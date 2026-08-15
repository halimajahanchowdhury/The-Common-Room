"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";

import {
    getChatMessages,
    sendChatMessage,
    getChatConversations,
} from "../../services/auth";

function ChatContent() {
    const searchParams = useSearchParams();
    const peerParam = searchParams.get("peer") || "";

    const [currentUser, setCurrentUser] = useState("");
    const [connections, setConnections] = useState<any[]>([]);
    const [activePeer, setActivePeer] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadLocalConnections = (storedName: string) => {
        const currentNameLower = storedName.toLowerCase().trim();
        const allRequests = JSON.parse(localStorage.getItem("sent_requests") || "[]");
        const allStudents = JSON.parse(localStorage.getItem("all_registered_students") || "[]");

        const acceptedPeersMap = new Map<string, any>();

        allRequests.forEach((req: any) => {
            if (req && req.status === "Accepted") {
                const fromUser = String(req.from_username || req.from_user || "").toLowerCase().trim();
                const toUser = String(req.to_username || req.to_user || "").toLowerCase().trim();

                let peerUsername = "";
                if (fromUser === currentNameLower) {
                    peerUsername = req.to_username || req.to_user;
                } else if (toUser === currentNameLower) {
                    peerUsername = req.from_username || req.from_user;
                }

                if (peerUsername) {
                    const peerLower = peerUsername.toLowerCase().trim();
                    const studentData = allStudents.find((s: any) => 
                        (s.username && s.username.toLowerCase().trim() === peerLower) ||
                        (s.full_name && s.full_name.toLowerCase().trim() === peerLower)
                    ) || {
                        username: peerUsername,
                        full_name: req.to_user || req.from_user || peerUsername,
                        university: "Campus Peer"
                    };

                    acceptedPeersMap.set(peerLower, studentData);
                }
            }
        });

        const connectionsList = Array.from(acceptedPeersMap.values());
        setConnections(connectionsList);

        if (peerParam) {
            const peerParamLower = peerParam.toLowerCase().trim();
            const foundInConnections = connectionsList.find((c: any) => 
                (c.username && c.username.toLowerCase().trim() === peerParamLower) ||
                (c.full_name && c.full_name.toLowerCase().trim() === peerParamLower)
            );
            if (foundInConnections) {
                setActivePeer(foundInConnections);
            } else {
                setActivePeer(null);
            }
        } else if (connectionsList.length > 0) {
            setActivePeer(connectionsList[0]);
        }
    };

    useEffect(() => {
        const storedName = localStorage.getItem("user_name") || "Student";
        setCurrentUser(storedName);

        const token = localStorage.getItem("access");
        if (token) {
            getChatConversations(token)
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setConnections(data);
                        if (peerParam) {
                            const peerLower = peerParam.toLowerCase().trim();
                            const found = data.find((c: any) =>
                                (c.username && c.username.toLowerCase().trim() === peerLower) ||
                                (c.full_name && c.full_name.toLowerCase().trim() === peerLower)
                            );
                            if (found) setActivePeer(found);
                            else setActivePeer(data[0]);
                        } else {
                            setActivePeer(data[0]);
                        }
                    } else {
                        loadLocalConnections(storedName);
                    }
                })
                .catch(() => loadLocalConnections(storedName));
        } else {
            loadLocalConnections(storedName);
        }
    }, [peerParam]);

    // Load messages from Django API with live polling
    useEffect(() => {
        if (!currentUser || !activePeer) return;

        const fetchMessages = () => {
            const token = localStorage.getItem("access");
            const peerIdentifier = activePeer.username || activePeer.full_name;

            if (token && peerIdentifier) {
                getChatMessages(peerIdentifier, token)
                    .then((data) => {
                        if (Array.isArray(data)) {
                            setMessages(data);
                        } else {
                            loadLocalMessages();
                        }
                    })
                    .catch(() => loadLocalMessages());
                return;
            }

            loadLocalMessages();
        };

        fetchMessages();
        const intervalId = setInterval(fetchMessages, 3000);
        return () => clearInterval(intervalId);
    }, [currentUser, activePeer]);

    const loadLocalMessages = () => {
        if (!currentUser || !activePeer) return;
        const convKey = getConversationKey(currentUser, activePeer.username || activePeer.full_name);
        const allChats = JSON.parse(localStorage.getItem("peer_chat_messages") || "{}");
        const existingMessages = allChats[convKey] || [];

        let hasUpdates = false;
        const updated = existingMessages.map((msg: any) => {
            if (msg && msg.sender.toLowerCase().trim() !== currentUser.toLowerCase().trim() && msg.status !== "seen") {
                hasUpdates = true;
                return { ...msg, status: "seen" };
            }
            return msg;
        });

        if (hasUpdates) {
            allChats[convKey] = updated;
            localStorage.setItem("peer_chat_messages", JSON.stringify(allChats));
        }

        setMessages(updated);
    };

    const getConversationKey = (userA: string, userB: string) => {
        const sorted = [userA.toLowerCase().trim(), userB.toLowerCase().trim()].sort();
        return `chat_${sorted[0]}_${sorted[1]}`;
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !activePeer) return;

        const freshToken = typeof window !== "undefined" ? localStorage.getItem("access") : null;
        const peerIdentifier = activePeer.username || activePeer.full_name;

        if (freshToken && peerIdentifier) {
            try {
                const sentData = await sendChatMessage(peerIdentifier, newMessage.trim(), freshToken);
                setMessages((prev) => [...prev, sentData]);
                setNewMessage("");
                return;
            } catch (err: any) {
                console.error("Failed to send message to backend:", err);
                if (err?.response?.status === 401) {
                    alert("Session expired. Please log in again to continue messaging.");
                    if (typeof window !== "undefined") window.location.href = "/login";
                    return;
                }
            }
        }

        const convKey = getConversationKey(currentUser, activePeer.username || activePeer.full_name);
        const allChats = JSON.parse(localStorage.getItem("peer_chat_messages") || "{}");
        const existingMessages = allChats[convKey] || [];

        const messageObj = {
            id: Date.now(),
            sender: currentUser,
            text: newMessage.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "delivered"
        };

        const updatedMessages = [...existingMessages, messageObj];
        allChats[convKey] = updatedMessages;

        localStorage.setItem("peer_chat_messages", JSON.stringify(allChats));
        setMessages(updatedMessages);
        setNewMessage("");
    };

    const getPeerUnreadCount = (peerUsername: string) => {
        if (!currentUser || !peerUsername) return 0;
        try {
            const convKey = getConversationKey(currentUser, peerUsername);
            const allChats = JSON.parse(localStorage.getItem("peer_chat_messages") || "{}");
            const chatList = allChats[convKey] || [];
            
            const peerLower = peerUsername.toLowerCase().trim();
            return chatList.filter((msg: any) => 
                msg && msg.sender && msg.sender.toLowerCase().trim() === peerLower && msg.status !== "seen"
            ).length;
        } catch {
            return 0;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
            <Navbar />

            <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
                <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row h-[750px] overflow-hidden">
                    
                    {/* Sidebar Connections List */}
                    <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                        <div className="p-4 border-b border-slate-100 bg-white">
                            <h2 className="text-lg font-bold text-slate-900">
                                💬 Messages
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Accepted collaboration connections
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
                            {connections.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-400">
                                    No accepted connections yet. Accept collaboration requests to start chatting!
                                </div>
                            ) : (
                                connections.map((peer: any, idx: number) => {
                                    const peerName = peer.full_name || peer.username;
                                    const isSelected = activePeer && (activePeer.username === peer.username || activePeer.full_name === peer.full_name);
                                    const peerUnread = getPeerUnreadCount(peer.username || peer.full_name);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setActivePeer(peer)}
                                            className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition ${
                                                isSelected 
                                                    ? "bg-indigo-50/80 border border-indigo-100 shadow-2xs" 
                                                    : "hover:bg-slate-100/80"
                                            }`}
                                        >
                                            <Avatar src={peer.profile_picture} name={peerName} username={peer.username} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                                        {peerName}
                                                    </h4>
                                                    {peerUnread > 0 && (
                                                        <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full animate-pulse">
                                                            {peerUnread}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                    {peer.university || "Campus Connection"}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col bg-white">
                        {activePeer ? (
                            <>
                                {/* Peer Header */}
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={activePeer.profile_picture} name={activePeer.full_name || activePeer.username} username={activePeer.username} size="md" />
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">
                                                {activePeer.full_name || activePeer.username}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {activePeer.university || "Campus Peer"} • {activePeer.department || "Peer Student"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Active Peer
                                    </span>
                                </div>

                                {/* Message Scroll Box */}
                                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                            <span className="text-3xl mb-2">👋</span>
                                            <p className="text-xs font-medium">
                                                Say hello to <span className="font-bold text-slate-700">{activePeer.full_name || activePeer.username}</span>!
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Start collaborating on skills and academic goals.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((msg: any) => {
                                            const isMe = msg.sender.toLowerCase().trim() === currentUser.toLowerCase().trim();

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-2xs ${
                                                            isMe
                                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                                                        }`}
                                                    >
                                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                    </div>
                                                    
                                                    {/* Timestamp & Delivered / Seen Status Receipts */}
                                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mt-1 px-1">
                                                        <span>{msg.time}</span>
                                                        {isMe && (
                                                            <>
                                                                <span>•</span>
                                                                {msg.status === "seen" ? (
                                                                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                                                        ✓✓ Seen
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400 font-medium flex items-center gap-0.5">
                                                                        ✓ Delivered
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Bar */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder={`Message ${activePeer.full_name || activePeer.username}...`}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs shadow-2xs focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Send 🚀
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                <span className="text-4xl mb-3">🔒</span>
                                <h3 className="text-sm font-bold text-slate-700">Strict Privacy Enforcement</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                    You can only message student peers who have an <span className="font-bold text-emerald-600">Accepted Collaboration Request</span> with you.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-500">
                Loading Chat...
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
