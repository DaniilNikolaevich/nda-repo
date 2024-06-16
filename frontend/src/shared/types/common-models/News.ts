interface Cover {
    id: string;
    name: string;
    mime_type: string;
    url: string;
}

interface Like {
    likes: number;
    dislikes: number;
}

interface Tag {
    id: string;
    name: string;
}

export interface News {
    id: string;
    title: string;
    brief_content: TrustedHTML | string;
    // TODO: creator model?
    creator: null;
    cover: Cover | Cover[];
    comments_count: number;
    likes_count: Like;
    tags: Tag[];
    is_external: boolean;
    external_link: string;
    is_liked: boolean;
    created_at: string;
    content?: string;
}

export interface NewsModel {
    total_pages: 14;
    payload: News[];
}
