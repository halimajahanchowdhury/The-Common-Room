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

            await createComment(
                id,
                commentText,
                token
            );

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
            <div className="p-10 text-center text-xl">
                Loading profile...
            </div>
        );

    }



    if (!profile) {

        return (
            <div className="p-10 text-center text-xl">
                Profile not found.
            </div>
        );

    }



    return (

        <div className="min-h-screen bg-gray-100 p-10">

            <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-lg">

                <h1 className="mb-6 text-4xl font-bold">
                    {profile.full_name}
                </h1>

                <p className="mb-6 text-gray-600">
                    {profile.university || "University not added"}
                </p>

                <hr className="my-6" />

                <h2 className="text-xl font-semibold">
                    Skills I Can Teach
                </h2>

                <p className="mb-6 text-gray-600">
                    {profile.skills_can_teach || "Not added yet"}
                </p>

                <h2 className="text-xl font-semibold">
                    Skills I Want to Learn
                </h2>

                <p className="mb-6 text-gray-600">
                    {profile.skills_want_to_learn || "Not added yet"}
                </p>

                <h2 className="text-xl font-semibold">
                    Bio
                </h2>

                <p className="mb-8 text-gray-600">
                    {profile.bio || "No bio added yet"}
                </p>

                {
                    collaborationStatus === "self" ? (

                        null

                    ) : collaborationStatus === "none" ? (

                        <button
                            onClick={handleRequest}
                            className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
                        >
                            Send Collaboration Request
                        </button>

                    ) : collaborationStatus === "pending" ? (

                        <button
                            disabled
                            className="w-full rounded-lg bg-yellow-500 py-3 text-white cursor-not-allowed"
                        >
                            Request Pending
                        </button>

                    ) : collaborationStatus === "accepted" ? (

                        <button
                            disabled
                            className="w-full rounded-lg bg-green-600 py-3 text-white cursor-not-allowed"
                        >
                            ✓ Collaboration Accepted
                        </button>

                    ) : collaborationStatus === "rejected" ? (

                        <button
                            disabled
                            className="w-full rounded-lg bg-red-600 py-3 text-white cursor-not-allowed"
                        >
                            Request Rejected
                        </button>

                    ) : null
                }


                {message && (

                    <p className="mt-4 text-center text-green-600">
                        {message}
                    </p>

                )}



                <hr className="my-8" />

                <h2 className="mb-4 text-2xl font-bold">
                    Comments
                </h2>

                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="mb-4 w-full rounded-lg border p-4"
                    rows={4}
                />

                <button
                    onClick={handleComment}
                    className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
                >
                    Post Comment
                </button>

                {commentMessage && (

                    <p className="mt-4 mb-8 text-center text-blue-600 font-medium">
                        {commentMessage}
                    </p>

                )}

                <div className="space-y-4">

                    {comments.length === 0 ? (

                        <p className="text-gray-500">
                            No comments yet.
                        </p>

                    ) : (

                        comments.map((comment) => (

                            <div
                                key={comment.id}
                                className="rounded-lg border p-4"
                            >

                                <p className="font-semibold">
                                    {comment.author_username}
                                </p>

                                <p className="mt-2">
                                    {comment.content}
                                </p>

                                <p className="mt-2 text-sm text-gray-500">
                                    {new Date(comment.created_at).toLocaleString()}
                                </p>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>

    );

}

