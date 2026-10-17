from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ("ceo", "CEO"),
        ("admin", "Admin"),
        ("manager", "Manager"),
        ("employee", "Employee"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="employee")

    @property
    def is_ceo(self):
        return self.role == "ceo"

    @property
    def is_admin_role(self):
        return self.role == "admin" or self.is_superuser

    @property
    def is_executive_or_admin(self):
        return self.role in ["ceo", "admin"] or self.is_superuser

    @property
    def is_manager_or_above(self):
        return self.role in ["ceo", "admin", "manager"] or self.is_superuser