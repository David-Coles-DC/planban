document.addEventListener('DOMContentLoaded', function () {
    const itemsContainer = document.querySelector('.items_table');
    const titleElement = document.getElementById('project-title');
    const projectId = titleElement.dataset.projectId;
    const editItemModal = document.getElementById('editItemModal');
    const editItemForm = document.getElementById('editItemForm');
    const modalTitle = document.getElementById('modalTitle');
    const itemTitle = document.getElementById('itemTitle');
    const itemDescription = document.getElementById('itemDescription');
    const itemIdInput = document.getElementById('itemId');
    const listIdInput = document.getElementById('listId');
    const submitButton = editItemForm.querySelector('button[type="submit"]');
    const deleteItemButton = document.getElementById('deleteItemButton');
    const firstListId = document.querySelector('.list_id').value;

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
                    const addItemElement = itemsContainer.querySelector('.add_item');
                    itemsContainer.insertBefore(newItem, addItemElement);
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
            listIdInput.value = this.dataset.listId;

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
            listIdInput.value = firstListId;

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