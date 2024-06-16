import { RestorePassword } from '@/components/widgets';
import { BaseLayout } from '@/layouts';

function SetPasswordPage() {
    return (
        <BaseLayout title='Регистрация | Установка пароля'>
            <RestorePassword />
        </BaseLayout>
    );
}

export default SetPasswordPage;
