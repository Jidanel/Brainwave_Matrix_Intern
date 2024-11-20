from django.shortcuts import render, redirect
from products.models import Product
from orders.models import Order

def dashboard_home(request):
    if not request.user.is_staff:
        return redirect('products:products_list')

    return render(request, 'dashboard/dashboard_home.html')

def manage_products(request):
    if not request.user.is_staff:
        return redirect('products:products_list')

    products = Product.objects.all()
    return render(request, 'dashboard/manage_products.html', {'products': products})

def sales_dashboard(request):
    if not request.user.is_staff:
        return redirect('products:products_list')

    orders = Order.objects.all()
    return render(request, 'dashboard/sales_dashboard.html', {'orders': orders})

def home_view(request):
    return render(request, 'home.html')
