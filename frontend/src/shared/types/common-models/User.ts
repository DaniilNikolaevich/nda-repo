import { CandidateModel } from '@/shared/types/common-models/Candidates';
import { CommonType } from '@/shared/types/common-models/common';

export interface UserModel {
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    password: string;
    fullname?: string;
    avatar_thumbnail_url?: string | null;
    info?: CandidateModel;
    id: string;
    role?: CommonType;
}
