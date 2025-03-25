document.addEventListener('DOMContentLoaded', function () {
    const itemsContainer = document.querySelector('.items_table');
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
                    const textNode = Array.from(itemElement.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                    if (textNode) {
                        textNode.textContent = data.item.title;
                    } else {
                        itemElement.textContent = data.item.title;
                    }
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
                showCToast("success", "item added successfully");
            } else {
                console.error(data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                item.click();
            }
        });
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
            setTimeout(() => {
                itemTitle.focus();
            }, 100);
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
});