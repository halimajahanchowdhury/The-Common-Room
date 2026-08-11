"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";

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

    useEffect(() => {
        const storedName = localStorage.getItem("user_name") || "Student";
        const storedProfile = localStorage.getItem("user_profile");
        
        let allRegistered: any[] = [];
        try {
            const parsed = JSON.parse(localStorage.getItem("all_registered_students") || "[]");
            if (Array.isArray(parsed)) {
                allRegistered = parsed;
            }
        } catch {
            allRegistered = [];
        }

        let savedRequests: any[] = [];
        try {
            const parsedReqs = JSON.parse(localStorage.getItem("sent_requests") || "[]");
            if (Array.isArray(parsedReqs)) savedRequests = parsedReqs;
        } catch {
            savedRequests = [];
        }

        setSentRequests(savedRequests.map((r: any) => r?.to_user).filter(Boolean));

        // Filter out the active logged-in student so directory shows ONLY other registered peers
        const currentNameLower = storedName.toLowerCase().trim();
        const otherPeers = allRegistered.filter((s: any) => {
            if (!s) return false;
            const studentUsername = String(s.username || "").toLowerCase().trim();
            const studentFullName = String(s.full_name || "").toLowerCase().trim();
            return studentUsername !== currentNameLower && studentFullName !== currentNameLower;
        });

        setProfiles(otherPeers);
    }, []);

    const handleSendRequest = (targetStudent: any) => {
        const currentUser = localStorage.getItem("user_name") || "Student";
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
            to_user: targetName,
            from_user: currentUser,
            skills: targetStudent?.skills_can_teach || "General Collaboration",
            status: "Pending",
            date: new Date().toLocaleDateString()
        };

        const updatedRequests = [...existingRequests, newRequest];
        localStorage.setItem("sent_requests", JSON.stringify(updatedRequests));
        setSentRequests(updatedRequests.map((r: any) => r?.to_user).filter(Boolean));

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
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
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

                    {/* Search & Skill Filter Pills */}
                    <div className="mb-8 space-y-4">
                        <input
                            type="text"
                            placeholder="Search by student name, university, or skills..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                        />

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

                                        <div className="space-y-4 pt-2 border-t border-slate-100">
                                            <div>
                                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1.5">
                                                    Can Teach
                                                </h3>
                                                <p className="text-xs text-slate-600 line-clamp-2">
                                                    {profile.skills_can_teach || "No skills listed"}
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-1.5">
                                                    Wants to Learn
                                                </h3>
                                                <p className="text-xs text-slate-600 line-clamp-2">
                                                    {profile.skills_want_to_learn || "No skills listed"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        {sentRequests.includes(profile.full_name || profile.username) ? (
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
