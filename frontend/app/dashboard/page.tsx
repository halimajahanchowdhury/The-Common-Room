"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";
import {
    getProfile,
    getSentCollaborationRequests,
    getReceivedCollaborationRequests,
    updateCollaborationRequest,
} from "../../services/auth";
import {
    Sparkles,
    GraduationCap,
    BookOpen,
    Building,
    Inbox,
    Send,
    Check,
    X,
    CheckCircle2,
    XCircle,
    Clock,
    MessageSquare,
    ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
    const [user, setUser] = useState<any>({
        username: "",
        email: ""
    });

    const [profile, setProfile] = useState<any>({
        full_name: "",
        university: "",
        department: "",
        semester: "",
        bio: "",
        skills_can_teach: "",
        skills_want_to_learn: ""
    });

    const [sentRequests, setSentRequests] = useState<any[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<any[]>([]);

    const loadRequests = (storedName: string) => {
        const token = localStorage.getItem("access");
        if (token) {
            getSentCollaborationRequests(token)
                .then((data) => {
                    if (Array.isArray(data)) setSentRequests(data);
                })
                .catch(() => {});

            getReceivedCollaborationRequests(token)
                .then((data) => {
                    if (Array.isArray(data)) setReceivedRequests(data);
                })
                .catch(() => {});
            return;
        }

        let savedRequests: any[] = [];
        try {
            const parsedReqs = JSON.parse(localStorage.getItem("sent_requests") || "[]");
            if (Array.isArray(parsedReqs)) {
                savedRequests = parsedReqs;
            }
        } catch {
            savedRequests = [];
        }

        const currentNameLower = storedName.toLowerCase().trim();

        const mySent = savedRequests.filter((r: any) => {
            if (!r) return false;
            if (r.from_username) {
                return String(r.from_username).toLowerCase().trim() === currentNameLower;
            }
            if (currentNameLower === "student") return false;
            const senderUser = String(r.from_user || "").toLowerCase().trim();
            return senderUser === currentNameLower && senderUser !== "student";
        });
        setSentRequests(mySent);

        const myReceived = savedRequests.filter((r: any) => {
            if (!r) return false;
            if (r.to_username) {
                return String(r.to_username).toLowerCase().trim() === currentNameLower;
            }
            if (currentNameLower === "student") return false;
            const targetUser = String(r.to_user || "").toLowerCase().trim();
            return targetUser === currentNameLower && targetUser !== "student";
        });
        setReceivedRequests(myReceived);
    };

    useEffect(() => {
        const token = localStorage.getItem("access");
        const storedName = localStorage.getItem("user_name") || "Student";

        loadRequests(storedName);

        if (token) {
            getProfile(token)
                .then((data) => {
                    if (data) {
                        setProfile(data);
                        setUser({
                            username: data.username || storedName,
                            email: data.email || ""
                        });
                        localStorage.setItem("user_profile", JSON.stringify(data));
                    }
                })
                .catch(() => loadLocalDashboard(storedName));
        } else {
            loadLocalDashboard(storedName);
        }
    }, []);

    const loadLocalDashboard = (storedName: string) => {
        const storedEmail = localStorage.getItem("user_email") || `${storedName}@gmail.com`;
        const storedProfile = localStorage.getItem("user_profile");

        setUser({
            username: storedName,
            email: storedEmail
        });

        if (storedProfile) {
            try {
                const parsed = JSON.parse(storedProfile);
                setProfile({
                    ...parsed,
                    full_name: parsed.full_name || storedName
                });
            } catch {
                setProfile((prev: any) => ({
                    ...prev,
                    full_name: storedName
                }));
            }
        }
    };

    const handleUpdateRequestStatus = async (requestId: number, newStatus: string) => {
        const token = localStorage.getItem("access");
        if (token) {
            try {
                await updateCollaborationRequest(requestId, newStatus.toLowerCase(), token);
                const storedName = localStorage.getItem("user_name") || "Student";
                loadRequests(storedName);
                return;
            } catch (err) {
                console.error("Failed to update status on server:", err);
            }
        }

        let savedRequests: any[] = [];
        try {
            const parsedReqs = JSON.parse(localStorage.getItem("sent_requests") || "[]");
            if (Array.isArray(parsedReqs)) savedRequests = parsedReqs;
        } catch {
            savedRequests = [];
        }

        const updated = savedRequests.map((r: any) => {
            if (r && r.id === requestId) {
                return { ...r, status: newStatus };
            }
            return r;
        });

        localStorage.setItem("sent_requests", JSON.stringify(updated));
        const storedName = localStorage.getItem("user_name") || "Student";
        loadRequests(storedName);
    };

    const isProfileIncomplete = !profile.skills_can_teach || !profile.bio;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
            <Navbar />

            <main className="flex-1 p-4 md:p-10">
                <div className="mx-auto max-w-4xl space-y-6">

                    {/* Profile Completion Reminder Banner */}
                    {isProfileIncomplete && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent p-5 shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                        Complete Your Profile
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                        Add your skills and bio so peer students can discover and collaborate with you.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/profile/edit"
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                            >
                                <span>Edit Profile</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    )}

                    {/* Main Dashboard Card */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
                        {/* Profile Header with Avatar */}
                        <div className="flex items-center pb-6 border-b border-slate-100 dark:border-slate-800/80 gap-4">
                            <Avatar src={profile?.profile_picture} name={profile?.full_name} username={user.username} size="lg" />
                            <div>
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-3 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                                    <Sparkles className="w-3 h-3 text-indigo-500" />
                                    <span>Student Dashboard</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {profile?.full_name || user.username}
                                </h1>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                    @{profile?.username || user.username} • {profile?.email || user.email}
                                </p>

                                {/* Academic Info Tag Bar */}
                                {(profile?.university || profile?.department || profile?.semester) && (
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                        {profile?.university && (
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                <Building className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span>{profile.university}</span>
                                            </span>
                                        )}
                                        {profile?.department && (
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                                                <GraduationCap className="w-3 h-3 text-indigo-500 shrink-0" />
                                                <span>{profile.department}</span>
                                            </span>
                                        )}
                                        {profile?.semester && (
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/40 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                                                <BookOpen className="w-3 h-3 text-teal-500 shrink-0" />
                                                <span>
                                                    {profile.semester.toLowerCase().includes("semester")
                                                        ? profile.semester
                                                        : profile.semester.toLowerCase().includes("year")
                                                        ? profile.semester
                                                        : `Semester ${profile.semester}`}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Skills Grid */}
                        <div className="grid gap-6 md:grid-cols-2 py-6 border-b border-slate-100 dark:border-slate-800/80">
                            <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>Skills I Can Teach</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile?.skills_can_teach ? (
                                        profile.skills_can_teach.split(",").map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="inline-block rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">No skills listed yet</span>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3 flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Skills I Want to Learn</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile?.skills_want_to_learn ? (
                                        profile.skills_want_to_learn.split(",").map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="inline-block rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/40 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">No skills listed yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="pt-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                Bio
                            </h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {profile?.bio || "No bio added yet."}
                            </p>
                        </div>
                    </div>

                    {/* Received Collaboration Requests Section */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Inbox className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Received Collaboration Requests</span>
                                </h2>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                    Requests sent to you from peer students across campus.
                                </p>
                            </div>
                            <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                {receivedRequests.length} Total
                            </span>
                        </div>

                        {receivedRequests.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                                <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                                <span>No collaboration requests received yet.</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {receivedRequests.map((req: any) => (
                                    <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                Request from: {req.from_user}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Skill Focus: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{req.skills}</span> • Sent on {req.date}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 self-start sm:self-auto">
                                            {String(req.status || "").toLowerCase() === "pending" ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateRequestStatus(req.id, "accepted")}
                                                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span>Accept</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateRequestStatus(req.id, "declined")}
                                                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                        <span>Decline</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                            String(req.status || "").toLowerCase() === "accepted"
                                                                ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                                                : "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300"
                                                        }`}
                                                    >
                                                        {String(req.status || "").toLowerCase() === "accepted" ? (
                                                            <>
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>Accepted</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                <span>Declined</span>
                                                            </>
                                                        )}
                                                    </span>
                                                    {String(req.status || "").toLowerCase() === "accepted" && (
                                                        <Link
                                                            href={`/chat?peer=${encodeURIComponent(req.from_username || req.from_user)}`}
                                                            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition flex items-center gap-1.5"
                                                        >
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            <span>Send Message</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sent Collaboration Requests Section */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Sent Collaboration Requests</span>
                                </h2>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                    Track requests sent to peers across campus.
                                </p>
                            </div>
                            <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                {sentRequests.length} Total
                            </span>
                        </div>

                        {sentRequests.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                                <Send className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                                <span>No collaboration requests sent yet. Browse students to connect!</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {sentRequests.map((req: any, index: number) => {
                                    const sLower = String(req.status || "").toLowerCase();
                                    return (
                                        <div key={index} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                    Request sent to: {req.to_user || req.to_username}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Skill Focus: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{req.skills || "General Collaboration"}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                        sLower === "accepted"
                                                            ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                                            : sLower === "declined" || sLower === "rejected"
                                                            ? "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300"
                                                            : "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300"
                                                    }`}
                                                >
                                                    {sLower === "accepted" ? (
                                                        <>
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>Accepted</span>
                                                        </>
                                                    ) : sLower === "declined" || sLower === "rejected" ? (
                                                        <>
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            <span>Declined</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>Pending</span>
                                                        </>
                                                    )}
                                                </span>
                                                {sLower === "accepted" && (
                                                    <Link
                                                        href={`/chat?peer=${encodeURIComponent(req.to_username || req.to_user)}`}
                                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition flex items-center gap-1.5"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        <span>Send Message</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
