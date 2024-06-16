import { CommonType } from '@/shared/types/common-models';

export type TabTypes = 'data' | 'contacts' | 'experience' | 'education';

export interface TabItemType {
    value: TabTypes;
    content: string;
}

export interface UserTypes {
    id: string;
    name: string;
    patronymic: string;
    fullname: string;
    surname: string;
    role: {
        id: string;
        name: string;
    };
    email: string;
    avatar_thumbnail_url: string;
}

export interface ProfileInfoApplicantTypes {
    id: string;
    user: UserTypes;
    birth_date: Date | null;
    ai_summary: string;
    sex: { id: string; name: string };
    preferred_salary: number;
    preferred_position: { id: string; name: string };
    city: { id: string; name: string };
    skills: Array<{ id: string; name: string }>;
    about: string;
    avatar_url: string;
    business_trip: boolean;
    relocation: boolean;
    contacts: Array<{ type: number; value: string; is_preferred: boolean }>;
    preferred_employment_type: Array<{ id: string; name: string }>;
    preferred_work_schedule: Array<{ id: string; name: string }>;
    country: { id: string; name: string };
}

export interface ProfileExperienceApplicantType {
    id: string;
    company: CommonType;
    position: CommonType;
    start_date: string;
    end_date: string;
    duties: string;
    achievements: string;
}

export interface ProfileEducationApplicantType {
    id: string;
    institution: CommonType;
    start_date: string;
    end_date: string;
    faculty: string;
    speciality: string;
    education_level: CommonType;
}
