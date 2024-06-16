import { AuthorizationForm } from '@/components/widgets';
import { BaseLayout } from '@/layouts';

function AuthPage() {
    return (
        <BaseLayout title='Авторизация'>
            <AuthorizationForm />
        </BaseLayout>
    );
}

export default AuthPage;
