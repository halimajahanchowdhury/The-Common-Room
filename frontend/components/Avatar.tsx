"use client";

interface AvatarProps {
    src?: string | null;
    name?: string;
    username?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function Avatar({ src, name, username, size = "md" }: AvatarProps) {
    const text = name || username || "Student";

    const getInitials = (str: string) => {
        const parts = str.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return str.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(text);

    const sizeClasses = {
        sm: "h-8 w-8 text-xs ring-1",
        md: "h-10 w-10 text-sm ring-2",
        lg: "h-14 w-14 text-lg ring-2",
        xl: "h-20 w-20 text-2xl ring-4",
    }[size];

    if (src) {
        const apiHost = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
            : "http://127.0.0.1:8000";
        const imageUrl = (src.startsWith("http") || src.startsWith("data:")) ? src : `${apiHost}${src}`;
        return (
            <img
                src={imageUrl}
                alt={text}
                className={`rounded-full object-cover ring-indigo-500/20 dark:ring-indigo-400/30 shadow-xs shrink-0 ${sizeClasses}`}
            />
        );
    }

    return (
        <div
            className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 font-bold text-white ring-indigo-500/20 dark:ring-indigo-400/30 shadow-xs select-none shrink-0 ${sizeClasses}`}
        >
            {initials}
        </div>
    );
}
