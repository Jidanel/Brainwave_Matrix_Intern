from django.urls import path
from .views import *

app_name = 'blog'

urlpatterns = [
    path('', article_list, name='index'),
    path('article/<int:pk>/', article_detail, name='article_detail'),  # Nouvelle vue pour les détails
    path('article/new/', article_create, name='article_create'),
    path('article/<int:pk>/edit/', article_update, name='article_update'),
    path('article/<int:pk>/delete/', article_delete, name='article_delete'),  # Page de confirmation
    path('article/<int:pk>/comment/', add_comment, name='add_comment'),
    path('comment/<int:pk>/delete/', delete_comment, name='delete_comment'),  # Page de confirmation de suppression du commentaire
    path('comment/<int:pk>/edit/', comment_update, name='comment_update'), 
]
