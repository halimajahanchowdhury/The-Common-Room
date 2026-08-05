"use client";

import { useState } from "react";
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

            setUsername("");
            setPassword("");

        } catch (error) {
            setMessage("❌ Login failed.");
            console.error(error);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">

            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

                <h1 className="mb-6 text-center text-3xl font-bold">
                    Login
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
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />


                    <button
                        className="w-full rounded bg-blue-600 p-3 text-white hover:bg-blue-700"
                        type="submit"
                    >
                        Login
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