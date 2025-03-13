document.addEventListener('DOMContentLoaded', function () {
    const listsContainer = document.querySelector('.lists');
    const titleElement = document.getElementById('project-title');
    const projectId = titleElement.dataset.projectId;

    var sortable = new Sortable(listsContainer, {
        animation: 150,
        handle: '.drag_handle',
        onEnd: function (e) {
            var order = sortable.toArray();
            updateListOrder(order);
        },
        dataIdAttr: 'data-id',
    });

    function updateListOrder(order) {
        fetch('/projects/update-list-order/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ order: order }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log('Order updated successfully');
                } else {
                    console.error('Failed to update order');
                }
            });
    }

    titleElement.addEventListener('click', function () {
        const currentTitle = titleElement.innerText;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentTitle;
        input.id = 'title-input';
        titleElement.replaceWith(input);
        input.focus();

        input.addEventListener('blur', saveTitle);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                saveTitle();
            }
        });

        function saveTitle() {
            const newTitle = input.value;
            const slug = input.value
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');
            titleElement.innerText = newTitle;
            input.replaceWith(titleElement);

            // Send the new title to the server
            fetch(`/projects/update-project-title/${projectId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ title: newTitle, slug: slug, projectId: projectId }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        const newUrl = `/projects/${slug}/`;
                        history.pushState(null, '', newUrl);
                    } else {
                        console.error('Failed to update title', data);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    });

    addItemForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(addItemForm);

        fetch('/projects/add-item/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const listId = formData.get('listId');
                const listElement = document.querySelector(`.list[data-id="${listId}"] .items`);
                const newItem = document.createElement('div');
                newItem.classList.add('item');
                newItem.textContent = data.item.title;
                listElement.appendChild(newItem);
                addItemModal.style.display = 'none';
                addItemForm.reset();
            } else {
                console.error(data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    });
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

            if (btn.hasAttribute('data-list-id')) {
                const listId = btn.getAttribute('data-list-id');
                const listIdInput = document.querySelector('#addItemForm input[name="listId"]');
                if (listIdInput) {
                    listIdInput.value = listId;
                }
            }
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

const addItemButtons = document.querySelectorAll('.add_item.button');
const addItemButtonIds = Array.from(addItemButtons).map(button => button.id);

// Setup modals
setupModal('addItemModal', addItemButtonIds);