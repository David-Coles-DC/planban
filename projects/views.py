import json
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.db.models import Max
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods, require_POST
from .forms import ProjectForm
from .models import Item, List, Project


@login_required
def index(request):
    user_projects = Project.objects.filter(owner=request.user)\
                                   .order_by('-modified_on')
    return render(request, 'projects/index.html', {'projects': user_projects})


@login_required
@require_POST
# The create_project function is used to create a new project
# and makes sure it belongs to the current user
def create_project(request):
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

            messages.add_message(
                request,
                messages.SUCCESS,
                "Your project was created successfully"
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
        messages.add_message(
            request,
            messages.ERROR,
            "An error occured while trying to create a project"
        )
        return JsonResponse({'success': False, 'errors': errors})


@login_required
# The project function is used to display the project board
# It fetches the project with the slug from the database
# and makes sure it belongs to the current user
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
# The project_table function is used to display the project table
# It fetches the project with the slug from the database
# and makes sure it belongs to the current user
def project_table(request, slug):
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
        'projects/table.html',
        {'project': project, 'lists_with_items': lists_with_items}
    )


@login_required
# The delete_project function is used to delete a project
# It uses the project id to fetch the project from the database
# and then deletes the project
# and makes sure it belongs to the current user
def delete_project(request, id):
    if request.method == 'POST':
        project = get_object_or_404(Project, id=id, owner=request.user)
        project.delete()

        messages.add_message(
            request,
            messages.SUCCESS,
            "Your project was deleted successfully"
        )

        return JsonResponse({'success': True})
    messages.add_message(
        request,
        messages.ERROR,
        "Invalid Request"
    )
    return JsonResponse({'success': False}, status=400)


@require_POST
@login_required
# The update_project_title function is used to update the title of a project
# It uses the project id to fetch the project from the database
# and makes sure it belongs to the current user
def update_project_title(request, id):
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


@require_POST
@login_required
# The update_list_title function is used to update the title of a list
# It uses the list id to fetch the list from the database
# and makes sure it belongs to the current user
def update_list_title(request, id):
    list = get_object_or_404(List, id=id, project__owner=request.user)
    data = json.loads(request.body)
    new_title = data.get('title')
    if new_title:
        try:
            list.title = new_title
            list.save()
            return JsonResponse({'success': True})
        except IntegrityError:
            return JsonResponse(
                {
                    'success': False,
                    'error': 'List with this title already exists.'
                }
            )
    return JsonResponse(
        {
            'success': False,
            'error': 'List title is required'
        },
        status=400
    )


@require_POST
@login_required
# The add_list function is used to add a new list to a project
# and makes sure it belongs to the current user
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
# The delete_list function is used to delete a list
# It uses the list id to fetch the list from the database
# and makes sure it belongs to the current user
def delete_list(request, id):
    if request.method in ['DELETE']:
        list_obj = get_object_or_404(List, id=id, project__owner=request.user)
        list_obj.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False}, status=400)


@require_POST
@login_required
# The update_list_order function is used to update the order of lists
# and makes sure it belongs to the current user
def update_list_order(request):
    data = json.loads(request.body)
    order = data.get('order', [])
    for index, list_id in enumerate(order):
        List.objects.filter(
            id=list_id,
            project__owner=request.user
        ).update(position=index)
    return JsonResponse({'success': True})


@require_POST
@login_required
# The update_item_order function is used to update the order of items
# and makes sure they belongs to the current user
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
# The save_item function is used to save an item
# It uses the item id to fetch the item from the database and updates it
# If the item id is not provided, a new item is created
# both will make sure it belongs to the current user
def save_item(request):
    title = request.POST.get('itemTitle')
    description = request.POST.get('itemDescription', '')
    list_id = request.POST.get('listId')
    item_id = request.POST.get('itemId')

    try:
        list_obj = List.objects.get(id=list_id, project__owner=request.user)

        if item_id:
            # Update existing item
            item = Item.objects.get(
                id=item_id,
                list__project__owner=request.user
            )
            item.title = title
            item.description = description
            item.save()
        else:
            # Create new item
            item = Item.objects.create(
                title=title,
                description=description,
                list=list_obj,
                position=list_obj.items.count()
            )
        return JsonResponse({
            'success': True,
            'item': {
                'id': item.id,
                'title': item.title,
                'description': item.description,
                'list_id': list_obj.id
            }
        })
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


@login_required
@require_http_methods(['DELETE'])
# The delete_item function is used to delete an item
# It uses the item id to fetch the item from the database
# and makes sure it belongs to the current user
def delete_item(request, id):
    try:
        item = get_object_or_404(
            Item,
            id=id,
            list__project__owner=request.user
        )
        item.delete()
        return JsonResponse({'success': True})
    except Item.DoesNotExist:
        return JsonResponse(
            {'success': False, 'error': 'Item not found'},
            status=404
        )
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
