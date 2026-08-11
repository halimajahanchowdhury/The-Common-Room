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

    useEffect(() => {
        const storedName = localStorage.getItem("user_name") || "Student";
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
        } else {
            setProfile((prev: any) => ({
                ...prev,
                full_name: storedName
            }));
        }
    }, []);

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
                </div>
            </main>
        </div>
    );
}
