"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";
import {
    getAllProfiles,
    sendCollaborationRequest,
    getSentCollaborationRequests,
    getReceivedCollaborationRequests,
} from "../../services/auth";
import {
    Search,
    X,
    Sparkles,
    GraduationCap,
    BookOpen,
    Building,
    Check,
    CheckCircle2,
    Clock,
    Send,
    Users,
    MessageSquare,
} from "lucide-react";

const POPULAR_SKILL_PILLS = [
    "All",
    "Python",
    "JavaScript",
    "React",
    "Django",
    "C++",
    "Design",
    "AI",
    "Math",
];

export default function StudentsPage() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [activePill, setActivePill] = useState("All");
    const [sentRequests, setSentRequests] = useState<any[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
    const [toastMessage, setToastMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const loadLocalProfiles = (storedName: string) => {
        let allRegistered: any[] = [];
        try {
            const parsed = JSON.parse(localStorage.getItem("all_registered_students") || "[]");
            if (Array.isArray(parsed)) allRegistered = parsed;
        } catch {
            allRegistered = [];
        }

        const currentNameLower = storedName.toLowerCase().trim();
        const otherPeers = allRegistered.filter((s: any) => {
            if (!s) return false;
            const studentUsername = String(s.username || "").toLowerCase().trim();
            const studentFullName = String(s.full_name || "").toLowerCase().trim();
            return studentUsername !== currentNameLower && studentFullName !== currentNameLower;
        });

        setProfiles(otherPeers);
        setLoading(false);
    };

    useEffect(() => {
        const storedName = localStorage.getItem("user_name") || "Student";
        const token = localStorage.getItem("access");

        const skillFilter = activePill === "All" ? "" : activePill;
        setLoading(true);

        if (token) {
            getSentCollaborationRequests(token)
                .then((reqs) => {
                    if (Array.isArray(reqs)) {
                        setSentRequests(reqs);
                    }
                })
                .catch(() => {});

            getReceivedCollaborationRequests(token)
                .then((reqs) => {
                    if (Array.isArray(reqs)) {
                        setReceivedRequests(reqs);
                    }
                })
                .catch(() => {});

            getAllProfiles(token, search, skillFilter)
                .then((data) => {
                    if (Array.isArray(data)) {
                        setProfiles(data);
                    } else {
                        loadLocalProfiles(storedName);
                    }
                })
                .catch(() => {
                    loadLocalProfiles(storedName);
                })
                .finally(() => setLoading(false));
        } else {
            loadLocalProfiles(storedName);
        }

        let savedRequests: any[] = [];
        try {
            const parsedReqs = JSON.parse(localStorage.getItem("sent_requests") || "[]");
            if (Array.isArray(parsedReqs)) savedRequests = parsedReqs;
        } catch {
            savedRequests = [];
        }

        const currentUserLower = storedName.toLowerCase().trim();
        const mySent = savedRequests.filter((r: any) => {
            if (!r) return false;
            if (r.from_username) return String(r.from_username).toLowerCase().trim() === currentUserLower;
            return String(r.from_user || "").toLowerCase().trim() === currentUserLower && currentUserLower !== "student";
        });

        setSentRequests((prev) => (prev.length > 0 ? prev : mySent));
    }, [search, activePill]);

    const getCollabStatus = (targetStudent: any) => {
        if (!targetStudent) return "none";
        const targetId = targetStudent.id;
        const targetUsername = String(targetStudent.username || "").toLowerCase().trim();
        const targetFullName = String(targetStudent.full_name || "").toLowerCase().trim();

        const isMatch = (r: any, isSent: boolean) => {
            if (!r) return false;
            const peerId = isSent ? (r.receiver || r.receiver_id) : (r.sender || r.sender_id);
            if (peerId && targetId && (peerId === targetId || peerId?.id === targetId)) return true;

            const peerUser = isSent
                ? String(r.to_username || r.receiver_username || r.to_user || "").toLowerCase().trim()
                : String(r.from_username || r.sender_username || r.from_user || "").toLowerCase().trim();

            return peerUser && (peerUser === targetUsername || peerUser === targetFullName);
        };

        // 1. Check if accepted in either direction
        const acceptedSent = sentRequests.some((r) => isMatch(r, true) && String(r.status).toLowerCase() === "accepted");
        const acceptedReceived = receivedRequests.some((r) => isMatch(r, false) && String(r.status).toLowerCase() === "accepted");
        if (acceptedSent || acceptedReceived) return "accepted";

        // 2. Check pending sent
        const pendingSent = sentRequests.some((r) => isMatch(r, true) && String(r.status).toLowerCase() === "pending");
        if (pendingSent) return "pending_sent";

        // 3. Check pending received
        const pendingReceived = receivedRequests.some((r) => isMatch(r, false) && String(r.status).toLowerCase() === "pending");
        if (pendingReceived) return "pending_received";

        return "none";
    };

    const handleSendRequest = async (targetStudent: any) => {
        const status = getCollabStatus(targetStudent);
        if (status === "accepted") {
            setToastMessage(`You are already connected with ${targetStudent.full_name || targetStudent.username}!`);
            setTimeout(() => setToastMessage(""), 3500);
            return;
        }
        if (status === "pending_sent") {
            setToastMessage(`Request already sent to ${targetStudent.full_name || targetStudent.username}!`);
            setTimeout(() => setToastMessage(""), 3500);
            return;
        }
        if (status === "pending_received") {
            setToastMessage(`${targetStudent.full_name || targetStudent.username} sent you a request. Please check your Dashboard!`);
            setTimeout(() => setToastMessage(""), 3500);
            return;
        }

        const token = localStorage.getItem("access");
        if (token && targetStudent?.id) {
            try {
                await sendCollaborationRequest(targetStudent.id, token);
                setSentRequests((prev: any) => [
                    ...prev,
                    {
                        receiver: targetStudent.id,
                        to_username: targetStudent.username,
                        to_user: targetStudent.full_name,
                        status: "pending",
                    },
                ]);
                setToastMessage(`Collaboration request sent to ${targetStudent.full_name || targetStudent.username}!`);
                setTimeout(() => setToastMessage(""), 3500);
            } catch (err: any) {
                console.error("Failed to send collaboration request:", err);
                const backendErr = err?.response?.data?.error || "Unable to send request. Please try again.";
                setToastMessage(backendErr);
                setTimeout(() => setToastMessage(""), 3500);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
            <Navbar />

            {/* Toast Banner Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 shadow-xl text-xs font-bold flex items-center gap-2 border border-slate-700 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-3">
                    <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <main className="flex-1 p-4 md:p-10">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                                <Users className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Student Network Directory</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Browse Students
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                Discover peers, explore skill matches, and send collaboration requests
                            </p>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, university, department, bio, or skills..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pl-11 pr-10 py-3 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Skill Filter Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1.5">
                                Filter by Skill:
                            </span>
                            {POPULAR_SKILL_PILLS.map((pill) => {
                                const isActive = activePill === pill;
                                return (
                                    <button
                                        key={pill}
                                        onClick={() => setActivePill(pill)}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-xs"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                    >
                                        {pill}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Filter Chips */}
                    {(search || activePill !== "All") && (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                            <span>Active Filters:</span>
                            {search && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-indigo-700 dark:text-indigo-300 font-semibold">
                                    Search: &quot;{search}&quot;
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch("")} />
                                </span>
                            )}
                            {activePill !== "All" && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-indigo-700 dark:text-indigo-300 font-semibold">
                                    Skill: {activePill}
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setActivePill("All")} />
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setActivePill("All");
                                }}
                                className="ml-auto text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    )}

                    {/* Student Profile Cards Grid */}
                    {loading ? (
                        <div className="py-16 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                            Loading student directory...
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs">
                            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                No student profiles found
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                Try adjusting your search query or clear the active skill filter pill.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profiles.map((profile) => {
                                const collabStatus = getCollabStatus(profile);

                                return (
                                    <div
                                        key={profile.id}
                                        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Card Top Banner with Skill Match Alert */}
                                            {profile.skill_matches?.has_match && (
                                                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                                    <span>Potential Skill Exchange Match!</span>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3.5 mb-4">
                                                <Avatar
                                                    src={profile.profile_picture}
                                                    name={profile.full_name}
                                                    username={profile.username}
                                                    size="md"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        href={`/students/${profile.id}`}
                                                        className="font-bold text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate block"
                                                    >
                                                        {profile.full_name || profile.username}
                                                    </Link>
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span>{profile.university || "University not specified"}</span>
                                                    </p>
                                                    {profile.department && (
                                                        <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                                                            {profile.department} {profile.semester ? `• Semester ${profile.semester}` : ""}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bio snippet */}
                                            {profile.bio && (
                                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                                    {profile.bio}
                                                </p>
                                            )}

                                            {/* Skills Section */}
                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5 flex items-center gap-1">
                                                        <GraduationCap className="w-3.5 h-3.5" />
                                                        <span>Can Teach</span>
                                                    </h3>
                                                    {profile.skills_can_teach_list && profile.skills_can_teach_list.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {profile.skills_can_teach_list.slice(0, 3).map((s: string, i: number) => (
                                                                <span key={i} className="inline-block rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                            {profile.skills_can_teach_list.length > 3 && (
                                                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 self-center">
                                                                    +{profile.skills_can_teach_list.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                                            {profile.skills_can_teach || "No skills listed"}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1.5 flex items-center gap-1">
                                                        <BookOpen className="w-3.5 h-3.5" />
                                                        <span>Wants to Learn</span>
                                                    </h3>
                                                    {profile.skills_want_to_learn_list && profile.skills_want_to_learn_list.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {profile.skills_want_to_learn_list.slice(0, 3).map((s: string, i: number) => (
                                                                <span key={i} className="inline-block rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/40 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                            {profile.skills_want_to_learn_list.length > 3 && (
                                                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 self-center">
                                                                    +{profile.skills_want_to_learn_list.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                                            {profile.skills_want_to_learn || "No skills listed"}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                            {collabStatus === "accepted" ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        disabled
                                                        className="flex-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-default flex items-center justify-center gap-1.5"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span>Connected</span>
                                                    </button>
                                                    <Link
                                                        href={`/chat?peer=${profile.username}`}
                                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 p-2.5 text-white transition flex items-center justify-center cursor-pointer"
                                                        title="Chat now"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            ) : collabStatus === "pending_sent" ? (
                                                <button
                                                    disabled
                                                    className="w-full rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-300 cursor-default flex items-center justify-center gap-1.5"
                                                >
                                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                    <span>Request Sent</span>
                                                </button>
                                            ) : collabStatus === "pending_received" ? (
                                                <Link
                                                    href="/dashboard"
                                                    className="w-full rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/40 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span>Request Received (Respond)</span>
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => handleSendRequest(profile)}
                                                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                    <span>Send Collaboration Request</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
