"use client";

import { useState } from "react";
import Link from "next/link";
import { loginUser, getProfile } from "../../services/auth";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!username.trim() || !password.trim()) {
            setMessage("❌ Please enter both username and password.");
            return;
        }

        setLoading(true);

        try {
            // 1. Obtain real JWT access and refresh tokens from Django API
            const tokenData = await loginUser(username.trim(), password.trim());

            if (tokenData && tokenData.error) {
                setMessage(`❌ ${tokenData.error}`);
                setLoading(false);
                return;
            }

            if (tokenData && tokenData.access) {
                // Clear stale cache from previous sessions
                localStorage.removeItem("user_profile");
                localStorage.removeItem("all_registered_students");
                localStorage.removeItem("sent_requests");

                localStorage.setItem("access", tokenData.access);
                if (tokenData.refresh) {
                    localStorage.setItem("refresh", tokenData.refresh);
                }
                localStorage.setItem("user_name", username.trim());

                // 2. Retrieve student profile from Django backend
                try {
                    const profile = await getProfile(tokenData.access);
                    if (profile) {
                        localStorage.setItem("user_profile", JSON.stringify(profile));
                        if (profile.full_name) {
                            localStorage.setItem("user_name", profile.full_name);
                        }
                    }
                } catch {
                    // Profile fetch optional fallback
                }

                // 3. Redirect to Dashboard with authentic JWT session
                window.location.href = "/dashboard";
            } else {
                setMessage("❌ Invalid username or password.");
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setMessage("❌ Invalid username or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 transition-colors">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <div className="text-center mb-8">
                    <Link href="/" className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        The Common Room
                    </Link>
                    <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Sign in with your Django account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Username
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="Enter your username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
                        {message}
                    </div>
                )}

                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
