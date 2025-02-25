from django.db import models
from django.contrib.auth.models import User

VISIBILITY = ((0, "Private"), (1, "Public"))

class Project(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="planban_project")
    short_description = models.TextField()
    readme = models.TextField()
    visibility = models.IntegerField(choices=VISIBILITY, default=0)
    created_on = models.DateTimeField(auto_now_add=True)
    modified_on = models.DateTimeField(auto_now=True)
