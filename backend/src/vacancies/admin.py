from django.contrib import admin

from .models import Vacancy, RecruiterFlow, FlowHistory, Interview, CandidateFlow


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'status',
        'position',
        'department',
        'country',
        'city',
        'salary',
        'category',
        'work_schedule',
        'employment_type',
        'description',
        'tasks',
        'tasks_used_as_template',
        'additional_requirements',
        'benefits',
        'created_at',
        'updated_at'
    )
    list_filter = ('status', 'department', 'category', 'tasks_used_as_template')
    search_fields = ('position__name', 'description', 'tasks', 'additional_requirements')
    raw_id_fields = ('position', 'department', 'country', 'city')
    filter_horizontal = ['skills']
    ordering = ['-created_at']


@admin.register(RecruiterFlow)
class RecruiterFlowAdmin(admin.ModelAdmin):
    list_display = ('id', 'candidate', 'vacancy', 'get_step_display', 'created_at', 'updated_at')
    list_filter = ['step']
    search_fields = ('candidate__username', 'vacancy__position__name', 'vacancy__description')
    ordering = ('-created_at',)
    list_per_page = 20
    autocomplete_fields = ('candidate', 'vacancy')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Основная информация', {
            'fields': ('candidate', 'vacancy', 'step', 'chat')
        }),
        ('Additional Info', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def get_step_display(self, obj):
        return obj.get_step_display()

    get_step_display.short_description = 'Шаг'

    actions = ['mark_as_deleted']

    def mark_as_deleted(self, request, queryset):
        queryset.update(step=RecruiterFlow.Step.DELETED)
        self.message_user(request, "Selected records were marked as deleted.")

    mark_as_deleted.short_description = "Mark selected records as deleted"


@admin.register(FlowHistory)
class FlowHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'recruitment_flow', 'message', 'created_at')
    list_filter = ['created_at']
    search_fields = ('message', 'recruitment_flow__vacancy__position__name', 'recruitment_flow__candidate__username')
    ordering = ['-created_at']
    list_per_page = 20

    def recruitment_flow_display(self, obj):
        return f"{obj.recruitment_flow.id} - {obj.recruitment_flow.get_step_display()}"

    recruitment_flow_display.short_description = 'Recruitment Flow'


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    # Fields to display in the admin list view
    list_display = (
        'id',
        'recruiter_flow',
        'interview_type',
        'status',
        'date',
        'start_time',
        'end_time',
        'meeting_link',
        'comment'
    )
    # Fields that will have clickable links to the edit page
    list_display_links = ('id', 'recruiter_flow')
    # Filters available in the right sidebar
    list_filter = ('interview_type', 'status', 'date')
    # Fields that can be searched
    search_fields = ('recruiter_flow__vacancy__position__name', 'comment')
    # Date hierarchy navigation for easy browsing
    date_hierarchy = 'date'
    # Default ordering in the list view
    ordering = ['-date']
    # Fields layout in the detail view
    fieldsets = (
        (None, {
            'fields': (
                'recruiter_flow', 'interview_type', 'status', 'date', 'start_time', 'end_time', 'meeting_link',
                'comment')
        }),
        ('Advanced options', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )
    # Read-only fields
    readonly_fields = ('created_at', 'updated_at')



@admin.register(CandidateFlow)
class CandidateFlowAdmin(admin.ModelAdmin):
    list_display = ('id', 'recruiter_flow', 'step', 'created_at', 'updated_at')
    ordering = ['-created_at']