"use client";

import { useState } from "react";
import { registerUser } from "../../services/auth";

export default function RegisterPage() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await registerUser(username, email, password);

            setMessage("✅ Account created successfully!");

            setUsername("");
            setEmail("");
            setPassword("");

        } catch (error) {
            setMessage("❌ Registration failed.");
            console.error(error);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">

            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

                <h1 className="mb-6 text-center text-3xl font-bold">
                    Create Account
                </h1>


                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        className="w-full rounded border p-3"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-3"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-3"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        className="w-full rounded bg-blue-600 p-3 text-white hover:bg-blue-700"
                        type="submit"
                    >
                        Register
                    </button>

                </form>


                {message && (
                    <p className="mt-4 text-center">
                        {message}
                    </p>
                )}

            </div>

        </div>
    );
}