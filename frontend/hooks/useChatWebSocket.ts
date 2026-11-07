"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
    id: number;
    sender_id: number;
    sender_username: string;
    recipient_id: number;
    text: string;
    status: "delivered" | "seen";
    timestamp: string;
    attachment_url?: string | null;
    attachment_name?: string;
    attachment_type?: string;
    attachment_size?: number | null;
}

interface UseChatWebSocketOptions {
    peerId: number | null;
    token: string | null;
    onMessageReceived?: (message: WebSocketMessage) => void;
    onMessagesSeen?: (seenBy: number) => void;
}

export function useChatWebSocket({
    peerId,
    token,
    onMessageReceived,
    onMessagesSeen,
}: UseChatWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!peerId || !token) return;

        // Clean up previous socket if existing
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Determine correct ws/wss protocol and host
        let apiBase = "https://thecommonroom-backend.onrender.com/api";
        if (process.env.NEXT_PUBLIC_API_URL) {
            apiBase = process.env.NEXT_PUBLIC_API_URL;
        } else if (typeof window !== "undefined" && window.location.hostname) {
            const h = window.location.hostname;
            if (h === "localhost" || h === "127.0.0.1" || h.startsWith("192.168.") || h.startsWith("10.")) {
                apiBase = `http://${h}:8000/api`;
            }
        }

        const isSecure = apiBase.startsWith("https");
        const protocol = isSecure ? "wss:" : "ws:";
        
        let host = "thecommonroom-backend.onrender.com";
        try {
            const urlObj = new URL(apiBase);
            host = urlObj.host;
        } catch {
            // fallback host
        }

        const wsUrl = `${protocol}//${host}/ws/chat/${peerId}/?token=${encodeURIComponent(token)}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "new_message" && data.message) {
                    onMessageReceived?.(data.message);
                } else if (data.type === "messages_seen") {
                    onMessagesSeen?.(data.seen_by);
                }
            } catch {
                // Ignore parse errors on ping/pong frames
            }
        };

        ws.onclose = (event) => {
            setIsConnected(false);
            // Reconnect after 3 seconds if not deliberately closed
            if (event.code !== 4001 && event.code !== 4002 && event.code !== 1000) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            }
        };

        ws.onerror = () => {
            ws.close();
        };
    }, [peerId, token, onMessageReceived, onMessagesSeen]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close(1000, "Component unmounted");
                wsRef.current = null;
            }
            setIsConnected(false);
        };
    }, [connect]);

    const sendMessage = useCallback((
        text: string,
        attachment?: {
            attachment_url?: string;
            attachment_name?: string;
            attachment_type?: string;
            attachment_size?: number;
        }
    ) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const payload: any = {
                action: "send_message",
                text: text.trim(),
            };

            if (attachment?.attachment_url) {
                payload.attachment_url = attachment.attachment_url;
                payload.attachment_name = attachment.attachment_name || "";
                payload.attachment_type = attachment.attachment_type || "";
                payload.attachment_size = attachment.attachment_size || null;
            }

            wsRef.current.send(JSON.stringify(payload));
            return true;
        }
        return false;
    }, []);

    const markSeen = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                action: "mark_seen",
            }));
        }
    }, []);

    return {
        isConnected,
        sendMessage,
        markSeen,
    };
}

