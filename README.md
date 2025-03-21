# Planban

**Planban** is a feature-rich **Kanban board** and **Gantt chart** project management tool, designed for efficiency, accessibility, and responsiveness. Built using **Django (Python) for the backend**, a **PostgreSQL database**, and **HTML, CSS, and JavaScript** for the frontend, Planban helps users manage tasks seamlessly.

## 🖥️ Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python, Django
- **Database**: PostgreSQL
- **Authentication**: Django AllAuth

## 🚀 Deployment

![Heroku](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white)

The site is currently deployed on Heroku and can be accessed via the following URL [https://planban-c33c6bd858d7.herokuapp.com/](https://planban-c33c6bd858d7.herokuapp.com/)

![Planban Screenshot](https://github.com/user-attachments/assets/9681aa90-02c1-4b2f-97ee-520de0e79c6c)

## 📦 Manual Installation
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/David-Coles-DC/planban
cd planban
```

### **2️⃣ Set Up a Virtual Environment**
```sh
python -m venv venv
source venv/Scripts/activate  # On Mac use: venv\bin\activate
```

### **3️⃣ Install Dependencies**
```sh
pip install -r requirements.txt
```

### **4️⃣ Set Up the Database**
```sh
python manage.py migrate
```

### **5️⃣ Run the Development Server**
```sh
python manage.py runserver
```
Access Planban at `http://127.0.0.1:8000/`.

## ♿ Accessibility
Planban follows **WCAG 2.1 AA guidelines**, including:
- Full **keyboard navigation** support.
- Proper **ARIA labels** for screen readers.
- High **colour contrast** and resizable text.
- Mobile-friendly and touch-accessible UI.

## 🛠️ Features

#### HOME PAGE
The home page is purely to tell you about Planban, I've used Skrollr to add some visual animation to the page which I have disabled on mobile to stop any issues. If you are logged in then the home page will automatically direct you into the projects page, there is no other reason to see the home page if you are logged in.

#### REGISTER
You can access the register form by clicking on the 'get started' buttons, after you register it should take you straight to the projects page. The register form will be shown as a modal popup (there is a backup register page)

#### LOG IN
If you already have an account then you can login using the login links on the home page, the form will be shown as a modal popup (there is also a backup login page)

#### FEATURES
This section just shows you some thigns you can do once you sign up

#### FAQs
Just some short questions with resposning answers in drop down elements.

#### CONTACT FORM
The contact form is there for visual reference, I have not connected any email support so the form can not be sent.

### Projects page
This page will allow the user to create an unlimited amount of projects, each project can be deleted if no longer required. When you first create a project it will send you straight to the project page, but if you visit the page and have some projects already set up you can access them by just clicking on the project name.

### Kanban View
The Kanban view for the board will allow you to see your project lists set up as boards, they will be positioned in a row and you can drag and drop these lists to reposition them, there are also arrows on each board that will move the boards left and right and these can be accessed via the keyboard for people with accessibility requirements.

You can edit the name of the each list just by clicking on the name of the list itself (or clicking the edit button) the title will be replaced with an input form and will update once you press enter or the input loses focus.

Each list can deleted by clicking the delete button at the bottom right of the list.

To create a new list just click the new list link at the far right of the lists row.

Within each list you can create a new item by clicking the new item button at the bottom left of the list, the item will appear within the list you create it in, but you can drag and drop the item into another list in the position you want. You can also delete the item by clicking on it to edit it and using the delete button in the popup modal edit form.

### List View

You can switch between the list view and the kanban view in the top right of the screen.

The list is a simplified version of the kanban board, it will just list all items in a column with a reference to what list they belong to.

### Messaging
I have incorporated Toastify to display any messages to the user, the types of messages are a split between Django messages and javascript messages, this is because the Django messages mostly only show when the page is refreshed as they are added to the session and then all shown at once, however as most of my processes do not refresh the page the messages were not showing until I manually refreshed, so to combat this I moved messages into the javascript processes instead.

### Future Features
There are some features that I didn't have time to implement that would benefit the app, these are the ability to see the items in a Gannt chart view and the ability to project colaboration.

#### GANNT CHART VIEW
This would be highly beneficial when planning projects, I had added date fields and dependancy fields into the database to be able to power the Gannt charts but I dind't have time to implement this.

#### PROJECT COLLABORATION
Adding the ability to invite other users to be able to contribute to projects would also be highly beneficial to the app.

## 🎨 User Experience
### Design
#### FONTS
The font I chose to use was 'Poppins' which I used from Google Fonts, it's a sans-serif font that is easy to read and pleasing to look at.

#### COLOURS
The colours I went for were blue and orange which go really well together, however the actual lists themselves I chose to use shades of grey to distinguish between different elements.

Primary Colour - #091057

Secondary Colour - #024CAA

Tertiary Colour - #EC8305

I put these colours together by using the external resource [ColorHunt](https://colorhunt.co/palette/091057024caaec8305dbd3d3). The link is a link to the actual colours that I used.

## 📅 Project Planning
### User Stories

Before creating the projects I set up user stories via GitHub Projects, the board itself can be found here;

[https://github.com/users/David-Coles-DC/projects/8](https://github.com/users/David-Coles-DC/projects/8)

### Wireframes

![image](https://github.com/user-attachments/assets/87db878d-61e9-4ae9-93da-91a4742954c5)

The above is a wireframe for the desktop, my aim was to make sure that the whole project page fitted within the browser window, and the project lists would change in height and if there were many lists then they could be scrolled horizontally without losing the header or footer.

![image](https://github.com/user-attachments/assets/593c49f5-24a8-4bbd-b96d-413c98041182)

For the mobile view the above theory would also take place, it would fit into the screen width and you could scroll the lists section horizontally with touch support.

I managed to create the design that I intended from the wireframes, however I did also create a home page for people to find out about Planban and I also added a list view which didn't originally exist on the wireframes.

### Data Models

![image](https://github.com/user-attachments/assets/59bd0ce6-458d-4d48-a1e2-50b803c1a97d)

As you can see from the diagram I have 3 main tables

#### PROJECT

This table holds all of the products for each user and also has a foreign key back to the user table.

#### LIST

This table holds all of the lists for each project and has a foreign key set up back to the projects table

#### ITEM

This table holds all of the items for each list and has a foreign key back to the lists table.

#### ITEM DEPENDS ON

This table was created to be able to run the Gannt charts, however this never came to fruition, but it was there to creation a relationship between an item and those other items that it depended on.

## 🧪 Testing

### Manual Testing

#### LIGHTHOUSE TESTS

![image](https://github.com/user-attachments/assets/0a84c95a-3ea7-4137-8839-eb3976c4d33c)

All pages gave the same result scores as above. This was of course after running the lighthouse several times and fixing issues that arose. The issue keeping me from getting 100% on performance id down to including external javascript sources such as FontAwesome, Toastify and Google Fonts. But I am extremely happy with the overall results.

#### WCAG TESTS

All Pages test ok for HTML validation, all except for a warning that states;
```
Possible misuse of aria-label.
```
However I feel like this is an improper warning.

All pages pass the CSS validation without any issues.

### Automated Testing

In the end I did not incorporate any automated testing into the project due to time limitations, however I do see the importance of automated testing as I do think that in a production project it should definitely be included.

## 🤖 AI

I used AI thoughout the creation of the project, for most of the code creation and functionality as well as fixing any issues that I came across. Overall I used Copilot mostly to speed up the development process.

#### CODE CREATION
Each time I wanted a new piece of functionality I would first consult Copilot, it would produce the code for me but I would only implement the code that I saw would be beneficial to the project, sometimes it would produce code that was incorrect for the context it was to be used in or overly complex, but overall it was very helpful.

#### ERROR DEBUGGING
When I had an issue with my project I would first consult Copilot, 90% of the time it could sort out the issue for me, however the other 10% of the time it had difficulty, I had to keep altering my prompts to be more specific which helped, but on the odd occassion I would have to revery to going back to Google to search for the issue.

## 🐛 Bugs
Any bugs that I found were fixed as and when I found them, however this doesn't mean that the project is bug free and I'm sure there are things that could occur that would break the app, however I am unaware of any of these at the time that this readme was created.

## 📚 Resources

- [ColorHunt](https://colorhunt.co/palette/091057024caaec8305dbd3d3) - For the colour palette Resources
- [Django](https://www.djangoproject.com/) - I used Django 5.1.6
- [Google Fonts](https://fonts.google.com/) - I used the fonts 'Poppins'
- [Heroku](https://www.heroku.com/) - My project was deployed on Heroku
- [Python](https://www.python.org/) - I used Python 3.13.1
- [RealFaviconGenerator](https://realfavicongenerator.net/) - To create the favicon for the website
- [SortableJS](https://github.com/SortableJS/Sortable) - drag and drop for reordering the lists and items
- [Skrollr](https://github.com/Prinzhorn/skrollr) - Stand-alone parallax scrolling JavaScript library
- [Toastify](https://apvarun.github.io/toastify-js/) - Used to show messages to the user
- [VSCode](https://code.visualstudio.com/) - I used VSCode as my development environment
