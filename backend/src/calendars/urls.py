from django.urls import path

from calendars.views import AdminBookingDetailView, AdminBookingView, AvailableDatesView, AvailableTimeSlotsView, \
    GenerateTimeSlots, \
    ScheduleDetailView, \
    ScheduleView, \
    SpecialDayDetailView, SpecialDayView, UserBookingView

urlpatterns = [
    path('generate-time-slots', GenerateTimeSlots.as_view()),
    path('recruiter/<uuid:recruiter_id>/schedule', ScheduleView.as_view()),
    path('recruiter/<uuid:recruiter_id>/schedule/<uuid:schedule_id>', ScheduleDetailView.as_view()),

    path('recruiter/<uuid:recruiter_id>/special-days', SpecialDayView.as_view()),
    path('recruiter/<uuid:recruiter_id>/special-days/<uuid:special_day_id>', SpecialDayDetailView.as_view()),

    path('interview/<uuid:interview_id>/available-time-slots', AvailableTimeSlotsView.as_view()),
    path('interview/<uuid:interview_id>/available-dates', AvailableDatesView.as_view()),

    path('admin/booking', AdminBookingView.as_view()),
    path('admin/booking/<uuid:event_id>', AdminBookingDetailView.as_view()),

    path('candidate/recruiter/<uuid:recruiter_id>/booking', UserBookingView.as_view()),
    path('candidate/booking', UserBookingView.as_view()),
]
