"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    getProfileById,
    sendCollaborationRequest,
    getComments,
    createComment,
    getCollaborationStatus,
} from "../../../services/auth";
import Navbar from "../../../components/Navbar";
import Avatar from "../../../components/Avatar";
import {
    Sparkles,
    ArrowLeftRight,
    GraduationCap,
    BookOpen,
    Building,
    Clock,
    Check,
    CheckCircle2,
    XCircle,
    Send,
    MessageSquare,
    User,
    AlertCircle,
} from "lucide-react";

export default function StudentProfilePage() {
    const params = useParams();
    const id = Number(params.id);

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [collaborationStatus, setCollaborationStatus] = useState("");
    const [isSender, setIsSender] = useState(true);
    const [commentMessage, setCommentMessage] = useState("");
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState("");

    const loadComments = () => {
        const token = localStorage.getItem("access");
        if (!token) return;

        getComments(id, token)
            .then((data) => setComments(data))
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        getProfileById(id, token)
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });

        getCollaborationStatus(id, token)
            .then((data) => {
                setCollaborationStatus(data.status);
                if (typeof data.is_sender === "boolean") {
                    setIsSender(data.is_sender);
                }
            })
            .catch((error) => {
                console.error(error);
            });

        loadComments();
    }, [id]);

    const handleRequest = async () => {
        const token = localStorage.getItem("access");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            await sendCollaborationRequest(id, token);
            setMessage("Collaboration request sent successfully!");
            setCollaborationStatus("pending");
            setIsSender(true);
        } catch (error: any) {
            console.error(error);
            setMessage(error?.response?.data?.detail || error?.response?.data?.error || "Failed to send collaboration request.");
        }
    };

    const handleComment = async () => {
        const token = localStorage.getItem("access");
        if (!token) return;
        if (commentText.trim() === "") return;

        try {
            await createComment(id, commentText, token);
            setCommentText("");
            setCommentMessage("Comment posted successfully!");
            loadComments();
        } catch (error: any) {
            if (error.response?.status === 403) {
                setCommentMessage(
                    "You can only comment after your collaboration request has been accepted."
                );
            } else {
                setCommentMessage(
                    "Something went wrong while posting your comment."
                );
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
                <Navbar />
                <div className="flex-1 p-10 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                    Loading profile details...
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
                <Navbar />
                <div className="flex-1 p-10 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                    Profile not found.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
            <Navbar />

            <main className="flex-1 p-4 md:p-10">
                <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
                    {/* Header with Avatar */}
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                        <Avatar src={profile.profile_picture} name={profile.full_name} username={profile.username} size="lg" />
                        <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-3 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                                <User className="w-3 h-3 text-indigo-500" />
                                <span>Student Profile</span>
                            </span>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {profile.full_name || profile.username || "Student Profile"}
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{profile.university || "University not added"}</span>
                            </p>
                        </div>
                    </div>

                    {/* Details & Skills Exchange */}
                    <div className="py-6 space-y-6 border-b border-slate-100 dark:border-slate-800/80">
                        {/* Skill Match Highlight */}
                        {profile.skill_matches?.has_match && (
                            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/40 p-5 shadow-2xs">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                        Potential Skill Exchange Match!
                                    </h3>
                                </div>
                                <div className="space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
                                    {profile.skill_matches.can_learn_from_peer?.map((skill: string, idx: number) => (
                                        <div key={`learn-${idx}`} className="flex items-center gap-2 font-semibold">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-emerald-800 dark:text-emerald-300">
                                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                <span>{skill}</span>
                                            </span>
                                            <span className="text-emerald-800/80 dark:text-emerald-300/80 font-normal">— This student can teach this and you want to learn it</span>
                                        </div>
                                    ))}
                                    {profile.skill_matches.can_teach_to_peer?.map((skill: string, idx: number) => (
                                        <div key={`teach-${idx}`} className="flex items-center gap-2 font-semibold">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-emerald-800 dark:text-emerald-300">
                                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                <span>{skill}</span>
                                            </span>
                                            <span className="text-emerald-800/80 dark:text-emerald-300/80 font-normal">— You can teach this and this student wants to learn it</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills Can Teach */}
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2.5 flex items-center gap-1.5">
                                <GraduationCap className="w-4 h-4" />
                                <span>Skills They Can Teach</span>
                            </h2>
                            {profile.skills_can_teach_list && profile.skills_can_teach_list.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills_can_teach_list.map((skill: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-xs">
                                    {profile.skills_can_teach || "No teaching skills listed yet"}
                                </p>
                            )}
                        </div>

                        {/* Skills Want to Learn */}
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2.5 flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" />
                                <span>Skills They Want to Learn</span>
                            </h2>
                            {profile.skills_want_to_learn_list && profile.skills_want_to_learn_list.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills_want_to_learn_list.map((skill: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/40 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-xs">
                                    {profile.skills_want_to_learn || "No learning skills listed yet"}
                                </p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                Bio
                            </h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                {profile.bio || "No bio added yet."}
                            </p>
                        </div>
                    </div>

                    {/* Collaboration Actions */}
                    <div className="py-6 border-b border-slate-100 dark:border-slate-800/80">
                        {collaborationStatus === "self" ? null : collaborationStatus === "none" ? (
                            <button
                                onClick={handleRequest}
                                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-semibold text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                <span>Send Collaboration Request</span>
                            </button>
                        ) : collaborationStatus === "pending" ? (
                            isSender ? (
                                <button
                                    disabled
                                    className="w-full rounded-xl bg-amber-500/90 py-3.5 text-sm font-semibold text-white cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-4 h-4" />
                                    <span>Collaboration Request Pending</span>
                                </button>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-semibold text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Request Received — Respond on Dashboard</span>
                                </Link>
                            )
                        ) : collaborationStatus === "accepted" ? (
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <button
                                    disabled
                                    className="w-full sm:w-auto flex-1 rounded-xl bg-emerald-600/90 py-3.5 text-sm font-semibold text-white cursor-default flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Connected Collaborators</span>
                                </button>
                                <Link
                                    href={`/chat?peer=${profile.username}`}
                                    className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Message in Chat</span>
                                </Link>
                            </div>
                        ) : collaborationStatus === "rejected" || collaborationStatus === "declined" ? (
                            <div className="space-y-3">
                                <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                                        <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                                        <span>Previous request was declined</span>
                                    </div>
                                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                                        You can send a fresh request below
                                    </span>
                                </div>
                                <button
                                    onClick={handleRequest}
                                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-semibold text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Send Collaboration Request Again</span>
                                </button>
                            </div>
                        ) : null}

                        {message && (
                            <p className="mt-3 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5">
                                <Sparkles className="w-4 h-4" />
                                <span>{message}</span>
                            </p>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="pt-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span>Collaborator Feedback & Comments</span>
                        </h2>

                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Leave feedback or a note..."
                            className="mb-3 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            rows={3}
                        />

                        <button
                            onClick={handleComment}
                            className="rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 px-6 py-2.5 text-sm font-semibold text-white transition cursor-pointer"
                        >
                            Post Comment
                        </button>

                        {commentMessage && (
                            <p className="mt-3 mb-6 text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{commentMessage}</span>
                            </p>
                        )}

                        <div className="mt-6 space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                                    No comments posted yet.
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="flex items-start gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4"
                                    >
                                        <Avatar username={comment.author_username} size="sm" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                    @{comment.author_username}
                                                </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
