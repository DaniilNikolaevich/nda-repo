import { ProfileInfoApplicantTypes } from '@/shared/types';

export type UserInfoDto = {
    userId: string;
};

type SkillsTypes = string | { name: string };
type ContactType = {
    type: number;
    value: string;
    is_preferred: boolean;
};

export type ChangeMeInfoDto = {
    sex: number;
    birth_date: string | null;
    city: string | null;
    country: string | null;
    about: string | null;
    preferred_position: string | null;
    preferred_salary: number;
    skills: Array<SkillsTypes>;
    preferred_work_schedule: Array<number>;
    preferred_employment_type: Array<number>;
    business_trip: boolean;
    relocation: boolean;
};

export type GetMeInfoDto = ProfileInfoApplicantTypes;

export type UploadUserAvatarDto = File | Blob | null;

export type PatchUserContactsDto = {
    contacts: Array<{ type: number; value: string; is_preferred: boolean }>;
};
