from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin

from .models import List, Project
from .models import ProjectAdmin

# Register your models here.
admin.site.register(Project, ProjectAdmin)
admin.site.register(List)
