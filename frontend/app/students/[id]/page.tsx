"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProfileById, sendCollaborationRequest } from "../../../services/auth";


export default function StudentProfilePage() {

    const params = useParams();

    const id = Number(params.id);

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");


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


    }, [id]);



    const handleRequest = async () => {

        const token = localStorage.getItem("access");

        if (!token) {
            window.location.href = "/login";
            return;
        }


        try {

            await sendCollaborationRequest(
                id,
                token
            );

            setMessage("Collaboration request sent successfully!");

        } catch (error) {

            console.error(error);

            setMessage("Something went wrong.");

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




                <button
                    onClick={handleRequest}
                    className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
                >
                    Send Collaboration Request
                </button>


                {message && (

                    <p className="mt-4 text-center text-green-600">
                        {message}
                    </p>

                )}



            </div>


        </div>

    );

}

