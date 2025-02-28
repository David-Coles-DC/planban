from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin

from .models import Project
from .models import ProjectAdmin

# Register your models here.
admin.site.register(Project, ProjectAdmin)