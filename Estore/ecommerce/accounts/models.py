from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_seller = models.BooleanField(default=False)  # Pour distinguer les vendeurs des acheteurs

    # Ajout de related_name uniques pour éviter les conflits
    groups = models.ManyToManyField(
        Group,
        related_name="customuser_groups",  # Nom unique pour éviter les conflits
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_permissions",  # Nom unique pour éviter les conflits
        blank=True
    )

    def __str__(self):
        return self.username
