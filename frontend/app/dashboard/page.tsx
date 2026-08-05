"use client";

import { useEffect, useState } from "react";
import {
    getCurrentUser,
    getProfile,
    getReceivedCollaborationRequests,
    updateCollaborationRequest,
} from "../../services/auth";

import Navbar from "../../components/Navbar";


export default function DashboardPage() {

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);


    const loadRequests = () => {

        const token = localStorage.getItem("access");

        if (!token) return;


        getReceivedCollaborationRequests(token)
            .then((data) => setRequests(data))
            .catch((error) => console.error(error));

    };



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


        loadRequests();


    }, []);




    const handleRequest = async (
        requestId: number,
        status: string
    ) => {

        const token = localStorage.getItem("access");

        if (!token) return;


        try {

            await updateCollaborationRequest(
                requestId,
                status,
                token
            );


            loadRequests();


        } catch (error) {

            console.error(error);

        }

    };





    return (

        <>

            <Navbar />


            <div className="min-h-screen bg-gray-100 p-10">


                <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-lg">


                    {user ? (

                        <>


                            <h1 className="mb-6 text-4xl font-bold">
                                The Common Room
                            </h1>



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




                            <hr className="my-8" />



                            <h3 className="mb-4 text-2xl font-bold">
                                Collaboration Requests
                            </h3>



                            {requests.length === 0 ? (


                                <p className="text-gray-500">
                                    No collaboration requests yet.
                                </p>


                            ) : (


                                <div className="space-y-4">


                                    {requests.map((request) => (


                                        <div
                                            key={request.id}
                                            className="rounded-lg border p-4"
                                        >


                                            <p>
                                                <strong>
                                                    {request.sender_username}
                                                </strong>{" "}
                                                wants to collaborate with you.
                                            </p>



                                            <p className="mb-4 text-sm text-gray-500">
                                                Status: {request.status}
                                            </p>




                                            {request.status === "pending" && (


                                                <div className="flex gap-3">


                                                    <button
                                                        onClick={() =>
                                                            handleRequest(
                                                                request.id,
                                                                "accepted"
                                                            )
                                                        }
                                                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                                    >
                                                        Accept
                                                    </button>



                                                    <button
                                                        onClick={() =>
                                                            handleRequest(
                                                                request.id,
                                                                "rejected"
                                                            )
                                                        }
                                                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </button>


                                                </div>


                                            )}



                                        </div>


                                    ))}



                                </div>


                            )}



                        </>


                    ) : (


                        <p>
                            Loading...
                        </p>


                    )}



                </div>


            </div>


        </>

    );

}
