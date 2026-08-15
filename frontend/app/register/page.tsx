"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser, loginUser, getProfile } from "../../services/auth";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!username.trim() || !email.trim() || !password.trim()) {
            setMessage("❌ Please fill out all required fields.");
            return;
        }

        setLoading(true);

        try {
            // 1. Register student account via Django REST API
            await registerUser(username.trim(), email.trim(), password.trim());

            // 2. Automatically obtain JWT tokens
            const tokenData = await loginUser(username.trim(), password.trim());

            if (tokenData && tokenData.access) {
                localStorage.setItem("access", tokenData.access);
                if (tokenData.refresh) {
                    localStorage.setItem("refresh", tokenData.refresh);
                }
                localStorage.setItem("user_name", username.trim());

                try {
                    const profile = await getProfile(tokenData.access);
                    if (profile) {
                        localStorage.setItem("user_profile", JSON.stringify(profile));
                    }
                } catch {
                    // Profile fetch fallback
                }

                setMessage("✅ Account created successfully! Redirecting to Dashboard...");
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 800);
            } else {
                setMessage("✅ Account created! Redirecting to Sign In...");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
            }
        } catch (err: any) {
            console.error("Registration Error:", err);
            if (err?.response?.data) {
                const errors = err.response.data;
                if (typeof errors === "object") {
                    const firstKey = Object.keys(errors)[0];
                    const firstVal = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
                    setMessage(`❌ ${firstKey}: ${firstVal}`);
                } else {
                    setMessage("❌ Registration failed. Username or email may already be taken.");
                }
            } else {
                setMessage("❌ Unable to connect to server. Please try again.");
            }
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
                        Create an Account
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Join the student collaboration network
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Username
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="Choose a username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Email
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="your.email@university.edu"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Password
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="Create a password"
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
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 rounded-xl border p-3 text-center text-xs font-semibold ${
                        message.startsWith("✅")
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-rose-200 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}>
                        {message}
                    </div>
                )}

                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}