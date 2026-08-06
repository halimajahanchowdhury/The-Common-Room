"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getCurrentUser,
    getProfile,
    getReceivedCollaborationRequests,
    getSentCollaborationRequests,
    updateCollaborationRequest,
} from "../../services/auth";

import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<any[]>([]);

    const loadRequests = () => {
        const token = localStorage.getItem("access");
        if (!token) return;

        getReceivedCollaborationRequests(token)
            .then((data) => setReceivedRequests(data))
            .catch((error) => console.error(error));

        getSentCollaborationRequests(token)
            .then((data) => setSentRequests(data))
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) return;

        getCurrentUser(token)
            .then((data) => setUser(data))
            .catch((error) => console.error(error));

        getProfile(token)
            .then((data) => setProfile(data))
            .catch((error) => console.error(error));

        loadRequests();
    }, []);

    const handleRequest = async (requestId: number, status: string) => {
        const token = localStorage.getItem("access");
        if (!token) return;

        try {
            await updateCollaborationRequest(requestId, status, token);
            loadRequests();
        } catch (error) {
            console.error(error);
        }
    };

    const isProfileIncomplete = profile && (!profile.skills_can_teach || !profile.bio);

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
                        {user ? (
                            <>
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
                                            @{user.username} • {user.email}
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
                                <div className="py-6 border-b border-slate-100">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        Bio
                                    </h3>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {profile?.bio || "No bio added yet."}
                                    </p>
                                </div>

                                {/* Received Collaboration Requests */}
                                <div className="py-6 border-b border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                                        Received Collaboration Requests ({receivedRequests.length})
                                    </h3>

                                    {receivedRequests.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                                            <p className="text-xs font-medium text-slate-400">
                                                No collaboration requests received yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {receivedRequests.map((request) => (
                                                <div
                                                    key={request.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 gap-4"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar username={request.sender_username} size="sm" />
                                                        <div>
                                                            <p className="text-sm text-slate-800 font-medium">
                                                                <strong className="text-indigo-600 font-bold">
                                                                    @{request.sender_username}
                                                                </strong>{" "}
                                                                wants to collaborate with you.
                                                            </p>
                                                            <span
                                                                className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                                    request.status === "accepted"
                                                                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                                        : request.status === "rejected"
                                                                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                                                                        : "bg-amber-100 text-amber-700 border border-amber-200"
                                                                }`}
                                                            >
                                                                Status: {request.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {request.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleRequest(request.id, "accepted")}
                                                                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRequest(request.id, "rejected")}
                                                                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Sent Collaboration Requests Tracker */}
                                <div className="pt-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                                        Sent Collaboration Requests Tracker ({sentRequests.length})
                                    </h3>

                                    {sentRequests.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                                            <p className="text-xs font-medium text-slate-400">
                                                You haven't sent any collaboration requests yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {sentRequests.map((request) => (
                                                <div
                                                    key={request.id}
                                                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar username={request.receiver_username} size="sm" />
                                                        <div>
                                                            <p className="text-sm text-slate-800 font-medium">
                                                                Request sent to{" "}
                                                                <strong className="text-indigo-600 font-bold">
                                                                    @{request.receiver_username}
                                                                </strong>
                                                            </p>
                                                            <p className="text-[11px] text-slate-400">
                                                                Sent on {new Date(request.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                                            request.status === "accepted"
                                                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                                : request.status === "rejected"
                                                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                                                : "bg-amber-100 text-amber-700 border border-amber-200"
                                                        }`}
                                                    >
                                                        {request.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center text-slate-400">
                                Loading your dashboard profile...
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
