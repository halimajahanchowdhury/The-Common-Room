"use client";

import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Avatar from "../../../components/Avatar";
import { getProfile, updateProfile, resetPassword } from "../../../services/auth";
import { evaluatePassword, isPasswordValid } from "../../../utils/passwordValidation";
import {
    User,
    GraduationCap,
    BookOpen,
    Camera,
    Lock,
    KeyRound,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Save,
    Building,
    Book,
    Eye,
    EyeOff,
    Check,
    X,
    Upload,
    Trash2,
} from "lucide-react";

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

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handlePasswordChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const newPassCriteria = evaluatePassword(passwords.newPassword);
    const validNewPass = isPasswordValid(passwords.newPassword);
    const newPassMatch = passwords.confirmPassword.length > 0 && passwords.newPassword === passwords.confirmPassword;

    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwords.currentPassword.trim() || !passwords.newPassword.trim() || !passwords.confirmPassword.trim()) {
            setPasswordMessage("Please fill out all password fields.");
            setIsPasswordSuccess(false);
            return;
        }

        if (!validNewPass) {
            setPasswordMessage("New password does not satisfy security requirements.");
            setIsPasswordSuccess(false);
            return;
        }

        if (passwords.newPassword.trim() !== passwords.confirmPassword.trim()) {
            setPasswordMessage("New passwords do not match.");
            setIsPasswordSuccess(false);
            return;
        }

        const storedUsername = localStorage.getItem("user_name") || "";
        if (!storedUsername) {
            setPasswordMessage("User session not found. Please sign in again.");
            setIsPasswordSuccess(false);
            return;
        }

        try {
            await resetPassword(storedUsername, passwords.newPassword.trim());
            setPasswordMessage("Password changed successfully!");
            setIsPasswordSuccess(true);
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            console.error("Password update error:", err);
            setPasswordMessage(err?.response?.data?.detail || err?.response?.data?.error || "Failed to update password.");
            setIsPasswordSuccess(false);
        }
    };

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [isProfileSuccess, setIsProfileSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

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

    const handleRemovePhoto = () => {
        setImageFile(null);
        setImagePreview(null);
        setProfile((prev: any) => ({
            ...prev,
            profile_picture: null,
        }));
        const fileInput = document.getElementById("avatar-file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const saveProfile = async () => {
        setSaving(true);
        setMessage("");
        setIsProfileSuccess(false);

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
                    profile_picture: profile.profile_picture || null,
                };

                const updatedData = await updateProfile(payload, token);

                if (updatedData && updatedData.error) {
                    const errors = updatedData.error;
                    if (typeof errors === "object") {
                        const firstKey = Object.keys(errors)[0];
                        const firstVal = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
                        setMessage(`${firstKey}: ${firstVal}`);
                    } else {
                        setMessage("Failed to save profile on server.");
                    }
                    setIsProfileSuccess(false);
                    setSaving(false);
                    return;
                }

                setProfile((prev: any) => ({ ...prev, ...updatedData }));
                localStorage.setItem("user_profile", JSON.stringify(updatedData));
                setMessage("Profile updated successfully!");
                setIsProfileSuccess(true);
                setSaving(false);
                return;
            } catch (err: any) {
                console.error("Failed to update profile via API:", err);
                setMessage("Failed to save profile on server.");
                setIsProfileSuccess(false);
                setSaving(false);
                return;
            }
        }

        localStorage.setItem("user_profile", JSON.stringify(profile));
        setMessage("Profile updated successfully!");
        setIsProfileSuccess(true);
        setSaving(false);
    };

    const hasPhoto = Boolean(imagePreview || profile.profile_picture);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
            <Navbar />

            <main className="flex-1 p-4 md:p-10">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Main Profile Info Card */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                            <User className="w-4 h-4" />
                            <span>Account Settings</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                            Edit Your Profile
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
                            Update your profile picture, academic details, and skills portfolio to help peer students find you.
                        </p>

                        {/* Profile Picture Preview & Action Toolbar (Option 2) */}
                        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 mb-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <Avatar
                                src={imagePreview || profile.profile_picture}
                                name={profile.full_name}
                                size="xl"
                            />
                            <div className="flex-1 text-center sm:text-left">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-center sm:justify-start gap-1.5">
                                    <Camera className="w-4 h-4 text-indigo-500" />
                                    <span>Profile Photo</span>
                                </label>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3.5">
                                    Upload a custom avatar or reset to your default initials avatar.
                                </p>

                                {/* Hidden File Input */}
                                <input
                                    id="avatar-file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("avatar-file-input")?.click()}
                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>{hasPhoto ? "Change Photo" : "Upload Photo"}</span>
                                    </button>

                                    {hasPhoto && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Remove Photo</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    name="full_name"
                                    value={profile.full_name || ""}
                                    onChange={handleChange}
                                    placeholder="Your Full Name"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    University
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        name="university"
                                        value={profile.university || ""}
                                        onChange={handleChange}
                                        placeholder="University Name"
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Department
                                    </label>
                                    <input
                                        name="department"
                                        value={profile.department || ""}
                                        onChange={handleChange}
                                        placeholder="e.g. Computer Science"
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Semester
                                    </label>
                                    <input
                                        name="semester"
                                        value={profile.semester || ""}
                                        onChange={handleChange}
                                        placeholder="e.g. 5th Semester"
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={profile.bio || ""}
                                    onChange={handleChange}
                                    placeholder="Tell us a little bit about yourself and academic interests..."
                                    className="h-28 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5 flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>Skills I Can Teach</span>
                                </label>
                                <textarea
                                    name="skills_can_teach"
                                    value={profile.skills_can_teach || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. Python, Machine Learning, UI Design"
                                    className="h-24 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1.5 flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Skills I Want to Learn</span>
                                </label>
                                <textarea
                                    name="skills_want_to_learn"
                                    value={profile.skills_want_to_learn || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. Next.js, Django, Data Structures"
                                    className="h-24 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                />
                            </div>

                            <button
                                onClick={saveProfile}
                                disabled={saving}
                                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-bold text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                            >
                                <Save className="w-4 h-4" />
                                <span>{saving ? "Saving Changes..." : "Save Profile Changes"}</span>
                            </button>

                            {message && (
                                <div className={`mt-4 rounded-xl border p-3.5 text-center text-xs font-semibold flex items-center justify-center gap-2 ${
                                    isProfileSuccess
                                        ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                        : "border-rose-200 dark:border-rose-900/40 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                                }`}>
                                    {isProfileSuccess ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                    <span>{message}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security & Change Password Card Section */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
                        <div className="pb-4 mb-6 border-b border-slate-100 dark:border-slate-800/80">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <span>Security & Password</span>
                            </h2>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                Update your account password for enhanced security.
                            </p>
                        </div>

                        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        placeholder="••••••••"
                                        value={passwords.currentPassword}
                                        onChange={handlePasswordChangeInput}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-10 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                        title={showCurrentPassword ? "Hide password" : "Show password"}
                                        aria-label="Toggle current password visibility"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            placeholder="••••••••"
                                            value={passwords.newPassword}
                                            onChange={handlePasswordChangeInput}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-10 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
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

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="••••••••"
                                            value={passwords.confirmPassword}
                                            onChange={handlePasswordChangeInput}
                                            className={`w-full rounded-xl border bg-white dark:bg-slate-950 pl-10 pr-10 py-3.5 text-sm focus:outline-none focus:ring-2 transition ${
                                                passwords.confirmPassword.length > 0
                                                    ? newPassMatch
                                                        ? "border-emerald-400 dark:border-emerald-700 focus:ring-emerald-500/20"
                                                        : "border-rose-400 dark:border-rose-700 focus:ring-rose-500/20"
                                                    : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                            title={showConfirmPassword ? "Hide password" : "Show password"}
                                            aria-label="Toggle confirm new password visibility"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Requirements Checklist */}
                            {passwords.newPassword.length > 0 && (
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3.5 text-xs space-y-1.5 transition">
                                    <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider mb-2">
                                        New Password Requirements:
                                    </div>
                                    <div className={`flex items-center gap-2 font-medium ${newPassCriteria.length ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                        {newPassCriteria.length ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                        <span>At least 8 characters</span>
                                    </div>
                                    <div className={`flex items-center gap-2 font-medium ${newPassCriteria.hasUppercase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                        {newPassCriteria.hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                        <span>At least one uppercase letter (A-Z)</span>
                                    </div>
                                    <div className={`flex items-center gap-2 font-medium ${newPassCriteria.hasLowercase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                        {newPassCriteria.hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                        <span>At least one lowercase letter (a-z)</span>
                                    </div>
                                    <div className={`flex items-center gap-2 font-medium ${newPassCriteria.hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                        {newPassCriteria.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                        <span>At least one number (0-9)</span>
                                    </div>
                                    <div className={`flex items-center gap-2 font-medium ${newPassCriteria.hasSpecialChar ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                                        {newPassCriteria.hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                        <span>At least one special character (!@#$%^&*...)</span>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!validNewPass || !newPassMatch || !passwords.currentPassword}
                                className="w-full rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 py-3.5 text-sm font-semibold text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <KeyRound className="w-4 h-4" />
                                <span>Update Password</span>
                            </button>
                        </form>

                        {passwordMessage && (
                            <div className={`mt-4 rounded-xl border p-3.5 text-center text-xs font-semibold flex items-center justify-center gap-2 ${
                                isPasswordSuccess
                                    ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    : "border-rose-200 dark:border-rose-900/40 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                            }`}>
                                {isPasswordSuccess ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                <span>{passwordMessage}</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
