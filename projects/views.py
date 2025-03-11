from django.shortcuts import render
from django.http import JsonResponse
from django.db import IntegrityError
from .forms import ProjectForm
from .models import Project
import logging

logger = logging.getLogger(__name__)

def index(request):
    user_projects = Project.objects.filter(owner=request.user)
    logger.debug(f"User projects: {user_projects}")
    return render(request, 'projects/index.html', {'projects': user_projects})

def create_project(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            try:
                project = form.save(commit=False)
                project.owner = request.user
                project.save()
                return JsonResponse({'success': True})
            except IntegrityError:
                form.add_error('slug', 'Project with this Slug already exists.')
                return JsonResponse({'success': False, 'error': 'Project with this Slug already exists.'})
        else:
            errors = form.errors.as_json()
            return JsonResponse({'success': False, 'errors': errors})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

def project(request, slug):
    project = Project.objects.get(slug=slug, owner=request.user)
    return render(request, 'projects/board.html', {'project': project})