from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

import random
import string

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    unique_code = models.CharField(max_length=9, unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.unique_code:  # Génère un code uniquement si le champ est vide
            self.unique_code = self._generate_unique_code()
        super().save(*args, **kwargs)

    def _generate_unique_code(self):
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=9))
            if not Order.objects.filter(unique_code=code).exists():
                return code

    def __str__(self):
        return f"Order {self.unique_code} by {self.user.username}"




class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
