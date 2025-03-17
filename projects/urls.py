from django.urls import path
from . import views

urlpatterns = [
    path(
        '',
        views.index,
        name='projects_index'
    ),
    path(
        'add-item/',
        views.add_item,
        name='add_item'
    ),
    path(
        'add-list/',
        views.add_list,
        name='add_list'
    ),
    path(
        'create_project/',
        views.create_project,
        name='create_project'
    ),
    path(
        'delete/<int:id>/',
        views.delete_project,
        name='delete_project'
    ),
    path(
        'update-item-order/',
        views.update_item_order,
        name='update_item_order'
    ),
    path(
        'delete-list/<int:id>/',
        views.delete_list,
        name='delete_list'
    ),
    path(
        'update-list-order/',
        views.update_list_order,
        name='update_list_order'
    ),
    path(
        'update-project-title/<int:id>/',
        views.update_project_title,
        name='update_project_title'
    ),
    path(
        '<slug:slug>/',
        views.project,
        name='project'
    ),
]
