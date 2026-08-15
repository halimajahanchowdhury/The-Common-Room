"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "../../services/auth";

export default function ForgotPasswordPage() {
    const [identity, setIdentity] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!identity.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setMessage("❌ Please fill out all fields.");
            setIsSuccess(false);
            return;
        }

        if (newPassword.trim() !== confirmPassword.trim()) {
            setMessage("❌ Passwords do not match.");
            setIsSuccess(false);
            return;
        }

        setLoading(true);

        try {
            await resetPassword(identity.trim(), newPassword.trim());
            setMessage("✅ Password reset successfully! Redirecting to Sign In...");
            setIsSuccess(true);

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch (err: any) {
            console.error("Password reset error:", err);
            if (err?.response?.data?.error) {
                setMessage(`❌ ${err.response.data.error}`);
            } else {
                setMessage("❌ Account not found with that username or email.");
            }
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 transition-colors">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <div className="text-center mb-8">
                    <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        The Common Room
                    </Link>
                    <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                        Reset Password
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Enter your username or email to set a new password.
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Username or Email
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="Enter your username or email"
                            required
                            value={identity}
                            onChange={(e) => setIdentity(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            New Password
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Resetting Password..." : "Reset Password 🔑"}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 rounded-xl border p-3 text-center text-xs font-semibold ${
                        isSuccess
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-rose-200 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}>
                        {message}
                    </div>
                )}

                <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    Remembered your password?{" "}
                    <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
