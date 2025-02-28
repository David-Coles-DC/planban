# Planban

**Planban** is a feature-rich **Kanban board** and **Gantt chart** project management tool, designed for efficiency, accessibility, and responsiveness. Built using **Django (Python) for the backend**, a **PostgreSQL database**, and **HTML, CSS, and JavaScript** for the frontend, Planban helps users manage tasks seamlessly.

## 🚀 Features
- **Kanban Board**: Create, edit, and organise tasks visually.
- **Gantt Chart View**: Convert your Kanban board into a timeline-based view.
- **User Authentication**: Secure sign-up, login, and password management.
- **Task Collaboration**: Add comments and tag users on tasks.
- **Dark Mode**: Toggle between light and dark themes.
- **Fully Responsive**: Works across all devices.
- **Accessibility First**: Keyboard navigation, screen reader support, and high-contrast UI.

## 🛠️ Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python, Django
- **Database**: PostgreSQL
- **Authentication**: Django Authentication System

## 📅 Planning

Before creating the projects I set up user stories via GitHub Projects, the board itself can be found here;

[https://github.com/users/David-Coles-DC/projects/8](https://github.com/users/David-Coles-DC/projects/8)

## 🚀 Deployment

![Heroku](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white)

The site is currently deployed on Heroku and can be accessed via the following URL [https://planban-c33c6bd858d7.herokuapp.com/](https://planban-c33c6bd858d7.herokuapp.com/)

## 📦 Installation
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

## 📚 Resources

- [ColorHunt](https://colorhunt.co/palette/091057024caaec8305dbd3d3) - For the colour palette Resources
- [Google Fonts](https://fonts.google.com/) - I used the fonts 'Poppins'
- [RealFaviconGenerator](https://realfavicongenerator.net/) - To create the favicon for the website
- [Skrollr](https://github.com/Prinzhorn/skrollr) - Stand-alone parallax scrolling JavaScript library
