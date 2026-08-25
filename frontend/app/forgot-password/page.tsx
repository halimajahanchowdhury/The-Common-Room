"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "../../services/auth";
import { evaluatePassword, isPasswordValid } from "../../utils/passwordValidation";
import {
    User,
    KeyRound,
    Lock,
    Eye,
    EyeOff,
    Sparkles,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Check,
    X,
} from "lucide-react";

export default function ForgotPasswordPage() {
    const [identity, setIdentity] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const criteria = evaluatePassword(newPassword);
    const validNewPassword = isPasswordValid(newPassword);
    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
    const canSubmit = validNewPassword && passwordsMatch && identity.trim().length > 0;

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!identity.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setMessage("Please fill out all fields.");
            setIsSuccess(false);
            return;
        }

        if (!validNewPassword) {
            setMessage("New password does not satisfy security requirements.");
            setIsSuccess(false);
            return;
        }

        if (newPassword.trim() !== confirmPassword.trim()) {
            setMessage("Passwords do not match.");
            setIsSuccess(false);
            return;
        }

        setLoading(true);

        try {
            await resetPassword(identity.trim(), newPassword.trim());
            setMessage("Password reset successfully! Redirecting to Sign In...");
            setIsSuccess(true);

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch (err: any) {
            console.error("Password reset error:", err);
            if (err?.response?.data?.error) {
                setMessage(String(err.response.data.error));
            } else {
                setMessage("Account not found with that username or email.");
            }
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 transition-colors">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                        <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <span>The Common Room</span>
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Reset Password
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Enter your username or email to set a new password.
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
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
                                value={identity}
                                onChange={(e) => setIdentity(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-10 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                placeholder="••••••••"
                                type={showNewPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                title={showNewPassword ? "Hide password" : "Show password"}
                                aria-label="Toggle new password visibility"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Password Requirements Checklist */}
                    {newPassword.length > 0 && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3.5 text-xs space-y-1.5 transition">
                            <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider mb-2">
                                New Password Requirements:
                            </div>
                            <div className={`flex items-center gap-2 font-medium ${criteria.length ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                {criteria.length ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                <span>At least 8 characters</span>
                            </div>
                            <div className={`flex items-center gap-2 font-medium ${criteria.hasUppercase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                {criteria.hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                <span>At least one uppercase letter (A-Z)</span>
                            </div>
                            <div className={`flex items-center gap-2 font-medium ${criteria.hasLowercase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                {criteria.hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                <span>At least one lowercase letter (a-z)</span>
                            </div>
                            <div className={`flex items-center gap-2 font-medium ${criteria.hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                {criteria.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                <span>At least one number (0-9)</span>
                            </div>
                            <div className={`flex items-center gap-2 font-medium ${criteria.hasSpecialChar ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                {criteria.hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                <span>At least one special character (!@#$%^&*...)</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className={`w-full rounded-xl border bg-white dark:bg-slate-950 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition ${
                                    confirmPassword.length > 0
                                        ? passwordsMatch
                                            ? "border-emerald-400 dark:border-emerald-700 focus:ring-emerald-500/20"
                                            : "border-rose-400 dark:border-rose-700 focus:ring-rose-500/20"
                                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                                }`}
                                placeholder="••••••••"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                title={showConfirmPassword ? "Hide password" : "Show password"}
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <p className="mt-1.5 text-xs font-semibold text-rose-500 flex items-center gap-1">
                                <X className="w-3.5 h-3.5" />
                                <span>Passwords do not match</span>
                            </p>
                        )}
                    </div>

                    <button
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-bold text-white shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        type="submit"
                        disabled={loading || !canSubmit}
                    >
                        <span>{loading ? "Resetting Password..." : "Reset Password"}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 rounded-xl border p-3.5 text-center text-xs font-semibold flex items-center justify-center gap-2 ${
                        isSuccess
                            ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-rose-200 dark:border-rose-900/40 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}>
                        {isSuccess ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{message}</span>
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
