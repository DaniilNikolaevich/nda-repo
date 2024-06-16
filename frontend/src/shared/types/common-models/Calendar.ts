import { CommonType } from '@/shared/types/common-models/common';

export interface SheduleType {
    weekday: CommonType;
    schedule_slots: Array<{ id?: string; start_time: string | null; end_time: string | null }>;
    is_day_off: boolean;
    id?: string;
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

export interface CandidateInfo {
    id: string;
    name: string;
    surname: string;
    patronymic: string;
    fullname: string;
    role: CommonType;
    email: string;
    avatar_thumbnail_url: string | null;
    user: {
        preferred_position: string | null;
    };
}

export interface PayloadAdminBookingType {
    id: string;
    recruiter: RecruiterInfo;
    candidate: CandidateInfo;
    name: string;
    description: string;
    meeting_url: string | null;
    slots: Array<{
        id: string;
        start_time: string;
        end_time: string;
    }>;
    start_date: string;
    end_date: string;
    start_datetime: string;
    end_datetime: string;
}

export interface AdminBookingType {
    total_pages: number;
    total_count: number;
    has_next_page: boolean;
    payload: Array<PayloadAdminBookingType>;
}

export interface SheduleRequestType {
    weekday: number;
    schedule_slots: Array<{ id?: string; start_time: string | null; end_time: string | null }>;
    is_day_off: boolean;
    id?: string;
}

export type AdminBookingByIdResponse = PayloadAdminBookingType;

export type GenerateSheduleRequestType = {
    start_time: string | null;
    end_time: string | null;
    session_duration: number;
    gap_duration: number;
};
