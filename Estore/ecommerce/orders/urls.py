from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('cart/', views.cart, name='cart'),
    path('cart/add/<int:product_id>/', views.cart_add, name='cart_add'),  # Ajout au panier
    path('checkout/', views.checkout, name='checkout'),
    path('history/', views.transaction_history, name='order_history'),
    path('receipt/<int:order_id>/', views.receipt, name='receipt'), 
    path('clear_cart/', views.clear_cart, name='clear_cart'),
    path('cart/count/', views.cart_count, name='cart_count'),

]

