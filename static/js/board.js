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
            var order = sortable.toArray().filter(id => {
                var element = document.querySelector(`[data-id="${id}"]`);
                return element && !element.classList.contains('add_list');
            });
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
                    showCToast("success", "list order updated successfully")
                } else {
                    showCToast("error", "list order failed to update successfully")
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
                    showCToast("success", "item order updated successfully")
                } else {
                    showCToast("error", "item order failed to update successfully")
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
                        showCToast("success", "project title updated successfully");
                        const newUrl = `/projects/${slug}/`;
                        history.pushState(null, '', newUrl);
                    } else {
                        showCToast("error", "Failed to update title");
                    }
                })
                .catch((error) => {
                    showCToast("error", "Failed to update title");
                });
        }
    });

    function moveListLeft(listId) {
        const listElement = document.querySelector(`.list[data-id="${listId}"]`);
        if (listElement) {
            const previousElement = listElement.previousElementSibling;
            if (previousElement && previousElement.classList.contains('list')) {
                listsContainer.insertBefore(listElement, previousElement);
                updateListOrder(Array.from(listsContainer.children)
                    .filter(list => !list.classList.contains('add_list'))
                    .map(list => list.dataset.id));
            }
        }
    }

    function moveListRight(listId) {
        const listElement = document.querySelector(`.list[data-id="${listId}"]`);
        if (listElement) {
            const nextElement = listElement.nextElementSibling;
            if (nextElement && nextElement.classList.contains('list')) {
                listsContainer.insertBefore(nextElement, listElement);
                updateListOrder(Array.from(listsContainer.children)
                    .filter(list => !list.classList.contains('add_list'))
                    .map(list => list.dataset.id));
            }
        }
    }

    function moveItemUp(itemId) {
        const itemElement = document.querySelector(`.item[data-id="${itemId}"]`);
        const itemsContainer = itemElement.closest('.items');
        if (itemElement) {
            const previousElement = itemElement.previousElementSibling;
            const listId = itemElement.closest('.list').dataset.id;
            if (previousElement && previousElement.classList.contains('item')) {
                itemsContainer.insertBefore(itemElement, previousElement);
                updateItemOrder(Array.from(itemsContainer.children).map(item => item.dataset.id), listId);
            }
        }
    }

    function moveItemDown(itemId) {
        const itemElement = document.querySelector(`.item[data-id="${itemId}"]`);
        const itemsContainer = itemElement.closest('.items');
        if (itemElement) {
            const nextElement = itemElement.nextElementSibling;
            const listId = itemElement.closest('.list').dataset.id;
            if (nextElement && nextElement.classList.contains('item')) {
                itemsContainer.insertBefore(nextElement, itemElement);
                updateItemOrder(Array.from(itemsContainer.children).map(item => item.dataset.id), listId);
            }
        }
    }

    document.querySelectorAll('.move_left').forEach(span => {
        span.addEventListener('click', function() {
            moveListLeft(this.dataset.listId);
        });
        span.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                moveListLeft(this.dataset.listId);
            }
        });
    });

    document.querySelectorAll('.move_right').forEach(span => {
        span.addEventListener('click', function() {
            moveListRight(this.dataset.listId);
        });
        span.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                moveListRight(this.dataset.listId);
            }
        });
    });

    document.querySelectorAll('.move_up').forEach(span => {
        span.addEventListener('click', function(event) {
            event.stopPropagation();
            moveItemUp(this.dataset.itemId);
        });
        span.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                moveItemUp(this.dataset.itemId);
            }
        });
    });

    document.querySelectorAll('.move_down').forEach(span => {
        span.addEventListener('click', function(event) {
            event.stopPropagation();
            moveItemDown(this.dataset.itemId);
        });
        span.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
            event.stopPropagation();
                moveItemDown(this.dataset.itemId);
            }
        });
    });

    document.querySelectorAll('.edit_title').forEach(span => {
        span.addEventListener('click', function() {
            const listId = this.dataset.listId;
            editListTitle(listId);
        });
        span.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                const listId = this.dataset.listId;
                editListTitle(listId);
            }
        });
    });

    document.querySelectorAll('.list_head').forEach(function(listTitleElement) {
        listTitleElement.addEventListener('click', function () {
            const listId = this.dataset.listId;
            editListTitle(listId);
        });
    });

    function editListTitle(listId) {
        const listTitleElement = document.querySelector(`.list_head[data-list-id="${listId}"]`);
        const currentTitle = listTitleElement.innerText;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentTitle;
        input.classList.add('list-title-input');
        listTitleElement.replaceWith(input);
        input.focus();

        input.addEventListener('blur', function () {
            setTimeout(saveListTitle, 100);
        });
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                saveListTitle();
            }
        });

        function saveListTitle() {
            const newTitle = input.value;
            listTitleElement.innerText = newTitle;
            if (document.body.contains(input)) {
                input.replaceWith(listTitleElement);
            }

            // Send the new title to the server
            fetch(`/projects/update-list-title/${listId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ title: newTitle, listId: listId }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        showCToast("success", "list title updated successfully");
                    } else {
                        showCToast("error", "Failed to update list title");
                    }
                })
                .catch((error) => {
                    showCToast("error", "Failed to update list title");
                });
        }
    }

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
                listHead.setAttribute('data-list-id', newList.id);
                listHead.onclick = function() {
                    editListTitle(this.dataset.listId);
                };

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

                // Add delete button to listFooter
                const deleteListButton = document.createElement('button');
                deleteListButton.classList.add('delete_list', 'button', 'trans');
                deleteListButton.setAttribute('aria-label', 'Delete list');
                deleteListButton.setAttribute('onclick', `confirmDeleteList('${newList.id}')`);
        
                const deleteListIcon = document.createElement('i');
                deleteListIcon.classList.add('fa-solid', 'fa-trash-can');
                deleteListIcon.setAttribute('aria-hidden', 'true');
                deleteListButton.appendChild(deleteListIcon);
        
                listFooter.appendChild(deleteListButton);

                // Create list control container
                const listControl = document.createElement('div');
                listControl.classList.add('list_control');
    
                // Create move left button
                const moveLeftButton = document.createElement('span');
                moveLeftButton.classList.add('move_left', 'button', 'trans');
                moveLeftButton.setAttribute('data-list-id', newList.id);
                moveLeftButton.setAttribute('role', 'button');
                moveLeftButton.setAttribute('tabindex', '0');
                moveLeftButton.onclick = function(event) {
                    event.stopPropagation();
                    moveListLeft(this.dataset.listId);
                };
    
                const moveLeftIcon = document.createElement('i');
                moveLeftIcon.classList.add('fa-solid', 'fa-arrow-left');
                moveLeftIcon.setAttribute('aria-hidden', 'true');
                moveLeftButton.appendChild(moveLeftIcon);
    
                listControl.appendChild(moveLeftButton);
    
                // Create move right button
                const moveRightButton = document.createElement('span');
                moveRightButton.classList.add('move_right', 'button', 'trans');
                moveRightButton.setAttribute('data-list-id', newList.id);
                moveRightButton.setAttribute('role', 'button');
                moveRightButton.setAttribute('tabindex', '0');
                moveRightButton.onclick = function(event) {
                    event.stopPropagation();
                    moveListRight(this.dataset.listId);
                };
    
                const moveRightIcon = document.createElement('i');
                moveRightIcon.classList.add('fa-solid', 'fa-arrow-right');
                moveRightIcon.setAttribute('aria-hidden', 'true');
                moveRightButton.appendChild(moveRightIcon);
    
                listControl.appendChild(moveRightButton);
    
                // Create edit title button
                const editTitleButton = document.createElement('span');
                editTitleButton.classList.add('edit_title', 'button', 'trans');
                editTitleButton.setAttribute('data-list-id', newList.id);
                editTitleButton.setAttribute('role', 'button');
                editTitleButton.setAttribute('tabindex', '0');
                editTitleButton.onclick = function(event) {
                    editListTitle(this.dataset.listId);
                };
    
                const editTitleIcon = document.createElement('i');
                editTitleIcon.classList.add('fa-solid', 'fa-pen');
                editTitleIcon.setAttribute('aria-hidden', 'true');
                editTitleButton.appendChild(editTitleIcon);
    
                listControl.appendChild(editTitleButton);

                newListElement.appendChild(listControl);
                newListElement.appendChild(listHead);
                newListElement.appendChild(itemsContainer);
                newListElement.appendChild(listFooter);
                
                listsContainer.insertBefore(newListElement, listsContainer.querySelector('.add_list'));

                addListForm.reset();
                addListForm.style.display = 'none';
                addListButton.style.display = 'block';

                showCToast("success", "list added successfully");
            } else {
                showCToast("error", "Failed to add list");
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
                    const textNode = Array.from(itemElement.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                    if (textNode) {
                        textNode.textContent = data.item.title;
                    } else {
                        itemElement.textContent = data.item.title;
                    }
                    itemElement.setAttribute('data-title', data.item.title);
                    itemElement.setAttribute('data-description', data.item.description);
                    showCToast("success", "item updated successfully");
                } else {
                    const newItem = document.createElement('div');
                    newItem.classList.add('item');
                    newItem.setAttribute('data-id', data.item.id);
                    newItem.setAttribute('data-title', data.item.title);
                    newItem.setAttribute('data-description', data.item.description);
                    newItem.textContent = data.item.title;

                    // Add onclick event to newItem
                    newItem.onclick = function() {
                        openEditItemModal(this);
                    };

                    // Create item control container
                    const itemControl = document.createElement('div');
                    itemControl.classList.add('item_control');
    
                    // Create move up button
                    const moveUpButton = document.createElement('span');
                    moveUpButton.classList.add('move_up', 'button', 'trans');
                    moveUpButton.setAttribute('data-item-id', data.item.id);
                    moveUpButton.setAttribute('role', 'button');
                    moveUpButton.onclick = function(event) {
                        event.stopPropagation();
                        moveItemUp(this.dataset.itemId);
                    };

                    // Create and append the icon to the move up button
                    const moveUpIcon = document.createElement('i');
                    moveUpIcon.classList.add('fa-solid', 'fa-arrow-up');
                    moveUpIcon.setAttribute('aria-hidden', 'true');
                    moveUpButton.appendChild(moveUpIcon);

                    itemControl.appendChild(moveUpButton);
    
                    // Create move down button
                    const moveDownButton = document.createElement('span');
                    moveDownButton.classList.add('move_down', 'button', 'trans');
                    moveDownButton.setAttribute('data-item-id', data.item.id);
                    moveDownButton.setAttribute('role', 'button');
                    moveDownButton.onclick = function(event) {
                        event.stopPropagation();
                        moveItemDown(this.dataset.itemId);
                    };

                    // Create and append the icon to the move down button
                    const moveDownIcon = document.createElement('i');
                    moveDownIcon.classList.add('fa-solid', 'fa-arrow-down');
                    moveDownIcon.setAttribute('aria-hidden', 'true');
                    moveDownButton.appendChild(moveDownIcon);

                    itemControl.appendChild(moveDownButton);
    
                    newItem.appendChild(itemControl);
                    listElement.appendChild(newItem);
                    showCToast("success", "item added successfully");
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

    function openEditItemModal(itemElement) {
        const itemIdValue = itemElement.getAttribute('data-id');
        const itemTitleValue = itemElement.getAttribute('data-title');
        const itemDescriptionValue = itemElement.getAttribute('data-description');
    
        itemTitle.value = itemTitleValue;
        itemDescription.value = itemDescriptionValue;
        itemIdInput.value = itemIdValue;
        listIdInput.value = itemElement.closest('.list').getAttribute('data-id');
    
        modalTitle.textContent = 'Edit Item';
        submitButton.textContent = 'Edit Item';
        deleteItemButton.style.display = 'block';
        editItemModal.classList.add('open');
    }

    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', function() {
            openEditItemModal(this);
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
                        showCToast("success", "item deleted successfully");
                    } else {
                        showCToast("error", "An error occurred while deleting the item");
                    }
                })
                .catch(error => {
                    showCToast("error", "An error occurred while deleting the item");
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
                showCToast("success", "list deleted successfully");
            } else {
                showCToast("error", "Failed to delete the list");
            }
        })
        .catch(error => {
            showCToast("error", "An error occurred while deleting the list");
        });
    }
}