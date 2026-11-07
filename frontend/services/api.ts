import axios from "axios";

const isLocalHostname = (host: string) => {
    return host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.") || host.startsWith("10.");
};

const getBaseURL = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== "undefined" && window.location.hostname) {
        const host = window.location.hostname;
        if (isLocalHostname(host)) {
            return `http://${host}:8000/api/`;
        }
        return "https://thecommonroom-backend.onrender.com/api/";
    }
    return "https://thecommonroom-backend.onrender.com/api/";
};

const api = axios.create({
    baseURL: getBaseURL(),
});

// Request interceptor to attach authorization header and dynamically sync hostname
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const host = window.location.hostname;
            if (!process.env.NEXT_PUBLIC_API_URL) {
                if (isLocalHostname(host)) {
                    config.baseURL = `http://${host}:8000/api/`;
                } else {
                    config.baseURL = "https://thecommonroom-backend.onrender.com/api/";
                }
            }
            const token = localStorage.getItem("access");
            if (token && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration & automatic refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("token/")
        ) {
            originalRequest._retry = true;

            if (typeof window !== "undefined") {
                const refreshToken = localStorage.getItem("refresh");
                if (refreshToken) {
                    try {
                        const refreshResponse = await axios.post(
                            `${api.defaults.baseURL}token/refresh/`,
                            { refresh: refreshToken }
                        );

                        if (refreshResponse.status === 200 && refreshResponse.data.access) {
                            const newAccessToken = refreshResponse.data.access;
                            localStorage.setItem("access", newAccessToken);
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                            return api(originalRequest);
                        }
                    } catch (refreshErr) {
                        // Refresh token also expired or invalid
                        localStorage.removeItem("access");
                        localStorage.removeItem("refresh");
                        localStorage.removeItem("user_profile");
                        localStorage.removeItem("user_name");
                        if (window.location.pathname !== "/login") {
                            window.location.href = "/login?expired=1";
                        }
                    }
                } else {
                    // No refresh token available
                    localStorage.removeItem("access");
                    localStorage.removeItem("user_profile");
                    localStorage.removeItem("user_name");
                    if (window.location.pathname !== "/login") {
                        window.location.href = "/login?session_expired=1";
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;