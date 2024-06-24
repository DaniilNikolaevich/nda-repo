import { CandidateModel } from '@/shared/types/common-models/Candidates';
import { CommonType } from '@/shared/types/common-models/common';
import { UserModel } from '@/shared/types/common-models/User';
import { VacancyModel } from '@/shared/types/common-models/Vacancy';

interface Role {
    id: number;
    name: string;
}

interface RecruiterInfo {
    email: string;
    position: string;
    department: string;
    phone: string;
    avatar_url: string;
    avatar_thumbnail_url: string;
}

export interface RecruiterModel {
    id: string;
    email: string;
    name: string;
    surname: string;
    patronymic: string;
    fullname: string;
    role: Role;
    is_active: boolean;
    is_registered: boolean;
    avatar_thumbnail_url: string | null;
    recruiter_info: RecruiterInfo;
}

export interface InterviewModel {
    id: string;
    created_at: string;
    date: null | string;
    start_time: null | string;
    end_time: null | string;
    interview_type: CommonType;
    meeting_link: string | null;
    status: CommonType;
    updated_at: string;
}

export interface RecruitmentProcessModel {
    id: string;
    vacancy: VacancyModel;
    candidate: UserModel;
    step: CommonType;
    created_at: string;
    updated_at: string;
    interview: InterviewModel;
    chat: null | string;
}
