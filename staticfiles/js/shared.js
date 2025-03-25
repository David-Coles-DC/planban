document.addEventListener('DOMContentLoaded', function () {
    const titleElement = document.getElementById('project-title');
    const projectId = titleElement.dataset.projectId;

    titleElement.addEventListener('click', function () {
        const currentTitle = titleElement.innerText;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentTitle;
        input.id = 'title-input';
        titleElement.replaceWith(input);
        input.focus();

        input.addEventListener('blur', function () {
            setTimeout(saveTitle, 500);
        });
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                saveTitle();
            }
        });

        function saveTitle() {
            if (!document.body.contains(input)) return
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
                    console.log(data);
                    console.log(data.error);
                    if (data.success) {
                        showCToast("success", "project title updated successfully");
                        const newUrl = `/projects/${slug}/`;
                        if (window.location.pathname.endsWith('/table')) {
                            newUrl += 'table/';
                        }
                        history.pushState(null, '', newUrl);
                    } else {
                        showCToast("info", data.error);
                    }
                })
                .catch((error) => {
                    showCToast("info", "Failed to update title");
                });
        }
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
                        showCToast("info", "An error occurred while deleting the item");
                    }
                })
                .catch(error => {
                    showCToast("info", "An error occurred while deleting the item");
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

showCToast("error", "error");
showCToast("success", "success");
showCToast("info", "warning");