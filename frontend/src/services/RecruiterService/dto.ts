import { CommonType } from '@/shared/types/common-models';
import { GenerateSheduleRequestType, SheduleRequestType, SheduleType } from '@/shared/types/common-models/Calendar';

export interface GetUsersListPayloadDto {
    id: string;
    email: string;
    name: string;
    surname: string;
    patronymic: string;
    fullname: string;
    role: CommonType;
    is_active: boolean;
    is_registered: boolean;
    avatar_thumbnail_url: string;
}

export interface GetUsersListDto {
    total_pages: number;
    total_count: number;
    has_next_page: boolean;
    payload: Array<GetUsersListPayloadDto>;
}

export interface RecruiterInfo {
    id: string;
    name: string;
    surname: string;
    patronymic: string;
    fullname: string;
    user: {
        id: string;
        name: string;
        surname: string;
        patronymic: string;
        fullname: string;
    };
}

export interface GetRecruiterInfoByMeDto {
    user: RecruiterInfo;
    email: string;
    position: string;
    department: string;
    external_calendar_type: number;
    phone: string;
    avatar_url: string;
    avatar_thumbnail_url: string;
    external_calendar_url: string;
    max_slots: number;
}

export interface ChangeAdditionalRecruiterInfoByMeDto {
    email?: string;
    position?: string;
    department?: string;
    phone?: string;
    max_slots?: number;
    external_calendar_url?: string;
    external_calendar_type?: number; //     GOOGLE = 1' YANDEX = 2 APPLE = 3 BITRIX = 4  OTHER = 5
}

export interface ChangeMainRecruiterInfoByMeDto {
    surname: string;
    name: string;
    patronymic: string;
}

export interface InviteToRecruiterDto {
    name: string;
    surname: string;
    patronymic: string;
    email: string;
}

export type GetShedulesMeResponse = Array<SheduleType>;

export type GetAdminBookingResponse = Array<SheduleType>;

export type CreateWeeklySheduleDto = {
    shedules: Array<SheduleRequestType>;
    recruiter_id: string;
};

export type GenerateSheduleDto = GenerateSheduleRequestType;
