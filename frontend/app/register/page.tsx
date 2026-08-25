"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "../../services/auth";
import { evaluatePassword, isPasswordValid } from "../../utils/passwordValidation";
import {
    User,
    Mail,
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

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const criteria = evaluatePassword(password);
    const validPassword = isPasswordValid(password);
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const canSubmit = validPassword && passwordsMatch && username.trim().length > 0 && email.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setIsSuccess(false);

        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setMessage("Please fill out all required fields.");
            return;
        }

        if (!validPassword) {
            setMessage("Password does not satisfy security requirements.");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Password and Confirm Password do not match.");
            return;
        }

        setLoading(true);

        try {
            // Register student account via Django REST API
            const result = await registerUser(username.trim(), email.trim(), password.trim());

            if (result && result.error) {
                const errors = result.error;
                if (typeof errors === "object") {
                    const firstKey = Object.keys(errors)[0];
                    const firstVal = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
                    setMessage(`${firstKey}: ${firstVal}`);
                } else {
                    setMessage(String(result.error));
                }
                setLoading(false);
                return;
            }

            setIsSuccess(true);
            setMessage("Account created successfully! Redirecting to Sign In...");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);
        } catch (err: any) {
            console.error("Registration Error:", err);
            setMessage("Unable to complete registration. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 transition-colors">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                        <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <span>The Common Room</span>
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Create an Account
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Join the student peer collaboration network
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                placeholder="Choose a username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            University Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                placeholder="your.email@university.edu"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-10 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                placeholder="Create a password"
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

                    {/* Password Requirements Checklist */}
                    {password.length > 0 && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3.5 text-xs space-y-1.5 transition">
                            <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider mb-2">
                                Password Requirements:
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
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className={`w-full rounded-xl border bg-white dark:bg-slate-950 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition ${
                                    confirmPassword.length > 0
                                        ? passwordsMatch
                                            ? "border-emerald-400 dark:border-emerald-700 focus:ring-emerald-500/20"
                                            : "border-rose-400 dark:border-rose-700 focus:ring-rose-500/20"
                                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                                }`}
                                placeholder="Re-enter password"
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
                        <span>{loading ? "Creating Account..." : "Sign Up"}</span>
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