import type { UserModel } from '@/shared/types/common-models/User';
import type { Skill } from '@/shared/types/common-models/Vacancy';

export interface CandidateModel {
    id: string;
    user: UserModel & {
        id: string;
        role: {
            id: number;
            name: string;
        };
    };
    sex: {
        id: number;
        name: string;
    };
    birth_date: string;
    country: {
        id: string;
        name: string;
        is_verified: boolean;
    };
    city: {
        id: string;
        name: string;
        is_verified: boolean;
    };
    contacts: {
        type: number;
        value: string;
        is_preferred: boolean;
    }[];
    about: string;
    ai_summary: string;
    preferred_work_schedule: {
        id: number;
        name: string;
    }[];
    business_trip: boolean;
    relocation: boolean;
    personalized_questions: string[];
    preferred_employment_type: {
        id: number;
        name: string;
    }[];
    preferred_position?: {
        id?: string;
        name?: string;
        is_verified: boolean;
    };
    preferred_salary: string | number;
    skills: Skill[];
    avatar_url: null | string;
    cv_url: string | null;
    avatar_thumbnail_url: UserModel['avatar_thumbnail_url'];
    recruiter_note: string;
    telegram_accept_url: string;
    total_experience: null | string | number;
    info?: CandidateModel;
    fullname?: string;
}
