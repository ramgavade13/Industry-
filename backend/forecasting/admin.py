from django.contrib import admin
from .models import Forecast, ForecastNote

admin.site.register(Forecast)
admin.site.register(ForecastNote)