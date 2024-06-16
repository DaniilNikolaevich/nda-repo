import { Avatar } from '@mantine/core';

interface ProfileAvatarApplicantProps {
    avatar: string;
}

export const ProfileAvatarApplicant = ({ avatar }: ProfileAvatarApplicantProps) => (
    <Avatar miw={284} mih={284} h={284} w={284} radius='sm' src={avatar ?? ''} />
);
