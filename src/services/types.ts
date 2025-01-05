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