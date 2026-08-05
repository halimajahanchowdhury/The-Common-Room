"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Navbar() {

    const router = useRouter();


    const logout = () => {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        router.push("/login");

    };


    return (

        <nav className="bg-white shadow-md px-8 py-4">

            <div className="mx-auto flex max-w-6xl items-center justify-between">


                <Link
                    href="/dashboard"
                    className="text-2xl font-bold"
                >
                    The Common Room
                </Link>



                <div className="flex items-center gap-6">


                    <Link
                        href="/dashboard"
                        className="text-gray-700 hover:text-blue-600"
                    >
                        Dashboard
                    </Link>


                    <Link
                        href="/students"
                        className="text-gray-700 hover:text-blue-600"
                    >
                        Browse Students
                    </Link>


                    <Link
                        href="/profile/edit"
                        className="text-gray-700 hover:text-blue-600"
                    >
                        My Profile
                    </Link>


                    <button
                        onClick={logout}
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        Logout
                    </button>


                </div>


            </div>


        </nav>

    );

}

