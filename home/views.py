from django.shortcuts import render


def home(request):
    context = {
        'is_logged_in': request.user.is_authenticated,
    }
    return render(request, 'home/index.html', context)
