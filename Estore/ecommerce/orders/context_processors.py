def cart_item_count(request):
    """
    Calculer le nombre total d'articles dans le panier et le rendre disponible pour tous les templates.
    """
    cart = request.session.get('cart', {})
    total_items = sum(cart.values())  # Somme des quantités dans le panier
    return {'cart_item_count': total_items}
