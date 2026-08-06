"use client";

import { useState } from "react";
import Link from "next/link";
import { loginUser } from "../../services/auth";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await loginUser(username, password);
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            window.location.href = "/dashboard";
        } catch (error) {
            console.error(error);
            setMessage("❌ Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800 p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="text-center mb-8">
                    <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        The Common Room
                    </Link>
                    <h1 className="mt-3 text-2xl font-bold text-slate-900">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Sign in to access your student dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Username
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Password
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                        type="submit"
                    >
                        Sign In
                    </button>
                </form>

                {message && (
                    <p className="mt-4 text-center text-sm font-medium text-rose-600">
                        {message}
                    </p>
                )}

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
