"use client";

import { useState } from "react";
import Link from "next/link";
import { loginUser, getProfile } from "../../services/auth";
import { User, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!username.trim() || !password.trim()) {
            setMessage("Please enter both username and password.");
            return;
        }

        setLoading(true);

        try {
            // 1. Obtain real JWT access and refresh tokens from Django API
            const tokenData = await loginUser(username.trim(), password.trim());

            if (tokenData && tokenData.error) {
                setMessage(String(tokenData.error));
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
                setMessage("Invalid username or password.");
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setMessage("Invalid username or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 transition-colors">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                        <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <span>The Common Room</span>
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Sign in with your username or email address
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Username or Email
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                placeholder="Enter username or email"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-10 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                title={showPassword ? "Hide password" : "Show password"}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-bold text-white shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        type="submit"
                        disabled={loading}
                    >
                        <span>{loading ? "Signing In..." : "Sign In"}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {message && (
                    <div className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-center text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{message}</span>
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
