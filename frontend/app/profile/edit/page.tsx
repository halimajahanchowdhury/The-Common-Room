"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import Navbar from "../../../components/Navbar";
import Avatar from "../../../components/Avatar";

export default function EditProfilePage() {
    const [profile, setProfile] = useState<any>({
        full_name: "",
        university: "",
        department: "",
        semester: "",
        bio: "",
        profile_picture: null,
        skills_can_teach: "",
        skills_want_to_learn: "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [message, setMessage] = useState("");

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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const saveProfile = async () => {
        const token = localStorage.getItem("access");

        const formData = new FormData();
        formData.append("full_name", profile.full_name || "");
        formData.append("university", profile.university || "");
        formData.append("department", profile.department || "");
        formData.append("semester", profile.semester || "");
        formData.append("bio", profile.bio || "");
        formData.append("skills_can_teach", profile.skills_can_teach || "");
        formData.append("skills_want_to_learn", profile.skills_want_to_learn || "");

        if (imageFile) {
            formData.append("profile_picture", imageFile);
        }

        try {
            const response = await api.patch("profiles/me/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setProfile(response.data);
            setImagePreview(null);
            setMessage("Profile updated successfully ✅");
        } catch (error) {
            console.error(error);
            setMessage("Profile update failed ❌");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            <Navbar />

            <main className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h1 className="mb-2 text-3xl font-extrabold text-slate-900 tracking-tight">
                        Edit Your Profile
                    </h1>
                    <p className="mb-6 text-sm font-medium text-slate-500">
                        Update your profile picture, academic details, and skills to help other students find you.
                    </p>

                    {/* Profile Picture Preview & Upload */}
                    <div className="flex items-center gap-5 p-4 mb-6 rounded-xl border border-slate-100 bg-slate-50/60">
                        <Avatar
                            src={imagePreview || profile.profile_picture}
                            name={profile.full_name}
                            size="lg"
                        />
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Full Name
                            </label>
                            <input
                                name="full_name"
                                value={profile.full_name || ""}
                                onChange={handleChange}
                                placeholder="Your Full Name"
                                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                University
                            </label>
                            <input
                                name="university"
                                value={profile.university || ""}
                                onChange={handleChange}
                                placeholder="University Name"
                                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Department
                                </label>
                                <input
                                    name="department"
                                    value={profile.department || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. Computer Science"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Semester
                                </label>
                                <input
                                    name="semester"
                                    value={profile.semester || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. 5th Semester"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={profile.bio || ""}
                                onChange={handleChange}
                                placeholder="Tell us a little bit about yourself..."
                                className="h-28 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                                🎓 Skills I Can Teach
                            </label>
                            <textarea
                                name="skills_can_teach"
                                value={profile.skills_can_teach || ""}
                                onChange={handleChange}
                                placeholder="Comma-separated: e.g. Python, Machine Learning, UI Design"
                                className="h-24 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
                                📚 Skills I Want to Learn
                            </label>
                            <textarea
                                name="skills_want_to_learn"
                                value={profile.skills_want_to_learn || ""}
                                onChange={handleChange}
                                placeholder="Comma-separated: e.g. Next.js, Django, Data Structures"
                                className="h-24 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>

                        <button
                            onClick={saveProfile}
                            className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition mt-4"
                        >
                            Save Profile Changes
                        </button>

                        {message && (
                            <p className="mt-3 text-center text-sm font-medium text-indigo-600">
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
