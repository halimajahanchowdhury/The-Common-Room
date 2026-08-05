"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getProfile } from "../../services/auth";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token) {
            return;
        }

        getCurrentUser(token)
            .then((data) => setUser(data))
            .catch((error) => console.error(error));


        getProfile(token)
            .then((data) => setProfile(data))
            .catch((error) => console.error(error));

    }, []);


    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
    };


    return (
        <div className="min-h-screen bg-gray-100 p-10">

            <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-lg">

                <h1 className="mb-6 text-4xl font-bold">
                    The Common Room
                </h1>


                {user ? (

                    <>

                        <h2 className="text-2xl font-semibold">
                            Welcome, {user.username} 👋
                        </h2>


                        <p className="mt-2 text-gray-600">
                            {user.email}
                        </p>


                        <hr className="my-8" />


                        <h3 className="text-xl font-semibold">
                            Skills I Can Teach
                        </h3>

                        <p className="text-gray-600">
                            {profile?.skills_can_teach || "Not added yet"}
                        </p>


                        <br />


                        <h3 className="text-xl font-semibold">
                            Skills I Want to Learn
                        </h3>

                        <p className="text-gray-600">
                            {profile?.skills_want_to_learn || "Not added yet"}
                        </p>


                        <br />


                        <h3 className="text-xl font-semibold">
                            Bio
                        </h3>

                        <p className="text-gray-600">
                            {profile?.bio || "No bio added yet"}
                        </p>


                        <br />


                        <h3 className="text-xl font-semibold">
                            Recent Posts
                        </h3>

                        <p className="text-gray-500">
                            (Coming next)
                        </p>



                        <div className="mt-8 flex gap-4">

                            <button
                                onClick={() => {
                                    window.location.href = "/profile/edit";
                                }}
                                className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                            >
                                Edit Profile
                            </button>


                            <button
                                onClick={logout}
                                className="rounded bg-red-600 px-6 py-3 text-white hover:bg-red-700"
                            >
                                Logout
                            </button>

                        </div>


                    </>

                ) : (

                    <p>Loading...</p>

                )}

            </div>

        </div>
    );
}
