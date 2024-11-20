from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import Order, OrderItem
from products.models import *
from django.http import HttpResponse
from django.template.loader import render_to_string
import tempfile
from django.http import JsonResponse
from django.core.exceptions import ValidationError

# Afficher le panier

def cart(request):
    # Récupérer le panier depuis la session
    cart = request.session.get('cart', {})
    cart_items = []
    total_price = 0

    for product_id, quantity in cart.items():
        try:
            product = Product.objects.get(id=product_id)
            subtotal = product.price * quantity
            cart_items.append({'product': product, 'quantity': quantity, 'subtotal': subtotal})
            total_price += subtotal
        except Product.DoesNotExist:
            # Si un produit n'existe pas, on peut l'ignorer ou afficher un message d'erreur
            continue

    return render(request, 'orders/cart.html', {
        'cart_items': cart_items,
        'total_price': total_price,
    })


# Passer la commande


def checkout(request):
    cart = request.session.get('cart', {})
    if not cart:
        messages.error(request, "Your cart is empty. Please add products before checking out.")
        return redirect('orders:cart')

    if request.method == 'POST':
        # Validation des champs obligatoires
        card_number = request.POST.get('card_number', '').strip()
        cardholder_name = request.POST.get('cardholder_name', '').strip()
        owner_name = request.POST.get('owner_name', '').strip()
        expiry_date = request.POST.get('expiry_date', '').strip()
        cvv = request.POST.get('cvv', '').strip()

        if not card_number or not cardholder_name or not owner_name or not expiry_date or not cvv:
            messages.error(request, "All payment fields are required. Please fill in all fields.")
            return redirect('orders:checkout')

        # Validation supplémentaire pour certains champs
        if len(card_number) < 16 or not card_number.isdigit():
            messages.error(request, "Invalid card number. Please enter a valid 16-digit card number.")
            return redirect('orders:checkout')

        if len(cvv) != 3 or not cvv.isdigit():
            messages.error(request, "Invalid CVV. Please enter a valid 3-digit CVV.")
            return redirect('orders:checkout')

        # Création de la commande
        order = Order.objects.create(user=request.user, total_price=0)
        total_price = 0

        # Vérification des stocks et ajout des articles à la commande
        for product_id, quantity in cart.items():
            product = Product.objects.get(id=product_id)
            if product.stock < quantity:
                messages.error(request, f"Not enough stock for {product.name}.")
                return redirect('orders:cart')

            total_price += product.price * quantity
            OrderItem.objects.create(order=order, product=product, quantity=quantity)
            product.stock -= quantity
            product.save()

        order.total_price = total_price
        order.save()

        # Vider le panier
        del request.session['cart']

        # Confirmation de la commande
        messages.success(request, "Order placed successfully!")
        return redirect('orders:receipt', order_id=order.id)  # Redirection vers la facture

    return render(request, 'orders/checkout.html')




# Historique des commandes
def transaction_history(request):
    transactions = None
    if request.method == 'POST':
        code = request.POST.get('order_code')
        transactions = Order.objects.filter(unique_code=code)

    return render(request, 'orders/transaction_history.html', {'transactions': transactions})


def cart_add(request, product_id):
    """
    Ajoute un produit au panier avec vérification du stock et gestion de session.
    """
    product = get_object_or_404(Product, id=product_id)
    quantity = int(request.POST.get('quantity', 1))  # Quantité demandée, par défaut 1

    # Récupérer le panier de la session (ou initialiser s'il est vide)
    cart = request.session.get('cart', {})

    # Vérifier le stock
    if product.stock >= quantity:
        product_id_str = str(product_id)
        if product_id_str in cart:
            # Mise à jour de la quantité dans le panier
            new_quantity = cart[product_id_str] + quantity
            if product.stock >= new_quantity:
                cart[product_id_str] = new_quantity
                messages.success(request, f"{quantity} x {product.name} added to cart.")
            else:
                messages.error(
                    request, f"Not enough stock for {product.name}. Available: {product.stock}"
                )
        else:
            # Ajouter le produit au panier
            cart[product_id_str] = quantity
            messages.success(request, f"{quantity} x {product.name} added to cart.")
    else:
        # Pas assez de stock
        messages.error(request, f"Not enough stock for {product.name}. Available: {product.stock}")

    # Sauvegarder le panier dans la session
    request.session['cart'] = cart

    # Redirection vers la page du panier
    return redirect('orders:cart')
def receipt(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    items = order.items.all()

    for item in items:
        item.subtotal = item.quantity * item.product.price  # Ajouter un champ 'subtotal' pour chaque item

    return render(request, 'orders/receipt.html', {
        'order': order,
        'items': items
    })


def clear_cart(request):
    """Vider le panier."""
    if 'cart' in request.session:
        del request.session['cart']  # Supprimer le panier de la session
        messages.success(request, "Your cart has been cleared.")
    else:
        messages.info(request, "Your cart is already empty.")
    return redirect('orders:cart')



def cart_count(request):
    cart = request.session.get('cart', {})
    cart_count = sum(cart.values())  # Total des quantités dans le panier
    return JsonResponse({'count': cart_count})
