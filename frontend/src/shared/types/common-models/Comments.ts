import { UserModel } from '@/shared/types/common-models/User';

export interface CommentModel {
    id: string;
    news: string;
    user: UserModel;
    content: string;
}

export interface CommentAboutUserModel {
    id: string;
    user: UserModel;
    author: UserModel;
    text: string;
    file_url: string;
    created_at: string;
    updated_at: string;
}
