"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "../services/auth";
import { GraduationCap, BookOpen, MessageSquare, Sparkles, ArrowRight } from "lucide-react";

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors">
            {/* Navigation Header */}
            <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 px-3.5 sm:px-6 py-3 sm:py-4 transition-colors">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-2xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 dark:from-indigo-400 dark:via-violet-400 dark:to-sky-400 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition shrink-0 whitespace-nowrap"
                    >
                        <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>The Common Room</span>
                    </Link>

                    <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                        {isAuthenticated === true ? (
                            <Link
                                href="/dashboard"
                                className="rounded-xl bg-indigo-600 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
                            >
                                <span>Dashboard</span>
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 sm:px-3 py-1.5 sm:py-2 transition whitespace-nowrap"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-xl bg-indigo-600 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition flex items-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap"
                                >
                                    <span>Get Started</span>
                                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="relative overflow-hidden mx-auto max-w-5xl px-6 py-20 sm:py-28 text-center">
                    {/* Background Soft Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 blur-[130px] pointer-events-none rounded-full" />

                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-8 backdrop-blur-md shadow-2xs">
                        <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                        Campus Collaboration & Skills Exchange Platform
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.15]">
                        Learn, Teach & Grow <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 dark:from-indigo-400 dark:via-violet-400 dark:to-sky-400 bg-clip-text text-transparent">
                            Together on Campus
                        </span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-base sm:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed font-medium">
                        The Common Room connects students to exchange knowledge seamlessly. Share skills you can teach, discover peers who excel in subjects you want to learn, and expand your academic network.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                        {isAuthenticated === true ? (
                            <Link
                                href="/dashboard"
                                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Open Dashboard</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/register"
                                    className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Get Started Free</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                                >
                                    Sign In to Account
                                </Link>
                            </>
                        )}
                    </div>
                </section>

                {/* Core Features Grid */}
                <section className="bg-white/60 dark:bg-slate-900/60 py-20 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                                Empowering Peer-to-Peer Learning
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                                Everything you need to find collaborators and share expertise across campus.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8 shadow-xs hover:shadow-md transition hover:border-indigo-300 dark:hover:border-indigo-500/50">
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Share Your Expertise
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-normal">
                                    List skills in programming, mathematics, languages, or design to guide and support fellow students.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8 shadow-xs hover:shadow-md transition hover:border-violet-300 dark:hover:border-violet-500/50">
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 font-bold">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Discover Skill Matches
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-normal">
                                    Browse student profiles across departments and automatically highlight mutual skill exchange overlaps.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8 shadow-xs hover:shadow-md transition hover:border-sky-300 dark:hover:border-sky-500/50">
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 font-bold">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Peer Messaging & Collabs
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-normal">
                                    Send collaboration requests, manage pending status on your dashboard, and message peers 1-on-1.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-950 py-8 text-center text-slate-500 dark:text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800/80">
                <div className="mx-auto max-w-6xl px-6">
                    <p>© {new Date().getFullYear()} The Common Room — Campus Student Collaboration Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
