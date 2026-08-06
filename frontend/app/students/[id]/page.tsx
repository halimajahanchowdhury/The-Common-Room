"use client";

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

export default function StudentProfilePage() {
    const params = useParams();
    const id = Number(params.id);

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [collaborationStatus, setCollaborationStatus] = useState("");
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
        } catch (error) {
            console.error(error);
            setMessage("Something went wrong.");
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
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 p-10 text-center text-slate-400">
                    Loading profile...
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 p-10 text-center text-slate-400">
                    Profile not found.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            <Navbar />

            <main className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    {/* Header with Avatar */}
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                        <Avatar src={profile.profile_picture} name={profile.full_name} size="lg" />
                        <div>
                            <span className="inline-block rounded-full bg-indigo-50 border border-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700 mb-1">
                                Student Profile
                            </span>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                {profile.full_name || "Student Profile"}
                            </h1>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                🏫 {profile.university || "University not added"}
                            </p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="py-6 space-y-6 border-b border-slate-100">
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                                Skills I Can Teach
                            </h2>
                            <p className="text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm">
                                {profile.skills_can_teach || "Not added yet"}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
                                Skills I Want to Learn
                            </h2>
                            <p className="text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm">
                                {profile.skills_want_to_learn || "Not added yet"}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Bio
                            </h2>
                            <p className="text-slate-700 leading-relaxed text-sm">
                                {profile.bio || "No bio added yet."}
                            </p>
                        </div>
                    </div>

                    {/* Collaboration Actions */}
                    <div className="py-6 border-b border-slate-100">
                        {collaborationStatus === "self" ? null : collaborationStatus === "none" ? (
                            <button
                                onClick={handleRequest}
                                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                            >
                                Send Collaboration Request
                            </button>
                        ) : collaborationStatus === "pending" ? (
                            <button
                                disabled
                                className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-white cursor-not-allowed"
                            >
                                ⏳ Collaboration Request Pending
                            </button>
                        ) : collaborationStatus === "accepted" ? (
                            <button
                                disabled
                                className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white cursor-not-allowed"
                            >
                                ✓ Collaboration Accepted
                            </button>
                        ) : collaborationStatus === "rejected" ? (
                            <button
                                disabled
                                className="w-full rounded-xl bg-rose-600 py-3.5 text-sm font-semibold text-white cursor-not-allowed"
                            >
                                Request Rejected
                            </button>
                        ) : null}

                        {message && (
                            <p className="mt-3 text-center text-sm font-semibold text-emerald-600">
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="pt-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">
                            Collaborator Feedback & Comments
                        </h2>

                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Leave feedback or a note..."
                            className="mb-3 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            rows={3}
                        />

                        <button
                            onClick={handleComment}
                            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
                        >
                            Post Comment
                        </button>

                        {commentMessage && (
                            <p className="mt-3 mb-6 text-sm font-medium text-indigo-600">
                                {commentMessage}
                            </p>
                        )}

                        <div className="mt-6 space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">
                                    No comments posted yet.
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                                    >
                                        <Avatar username={comment.author_username} size="sm" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-slate-900 text-sm">
                                                    @{comment.author_username}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 text-sm leading-relaxed">
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
