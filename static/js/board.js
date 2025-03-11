document.addEventListener('DOMContentLoaded', function () {
    const titleElement = document.getElementById('project-title');

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
            titleElement.innerText = newTitle;
            input.replaceWith(titleElement);

            // Send the new title to the server
            fetch('/update-project-title', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': '{{ csrf_token }}', // Include CSRF token if using Django
                },
                body: JSON.stringify({ title: newTitle, projectId: '{{ project.id }}' }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        console.log('Title updated successfully');
                    } else {
                        console.error('Failed to update title');
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    });
});
