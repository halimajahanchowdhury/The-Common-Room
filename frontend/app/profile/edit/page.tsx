"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import Navbar from "../../../components/Navbar";
import Avatar from "../../../components/Avatar";

import { getProfile, updateProfile, resetPassword } from "../../../services/auth";

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

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordMessage, setPasswordMessage] = useState("");
    const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);

    const handlePasswordChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwords.currentPassword.trim() || !passwords.newPassword.trim() || !passwords.confirmPassword.trim()) {
            setPasswordMessage("❌ Please fill out all password fields.");
            setIsPasswordSuccess(false);
            return;
        }

        if (passwords.newPassword.trim() !== passwords.confirmPassword.trim()) {
            setPasswordMessage("❌ New passwords do not match.");
            setIsPasswordSuccess(false);
            return;
        }

        const storedUsername = localStorage.getItem("user_name") || "";
        if (!storedUsername) {
            setPasswordMessage("❌ User session not found. Please sign in again.");
            setIsPasswordSuccess(false);
            return;
        }

        try {
            await resetPassword(storedUsername, passwords.newPassword.trim());
            setPasswordMessage("✅ Password changed successfully!");
            setIsPasswordSuccess(true);
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            console.error("Password update error:", err);
            setPasswordMessage(err?.response?.data?.error || "❌ Failed to update password.");
            setIsPasswordSuccess(false);
        }
    };

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token) {
            getProfile(token)
                .then((data) => {
                    if (data) {
                        setProfile((prev: any) => ({ ...prev, ...data }));
                        localStorage.setItem("user_profile", JSON.stringify(data));
                        if (data.full_name) localStorage.setItem("user_name", data.full_name);
                    }
                })
                .catch(() => loadLocalProfile());
        } else {
            loadLocalProfile();
        }
    }, []);

    const loadLocalProfile = () => {
        const storedProfile = localStorage.getItem("user_profile");
        const storedName = localStorage.getItem("user_name");

        if (storedProfile) {
            try {
                setProfile(JSON.parse(storedProfile));
            } catch {
                if (storedName) {
                    setProfile((prev: any) => ({ ...prev, full_name: storedName }));
                }
            }
        } else if (storedName) {
            setProfile((prev: any) => ({ ...prev, full_name: storedName }));
        }
    };

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

            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const maxDim = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxDim) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
                        setImagePreview(compressedBase64);
                        setProfile((prev: any) => ({
                            ...prev,
                            profile_picture: compressedBase64
                        }));
                    }
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProfile = async () => {
        const token = localStorage.getItem("access");

        if (token) {
            try {
                const payload: any = {
                    full_name: profile.full_name || "",
                    university: profile.university || "",
                    department: profile.department || "",
                    semester: profile.semester || "",
                    bio: profile.bio || "",
                    skills_can_teach: profile.skills_can_teach || "",
                    skills_want_to_learn: profile.skills_want_to_learn || "",
                };

                if (profile.profile_picture) {
                    payload.profile_picture = profile.profile_picture;
                }

                const updatedData = await updateProfile(payload, token);

                if (updatedData && updatedData.error) {
                    const errors = updatedData.error;
                    if (typeof errors === "object") {
                        const firstKey = Object.keys(errors)[0];
                        const firstVal = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
                        setMessage(`❌ ${firstKey}: ${firstVal}`);
                    } else {
                        setMessage("❌ Failed to save profile on server.");
                    }
                    return;
                }

                setProfile((prev: any) => ({ ...prev, ...updatedData }));
                localStorage.setItem("user_profile", JSON.stringify(updatedData));
                setMessage("Profile updated successfully ✅");
                return;
            } catch (err: any) {
                console.error("Failed to update profile via API:", err);
                setMessage("❌ Failed to save profile on server.");
                return;
            }
        }

        localStorage.setItem("user_profile", JSON.stringify(profile));
        setMessage("Profile updated successfully ✅");
    };

    const parseSkillTags = (str: string) => {
        if (!str) return [];
        return str.split(",").map(s => s.trim()).filter(Boolean);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
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
                    <div className="flex items-center gap-5 p-4 mb-6 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800">
                        <Avatar
                            src={imagePreview || profile.profile_picture}
                            name={profile.full_name}
                            size="lg"
                        />
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
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

                    {/* Security & Change Password Card Section */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="pb-4 mb-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">
                                🔒 Security & Password
                            </h2>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                Update your account password for enhanced security.
                            </p>
                        </div>

                        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    placeholder="••••••••"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChangeInput}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="••••••••"
                                        value={passwords.newPassword}
                                        onChange={handlePasswordChangeInput}
                                        className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={passwords.confirmPassword}
                                        onChange={handlePasswordChangeInput}
                                        className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition"
                            >
                                Update Password 🔑
                            </button>
                        </form>

                        {passwordMessage && (
                            <p className={`mt-4 text-center text-xs font-semibold ${isPasswordSuccess ? "text-emerald-600" : "text-rose-600"}`}>
                                {passwordMessage}
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
