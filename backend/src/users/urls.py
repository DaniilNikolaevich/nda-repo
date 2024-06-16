from django.urls import path

from users.admin_settings.views import AdminMyAvatarView, AdminMyInfoView, AdminMyUserView, UserDetailView, UserView
from users.views import SignInView, RefreshTokenView, RegisterView, SetPasswordView, PasswordResetView, \
    PasswordResetConfirmView, TestView, UserInformationView, UserAvatarView, UserWorkExperienceView, MyInformationView, \
    MyWorkExperienceView, MyEducationView, UserEducationView, MyProfileOccupancy, UserProfileOccupancy, UserCommentView, \
    UserCommentDetailView, MyCVView, UserCVView

urlpatterns = [
    path('test', TestView.as_view()),
    path('auth/sign-in', SignInView.as_view()),
    path('auth/refresh-token', RefreshTokenView.as_view()),
    path('auth/register', RegisterView.as_view()),
    path('auth/set-password', SetPasswordView.as_view()),
    path('auth/password-reset', PasswordResetView.as_view()),
    path('auth/password-reset-confirm', PasswordResetConfirmView.as_view()),

    path('me/info', MyInformationView.as_view()),
    path('me/profile-occupancy', MyProfileOccupancy.as_view()),
    path('me/avatar', UserAvatarView.as_view()),
    path('me/work-experience', MyWorkExperienceView.as_view()),
    path('me/education', MyEducationView.as_view()),
    path('me/download-cv', MyCVView.as_view()),

    path('<uuid:user_id>/comments', UserCommentView.as_view()),
    path('comments/<uuid:comment_id>', UserCommentDetailView.as_view()),

    path('<uuid:target_user_id>/info', UserInformationView.as_view()),
    path('<uuid:target_user_id>/download-cv', UserCVView.as_view()),
    path('<uuid:target_user_id>/profile-occupancy', UserProfileOccupancy.as_view()),
    path('<uuid:target_user_id>/work-experience', UserWorkExperienceView.as_view()),
    path('<uuid:target_user_id>/education', UserEducationView.as_view()),

    path('admin/users', UserView.as_view()),
    path('admin/users/<uuid:target_user_id>', UserDetailView.as_view()),
    path('admin/me', AdminMyUserView.as_view()),
    path('admin/me/info', AdminMyInfoView.as_view()),
    path('admin/me/avatar', AdminMyAvatarView.as_view()),
]
