"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";

import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import {
    getChatMessages,
    sendChatMessage,
    getChatConversations,
    getProfile,
    uploadChatAttachment,
} from "../../services/auth";
import {
    MessageSquare,
    Send,
    CheckCheck,
    Check,
    Lock,
    User,
    Sparkles,
    Hand,
    ArrowLeft,
    Paperclip,
    FileText,
    Download,
    X,
    File,
    Loader2,
    Image as ImageIcon,
} from "lucide-react";

function ChatContent() {
    const searchParams = useSearchParams();
    const peerParam = searchParams.get("peer") || "";

    const [currentUser, setCurrentUser] = useState("");
    const [currentUsername, setCurrentUsername] = useState("");
    const [currentFullName, setCurrentFullName] = useState("");
    const [connections, setConnections] = useState<any[]>([]);
    const [activePeer, setActivePeer] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [previewModal, setPreviewModal] = useState<{
        url: string;
        name: string;
        type: string;
        size?: number;
    } | null>(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && previewModal) {
                setPreviewModal(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [previewModal]);

    // Load PDF as a Same-Origin Blob URL so browsers don't block it with "refused to connect"
    useEffect(() => {
        if (previewModal && previewModal.name.toLowerCase().endsWith(".pdf")) {
            setPdfLoading(true);
            setPdfError(false);
            setPdfBlobUrl(null);

            let active = true;
            let createdBlobUrl = "";

            fetch(previewModal.url)
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to load PDF");
                    return res.blob();
                })
                .then((blob) => {
                    if (active) {
                        const blobWithType = new Blob([blob], { type: "application/pdf" });
                        createdBlobUrl = window.URL.createObjectURL(blobWithType);
                        setPdfBlobUrl(createdBlobUrl);
                        setPdfLoading(false);
                    }
                })
                .catch(() => {
                    if (active) {
                        setPdfError(true);
                        setPdfLoading(false);
                    }
                });

            return () => {
                active = false;
                if (createdBlobUrl) {
                    window.URL.revokeObjectURL(createdBlobUrl);
                }
            };
        } else {
            setPdfBlobUrl(null);
            setPdfLoading(false);
            setPdfError(false);
        }
    }, [previewModal]);

    // Safe file download that triggers a native file download without navigating away from the chat
    const handleDownload = async (url: string, filename: string) => {
        setDownloading(true);
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename || "attachment";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        } catch {
            const link = document.createElement("a");
            link.href = url;
            link.download = filename || "attachment";
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setDownloading(false);
        }
    };

    const resolveAttachmentUrl = (url?: string | null) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
            return url;
        }
        let apiHost = "https://thecommonroom-backend.onrender.com";
        if (process.env.NEXT_PUBLIC_API_URL) {
            apiHost = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
        } else if (typeof window !== "undefined" && window.location.hostname) {
            const host = window.location.hostname;
            if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.") || host.startsWith("10.")) {
                apiHost = `http://${host}:8000`;
            }
        }
        return `${apiHost}${url}`;
    };

    const formatBytes = (bytes?: number | null) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert("File exceeds the 10 MB limit.");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setSelectedFile(file);
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const clearAttachment = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
    const peerId = activePeer?.user_id || activePeer?.id || null;

    const { isConnected, sendMessage: sendWsMessage } = useChatWebSocket({
        peerId,
        token,
        onMessageReceived: (newMsg) => {
            setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
            setConnections((prev) =>
                prev.map((c) => {
                    const cId = c.user_id || c.id;
                    if (cId === newMsg.sender_id || cId === newMsg.recipient_id) {
                        return {
                            ...c,
                            last_message: newMsg.text,
                            last_message_time: new Date(newMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        };
                    }
                    return c;
                })
            );
        },
        onMessagesSeen: (seenBy) => {
            setMessages((prev) =>
                prev.map((m) => (m.sender_id !== seenBy ? { ...m, status: "seen" } : m))
            );
        },
    });


    const chatEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true);
    const prevMessagesCountRef = useRef(0);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        chatEndRef.current?.scrollIntoView({ behavior });
    };

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            // If user is within 120px of bottom, consider them "near bottom"
            isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 120;
        }
    };

    // Scroll to bottom when opening or switching a peer conversation
    useEffect(() => {
        isNearBottomRef.current = true;
        prevMessagesCountRef.current = 0;
        scrollToBottom("auto");
    }, [activePeer?.username || activePeer?.full_name]);

    // Only auto-scroll on new message if user is already at the bottom
    useEffect(() => {
        const isNewMessageAdded = messages.length > prevMessagesCountRef.current;
        prevMessagesCountRef.current = messages.length;

        if (isNewMessageAdded && isNearBottomRef.current) {
            scrollToBottom("smooth");
        }
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

        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

        if (peerParam) {
            const peerParamLower = peerParam.toLowerCase().trim();
            const foundInConnections = connectionsList.find((c: any) => 
                (c.username && c.username.toLowerCase().trim() === peerParamLower) ||
                (c.full_name && c.full_name.toLowerCase().trim() === peerParamLower)
            );
            if (foundInConnections) {
                setActivePeer(foundInConnections);
            } else if (isDesktop && connectionsList.length > 0) {
                setActivePeer(connectionsList[0]);
            } else {
                setActivePeer(null);
            }
        } else if (isDesktop && connectionsList.length > 0) {
            setActivePeer(connectionsList[0]);
        } else {
            setActivePeer(null);
        }
    };

    useEffect(() => {
        const storedName = localStorage.getItem("user_name") || "Student";
        setCurrentUser(storedName);

        try {
            const cachedProfile = JSON.parse(localStorage.getItem("user_profile") || "{}");
            if (cachedProfile.username) setCurrentUsername(cachedProfile.username);
            if (cachedProfile.full_name) setCurrentFullName(cachedProfile.full_name);
        } catch {}

        const token = localStorage.getItem("access");
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

        if (token) {
            getProfile(token)
                .then((prof) => {
                    if (prof) {
                        if (prof.username) setCurrentUsername(prof.username);
                        if (prof.full_name) setCurrentFullName(prof.full_name);
                    }
                })
                .catch(() => {});

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
                            if (found) {
                                setActivePeer(found);
                            } else if (isDesktop) {
                                setActivePeer(data[0]);
                            } else {
                                setActivePeer(null);
                            }
                        } else if (isDesktop) {
                            setActivePeer(data[0]);
                        } else {
                            setActivePeer(null);
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

    // Load messages from Django API with 3s polling
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

                // Also periodically sync sidebar unread counters
                getChatConversations(token)
                    .then((convs) => {
                        if (Array.isArray(convs) && convs.length > 0) {
                            setConnections(convs);
                        }
                    })
                    .catch(() => {});
                return;
            }

            loadLocalMessages();
        };

        fetchMessages();
        // Heartbeat sync for unread sidebar counters
        const intervalId = setInterval(fetchMessages, 10000);
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

        if ((!newMessage.trim() && !selectedFile) || !activePeer) return;

        const freshToken = typeof window !== "undefined" ? localStorage.getItem("access") : null;
        const peerIdentifier = activePeer.username || activePeer.full_name;

        if (freshToken && peerIdentifier) {
            let attachmentData: any = null;

            if (selectedFile) {
                setUploadingAttachment(true);
                try {
                    attachmentData = await uploadChatAttachment(selectedFile, freshToken);
                } catch (err: any) {
                    console.error("Attachment upload failed:", err);
                    const errMsg = err?.response?.data?.error || "Failed to upload attachment (max 10MB).";
                    alert(errMsg);
                    setUploadingAttachment(false);
                    return;
                } finally {
                    setUploadingAttachment(false);
                }
            }

            const messageText = newMessage.trim();

            // Priority 1: Instant WebSocket delivery
            const sentViaWs = sendWsMessage(messageText, attachmentData);
            if (sentViaWs) {
                setNewMessage("");
                clearAttachment();
                isNearBottomRef.current = true;
                setTimeout(() => scrollToBottom("smooth"), 50);
                return;
            }

            // Priority 2: Graceful fallback to HTTP REST API
            try {
                const sentData = await sendChatMessage(peerIdentifier, messageText, freshToken, attachmentData);
                setMessages((prev) => [...prev, sentData]);
                setNewMessage("");
                clearAttachment();
                isNearBottomRef.current = true;
                setTimeout(() => scrollToBottom("smooth"), 50);
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
            status: "delivered",
            attachment_url: filePreview || null,
            attachment_name: selectedFile?.name || "",
            attachment_type: selectedFile?.type?.startsWith("image/") ? "image" : "document",
            attachment_size: selectedFile?.size || null,
        };

        const updatedMessages = [...existingMessages, messageObj];
        allChats[convKey] = updatedMessages;

        localStorage.setItem("peer_chat_messages", JSON.stringify(allChats));
        setMessages(updatedMessages);
        setNewMessage("");
        clearAttachment();
        isNearBottomRef.current = true;
        setTimeout(() => scrollToBottom("smooth"), 50);
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
        <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden transition-colors">
            <Navbar />

            <main className="flex-1 p-2 sm:p-4 md:p-6 flex items-center justify-center min-h-0 overflow-hidden">
                <div className="w-full max-w-5xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row h-full overflow-hidden">
                    
                    {/* Sidebar Connections List */}
                    <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80 flex flex-col bg-slate-50/50 dark:bg-slate-950/40 h-full min-h-0 ${activePeer ? "hidden md:flex" : "flex"}`}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <span>Messages</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Accepted collaboration connections
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 p-2">
                            {connections.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                                    <User className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                                    <span>No accepted connections yet. Accept collaboration requests to start chatting!</span>
                                </div>
                            ) : (
                                connections.map((peer: any, idx: number) => {
                                    const peerName = peer.full_name || peer.username;
                                    const isSelected = activePeer && (activePeer.username === peer.username || activePeer.full_name === peer.full_name);
                                    const peerUnread = isSelected
                                        ? 0
                                        : typeof peer.unread_count === "number"
                                        ? peer.unread_count
                                        : getPeerUnreadCount(peer.username || peer.full_name);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setActivePeer(peer);
                                                setConnections((prev) =>
                                                    prev.map((c) =>
                                                        (c.username && c.username === peer.username) || (c.full_name && c.full_name === peer.full_name)
                                                            ? { ...c, unread_count: 0 }
                                                            : c
                                                    )
                                                );
                                            }}
                                            className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition cursor-pointer ${
                                                isSelected 
                                                    ? "bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50" 
                                                    : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                                            }`}
                                        >
                                            <Avatar src={peer.profile_picture} name={peerName} username={peer.username} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {peerName}
                                                    </h4>
                                                    {peerUnread > 0 && (
                                                        <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full animate-pulse">
                                                            {peerUnread}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
                    <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 h-full min-h-0 overflow-hidden ${!activePeer ? "hidden md:flex" : "flex"}`}>
                        {activePeer ? (
                            <>
                                {/* Peer Header */}
                                <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        <button
                                            onClick={() => setActivePeer(null)}
                                            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                            title="Back to conversations"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <Avatar src={activePeer.profile_picture} name={activePeer.full_name || activePeer.username} username={activePeer.username} size="md" />
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[140px] sm:max-w-none">
                                                {activePeer.full_name || activePeer.username}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-none">
                                                {activePeer.university || "Campus Peer"} • {activePeer.department || "Peer Student"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-2.5 sm:px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shrink-0">
                                        <Sparkles className="w-3 h-3 text-indigo-500" />
                                        <span>Collaborator</span>
                                    </span>
                                </div>

                                {/* Message Scroll Box */}
                                <div
                                    ref={messagesContainerRef}
                                    onScroll={handleScroll}
                                    className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/50"
                                >
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                                            <Hand className="w-8 h-8 text-indigo-500 mb-2" />
                                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                Say hello to <span className="font-bold">{activePeer.full_name || activePeer.username}</span>!
                                            </p>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                                                Start collaborating on skills and academic goals.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((msg: any) => {
                                             const senderLower = String(msg.sender || msg.sender_username || "").toLowerCase().trim();
                                             const senderFullNameLower = String(msg.sender_full_name || "").toLowerCase().trim();
                                             const recipientLower = String(msg.recipient || msg.recipient_username || "").toLowerCase().trim();
                                             const peerUsernameLower = String(activePeer?.username || "").toLowerCase().trim();
                                             const peerFullNameLower = String(activePeer?.full_name || "").toLowerCase().trim();

                                             const isMe = 
                                                 (currentUsername && senderLower === currentUsername.toLowerCase().trim()) ||
                                                 (currentUser && (senderLower === currentUser.toLowerCase().trim() || senderFullNameLower === currentUser.toLowerCase().trim())) ||
                                                 (currentFullName && senderFullNameLower === currentFullName.toLowerCase().trim()) ||
                                                 (activePeer && (recipientLower === peerUsernameLower || recipientLower === peerFullNameLower));
                                             const formatMessageTime = (m: any) => {
                                                 if (!m) return "";
                                                 if (m.timestamp) {
                                                     try {
                                                         const d = new Date(m.timestamp);
                                                         if (!isNaN(d.getTime())) {
                                                             return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                         }
                                                     } catch {}
                                                 }
                                                 return m.time || "";
                                             };

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] rounded-2xl p-3 text-xs font-medium shadow-2xs ${
                                                            isMe
                                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none"
                                                        }`}
                                                    >
                                                        {msg.attachment_url && (
                                                            <div className={msg.text ? "mb-2.5" : ""}>
                                                                {msg.attachment_type === "image" ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPreviewModal({
                                                                            url: resolveAttachmentUrl(msg.attachment_url),
                                                                            name: msg.attachment_name || "Image Attachment",
                                                                            type: "image",
                                                                            size: msg.attachment_size,
                                                                        })}
                                                                        className="block overflow-hidden rounded-xl border border-black/10 dark:border-white/10 group cursor-pointer max-w-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                                        title="Click to view image in full screen"
                                                                    >
                                                                        <img
                                                                            src={resolveAttachmentUrl(msg.attachment_url)}
                                                                            alt={msg.attachment_name || "Attachment"}
                                                                            className="max-h-64 w-auto rounded-xl object-contain group-hover:scale-[1.01] transition"
                                                                        />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPreviewModal({
                                                                            url: resolveAttachmentUrl(msg.attachment_url),
                                                                            name: msg.attachment_name || "Attachment",
                                                                            type: msg.attachment_type || "document",
                                                                            size: msg.attachment_size,
                                                                        })}
                                                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                                                                            isMe
                                                                                ? "bg-indigo-700/60 hover:bg-indigo-700 text-white"
                                                                                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/70 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                                                                        }`}
                                                                        title="Click to view file"
                                                                    >
                                                                        <FileText className="w-6 h-6 shrink-0 opacity-80" />
                                                                        <div className="min-w-0 flex-1 text-left">
                                                                            <p className="font-bold text-xs truncate">{msg.attachment_name || "Attachment"}</p>
                                                                            {msg.attachment_size && (
                                                                                <p className="text-[10px] opacity-70">{formatBytes(msg.attachment_size)}</p>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-black/10 dark:bg-white/10 shrink-0">
                                                                            View
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                                                    </div>
                                                    
                                                    {/* Timestamp & Delivered / Seen Status Receipts */}
                                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 px-1">
                                                        <span>{formatMessageTime(msg)}</span>
                                                        {isMe && (
                                                            <>
                                                                <span>•</span>
                                                                {msg.status === "seen" ? (
                                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                                                                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                                        <span>Seen</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-0.5">
                                                                        <Check className="w-3.5 h-3.5" />
                                                                        <span>Delivered</span>
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

                                {/* Pending File Preview Banner */}
                                {selectedFile && (
                                    <div className="px-4 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs animate-in fade-in slide-in-from-bottom-2 shrink-0">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {filePreview ? (
                                                <img src={filePreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                                            ) : (
                                                <FileText className="w-6 h-6 text-indigo-500 shrink-0" />
                                            )}
                                            <div className="min-w-0 truncate">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatBytes(selectedFile.size)} • Click Send to share</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearAttachment}
                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                                            title="Cancel attachment"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Input Bar */}
                                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                                        title="Attach image or document (Max 10MB)"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder={`Message ${activePeer.full_name || activePeer.username}...`}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs shadow-2xs focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                    <button
                                        type="submit"
                                        disabled={(!newMessage.trim() && !selectedFile) || uploadingAttachment}
                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer shrink-0"
                                    >
                                        {uploadingAttachment ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send</span>
                                                <Send className="w-3.5 h-3.5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500">
                                <Lock className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Strict Privacy Enforcement</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                                    You can only message student peers who have an <span className="font-bold text-emerald-600 dark:text-emerald-400">Accepted Collaboration Request</span> with you.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* In-Tab Attachment Preview Modal */}
            {previewModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-150"
                    onClick={() => setPreviewModal(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header Bar with Right-Side Above Close (X) */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0 pr-4">
                                {previewModal.type === "image" ? (
                                    <ImageIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                                ) : (
                                    <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {previewModal.name}
                                    </p>
                                    {previewModal.size ? (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {formatBytes(previewModal.size)}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => handleDownload(previewModal.url, previewModal.name)}
                                    disabled={downloading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                                    title="Download file directly to your device"
                                >
                                    {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                    <span className="hidden sm:inline">Download</span>
                                </button>
                                {/* Close X sign positioned at the top right above */}
                                <button
                                    type="button"
                                    onClick={() => setPreviewModal(null)}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    title="Close and return to chat (Esc)"
                                    aria-label="Close attachment preview"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body: Rich Attachment Display */}
                        <div className="flex-1 min-h-0 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/5 dark:bg-slate-950/40">
                            {previewModal.type === "image" ? (
                                <img
                                    src={previewModal.url}
                                    alt={previewModal.name}
                                    className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
                                />
                            ) : previewModal.type === "video" ? (
                                <video
                                    src={previewModal.url}
                                    controls
                                    autoPlay
                                    className="max-h-[75vh] max-w-full rounded-lg shadow-sm"
                                />
                            ) : previewModal.type === "audio" ? (
                                <div className="p-8 w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-sm text-center">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-4">{previewModal.name}</p>
                                    <audio src={previewModal.url} controls className="w-full" />
                                </div>
                            ) : previewModal.name.toLowerCase().endsWith(".pdf") ? (
                                <div className="w-full h-[75vh] flex items-center justify-center">
                                    {pdfLoading ? (
                                        <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                            <p className="text-xs font-semibold">Loading document preview...</p>
                                        </div>
                                    ) : pdfBlobUrl ? (
                                        <iframe
                                            src={pdfBlobUrl}
                                            title={previewModal.name}
                                            className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white"
                                        />
                                    ) : (
                                        <div className="p-8 text-center max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                            <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">
                                                {previewModal.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                                Click download to save this PDF directly to your device without leaving the chat.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => handleDownload(previewModal.url, previewModal.name)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition cursor-pointer"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>Download PDF</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">
                                        {previewModal.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                        This document can be opened directly on your device.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(previewModal.url, previewModal.name)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition cursor-pointer"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download File</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                Loading Chat...
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
