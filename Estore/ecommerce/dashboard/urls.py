from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.dashboard_home, name='dashboard_home'),
    path('products/', views.manage_products, name='manage_products'),
    path('sales/', views.sales_dashboard, name='sales_dashboard'),
]
