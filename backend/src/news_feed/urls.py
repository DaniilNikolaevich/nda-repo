from django.urls import path

from news_feed.views import NewsCommentDetailView, NewsCommentsView, NewsDetailView, NewsDocumentView, NewsFeedView, \
    NewsLikesView, NewsSubscriptionView, NewsTagDetailView, \
    NewsTagView

urlpatterns = [
    path('news', NewsFeedView.as_view()),
    path('news/<uuid:news_id>', NewsDetailView.as_view()),
    path('news/<uuid:news_id>/comments', NewsCommentsView.as_view()),
    path('news/<uuid:news_id>/reactions', NewsLikesView.as_view()),
    path('comments/<uuid:comment_id>', NewsCommentDetailView.as_view()),
    path('tags', NewsTagView.as_view()),
    path('tags/<uuid:tag_id>', NewsTagDetailView.as_view()),
    path('documents', NewsDocumentView.as_view()),
    path('documents/<uuid:document_id>', NewsDocumentView.as_view()),
    path('subscribe', NewsSubscriptionView.as_view()),
]
