from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin

from .models import Item, List, Project, ProjectAdmin

# Register your models here.
admin.site.register(
    Item, SummernoteModelAdmin
)

admin.site.register(
    List, SummernoteModelAdmin
)

admin.site.register(
    Project,
    ProjectAdmin
)
