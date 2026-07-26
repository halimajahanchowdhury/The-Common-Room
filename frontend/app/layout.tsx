import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "The Common Room",
    description: "A collaborative student learning platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}