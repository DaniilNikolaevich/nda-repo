import { ProfileEducationApplicantType } from '@/shared/types';

export type GetEducationByMeDto = ProfileEducationApplicantType;

export interface ChangeEducationByMeDto {
    institution: string;
    start_date: string;
    end_date: string;
    faculty: string;
    speciality: string;
    education_level: number;
}
