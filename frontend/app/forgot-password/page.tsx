"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [identity, setIdentity] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();

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

        const inputId = identity.trim().toLowerCase();
        let allStudents: any[] = [];
        try {
            const parsed = JSON.parse(localStorage.getItem("all_registered_students") || "[]");
            if (Array.isArray(parsed)) allStudents = parsed;
        } catch {
            allStudents = [];
        }

        const foundIndex = allStudents.findIndex((s: any) => 
            s && (
                String(s.username || "").toLowerCase().trim() === inputId ||
                String(s.email || "").toLowerCase().trim() === inputId ||
                String(s.full_name || "").toLowerCase().trim() === inputId
            )
        );

        if (foundIndex === -1) {
            setMessage("❌ Account not found with that username or email.");
            setIsSuccess(false);
            return;
        }

        // Update password for that specific user
        allStudents[foundIndex].password = newPassword.trim();
        localStorage.setItem("all_registered_students", JSON.stringify(allStudents));

        // Sync with user_profile if it's the currently active user
        try {
            const activeProfile = JSON.parse(localStorage.getItem("user_profile") || "{}");
            if (activeProfile.username === allStudents[foundIndex].username) {
                activeProfile.password = newPassword.trim();
                localStorage.setItem("user_profile", JSON.stringify(activeProfile));
            }
        } catch {
            // Ignore error if profile invalid
        }

        setMessage("✅ Password reset successfully! Redirecting to Sign In...");
        setIsSuccess(true);

        setTimeout(() => {
            window.location.href = "/login";
        }, 1500);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800 p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="text-center mb-8">
                    <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        The Common Room
                    </Link>
                    <h1 className="mt-3 text-2xl font-bold text-slate-900">
                        Reset Password
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                        Enter your username or email to set a new password.
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Username or Email
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="Enter your username or email"
                            required
                            value={identity}
                            onChange={(e) => setIdentity(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            New Password
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                        type="submit"
                    >
                        Reset Password 🔑
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center text-xs font-semibold ${isSuccess ? "text-emerald-600" : "text-rose-600"}`}>
                        {message}
                    </p>
                )}

                <div className="mt-6 text-center text-xs text-slate-500">
                    Remembered your password?{" "}
                    <Link href="/login" className="font-bold text-indigo-600 hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
