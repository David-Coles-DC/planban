document.addEventListener('DOMContentLoaded', function () {
    const listsContainer = document.querySelector('.lists');
    const titleElement = document.getElementById('project-title');
    const projectId = titleElement.dataset.projectId;
    const addListButton = document.getElementById('addListButton');
    const addListForm = document.getElementById('addListForm');
    const cancelAddList = document.getElementById('cancelAddList');
    const listTitleInput = document.getElementById('listTitle');
    const editItemModal = document.getElementById('editItemModal');
    const editItemForm = document.getElementById('editItemForm');
    const modalTitle = document.getElementById('modalTitle');
    const itemTitle = document.getElementById('itemTitle');
    const itemDescription = document.getElementById('itemDescription');
    const listIdInput = document.getElementById('listId');
    const itemIdInput = document.getElementById('itemId');
    const submitButton = editItemForm.querySelector('button[type="submit"]');
    const deleteItemButton = document.getElementById('deleteItemButton');

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

    document.querySelectorAll('.list_head').forEach(function(listTitleElement) {
        listTitleElement.addEventListener('click', function () {
            const currentTitle = listTitleElement.innerText;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentTitle;
            input.classList.add('list-title-input');
            listTitleElement.replaceWith(input);
            input.focus();

            input.addEventListener('blur', saveListTitle);
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    saveListTitle();
                }
            });

            function saveListTitle() {
                const newTitle = input.value;
                listTitleElement.innerText = newTitle;
                input.replaceWith(listTitleElement);

                // Send the new title to the server
                fetch(`/projects/update-list-title/${listTitleElement.dataset.listId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify({ title: newTitle, listId: listTitleElement.dataset.listId }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (!data.success) {
                            console.error('Failed to update list title', data);
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
        });
    });

    function moveListLeft(listId) {
        const listElement = document.querySelector(`.list[data-id="${listId}"]`);
        if (listElement) {
            const previousElement = listElement.previousElementSibling;
            if (previousElement && previousElement.classList.contains('list')) {
                listsContainer.insertBefore(listElement, previousElement);
                updateListOrder(Array.from(listsContainer.children).map(list => list.dataset.id));
            }
        }
    }

    function moveListRight(listId) {
        const listElement = document.querySelector(`.list[data-id="${listId}"]`);
        if (listElement) {
            const nextElement = listElement.nextElementSibling;
            if (nextElement && nextElement.classList.contains('list')) {
                listsContainer.insertBefore(nextElement, listElement);
                updateListOrder(Array.from(listsContainer.children).map(list => list.dataset.id));
            }
        }
    }

    document.querySelectorAll('.move_left').forEach(span => {
        span.addEventListener('click', function() {
            moveListLeft(this.dataset.listId);
        });
    });

    document.querySelectorAll('.move_right').forEach(span => {
        span.addEventListener('click', function() {
            moveListRight(this.dataset.listId);
        });
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

    editItemForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(editItemForm);

        fetch('/projects/save-item/', {
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
                if (formData.get('itemId')) {
                    const itemElement = document.querySelector(`.item[data-id="${formData.get('itemId')}"]`);
                    itemElement.textContent = data.item.title;
                    itemElement.setAttribute('data-title', data.item.title);
                    itemElement.setAttribute('data-description', data.item.description);
                } else {
                    const newItem = document.createElement('div');
                    newItem.classList.add('item');
                    newItem.setAttribute('data-id', data.item.id);
                    newItem.setAttribute('data-title', data.item.title);
                    newItem.setAttribute('data-description', data.item.description);
                    newItem.textContent = data.item.title;
                    listElement.appendChild(newItem);
                }
                editItemModal.classList.remove('open');
                editItemForm.reset();
                deleteItemButton.style.display = 'none';
            } else {
                console.error(data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', function() {
            const itemIdValue = this.getAttribute('data-id');
            const itemTitleValue = this.getAttribute('data-title');
            const itemDescriptionValue = this.getAttribute('data-description');

            itemTitle.value = itemTitleValue;
            itemDescription.value = itemDescriptionValue;
            itemIdInput.value = itemIdValue;
            listIdInput.value = this.closest('.list').getAttribute('data-id');

            modalTitle.textContent = 'Edit Item';
            submitButton.textContent = 'Edit Item';
            deleteItemButton.style.display = 'block';
            editItemModal.classList.add('open');
        });
    });

    const addItemButtons = document.querySelectorAll('.add_item');
    addItemButtons.forEach(button => {
        button.addEventListener('click', function() {
            itemTitle.value = '';
            itemDescription.value = '';
            itemIdInput.value = '';
            listIdInput.value = this.getAttribute('data-list-id');

            modalTitle.textContent = 'Add New Item';
            submitButton.textContent = 'Add Item';
            deleteItemButton.style.display = 'none';
            editItemModal.classList.add('open');
        });
    });

    deleteItemButton.addEventListener('click', function() {
        const itemId = itemIdInput.value;
        if (itemId) {
            const confirmation = confirm("Are you sure you want to delete this item?");
            if (confirmation) {
                fetch(`/projects/delete-item/${itemId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                })
                .then(response => {
                    if (response.ok) {
                        const itemElement = document.querySelector(`.item[data-id="${itemId}"]`);
                        itemElement.remove();
                        editItemModal.classList.remove('open');
                        editItemForm.reset();
                        deleteItemButton.style.display = 'none';
                    } else {
                        alert('Failed to delete the item.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while deleting the item.');
                });
            }
        }
    });

    const closeModalButtons = document.querySelectorAll('.modal .close');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').classList.remove('open');
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('open');
        }
    });
});

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