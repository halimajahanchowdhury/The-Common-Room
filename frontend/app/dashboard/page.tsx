"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";

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

        // Sent requests (sent BY active user)
        const mySent = savedRequests.filter((r: any) => {
            if (!r) return false;
            const sender = String(r.from_user || "").toLowerCase().trim();
            return sender === currentNameLower;
        });
        setSentRequests(mySent);

        // Received requests (sent TO active user)
        const myReceived = savedRequests.filter((r: any) => {
            if (!r) return false;
            const recipient = String(r.to_user || "").toLowerCase().trim();
            return recipient === currentNameLower;
        });
        setReceivedRequests(myReceived);
    };

    useEffect(() => {
        const storedName = localStorage.getItem("user_name") || "Student";
        const storedEmail = localStorage.getItem("user_email") || `${storedName}@gmail.com`;
        const storedProfile = localStorage.getItem("user_profile");

        loadRequests(storedName);

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
        } else {
            setProfile((prev: any) => ({
                ...prev,
                full_name: storedName
            }));
        }
    }, []);

    const handleUpdateRequestStatus = (requestId: number, newStatus: string) => {
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
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            <Navbar />

            <main className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-4xl space-y-6">

                    {/* Profile Completion Reminder Banner */}
                    {isProfileIncomplete && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent p-6 shadow-xs">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✨</span>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">
                                        Complete Your Profile
                                    </h4>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Add your skills and bio so other students can discover and collaborate with you.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/profile/edit"
                                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition shrink-0 text-center"
                            >
                                Edit Profile →
                            </Link>
                        </div>
                    )}

                    {/* Main Dashboard Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        {/* Profile Header with Avatar */}
                        <div className="flex items-center pb-6 border-b border-slate-100 gap-4">
                            <Avatar src={profile?.profile_picture} name={profile?.full_name} username={user.username} size="lg" />
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700 mb-1">
                                    Student Dashboard
                                </div>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {profile?.full_name || user.username}
                                </h1>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">
                                    @{user.username} • {user.email} • {profile?.university} ({profile?.department})
                                </p>
                            </div>
                        </div>

                        {/* Skills Grid */}
                        <div className="grid gap-6 md:grid-cols-2 py-6 border-b border-slate-100">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3">
                                    🎓 Skills I Can Teach
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile?.skills_can_teach ? (
                                        profile.skills_can_teach.split(",").map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="inline-block rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-3">
                                    📚 Skills I Want to Learn
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile?.skills_want_to_learn ? (
                                        profile.skills_want_to_learn.split(",").map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="inline-block rounded-lg bg-teal-50 border border-teal-100 px-3 py-1 text-xs font-semibold text-teal-700"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="pt-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Bio
                            </h3>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {profile?.bio || "No bio added yet."}
                            </p>
                        </div>
                    </div>

                    {/* Received Collaboration Requests Section */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Received Collaboration Requests
                                </h2>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">
                                    Requests sent to you from peer students across campus.
                                </p>
                            </div>
                            <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                                {receivedRequests.length} Total
                            </span>
                        </div>

                        {receivedRequests.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                                No collaboration requests received yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {receivedRequests.map((req: any) => (
                                    <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">
                                                Request from: {req.from_user}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Skill Focus: <span className="font-semibold text-indigo-600">{req.skills}</span> • Sent on {req.date}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 self-start sm:self-auto">
                                            {req.status === "Pending" ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateRequestStatus(req.id, "Accepted")}
                                                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                                    >
                                                        Accept ✅
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateRequestStatus(req.id, "Declined")}
                                                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                                                    >
                                                        Decline ❌
                                                    </button>
                                                </>
                                            ) : (
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                        req.status === "Accepted"
                                                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                                            : "bg-rose-50 border border-rose-200 text-rose-700"
                                                    }`}
                                                >
                                                    {req.status === "Accepted" ? "Accepted ✅" : "Declined ❌"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sent Collaboration Requests Section */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Sent Collaboration Requests
                                </h2>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">
                                    Track requests sent to peers across campus.
                                </p>
                            </div>
                            <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                                {sentRequests.length} Total
                            </span>
                        </div>

                        {sentRequests.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                                No collaboration requests sent yet. Browse students to connect!
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {sentRequests.map((req: any, index: number) => (
                                    <div key={index} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">
                                                Request sent to: {req.to_user}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Skill Focus: <span className="font-semibold text-indigo-600">{req.skills}</span> • Sent on {req.date}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                req.status === "Accepted"
                                                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                                    : req.status === "Declined"
                                                    ? "bg-rose-50 border border-rose-200 text-rose-700"
                                                    : "bg-amber-50 border border-amber-200 text-amber-700"
                                            }`}
                                        >
                                            {req.status === "Accepted"
                                                ? "Accepted ✅"
                                                : req.status === "Declined"
                                                ? "Declined ❌"
                                                : "Pending ⏳"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
