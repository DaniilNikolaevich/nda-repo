import { CityModel, PathParamsDefaultType, TemplatesOfTasksType } from '@/shared/types/common-models';
import { DepartmentsType } from '@/shared/types/common-models/Departments';

export interface CitiesDictionaryResponse {
    payload: CityModel[];
}

export interface CitiesDictionaryRequest {
    search?: string;
    itemsPerPage?: string | number;
}

export type TemplatesOfBenefitsDto = PathParamsDefaultType;

export interface TemplatesOfBenefitsResponse {
    total_pages: number;
    total_count: number;
    has_next_page: boolean;
    payload: Array<{ position: string; benefits: string }>;
}

export type TemplatesOfTasksDto = PathParamsDefaultType;

export type TemplatesOfTasksResponse = TemplatesOfTasksType;

export type DepartmentsDto = PathParamsDefaultType;

export type DepartmentsResponse = DepartmentsType;

export type ParamsQuery = {
    page?: number;
    itemsPerPage?: number;
    sortBy?: string;
    sortDesk?: string;
    search?: string;
};
