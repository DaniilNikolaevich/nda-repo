from django.contrib import admin

from calendars.models import CalendarEvent, EventSlot, ExternalBooking, Schedule, ScheduleSlot, SpecialDay, \
    SpecialDaySlot


class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'recruiter', 'candidate', 'interview', 'start_date', 'end_date')
    search_fields = ('recruiter__fullname',)


admin.site.register(CalendarEvent, CalendarEventAdmin)


class CalendarEventAdminAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'start_time', 'end_time')
    search_fields = ('event__name',)


admin.site.register(EventSlot, CalendarEventAdminAdmin)


class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'recruiter', 'is_day_off', 'weekday')
    search_fields = ('recruiter__id',)


admin.site.register(Schedule, ScheduleAdmin)


class ScheduleSlotAdmin(admin.ModelAdmin):
    list_display = ('id', 'schedule', 'start_time', 'end_time')
    search_fields = ('schedule__id',)


admin.site.register(ScheduleSlot, ScheduleSlotAdmin)


class SpecialDayAdmin(admin.ModelAdmin):
    list_display = ('id', 'recruiter', 'date', 'is_day_off')
    search_fields = ('recruiter__id', 'date')


admin.site.register(SpecialDay, SpecialDayAdmin)


class SpecialDaySlotAdmin(admin.ModelAdmin):
    list_display = ('id', 'special_day', 'start_time', 'end_time')
    search_fields = ('recruiter__id',)


admin.site.register(SpecialDaySlot, SpecialDaySlotAdmin)


class ExternalBookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'recruiter', 'uid', 'name', 'start_datetime', 'end_datetime')
    search_fields = ('recruiter__name',)


admin.site.register(ExternalBooking, ExternalBookingAdmin)
