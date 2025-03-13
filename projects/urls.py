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
