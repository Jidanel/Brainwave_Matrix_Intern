from django.shortcuts import render, get_object_or_404
from .models import Product, Category
from django.core.paginator import Paginator
from django.db.models import Q


def category_list(request):
    """Affiche la liste des catégories avec pagination."""
    categories = Category.objects.all()
    paginator = Paginator(categories, 6)  # 6 catégories par page
    page_number = request.GET.get('page')
    categories = paginator.get_page(page_number)

    return render(request, 'products/category_list.html', {'categories': categories})


def product_list_by_category(request, category_id):
    """Affiche les produits d’une catégorie spécifique avec recherche, tri et possibilité de réinitialiser."""
    category = get_object_or_404(Category, id=category_id)
    query = request.GET.get('q', '')  # Recherche par nom
    sort_order = request.GET.get('sort', '')  # Tri par prix
    reset_filter = request.GET.get('reset', None)  # Vérifie si le filtre doit être réinitialisé
    
    # Obtenir tous les produits de la catégorie
    products = category.products.all()

    # Appliquer la recherche par nom
    if query:
        products = products.filter(name__icontains=query)

    # Appliquer le tri par prix
    if sort_order == 'asc':
        products = products.order_by('price')
    elif sort_order == 'desc':
        products = products.order_by('-price')

    # Pagination des produits
    paginator = Paginator(products, 12)  # 12 produits par page
    page_number = request.GET.get('page')
    products = paginator.get_page(page_number)

    # Réinitialisation des filtres
    if reset_filter:
        return render(request, 'products/product_list.html', {
            'category': category,
            'products': category.products.all().order_by('id'),  # Retourner à l'état initial (par défaut)
        })

    return render(request, 'products/product_list.html', {
        'category': category,
        'products': products,
        'query': query,
        'sort_order': sort_order,
    })


def product_detail(request, id):
    """Affiche le détail d’un produit."""
    product = get_object_or_404(Product, id=id)
    return render(request, 'products/product_detail.html', {'product': product})


def home(request):
    # Récupérer les produits avec un stock supérieur à 0
    featured_products = Product.objects.filter(stock__gt=0).order_by('-id')[:6]  # Les 6 derniers produits en stock
    return render(request, 'home.html', {'featured_products': featured_products})

