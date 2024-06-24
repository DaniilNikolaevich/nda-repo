import { MemoImage } from '@/shared/ui';

interface ProfileAvatarApplicantProps {
    avatar: string;
}

export const ProfileAvatarApplicant = ({ avatar }: ProfileAvatarApplicantProps) => (
    <MemoImage height={284} width={284} src={avatar ?? ''} alt='Аватар пользователя' />
);
