import { RestorePassword } from '@/components/widgets';
import { BaseLayout } from '@/layouts';

function ResetPasswordConfirmation() {
    return (
        <BaseLayout title='Сброс пароля'>
            <RestorePassword title='Сбросить пароль' isReset />
        </BaseLayout>
    );
}

export default ResetPasswordConfirmation;
