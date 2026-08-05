"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function EditProfilePage() {

    const [profile, setProfile] = useState({
        full_name: "",
        university: "",
        department: "",
        semester: "",
        bio: "",
        skills_can_teach: "",
        skills_want_to_learn: "",
    });

    const [message, setMessage] = useState("");


    // Load existing profile data
    useEffect(() => {

        const token = localStorage.getItem("access");

        if (!token) {
            console.log("No token found");
            return;
        }

        api.get("profiles/me/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                setProfile(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

    }, []);



    // Update input values
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {

        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });

    };



    // Save profile changes
    const saveProfile = async () => {

        const token = localStorage.getItem("access");

        try {

            await api.patch(
                "profiles/me/",
                profile,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("Profile updated successfully ✅");

        } catch (error) {

            console.error(error);
            setMessage("Profile update failed ❌");

        }

    };



    return (

        <div className="min-h-screen bg-gray-100 p-10">

            <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow-lg">

                <h1 className="mb-6 text-3xl font-bold">
                    Edit Profile
                </h1>


                <input
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="mb-4 w-full rounded border p-3"
                />


                <input
                    name="university"
                    value={profile.university}
                    onChange={handleChange}
                    placeholder="University"
                    className="mb-4 w-full rounded border p-3"
                />


                <input
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    placeholder="Department"
                    className="mb-4 w-full rounded border p-3"
                />


                <input
                    name="semester"
                    value={profile.semester}
                    onChange={handleChange}
                    placeholder="Semester"
                    className="mb-4 w-full rounded border p-3"
                />


                <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                    className="mb-4 h-28 w-full rounded border p-3"
                />


                <textarea
                    name="skills_can_teach"
                    value={profile.skills_can_teach}
                    onChange={handleChange}
                    placeholder="Skills I can teach (example: Python, C++, Design)"
                    className="mb-4 h-24 w-full rounded border p-3"
                />


                <textarea
                    name="skills_want_to_learn"
                    value={profile.skills_want_to_learn}
                    onChange={handleChange}
                    placeholder="Skills I want to learn (example: Django, AI, React)"
                    className="mb-4 h-24 w-full rounded border p-3"
                />


                <button
                    onClick={saveProfile}
                    className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                    Save Profile
                </button>


                {message && (
                    <p className="mt-4 text-center">
                        {message}
                    </p>
                )}

            </div>

        </div>

    );
}

