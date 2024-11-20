from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    path('', views.category_list, name='category_list'),  # Liste des catégories
    path('category/<int:category_id>/', views.product_list_by_category, name='product_by_category'),  # Produits par catégorie
    path('product/<int:id>/', views.product_detail, name='product_detail'),  # Détail d’un produit
]
