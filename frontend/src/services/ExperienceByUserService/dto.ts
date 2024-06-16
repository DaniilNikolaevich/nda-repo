import { ProfileExperienceApplicantType } from '@/shared/types';

export interface ChangeWorkExperienceDto {
    company: string | null;
    position: string | null;
    start_date: string | null;
    end_date: string | null;
    duties: string | null;
    achievements: string | null;
}

export type GetWorkExperienceDto = ProfileExperienceApplicantType;
