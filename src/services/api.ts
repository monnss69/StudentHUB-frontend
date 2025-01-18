import axios from 'axios';
import { CreateUserInput, CreatePostInput, LoginInput, CreateCommentInput, Tag, EditData } from '../types';

// Create axios instance with enhanced configuration
const api = axios.create({
    baseURL: "https://studenthub-backend.vercel.app",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    // Add timeout to prevent hanging requests
    timeout: 15000, // 15 seconds should be enough for most operations
});

// Request interceptor to handle authentication and request preparation
api.interceptors.request.use((config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add it to the headers
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    // If there's an error in request preparation, reject with error
    return Promise.reject(error);
});

// Response interceptor for handling common response scenarios and retries
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Handle network errors and timeouts with retry logic
        if (
            (error.response?.status === 0 || error.code === 'ECONNABORTED' || !error.response) &&
            !originalRequest._retry &&
            originalRequest.method?.toLowerCase() === 'get' // Only retry GET requests
        ) {
            originalRequest._retry = true;
            
            try {
                // Wait 1 second before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                return await api.request(originalRequest);
            } catch (retryError) {
                console.error('Retry failed:', retryError);
                return Promise.reject(retryError);
            }
        }

        return Promise.reject(error);
    }
);

export const apiService = {
    // User endpoints
    createUser: async (user: CreateUserInput) => {
        try {
            const response = await api.post('/users', user);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    getUser: async (id: string) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    getUserByUsername: async (username: string) => {
        try {
            const response = await api.get(`/users?username=${username}`);
            return response.data[0]; // Returns first matching user
        } catch (error) {
            console.error('Error fetching user by username:', error);
            throw error;
        }
    },

    getUserPosts: async (id: string) => {
        try {
            const response = await api.get(`/users/${id}/posts`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user posts:', error);
            throw error;
        }
    },

    updateUser: async (id: string, user: EditData) => {
        try {
            const response = await api.put(`/users/${id}`, user);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Authentication endpoints
    login: async (credentials: LoginInput) => {
        try {
            const response = await api.post('/login', credentials);
            const { token } = response.data;
            
            // Store token in localStorage
            if (token) {
                localStorage.setItem('auth_token', token);
            }
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            const response = await api.post('/logout');
            // Clear token on successful logout
            localStorage.removeItem('auth_token');
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Token synchronization
    syncToken: async (token: string) => {
        try {
            const response = await api.post('/api/auth/sync', { token });
            return response.data;
        } catch (error) {
            console.error('Token sync error:', error);
            throw error;
        }
    },

    logoutAfterEdit: async () => {
        try {
            await api.post('/logout');
            // Clear token on successful logout
            localStorage.removeItem('auth_token');
            return true;
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    },
    
    // Post endpoints
    createPost: async (post: CreatePostInput) => {
        try {
            const response = await api.post('/posts', {
                title: post.title,
                content: post.content,
                category_id: post.category_id,
                author_id: post.author_id
            });
            const response2 = await api.post(`/posts/${response.data.id}/tags`, post.tags);
            return response.data;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    getPost: async (id: string) => {
        try {
            const response = await api.get(`/posts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    },

    getPostsByCategory: async (category: string, pageIndex: number) => {
        try {
            const response = await api.get(`/posts/category/${category}/${pageIndex}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching posts by category:', error);
            throw error;
        }
    },

    updatePost: async (id: string, post: Partial<CreatePostInput>) => {
        try {
            const response = await api.put(`/posts/${id}`, post);
            return response.data;
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    },

    deletePost: async (id: string) => {
        try {
            const response = await api.delete(`/posts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    },

    // Tag endpoints
    getAllTag: async () => {
        try {
            const response = await api.get(`/tags`);
            return response.data;
        } catch (error) {
            console.error('Error fetching tag:', error);
            throw error;
        }
    },

    getTagByPost: async (postId: string) => {
        try {
            const response = await api.get(`/posts/${postId}/tags`);
            return response.data;
        } catch (error) {
            console.error('Error fetching tag:', error);
            throw error;
        }
    },

    addTagToPost: async (postId: string, tags: Tag[]) => {
        try {
            const response = await api.post(`/posts/${postId}/tags`, tags);
            return response.data;
        } catch (error) {
            console.error('Error adding tag to post:', error);
            throw error;
        }
    },

    deleteTagByPost: async (postId: string, tagId: string) => {
        try {
            const response = await api.delete(`/posts/${postId}/tags/${tagId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting tag:', error);
            throw error;
        }
    },

    // Comment endpoints
    getPostComments: async (postId: string) => {
        try {
            const response = await api.get(`/posts/${postId}/comments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching post comments:', error);
            throw error;
        }
    },

    createComment: async (postId: string, comment: CreateCommentInput) => {
        try {
            const response = await api.post(`posts/${postId}/comments`, comment);
            return response.data;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    },

    // Category endpoints
    getCategories: async () => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    getCategory: async (id: string) => {
        try {
            const response = await api.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category:', error);
            throw error;
        }
    },

    uploadImage: async (file: File, username: string) => {
        try {
            // Create FormData to send the file
            const formData = new FormData();
            formData.append('file', file);
            formData.append('username', username);

            // We need to override the default content-type to handle multipart form data
            const response = await api.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // The backend will return { url: "cloudinary_url" }
            return response.data.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            // Propagate the error for proper handling in components
            throw error instanceof Error
                ? error
                : new Error('Failed to upload image');
        }
    },

    // Updated image removal function to use backend endpoint
    removeImage: async (username: string) => {
        try {
            const response = await api.delete(`/api/upload/${username}`);
            return response.data.message; // Backend returns { message: "Image deleted successfully" }
        } catch (error) {
            console.error('Error removing image:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to remove image');
        }
    },
};