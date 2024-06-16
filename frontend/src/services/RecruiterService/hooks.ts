import { useCreateChatByCandidateMutation, useSelectCandidateMutation } from '@/services';

export const useSelectCandidateForJob = () => {
    const [selectCandidate] = useSelectCandidateMutation();

    const handleSelectCandidate = ({ vacancy, candidate }: { vacancy: string; candidate: string }) => {
        selectCandidate({
            candidate: (candidate as string) ?? '',
            vacancy: (vacancy as string) ?? '',
        });
    };

    return { handleSelectCandidate };
};

export const useCreateChatWithCandidate = () => {
    const [createChat, { data: chatInfo }] = useCreateChatByCandidateMutation();

    const handleCreateChat = (id: string) => {
        createChat({
            candidate_id: id,
        });
    };

    return {
        handleCreateChat,
        chatInfo,
    };
};
