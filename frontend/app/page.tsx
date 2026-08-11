"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "../services/auth";

export default function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        getCurrentUser(token)
            .then(() => {
                setIsAuthenticated(true);
            })
            .catch(() => {
                setIsAuthenticated(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
            {/* Header / Navigation Bar */}
            <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 px-8 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link
                        href="/"
                        className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent tracking-tight"
                    >
                        The Common Room
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-slate-300 hover:text-indigo-400 px-3 py-2 transition"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="relative overflow-hidden mx-auto max-w-5xl px-6 py-24 text-center">
                    {/* Radial Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

                    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                        Collaborative Student Platform
                    </span>

                    <h1 className="text-5xl font-black text-white tracking-tight sm:text-6xl mb-6 leading-tight">
                        Learn, Teach & Grow <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                            Together on Campus
                        </span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-lg text-slate-400 mb-10 leading-relaxed">
                        The Common Room connects students to exchange knowledge seamlessly. List skills you can teach, find peers who excel in subjects you want to learn, and build your collaborative academic network.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition hover:-translate-y-0.5"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/login"
                            className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800/80 px-8 py-4 text-base font-semibold text-slate-200 shadow-sm hover:bg-slate-800 hover:text-white transition hover:-translate-y-0.5"
                        >
                            Sign In to Account
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-slate-950/60 py-20 border-t border-slate-800/80">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl font-bold text-white mb-3">
                                Empowering Peer-to-Peer Learning
                            </h2>
                            <p className="text-slate-400">
                                Simple tools designed to make student collaboration effortless.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-sm transition hover:border-slate-700 hover:bg-slate-900/90">
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-2xl">
                                    🎓
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Share Your Expertise
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Offer your skills in programming, math, languages, or design to guide and help fellow students.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-sm transition hover:border-slate-700 hover:bg-slate-900/90">
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-2xl">
                                    📚
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Learn New Skills
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Browse student profiles across departments and connect with peers ready to teach what you want to learn.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-sm transition hover:border-slate-700 hover:bg-slate-900/90">
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-2xl">
                                    🤝
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Seamless Collaboration
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Send collaboration requests, manage pending status, and share comments directly on collaborator profiles.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 py-8 text-center text-slate-500 text-xs border-t border-slate-800/60">
                <div className="mx-auto max-w-6xl px-6">
                    <p>© {new Date().getFullYear()} The Common Room. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
