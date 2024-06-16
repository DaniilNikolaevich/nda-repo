import { VacancyInfoRequest, VacancyModel } from '@/shared/types/common-models';

export interface VacanciesParamsDTO {
    page?: number | string;
    itemsPerPage?: number;
    sortDesc?: string;
    sortBy?: string;
    search?: string;
    salary__gte?: string;
    city__in?: string;
    date_range?: string;
    category__in?: string;
    employment_type_in?: string;
    work_schedule_in?: string;
    created_at?: string;
}

export interface VacanciesForRecruiterParamsDTO {
    page?: number | string;
    itemsPerPage?: number;
    sortDesc?: boolean;
    sortBy?: string;
    search?: string;
    category__in?: string | number;
    status__in?: string | number;
}

export interface VacancyByIdDTO {
    vacancy_id: string;
}

export interface VacanciesResponse {
    payload: VacancyModel[];
    total_pages: number;
    total_count: number;
}

export type VacancyByIdResponse = VacancyModel;

export interface VacanciesForRecruiterResponse {
    payload: VacancyModel[];
    has_next_page: false;
    total_pages: number;
    total_count: number;
}

export interface VacancyStatusDto {
    vacancy_id: string;
    status: number;
}

export type CreateVacancyDto = VacancyInfoRequest;

export type ChangeVacancyDto = VacancyInfoRequest & {
    vacancy_id: string;
};

export interface CandidateParams {
    page?: number;
    itemsPerPage?: number;
    sortBy?: string;
    sortDesc?: string;
    search?: string;
    preferred_salary__isnull?: string;
    preferred_salary__gte?: string | number;
    city__in?: string;
    preferred_work_schedule?: string;
    preferred_employment_type?: string;
}
