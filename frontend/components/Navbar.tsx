"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("app_theme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
            localStorage.setItem("app_theme", "light");
        } else {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
            localStorage.setItem("app_theme", "dark");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) return;

        const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/";
        fetch(`${apiHost}chat/unread_count/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && typeof data.unread_count === "number") {
                    setUnreadCount(data.unread_count);
                }
            })
            .catch(() => {});
    }, []);

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user_profile");
        localStorage.removeItem("user_name");
        router.push("/login");
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 shadow-xs px-8 py-3.5">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                <Link
                    href="/dashboard"
                    className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent tracking-tight"
                >
                    The Common Room
                </Link>

                <div className="flex items-center gap-5">
                    <Link
                        href="/dashboard"
                        className="text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/students"
                        className="text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                        Browse Students
                    </Link>

                    <Link
                        href="/chat"
                        className="text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
                    >
                        <span>Messages 💬</span>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full animate-pulse shadow-xs">
                                {unreadCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/profile/edit"
                        className="text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                        My Profile
                    </Link>

                    <button
                        onClick={toggleTheme}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Toggle Dark / Light Theme"
                    >
                        {isDarkMode ? "☀️ Light" : "🌙 Dark"}
                    </button>

                    <button
                        onClick={logout}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}


