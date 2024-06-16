import { CandidateModel } from '@/shared/types/common-models/Candidates';
import { RecruiterModel } from '@/shared/types/common-models/Recruiter';
import { UserModel } from '@/shared/types/common-models/User';

export interface ChatModel {
    created_at: string | null;
    id: string;
    name: string;
    candidate?: CandidateModel;
    recruiter?: RecruiterModel;
    message?: string;
}

export interface ChatMessageModel extends ChatModel {
    author: UserModel;
    chat: {
        candidate: CandidateModel;
        created_at: string;
        id: string;
        name: string;
        recruiter: RecruiterModel;
        updated_at: string;
    };
}
