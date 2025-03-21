from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin

from .models import Item, List, Project, ProjectAdmin

# Register your models here.
admin.site.register(
    Item,
    List,
    Project,
    ProjectAdmin,
    SummernoteModelAdmin,
)
