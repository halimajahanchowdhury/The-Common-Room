"use client";

interface AvatarProps {
    src?: string | null;
    name?: string;
    username?: string;
    size?: "sm" | "md" | "lg";
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
        sm: "h-8 w-8 text-xs",
        md: "h-11 w-11 text-sm",
        lg: "h-16 w-16 text-xl",
    }[size];

    if (src) {
        // Ensure standard URL format if relative media path or base64 data URL
        const imageUrl = (src.startsWith("http") || src.startsWith("data:")) ? src : `http://127.0.0.1:8000${src}`;
        return (
            <img
                src={imageUrl}
                alt={text}
                className={`rounded-full object-cover shadow-xs shrink-0 ${sizeClasses}`}
            />
        );
    }

    return (
        <div
            className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 font-bold text-white shadow-xs select-none shrink-0 ${sizeClasses}`}
        >
            {initials}
        </div>
    );
}
