from django.contrib import admin

from base.admin import BaseAdmin
from users.models import AdminInformation, User, VerificationCode, UserInformation, UserWorkExperience, UserEducation


@admin.register(User)
class UserAdmin(BaseAdmin):
    list_display = ['id', 'fullname', 'role', 'email', 'is_registered', 'is_active', 'created_at', 'updated_at']
    search_fields = ['id__icontains', 'surname__icontains', 'email']
    list_filter = ['role', 'is_active']
    ordering = ['-created_at']


@admin.register(VerificationCode)
class VerificationCodeAdmin(BaseAdmin):
    list_display = ['id', 'code', 'is_used', 'user', 'valid_until', 'email', 'verification_type',
                    'created_at', 'updated_at']
    search_fields = ['code', 'email']
    list_filter = ['verification_type']
    ordering = ['-created_at']


@admin.register(UserInformation)
class UserInformationAdmin(admin.ModelAdmin):
    list_display = ('user', 'sex', 'birth_date', 'business_trip', 'relocation')
    search_fields = ('user__email',)
    list_filter = ('sex', 'business_trip', 'relocation')
    date_hierarchy = 'birth_date'

    raw_id_fields = ('user', 'city')
    filter_horizontal = ['skills']

    fieldsets = [
        (None, {'fields': ['user', 'sex', 'birth_date']}),
        ('Personal Info', {'fields': ['about', 'avatar', 'avatar_thumbnail', 'cv', 'cv_filename']}),
        ('Work preferences', {'fields': ['preferred_work_schedule', 'business_trip', 'relocation',
                                         'preferred_employment_type', 'preferred_position', 'preferred_salary']}),
        ('Social', {'fields': ['contacts', 'telegram_chat_id']}),
        ('Location', {'fields': ['city']}),
        ('Skills', {'fields': ['skills']}),
        ('AI', {'fields': ['ai_summary', 'personalized_questions']}),
        ('Recruiter', {'fields': ['recruiter_note']})
    ]


@admin.register(UserWorkExperience)
class UserWorkExperienceAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'position', 'start_date', 'end_date')
    search_fields = ('user__fullname', 'company', 'position__name')
    raw_id_fields = ('user', 'position')
    autocomplete_fields = ('user', 'position')
    fieldsets = (
        (None, {
            'fields': (
                'user', 'company', 'start_date', 'end_date', 'position', 'duties', 'achievements')
        }),
    )


@admin.register(UserEducation)
class UserEducationAdmin(admin.ModelAdmin):
    list_display = ('user', 'institution', 'start_date', 'end_date', 'faculty', 'speciality', 'education_level')
    search_fields = ('user__fullname', 'institution__name', 'faculty', 'speciality')
    raw_id_fields = ['user']
    autocomplete_fields = ['user']
    fieldsets = (
        (None, {
            'fields': ('user', 'institution', 'start_date', 'end_date', 'faculty', 'speciality', 'education_level')
        }),
    )


@admin.register(AdminInformation)
class AdminInformationAdmin(admin.ModelAdmin):
    pass
