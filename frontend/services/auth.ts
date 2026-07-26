import api from "./api";

export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {
    const response = await api.post("accounts/register/", {
        username,
        email,
        password,
    });

    return response.data;
};

export const loginUser = async (
    username: string,
    password: string
) => {
    const response = await api.post("token/", {
        username,
        password,
    });

    return response.data;
};

export const getCurrentUser = async (token: string) => {
    const response = await api.get("accounts/me/", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};