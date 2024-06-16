import { CommonType } from '@/shared/types/common-models';

export interface GetChatsByCandidateResponse {
    chats: Array<CommonType>;
    token: string;
}
