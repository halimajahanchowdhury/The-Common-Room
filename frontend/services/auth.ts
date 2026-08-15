import api from "./api";


export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {
    try {
        const response = await api.post(
            "accounts/register/",
            {
                username,
                email,
                password,
            }
        );
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return { error: error.response.data };
        }
        return { error: { detail: "Registration failed. Please check your details." } };
    }
};

export const resetPassword = async (identity: string, newPassword: string) => {
    const response = await api.post("accounts/password_reset/", {
        identity,
        new_password: newPassword,
    });
    return response.data;
};



export const loginUser = async (
    username: string,
    password: string
) => {
    try {
        const response = await api.post(
            "token/",
            {
                username,
                password,
            }
        );
        return response.data;
    } catch (error: any) {
        if (error?.response?.data?.detail) {
            return { error: error.response.data.detail };
        }
        return { error: "Invalid username or password. Please try again." };
    }
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

export const getMyProfile = getProfile;

export const getAllProfiles = async (
    token: string,
    search?: string,
    skill?: string
) => {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append("search", search.trim());
    if (skill && skill.trim()) params.append("skill", skill.trim());

    const queryString = params.toString() ? `?${params.toString()}` : "";

    const response = await api.get(
        `profiles/${queryString}`,
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

export const getSentCollaborationRequests = async (
    token: string
) => {

    const response = await api.get(
        "collaborations/sent/",
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

export const getChatMessages = async (
    peer: string,
    token: string
) => {
    const response = await api.get(
        `chat/messages/?peer=${encodeURIComponent(peer)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const sendChatMessage = async (
    recipient: string,
    text: string,
    token: string
) => {
    const response = await api.post(
        "chat/messages/",
        {
            recipient,
            text,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const getChatConversations = async (
    token: string
) => {
    const response = await api.get(
        "chat/conversations/",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const updateProfile = async (
    data: any,
    token: string
) => {
    try {
        const response = await api.put(
            "profiles/me/",
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return { error: error.response.data };
        }
        return { error: { detail: "Failed to update profile." } };
    }
};

export const getPosts = async (token: string) => {
    const response = await api.get("posts/", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createPost = async (content: string, token: string) => {
    const response = await api.post("posts/", { content }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createCommentOnPost = async (postId: number, content: string, token: string) => {
    const response = await api.post(`posts/${postId}/comments/`, { content }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};







