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
});
