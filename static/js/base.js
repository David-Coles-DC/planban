function toggleDropdown(dropDownId, event) {
    var content = document.getElementById(dropDownId);
    if (!content.contains(event.target)) {
        content.classList.toggle('active');
    }
}

function handleMenuKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        toggleDropdown('account-menu', event);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (event) {
        var hasDropdowns = document.querySelectorAll('.has_dropdown');
        var isClickInsideDropdown = false;

        hasDropdowns.forEach(function (dropdown) {
            if (dropdown.contains(event.target)) {
                isClickInsideDropdown = true;
            }
        });

        if (!isClickInsideDropdown) {
            hasDropdowns.forEach(function (dropdown) {
                dropdown.querySelector('.drop_down_menu').classList.remove('active');
            });
        }
    });
});

// Helper function to get the CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + '=') {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}