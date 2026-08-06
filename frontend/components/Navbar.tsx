"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
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

                <div className="flex items-center gap-6">
                    <Link
                        href="/dashboard"
                        className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/students"
                        className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
                    >
                        Browse Students
                    </Link>

                    <Link
                        href="/profile/edit"
                        className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
                    >
                        My Profile
                    </Link>

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


