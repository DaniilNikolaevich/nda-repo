import { RegistrationForm } from '@/components/widgets';
import { BaseLayout } from '@/layouts';

function RegistrationPage() {
    return (
        <BaseLayout title='Регистрация'>
            <RegistrationForm />
        </BaseLayout>
    );
}

export default RegistrationPage;
