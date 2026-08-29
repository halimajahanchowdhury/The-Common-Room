"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";

import {
    getChatMessages,
    sendChatMessage,
    getChatConversations,
    getProfile,
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
            status: "delivered"
        };

        const updatedMessages = [...existingMessages, messageObj];
        allChats[convKey] = updatedMessages;

        localStorage.setItem("peer_chat_messages", JSON.stringify(allChats));
        setMessages(updatedMessages);
        setNewMessage("");
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
            <Navbar />

            <main className="flex-1 p-2 sm:p-3 md:p-8 flex items-center justify-center">
                <div className="w-full max-w-5xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row h-[calc(100dvh-5.5rem)] md:h-[750px] overflow-hidden">
                    
                    {/* Sidebar Connections List */}
                    <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80 flex flex-col bg-slate-50/50 dark:bg-slate-950/40 h-full ${activePeer ? "hidden md:flex" : "flex"}`}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
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
                    <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 h-full ${!activePeer ? "hidden md:flex" : "flex"}`}>
                        {activePeer ? (
                            <>
                                {/* Peer Header */}
                                <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
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
                                    className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/50"
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
                                                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-2xs ${
                                                            isMe
                                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none"
                                                        }`}
                                                    >
                                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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

                                {/* Input Bar */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder={`Message ${activePeer.full_name || activePeer.username}...`}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs shadow-2xs focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Send</span>
                                        <Send className="w-3.5 h-3.5" />
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
