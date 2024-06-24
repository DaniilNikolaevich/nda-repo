import { ChatModel } from '@/shared/types/common-models/Chat';
import { CommonType } from '@/shared/types/common-models/common';
import type { RecruiterModel } from '@/shared/types/common-models/Recruiter';

export interface Skill {
    id: string;
    name: string;
    is_verified: boolean;
}

export interface VacancyModel {
    id: string;
    views_num: number;
    position: {
        id: string;
        is_verified: boolean;
        name: string;
    };
    created_at: string;
    salary: string | number;
    city: {
        id: string;
        name: string;
    };
    country: {
        id: string;
        name: string;
    };
    category: {
        id: number;
        name: string;
    };
    additional_requirements: string;
    department: CommonType;
    status: CommonType;
    work_schedule: {
        id: number;
        name: string;
    };
    employment_type: {
        id: number;
        name: string;
    };
    tasks: string;
    description: string;
    skills: Skill[];
    benefits: null | string;
    candidate_response?: {
        is_responded: boolean;
        response_time: string;
    };
    responsible_recruiter?: RecruiterModel;
    chat?: ChatModel;
}

export interface VacancyInfoRequest {
    position?: string | null;
    department?: string | null;
    country?: string | null;
    city?: string | null;
    salary?: number | null;
    category?: number | null;
    work_schedule?: number | null;
    employment_type?: number | null;
    description?: string | null;
    tasks?: string | null;
    tasks_used_as_template?: boolean | null;
    skills?: Array<string> | null;
    benefits?: string | null;
    benefits_used_as_template?: boolean | null;
    additional_requirements?: string | null;
}
