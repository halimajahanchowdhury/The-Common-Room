"use client";

import { useEffect, useState } from "react";
import { getAllProfiles } from "../../services/auth";

export default function StudentsPage() {

    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const token = localStorage.getItem("access");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        getAllProfiles(token)
            .then((data) => {
                setProfiles(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });

    }, []);

    if (loading) {
        return (
            <div className="p-10 text-center text-xl">
                Loading students...
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-gray-100 p-10">

            <div className="mx-auto max-w-6xl">

                <h1 className="mb-8 text-4xl font-bold">
                    Browse Students
                </h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {profiles.map((profile) => (

                        <div
                            key={profile.id}
                            className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-xl"
                        >

                            <h2 className="mb-2 text-2xl font-semibold">
                                {profile.full_name}
                            </h2>

                            <p className="mb-3 text-gray-500">
                                {profile.university}
                            </p>

                            <h3 className="font-semibold">
                                Can Teach
                            </h3>

                            <p className="mb-4 text-gray-700">
                                {profile.skills_can_teach || "No skills added"}
                            </p>

                            <h3 className="font-semibold">
                                Wants to Learn
                            </h3>

                            <p className="mb-6 text-gray-700">
                                {profile.skills_want_to_learn || "No skills added"}
                            </p>

                            <button
                                className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700"
                            >
                                View Profile
                            </button>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}


