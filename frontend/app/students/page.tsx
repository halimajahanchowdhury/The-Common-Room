"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";
import { getAllProfiles, sendCollaborationRequest, getSentCollaborationRequests } from "../../services/auth";
import {
    Search,
    X,
    Sparkles,
    GraduationCap,
    BookOpen,
    Building,
    Check,
    Send,
    Users,
    SlidersHorizontal,
    Info,
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

    const isAlreadySent = (targetStudent: any) => {
        if (!targetStudent) return false;
        const targetId = targetStudent.id;
        const targetUsername = String(targetStudent.username || "").toLowerCase().trim();
        const targetFullName = String(targetStudent.full_name || "").toLowerCase().trim();

        return sentRequests.some((r: any) => {
            if (!r) return false;
            if (r.receiver && targetId && (r.receiver === targetId || r.receiver?.id === targetId)) return true;
            if (r.receiver_id && targetId && r.receiver_id === targetId) return true;

            const toUsername = String(r.to_username || r.receiver_username || "").toLowerCase().trim();
            const toUser = String(r.to_user || r.receiver_name || "").toLowerCase().trim();

            return (
                (toUsername && (toUsername === targetUsername || toUsername === targetFullName)) ||
                (toUser && (toUser === targetUsername || toUser === targetFullName))
            );
        });
    };

    const handleSendRequest = async (targetStudent: any) => {
        if (isAlreadySent(targetStudent)) {
            setToastMessage(`Request already sent to ${targetStudent.full_name || targetStudent.username}!`);
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
                        status: "pending"
                    }
                ]);
                setToastMessage(`Request sent to ${targetStudent.full_name || targetStudent.username}!`);
                setTimeout(() => setToastMessage(""), 3500);
                return;
            } catch (err: any) {
                console.error("Server request failed:", err);
                const errMsg = err?.response?.data?.detail || err?.response?.data?.error || "Request already sent to this student!";
                setToastMessage(errMsg);
                setTimeout(() => setToastMessage(""), 3500);
                return;
            }
        }

        const currentUserUsername = localStorage.getItem("user_name") || "Student";
        let currentProfileName = currentUserUsername;
        try {
            const parsedProfile = JSON.parse(localStorage.getItem("user_profile") || "{}");
            if (parsedProfile.full_name) currentProfileName = parsedProfile.full_name;
        } catch {
            currentProfileName = currentUserUsername;
        }

        const targetUsername = targetStudent?.username || targetStudent?.full_name || "Student";
        const targetName = targetStudent?.full_name || targetStudent?.username || "Student";

        let existingRequests: any[] = [];
        try {
            const parsed = JSON.parse(localStorage.getItem("sent_requests") || "[]");
            if (Array.isArray(parsed)) existingRequests = parsed;
        } catch {
            existingRequests = [];
        }

        const newRequest = {
            id: Date.now(),
            to_username: targetUsername,
            to_user: targetName,
            from_username: currentUserUsername,
            from_user: currentProfileName,
            skills: targetStudent?.skills_can_teach || "General Collaboration",
            status: "Pending",
            date: new Date().toLocaleDateString()
        };

        const updatedRequests = [...existingRequests, newRequest];
        localStorage.setItem("sent_requests", JSON.stringify(updatedRequests));

        const currentUserLower = currentUserUsername.toLowerCase().trim();
        const myUpdatedSent = updatedRequests.filter((r: any) => {
            if (!r) return false;
            if (r.from_username) return String(r.from_username).toLowerCase().trim() === currentUserLower;
            return String(r.from_user || "").toLowerCase().trim() === currentUserLower;
        });

        setSentRequests(myUpdatedSent);

        setToastMessage(`Collaboration request sent to ${targetName} successfully!`);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const filteredProfiles = profiles.filter((profile) => {
        if (!profile) return false;
        const query = search.toLowerCase().trim();

        const nameStr = String(profile.full_name || profile.username || "").toLowerCase();
        const uniStr = String(profile.university || "").toLowerCase();
        const teachStr = String(profile.skills_can_teach || "").toLowerCase();
        const learnStr = String(profile.skills_want_to_learn || "").toLowerCase();

        const matchesSearch =
            nameStr.includes(query) ||
            uniStr.includes(query) ||
            teachStr.includes(query) ||
            learnStr.includes(query);

        if (activePill === "All") {
            return matchesSearch;
        }

        const pillQuery = activePill.toLowerCase();
        const matchesPill = teachStr.includes(pillQuery) || learnStr.includes(pillQuery);

        return matchesSearch && matchesPill;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
            <Navbar />

            <main className="flex-1 p-4 md:p-10">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                            <Users className="w-4 h-4" />
                            <span>Campus Network</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Browse Students
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                            Find study partners, skill exchangers, and collaborators across campus.
                        </p>

                        {toastMessage && (
                            <div className="mt-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50 dark:bg-indigo-950/50 p-4 text-xs font-bold text-indigo-800 dark:text-indigo-300 shadow-xs flex items-center gap-2">
                                <Info className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                                <span>{toastMessage}</span>
                            </div>
                        )}
                    </div>

                    {/* Search & Skill Filter Inputs */}
                    <div className="mb-8 space-y-4">
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by student name, university, department, bio, or skills..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-12 pr-12 py-3.5 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs bg-slate-100 dark:bg-slate-800 rounded-full h-6 w-6 flex items-center justify-center transition"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Active Filters Bar */}
                        {(search.trim() || activePill !== "All") && (
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                <span className="text-slate-400 flex items-center gap-1">
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>Active Filters:</span>
                                </span>
                                {search.trim() && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                                        Search: &quot;{search}&quot;
                                        <button onClick={() => setSearch("")} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {activePill !== "All" && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                                        Skill: {activePill}
                                        <button onClick={() => setActivePill("All")} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={() => { setSearch(""); setActivePill("All"); }}
                                    className="ml-auto text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-bold"
                                >
                                    Reset All
                                </button>
                            </div>
                        )}

                        {/* Quick Skill Filter Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Quick Filters:</span>
                            </span>
                            {POPULAR_SKILL_PILLS.map((skill) => (
                                <button
                                    key={skill}
                                    onClick={() => setActivePill(skill)}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                        activePill === skill
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                            Loading student directory...
                        </div>
                    ) : filteredProfiles.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                            <Users className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                            <span>No student profiles match your search criteria. Try adjusting your search query or skill filters!</span>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredProfiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:shadow-md"
                                >
                                    <div>
                                        {/* Avatar & Header */}
                                        <div className="flex items-center gap-3.5 mb-4">
                                            <Avatar src={profile.profile_picture} name={profile.full_name} username={profile.username} size="md" />
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                                                    {profile.full_name || profile.username || "Student"}
                                                </h2>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1">
                                                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{profile.university || "University not added"}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                                            {/* Skill Match Badge */}
                                            {profile.skill_matches?.has_match && (
                                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                    <span>Potential Skill Match:</span>
                                                    <span>{profile.skill_matches.matching_skills?.slice(0, 2).join(", ")}</span>
                                                </div>
                                            )}

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
                                        {isAlreadySent(profile) ? (
                                            <button
                                                disabled
                                                className="w-full rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-default flex items-center justify-center gap-1.5"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Request Sent</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSendRequest(profile)}
                                                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Send Request</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
