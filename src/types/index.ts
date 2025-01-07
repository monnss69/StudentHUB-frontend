export interface CreatePostInput {
    title: string;
    content: string;
    categoryID: string;
}

export interface CreateUserInput {
    username: string;
    email: string;
    passwordHash: string;
}

export interface CreateCommentInput {
    author_id: string;
    content: string;
}

export interface LoginInput {
    username: string;
    password: string;
}

export interface UserData {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
}