// Base interfaces for common properties
interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}

// User related interfaces
export interface UserData extends BaseEntity {
    username: string;
    email: string;
    password_hash: string;
}

export interface CreateUserInput {
    username: string;
    email: string;
    password_hash: string;
}

export interface LoginInput {
    username: string;
    password: string;
}

// Post related interfaces
export interface Post extends BaseEntity {
    title: string;
    content: string;
    author_id: string;
    category_id: string;
}

export interface CreatePostInput {
    title: string;
    content: string;
    category_id: string;
    author_id: string;
}

export interface UpdatePostInput {
    title: string;
    content: string;
}

// Comment related interfaces
export interface Comment extends BaseEntity {
    content: string;
    author_id: string;
    post_id: string;
}

export interface CreateCommentInput {
    content: string;
    author_id: string;
}

// Category related interfaces
export interface Category extends BaseEntity {
    name: string;
    description?: string;
}

// Auth related types
export interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    isAuthenticated: boolean;
    refreshAuth: () => Promise<void>;
}

// API response types
export interface AuthResponse {
    token: string;
}

export interface ApiError {
    message: string;
    status?: number;
}

// Component prop types
export interface PostProps {
    post: Post;
    author: UserData;
}

export interface UserProfileSidebarProps {
    userData: UserData;
    postsCount: number;
}

export interface ProtectedRouteProps {
    children: React.ReactNode;
}

export interface DecodedToken {
    sub: string;
    exp: number;
    iat: number;
}