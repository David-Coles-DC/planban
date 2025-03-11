from django.contrib import admin
from django.db import models
from django.contrib.auth.models import User

VISIBILITY = ((0, "Private"), (1, "Public"))

class Project(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_project")
    short_description = models.TextField(blank=True)
    readme = models.TextField()
    visibility = models.IntegerField(choices=VISIBILITY, default=0)
    created_on = models.DateTimeField(auto_now_add=True)
    modified_on = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['owner', 'slug'], name='unique_slug_per_owner')
        ]

class ProjectAdmin(admin.ModelAdmin):
    readonly_fields = ('created_on', 'modified_on')