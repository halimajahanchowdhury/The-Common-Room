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
    Menu,
    X,
} from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
    const [isSystemOpen, setIsSystemOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const systemDropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

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

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (systemDropdownRef.current && !systemDropdownRef.current.contains(event.target as Node)) {
                setIsSystemOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsSystemOpen(false);
    }, [pathname]);

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
        <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs px-4 sm:px-6 lg:px-8 py-3 transition-colors" ref={mobileMenuRef}>
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:gap-4">
                {/* Brand Logo */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-2xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap"
                >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>The Common Room</span>
                </Link>

                {/* DESKTOP Navbar Links (hidden on mobile/tablets, visible lg and up) */}
                <div className="hidden lg:flex items-center gap-2 lg:gap-3 shrink-0">
                    <Link
                        href="/dashboard"
                        className={`text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 ${
                            isActive("/dashboard")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4 shrink-0" />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/students"
                        className={`text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 ${
                            isActive("/students")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <Users className="w-4 h-4 shrink-0" />
                        <span>Browse Students</span>
                    </Link>

                    <Link
                        href="/chat"
                        className={`text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl relative whitespace-nowrap shrink-0 ${
                            isActive("/chat")
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span>Messages</span>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full animate-pulse shadow-xs">
                                {unreadCount}
                            </span>
                        )}
                    </Link>

                    {/* System Dropdown (Edit Profile + Appearance) */}
                    <div className="relative shrink-0" ref={systemDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsSystemOpen(!isSystemOpen)}
                            className={`text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap ${
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
                        className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-1.5 text-xs lg:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-1.5 cursor-pointer ml-1 shadow-2xs whitespace-nowrap shrink-0"
                        title="Sign Out"
                        aria-label="Sign Out"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                    </button>
                </div>

                {/* MOBILE / TABLET Hamburger Button (visible on < lg, hidden on lg+) */}
                <div className="flex lg:hidden items-center gap-2">
                    {unreadCount > 0 && (
                        <Link
                            href="/chat"
                            className="relative p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white animate-pulse">
                                {unreadCount}
                            </span>
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* MOBILE / TABLET Dropdown Drawer Panel */}
            {isMobileMenuOpen && (
                <div className="lg:hidden mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                    <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                            isActive("/dashboard")
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/students"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                            isActive("/students")
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Browse Students</span>
                    </Link>

                    <Link
                        href="/chat"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                            isActive("/chat")
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-4 h-4" />
                            <span>Messages</span>
                        </div>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                {unreadCount} New
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/profile/edit"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                            isActive("/profile/edit")
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Edit Profile & Skills</span>
                    </Link>

                    {/* Mobile Appearance Switcher */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <Palette className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Theme Appearance</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => applyTheme("light")}
                                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    themeMode === "light"
                                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shadow-2xs border border-amber-200 dark:border-amber-800"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                <Sun className="w-3.5 h-3.5" />
                                <span>Light</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => applyTheme("dark")}
                                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    themeMode === "dark"
                                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs border border-indigo-200 dark:border-indigo-800"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                <Moon className="w-3.5 h-3.5" />
                                <span>Dark</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => applyTheme("system")}
                                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    themeMode === "system"
                                        ? "bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shadow-2xs border border-teal-200 dark:border-teal-800"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                <Laptop className="w-3.5 h-3.5" />
                                <span>System</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Logout Button */}
                    <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer shadow-2xs"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Account</span>
                    </button>
                </div>
            )}
        </nav>
    );
}
