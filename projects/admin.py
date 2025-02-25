from django.contrib import admin
from .models import Project
from .models import ProjectAdmin

# Register your models here.
admin.site.register(Project, ProjectAdmin)