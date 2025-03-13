import json
from django.shortcuts import render
from django.http import JsonResponse
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from .forms import ProjectForm
from .models import Project, List


@login_required
def index(request):
    user_projects = Project.objects.filter(owner=request.user)\
                                   .order_by('-modified_on')
    return render(request, 'projects/index.html', {'projects': user_projects})


@login_required
def create_project(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            try:
                project = form.save(commit=False)
                project.owner = request.user
                project.save()

                # Create the default lists
                List.objects.create(
                    project=project,
                    title='To Do',
                    position=0
                )
                List.objects.create(
                    project=project,
                    title='In Progress',
                    position=1
                )
                List.objects.create(
                    project=project,
                    title='Done',
                    position=2
                )

                return JsonResponse({'success': True, 'slug': project.slug})
            except IntegrityError:
                form.add_error(
                    'slug',
                    'Project with this Slug already exists.'
                )
                return JsonResponse(
                    {
                        'success': False,
                        'error': 'Project with this Slug already exists.'
                    }
                )
        else:
            errors = form.errors.as_json()
            return JsonResponse({'success': False, 'errors': errors})
    return JsonResponse({'success': False, 'error': 'Invalid request'})


@login_required
def project(request, slug):
    project = Project.objects.get(slug=slug, owner=request.user)
    lists = List.objects.filter(project=project).order_by('position')
    return render(
        request,
        'projects/board.html',
        {'project': project, 'lists': lists}
    )


@login_required
def delete_project(request, id):
    if request.method == 'POST':
        project = get_object_or_404(Project, id=id, owner=request.user)
        project.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False}, status=400)


@login_required
def update_project_title(request, id):
    if request.method == 'POST':
        project = get_object_or_404(Project, id=id, owner=request.user)
        data = json.loads(request.body)
        new_title = data.get('title')
        new_slug = data.get('slug')
        if new_title:
            if new_slug:
                try:
                    project.title = new_title
                    project.slug = new_slug
                    project.save()
                    return JsonResponse(
                        {
                            'success': True,
                            'slug': project.slug
                        }
                    )
                except IntegrityError:
                    return JsonResponse(
                        {
                            'success': False,
                            'error': 'Project with this Slug already exists.'
                        }
                    )
            return JsonResponse(
                {
                    'success': False,
                    'error': 'Slug is required'
                },
                status=400
            )
        return JsonResponse(
            {
                'success': False,
                'error': 'Title is required'
            },
            status=400
        )
    return JsonResponse(
        {
            'success': False,
            'error': 'Invalid request method'
        },
        status=400
    )


@csrf_exempt
@require_POST
def update_list_order(request):
    data = json.loads(request.body)
    order = data.get('order', [])
    for index, list_id in enumerate(order):
        List.objects.filter(id=list_id).update(position=index)
    return JsonResponse({'success': True})
