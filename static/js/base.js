function toggleDropdown(dropDownId, event) {
    var content = document.getElementById(dropDownId);
    if (!content.contains(event.target)) {
        content.classList.toggle('active');
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