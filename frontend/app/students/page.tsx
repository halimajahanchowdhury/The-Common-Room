"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";
import { getAllProfiles, sendCollaborationRequest } from "../../services/auth";

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
    const [sentRequests, setSentRequests] = useState<string[]>([]);
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

        setSentRequests(mySent);
    }, [search, activePill]);

    const isAlreadySent = (targetStudent: any) => {
        if (!targetStudent) return false;
        const targetUsername = String(targetStudent.username || "").toLowerCase().trim();
        const targetFullName = String(targetStudent.full_name || "").toLowerCase().trim();

        return sentRequests.some((r: any) => {
            if (!r) return false;
            const toUsername = String(r.to_username || "").toLowerCase().trim();
            const toUser = String(r.to_user || "").toLowerCase().trim();

            return (
                (toUsername && (toUsername === targetUsername || toUsername === targetFullName)) ||
                (toUser && (toUser === targetUsername || toUser === targetFullName))
            );
        });
    };

    const handleSendRequest = async (targetStudent: any) => {
        const token = localStorage.getItem("access");
        if (token && targetStudent?.id) {
            try {
                await sendCollaborationRequest(targetStudent.id, token);
                setSentRequests((prev: any) => [...prev, { to_username: targetStudent.username, to_user: targetStudent.full_name, status: "pending" }]);
                setToastMessage(`Request sent to ${targetStudent.full_name || targetStudent.username}! ✨`);
                setTimeout(() => setToastMessage(""), 3500);
                return;
            } catch (err) {
                console.error("Server request failed, using local storage fallback:", err);
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
            <Navbar />

            <main className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Browse Students
                        </h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            Find study partners, skill exchangers, and collaborators across campus.
                        </p>

                        {toastMessage && (
                            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-xs">
                                ✓ {toastMessage}
                            </div>
                        )}
                    </div>

                    {/* Search & Skill Filter Inputs */}
                    <div className="mb-8 space-y-4">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Search by student name, university, department, bio, or skills..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white p-4 pr-12 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-4 text-slate-400 hover:text-slate-600 font-bold text-xs bg-slate-100 rounded-full h-6 w-6 flex items-center justify-center transition"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Active Filters Bar */}
                        {(search.trim() || activePill !== "All") && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100/70 p-3 rounded-xl border border-slate-200/80">
                                <span className="text-slate-400">Active Filters:</span>
                                {search.trim() && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-slate-800 border border-slate-200 shadow-2xs">
                                        Search: &quot;{search}&quot;
                                        <button onClick={() => setSearch("")} className="text-slate-400 hover:text-rose-600">✕</button>
                                    </span>
                                )}
                                {activePill !== "All" && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-slate-800 border border-slate-200 shadow-2xs">
                                        Skill: {activePill}
                                        <button onClick={() => setActivePill("All")} className="text-slate-400 hover:text-rose-600">✕</button>
                                    </span>
                                )}
                                <button
                                    onClick={() => { setSearch(""); setActivePill("All"); }}
                                    className="ml-auto text-indigo-600 hover:text-indigo-800 text-[11px] font-bold underline"
                                >
                                    Reset All
                                </button>
                            </div>
                        )}

                        {/* Quick Skill Filter Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                                Quick Filters:
                            </span>
                            {POPULAR_SKILL_PILLS.map((skill) => (
                                <button
                                    key={skill}
                                    onClick={() => setActivePill(skill)}
                                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                                        activePill === skill
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredProfiles.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs font-semibold text-slate-400">
                            No other student profiles matching your search criteria. When peer students sign up, they will appear here!
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredProfiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                                >
                                    <div>
                                        {/* Avatar & Header */}
                                        <div className="flex items-center gap-3.5 mb-4">
                                            <Avatar src={profile.profile_picture} name={profile.full_name} size="md" />
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-900 line-clamp-1">
                                                    {profile.full_name || "Student"}
                                                </h2>
                                                <p className="text-xs font-medium text-slate-500 line-clamp-1">
                                                    🏫 {profile.university || "University not added"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2 border-t border-slate-100">
                                            {/* Skill Match Badge */}
                                            {profile.skill_matches?.has_match && (
                                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                                                    <span>⚡ Match:</span>
                                                    <span>{profile.skill_matches.matching_skills?.slice(0, 2).join(", ")}</span>
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1.5">
                                                    Can Teach
                                                </h3>
                                                {profile.skills_can_teach_list && profile.skills_can_teach_list.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {profile.skills_can_teach_list.slice(0, 3).map((s: string, i: number) => (
                                                            <span key={i} className="inline-block rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                                                {s}
                                                            </span>
                                                        ))}
                                                        {profile.skills_can_teach_list.length > 3 && (
                                                            <span className="text-[10px] font-medium text-slate-400 self-center">
                                                                +{profile.skills_can_teach_list.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-600 line-clamp-2">
                                                        {profile.skills_can_teach || "No skills listed"}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-1.5">
                                                    Wants to Learn
                                                </h3>
                                                {profile.skills_want_to_learn_list && profile.skills_want_to_learn_list.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {profile.skills_want_to_learn_list.slice(0, 3).map((s: string, i: number) => (
                                                            <span key={i} className="inline-block rounded-md bg-teal-50 border border-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                                                                {s}
                                                            </span>
                                                        ))}
                                                        {profile.skills_want_to_learn_list.length > 3 && (
                                                            <span className="text-[10px] font-medium text-slate-400 self-center">
                                                                +{profile.skills_want_to_learn_list.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-600 line-clamp-2">
                                                        {profile.skills_want_to_learn || "No skills listed"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        {isAlreadySent(profile) ? (
                                            <button
                                                disabled
                                                className="w-full rounded-xl bg-emerald-50 border border-emerald-200 py-2.5 text-xs font-bold text-emerald-700 cursor-default flex items-center justify-center gap-1.5"
                                            >
                                                ✓ Request Sent
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSendRequest(profile)}
                                                className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                                            >
                                                Send Request
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
