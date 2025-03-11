window.onload = function () {
    var s = skrollr.init();
    if (s.isMobile()) {
        document.body.classList.add('is_mobile');
        s.destroy();
    }
};

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

    // Slug generation
    var titleInput = document.getElementById('title');
    var slugInput = document.getElementById('slug');
    var slugDisplay = document.getElementById('slug_text');

    titleInput.addEventListener('input', function() {
        var slug = titleInput.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        slugInput.value = slug;
        slugDisplay.value = `/projects/${slug}`;
        document.getElementById('newProjectModalError').style.display = '';
    });

    document.getElementById('newProjectForm').onsubmit = function(event) {
        event.preventDefault();
        var form = this;
        var formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  location.reload();
              } else {
                console.log(data.error);
                if (data.error === 'Project with this Slug already exists.') {
                    var errorDisplay = document.getElementById('newProjectModalError');
                    errorDisplay.textContent = 'This project name already exists.';
                    errorDisplay.style.display = 'block';
                } else {
                    alert('Error creating project');
                }
              }
          });
    }
});

// Modal JavaScript
function setupModal(modalId, buttonIds) {
    var modal = document.getElementById(modalId);
    var span = modal.getElementsByClassName('close')[0];

    buttonIds.forEach(function (buttonId) {
        var btn = document.getElementById(buttonId);
        btn.onclick = function (event) {
            event.preventDefault(); // Prevent the default action of the link

            // Close any open modals
            document.querySelectorAll('.modal.open').forEach(function (openModal) {
                openModal.classList.remove('open');
            });

            // Open the new modal
            modal.classList.add('open');
        };
    });

    span.onclick = function () {
        modal.classList.remove('open');
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.classList.remove('open');
        }
    };
}

// Setup modals
setupModal('newProjectModal', ['new_project']);

function confirmDelete(projectId, projectTitle, event) {
    event.preventDefault();
    if (confirm(`"Are you sure you want to delete the project '${projectTitle}'?"`)) {
        // Send a request to delete the project
        fetch(`/projects/delete/${projectId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (response.ok) {
                // Reload the page or remove the project element from the DOM
                location.reload();
            } else {
                alert("Failed to delete the project.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Failed to delete the project.");
        });
    }
}

// Helper function to get the CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}