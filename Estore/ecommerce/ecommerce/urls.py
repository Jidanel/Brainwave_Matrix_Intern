from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),  # URLs de l'application accounts
    path('products/', include('products.urls')),  # URLs de l'application products
    path('orders/', include('orders.urls')),      # URLs de l'application orders
    path('dashboard/', include('dashboard.urls')),  # URLs de l'application dashboard
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
]

# Servir les fichiers statiques et media en mode DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
