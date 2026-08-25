"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    UserCircle,
    Sun,
    Moon,
    LogOut,
    Sparkles,
} from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
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

    const isActive = (path: string) => pathname === path || (path !== "/dashboard" && pathname?.startsWith(path));

    return (
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs px-4 md:px-8 py-3">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition-opacity"
                >
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>The Common Room</span>
                </Link>

                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto py-1">
                    <Link
                        href="/dashboard"
                        className={`text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                            isActive("/dashboard")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>

                    <Link
                        href="/students"
                        className={`text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                            isActive("/students")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Browse Students</span>
                    </Link>

                    <Link
                        href="/chat"
                        className={`text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg relative ${
                            isActive("/chat")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Messages</span>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full animate-pulse shadow-xs">
                                {unreadCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/profile/edit"
                        className={`text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                            isActive("/profile/edit")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <UserCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">My Profile</span>
                    </Link>

                    <button
                        onClick={toggleTheme}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Toggle Dark / Light Theme"
                        aria-label="Toggle Dark / Light Theme"
                    >
                        {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                        <span className="hidden md:inline">{isDarkMode ? "Light" : "Dark"}</span>
                    </button>

                    <button
                        onClick={logout}
                        className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 text-xs md:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-1 cursor-pointer"
                        title="Sign Out"
                        aria-label="Sign Out"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
