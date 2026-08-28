"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    UserCircle,
    Sun,
    Moon,
    Laptop,
    LogOut,
    Sparkles,
    Settings,
    ChevronDown,
    Palette,
    User,
    Check,
} from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
    const [isSystemOpen, setIsSystemOpen] = useState(false);
    const systemDropdownRef = useRef<HTMLDivElement>(null);

    // Apply theme helper
    const applyTheme = (mode: "light" | "dark" | "system") => {
        setThemeMode(mode);
        localStorage.setItem("app_theme", mode);

        if (mode === "system") {
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (systemPrefersDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        } else if (mode === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    // Initialize theme on mount
    useEffect(() => {
        const savedTheme = (localStorage.getItem("app_theme") as "light" | "dark" | "system") || "system";
        applyTheme(savedTheme);

        // Listen to OS theme changes if on system mode
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemChange = (e: MediaQueryListEvent) => {
            const currentSaved = localStorage.getItem("app_theme") || "system";
            if (currentSaved === "system") {
                if (e.matches) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            }
        };

        mediaQuery.addEventListener("change", handleSystemChange);
        return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (systemDropdownRef.current && !systemDropdownRef.current.contains(event.target as Node)) {
                setIsSystemOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load unread count
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
                {/* Brand Logo */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition-opacity shrink-0"
                >
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>The Common Room</span>
                </Link>

                {/* Navbar Links & Actions */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                    <Link
                        href="/dashboard"
                        className={`text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${
                            isActive("/dashboard")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>

                    <Link
                        href="/students"
                        className={`text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${
                            isActive("/students")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <Users className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Browse Students</span>
                    </Link>

                    <Link
                        href="/chat"
                        className={`text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl relative ${
                            isActive("/chat")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Messages</span>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full animate-pulse shadow-xs">
                                {unreadCount}
                            </span>
                        )}
                    </Link>

                    {/* System Dropdown (Edit Profile + Appearance) */}
                    <div className="relative" ref={systemDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsSystemOpen(!isSystemOpen)}
                            className={`text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-pointer ${
                                isSystemOpen || isActive("/profile/edit")
                                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50"
                                    : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
                            }`}
                        >
                            <Settings className="w-4 h-4 shrink-0" />
                            <span>System</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSystemOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isSystemOpen && (
                            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2.5 space-y-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                                {/* Profile Link */}
                                <Link
                                    href="/profile/edit"
                                    onClick={() => setIsSystemOpen(false)}
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                >
                                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Edit Profile</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Skills, photo & academic tags</div>
                                    </div>
                                </Link>

                                <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />

                                {/* Appearance Section */}
                                <div className="p-1.5">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                        <Palette className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Appearance</span>
                                    </div>

                                    {/* 3-Way Segmented Switcher */}
                                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => applyTheme("light")}
                                            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                                themeMode === "light"
                                                    ? "bg-white dark:bg-slate-800 text-amber-500 shadow-2xs border border-slate-200 dark:border-slate-700"
                                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                            }`}
                                        >
                                            <Sun className="w-4 h-4" />
                                            <span>Light</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => applyTheme("dark")}
                                            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                                themeMode === "dark"
                                                    ? "bg-white dark:bg-slate-800 text-indigo-400 shadow-2xs border border-slate-200 dark:border-slate-700"
                                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                            }`}
                                        >
                                            <Moon className="w-4 h-4" />
                                            <span>Dark</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => applyTheme("system")}
                                            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                                themeMode === "system"
                                                    ? "bg-white dark:bg-slate-800 text-teal-500 shadow-2xs border border-slate-200 dark:border-slate-700"
                                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                            }`}
                                        >
                                            <Laptop className="w-4 h-4" />
                                            <span>System</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 text-xs md:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-1.5 cursor-pointer ml-1"
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
