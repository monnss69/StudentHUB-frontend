import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { CreateUserInput, CreatePostInput, LoginInput, CreateCommentInput, Tag, EditData } from '../types';

// Configure the base axios instance with sensible defaults
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Default 30 second timeout
});

// Implement exponential backoff retry logic for failed requests
const retryWithBackoff = async (operation: () => Promise<any>, retryCount = 0, maxRetries = 3) => {
    try {
        return await operation();
    } catch (error) {
        if (retryCount >= maxRetries) {
            throw error;
        }
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(operation, retryCount + 1, maxRetries);
    }
};

// Request interceptor to handle authentication and request preparation
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Extend timeout for POST and PUT requests
        if (['post', 'put'].includes(config.method?.toLowerCase() || '')) {
            config.timeout = 60000;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling and retries
api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Handle authentication errors
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Handle timeout and network errors
        const configWithRetry = originalRequest as InternalAxiosRequestConfig & { _retry?: boolean };
        if (
            (error.code === 'ECONNABORTED' || 
             error.response?.status === 504 ||
             !error.response) &&
            !configWithRetry._retry
        ) {
            configWithRetry._retry = true;
            return retryWithBackoff(() => api.request(configWithRetry));
        }

        return Promise.reject(error);
    }
);

// Centralized error handler
const handleApiError = (error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);
    if (axios.isAxiosError(error)) {
        throw new Error(
            `${context} failed: ${error.response?.status || 'Network error'} - 
            ${error.response?.data?.error || error.message}`
        );
    }
    throw error;
};

export const apiService = {
    // User Management
    createUser: async (user: CreateUserInput) => {
        try {
            const response = await retryWithBackoff(() => api.post('/users', user));
            return response.data;
        } catch (error) {
            handleApiError(error, 'User creation');
        }
    },

    getUser: async (id: string) => {
        try {
            const response = await retryWithBackoff(() => api.get(`/users/${id}`));
            return response.data;
        } catch (error) {
            handleApiError(error, 'User fetch');
        }
    },

    getUserByUsername: async (username: string) => {
        try {
            const response = await retryWithBackoff(() => 
                api.get(`/users?username=${username}`)
            );
            return response.data[0];
        } catch (error) {
            handleApiError(error, 'Username lookup');
        }
    },

    getUserPosts: async (id: string) => {
        try {
            const response = await retryWithBackoff(() => 
                api.get(`/users/${id}/posts`)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'User posts fetch');
        }
    },

    updateUser: async (id: string, user: EditData) => {
        try {
            const response = await retryWithBackoff(() => 
                api.put(`/users/${id}`, user)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'User update');
        }
    },

    // Authentication
    login: async (credentials: LoginInput) => {
        try {
            const response = await api.post('/login', credentials);
            const { token } = response.data;
            if (token) {
                localStorage.setItem('auth_token', token);
            }
            return response.data;
        } catch (error) {
            handleApiError(error, 'Login');
        }
    },

    logout: async () => {
        try {
            const response = await api.post('/logout');
            localStorage.removeItem('auth_token');
            return response.data;
        } catch (error) {
            localStorage.removeItem('auth_token');
            handleApiError(error, 'Logout');
        }
    },

    syncToken: async (token: string) => {
        try {
            return await api.post('/api/auth/sync', { token });
        } catch (error) {
            handleApiError(error, 'Token sync');
        }
    },

    logoutAfterEdit: async () => {
        try {
            await api.post('/logout');
            localStorage.removeItem('auth_token');
            return true;
        } catch (error) {
            localStorage.removeItem('auth_token');
            handleApiError(error, 'Logout after edit');
        }
    },

    // Post Management
    createPost: async (post: CreatePostInput) => {
        try {
            console.log('Starting post creation...');
            
            const postResponse = await api.post('/posts', {
                title: post.title,
                content: post.content,
                category_id: post.category_id,
                author_id: post.author_id
            }, { timeout: 60000 });

            if (post.tags && post.tags.length > 0) {
                console.log('Adding tags to post...');
                await api.post(`/posts/${postResponse.data.id}/tags`, post.tags);
            }

            return postResponse.data;
        } catch (error) {
            handleApiError(error, 'Post creation');
        }
    },

    getPost: async (id: string) => {
        try {
            const response = await retryWithBackoff(() => 
                api.get(`/posts/${id}`)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Post fetch');
        }
    },

    getPostsByCategory: async (category: string, pageIndex: number) => {
        try {
            const response = await retryWithBackoff(() =>
                api.get(`/posts/category/${category}/${pageIndex}`)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Category posts fetch');
        }
    },

    updatePost: async (id: string, post: Partial<CreatePostInput>) => {
        try {
            const response = await retryWithBackoff(() =>
                api.put(`/posts/${id}`, post)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Post update');
        }
    },

    deletePost: async (id: string) => {
        try {
            const response = await retryWithBackoff(() =>
                api.delete(`/posts/${id}`)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Post deletion');
        }
    },

    // Tag Management
    getAllTag: async () => {
        try {
            const response = await retryWithBackoff(() =>
                api.get('/tags')
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Tags fetch');
        }
    },

    getTagByPost: async (postId: string) => {
        try {
            const response = await retryWithBackoff(() =>
                api.get(`/posts/${postId}/tags`)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Post tags fetch');
        }
    },

    addTagToPost: async (postId: string, tags: Tag[]) => {
        try {
            const response = await retryWithBackoff(() =>
                api.post(`/posts/${postId}/tags`, tags)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Tag addition');
        }
    },

    deleteTagByPost: async (postId: string, tagId: string) => {
        try {
            const response = await retryWithBackoff(() =>
                api.delete(`/posts/${postId}/tags/${tagId}`)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Tag deletion');
        }
    },

    // Comment Management
    getPostComments: async (postId: string) => {
        try {
            const response = await retryWithBackoff(() =>
                api.get(`/posts/${postId}/comments`)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Comments fetch');
        }
    },

    createComment: async (postId: string, comment: CreateCommentInput) => {
        try {
            const response = await retryWithBackoff(() =>
                api.post(`posts/${postId}/comments`, comment)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Comment creation');
        }
    },

    // Category Management
    getCategories: async () => {
        try {
            const response = await retryWithBackoff(() =>
                api.get('/categories')
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Categories fetch');
        }
    },

    getCategory: async (id: string) => {
        try {
            const response = await retryWithBackoff(() =>
                api.get(`/categories/${id}`)
            );
            return response.data;
        } catch (error) {
            handleApiError(error, 'Category fetch');
        }
    },

    // File Upload Management
    uploadImage: async (file: File, username: string) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('username', username);

            const response = await retryWithBackoff(() => 
                api.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 60000, // Extended timeout for file uploads
                })
            );

            return response.data.url;
        } catch (error) {
            handleApiError(error, 'Image upload');
        }
    },

    removeImage: async (username: string) => {
        try {
            const response = await retryWithBackoff(() =>
                api.delete(`/api/upload/${username}`)
            );
            return response.data.message;
        } catch (error) {
            handleApiError(error, 'Image removal');
        }
    },
};