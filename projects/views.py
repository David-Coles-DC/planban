import json
from django.shortcuts import render
from django.http import JsonResponse
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_POST
from django.db.models import Max
from .forms import ProjectForm
from .models import Item, List, Project


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

    # Fetch items for each list
    lists_with_items = []
    for list in lists:
        items = list.items.all().order_by('position')
        lists_with_items.append({
            'list': list,
            'items': items
        })

    return render(
        request,
        'projects/board.html',
        {'project': project, 'lists_with_items': lists_with_items}
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


@require_POST
@login_required
def add_list(request):
    title = request.POST.get('listTitle')
    project_id = request.POST.get('projectId')

    try:
        project = Project.objects.get(id=project_id, owner=request.user)
        max_position = List.objects\
            .filter(project=project)\
            .aggregate(Max('position'))['position__max']
        position = (max_position + 1) if max_position is not None else 0

        new_list = List.objects.create(
            title=title,
            project=project,
            position=position
        )

        return JsonResponse(
            {
                'success': True,
                'list': {
                    'id': new_list.id,
                    'title': new_list.title
                }
            }
        )
    except Project.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Project not found'})


@login_required
@require_http_methods(['DELETE'])
def delete_list(request, id):
    if request.method in ['DELETE']:
        list_obj = get_object_or_404(List, id=id, project__owner=request.user)
        list_obj.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False}, status=400)


@require_POST
@login_required
def update_list_order(request):
    data = json.loads(request.body)
    order = data.get('order', [])
    for index, list_id in enumerate(order):
        List.objects.filter(id=list_id).update(position=index)
    return JsonResponse({'success': True})


@require_POST
@login_required
def update_item_order(request):
    try:
        data = json.loads(request.body)
        print(data)
        order = data.get('order', [])
        new_list_id = data.get('listId')

        # Ensure the new list exists
        new_list = List.objects.get(
            id=new_list_id,
            project__owner=request.user
        )

        # Update the order and list of items
        for index, item_id in enumerate(order):
            item = Item.objects.get(id=item_id)
            item.list = new_list
            item.position = index
            item.save()

        return JsonResponse({'success': True})
    except List.DoesNotExist:
        return JsonResponse(
            {'success': False, 'error': 'List not found'},
            status=404
        )
    except Item.DoesNotExist:
        return JsonResponse(
            {'success': False, 'error': 'Item not found'},
            status=404
        )
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_POST
@login_required
def add_item(request):
    title = request.POST.get('itemTitle')
    description = request.POST.get('itemDescription', '')
    list_id = request.POST.get('listId')
    print("itemTitle: ", title)
    print("itemDescription: ", description)
    print("list_id: ", list_id)

    try:
        list_obj = List.objects.get(id=list_id, project__owner=request.user)
        item = Item.objects.create(
            title=title,
            description=description,
            list=list_obj,
            position=list_obj.items.count()
        )
        return JsonResponse({'success': True, 'item': {'title': item.title}})
    except List.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'List not found'})
