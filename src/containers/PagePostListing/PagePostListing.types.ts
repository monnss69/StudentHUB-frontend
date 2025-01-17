import { Post as PostType, UserData, Comment } from "@/types";

export interface PostContainerProps {
    post: PostType;
    author: UserData;
}

export interface QueryData {
    tags: string[];
    comments: Comment[];
}