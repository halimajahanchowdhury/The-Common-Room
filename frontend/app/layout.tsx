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
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            try {
                                const savedTheme = localStorage.getItem('app_theme');
                                if (savedTheme === 'light') {
                                    document.documentElement.classList.remove('dark');
                                } else {
                                    document.documentElement.classList.add('dark');
                                }
                            } catch (e) {
                                document.documentElement.classList.add('dark');
                            }
                        `,
                    }}
                />
            </head>
            <body className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
                {children}
            </body>
        </html>
    );
}