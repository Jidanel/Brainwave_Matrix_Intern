# blog_platform/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),  # Inclure les URLs de l'application 'users'
    path('blog/', include('blog.urls')),    # Inclure les URLs de l'application 'blog'
    path('', RedirectView.as_view(url='users/login/')),  # Rediriger l'accueil vers la page de connexion
]
