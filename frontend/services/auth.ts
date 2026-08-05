import api from "./api";


export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {

    const response = await api.post(
        "accounts/register/",
        {
            username,
            email,
            password,
        }
    );

    return response.data;
};



export const loginUser = async (
    username: string,
    password: string
) => {

    const response = await api.post(
        "token/",
        {
            username,
            password,
        }
    );

    return response.data;
};



export const getCurrentUser = async (
    token: string
) => {

    const response = await api.get(
        "accounts/me/",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};



export const getProfile = async (
    token: string
) => {

    const response = await api.get(
        "profiles/me/",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const getAllProfiles = async (
    token: string
) => {

    console.log("Token being sent:", token);

    const response = await api.get(
        "profiles/",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const getProfileById = async (
    id: number,
    token: string
) => {

    const response = await api.get(
        `profiles/${id}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const sendCollaborationRequest = async (
    receiverId: number,
    token: string
) => {

    const response = await api.post(
        "collaborations/create/",
        {
            receiver: receiverId,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


export const getReceivedCollaborationRequests = async (
    token: string
) => {

    const response = await api.get(
        "collaborations/received/",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const updateCollaborationRequest = async (
    requestId: number,
    status: string,
    token: string
) => {

    const response = await api.patch(
        `collaborations/${requestId}/`,
        {
            status,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const getComments = async (
    profileId: number,
    token: string
) => {

    const response = await api.get(
        `posts/profile/${profileId}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


export const createComment = async (
    profileId: number,
    content: string,
    token: string
) => {

    const response = await api.post(
        "posts/create/",
        {
            profile: profileId,
            content: content,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const getCollaborationStatus = async (
    userId: number,
    token: string
) => {

    const response = await api.get(
        `collaborations/status/${userId}/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};







