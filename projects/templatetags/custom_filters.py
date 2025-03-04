from django import template

register = template.Library()

@register.filter
def user_initials(user):
    if user.first_name and user.last_name:
        return f"{user.first_name[0]}{user.last_name[0]}"
    elif user.first_name:
        return user.first_name[:2]
    else:
        return user.username[:2]

@register.filter
def display_name(user):
    if user.first_name and user.last_name:
        return f"{user.first_name} {user.last_name}"
    else:
        return user.username