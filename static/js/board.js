document.addEventListener('DOMContentLoaded', function () {
    const listsContainer = document.querySelector('.lists');
    const titleElement = document.getElementById('project-title');
    const projectId = titleElement.dataset.projectId;
    const addListButton = document.getElementById('addListButton');
    const addListForm = document.getElementById('addListForm');
    const cancelAddList = document.getElementById('cancelAddList');
    const listTitleInput = document.getElementById('listTitle');

    addListButton.addEventListener('click', function() {
        addListButton.style.display = 'none';
        addListForm.style.display = 'block';
        listTitleInput.focus();
    });

    cancelAddList.addEventListener('click', function() {
        addListForm.style.display = 'none';
        addListButton.style.display = 'block';
    });

    // Initialize Sortable for the lists container
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

    // Initialize Sortable for each list's items container
    document.querySelectorAll('.items').forEach(function(itemsContainer) {
        new Sortable(itemsContainer, {
            group: 'shared',
            animation: 150,
            onEnd: function (e) {
                var fromItemOrder = Array.from(e.from.children).map(item => item.dataset.id);
                var toItemOrder = Array.from(e.to.children).map(item => item.dataset.id);
                var newListId = e.to.closest('.list').dataset.id;
                var oldListId = e.from.closest('.list').dataset.id;
    
                updateItemOrder(fromItemOrder, oldListId);
                updateItemOrder(toItemOrder, newListId);
            },
            dataIdAttr: 'data-id',
        });
    });

    function updateItemOrder(order, listId) {
        fetch('/projects/update-item-order/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ order: order, listId: listId }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log('Item order updated successfully');
                } else {
                    console.error('Failed to update item order', data);
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

    addListForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(addListForm);

        fetch('/projects/add-list/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const newList = data.list;
                const newListElement = document.createElement('div');
                newListElement.classList.add('list');
                newListElement.setAttribute('data-id', newList.id);
                const listHead = document.createElement('div');
                listHead.classList.add('list_head', 'drag_handle');
                listHead.textContent = newList.title;

                const itemsContainer = document.createElement('div');
                itemsContainer.classList.add('items');

                const listFooter = document.createElement('div');
                listFooter.classList.add('list_footer');

                const addItemButton = document.createElement('button');
                addItemButton.classList.add('add_item', 'button', 'trans');
                addItemButton.id = `addItem${newList.id}`;
                addItemButton.setAttribute('data-list-id', newList.id);

                const addItemIcon = document.createElement('i');
                addItemIcon.classList.add('fa-solid', 'fa-plus');
                addItemButton.appendChild(addItemIcon);
                addItemButton.appendChild(document.createTextNode(' Add Item'));

                listFooter.appendChild(addItemButton);

                newListElement.appendChild(listHead);
                newListElement.appendChild(itemsContainer);
                newListElement.appendChild(listFooter);
                
                listsContainer.insertBefore(newListElement, listsContainer.querySelector('.add_list'));

                addListForm.reset();
                addListForm.style.display = 'none';
                addListButton.style.display = 'block';
            } else {
                console.error('Failed to add list', data.error);
            }
        })
        .catch(error => console.error('Error:', error));
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
                addItemModal.classList.remove('open');
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

function confirmDeleteList(listId) {
    const confirmation = confirm("Are you sure you want to delete this list and all items within it?");
    if (confirmation) {
        // Make an AJAX request to delete the list (assuming you have an endpoint to handle this)
        fetch(`/projects/delete-list/${listId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (response.ok) {
                // Remove the list from the DOM
                const listElement = document.querySelector(`.list[data-id="${listId}"]`);
                listElement.remove();
            } else {
                alert('Failed to delete the list.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the list.');
        });
    }
}