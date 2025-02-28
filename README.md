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

## 📦 Installation
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/yourusername/planban.git
cd planban
```

### **2️⃣ Set Up a Virtual Environment**
```sh
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
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

## 📝 License
This project is licensed under the **MIT License**.

---
**Planban** – Your all-in-one project management solution. 🚀

### Resources

- [RealFaviconGenerator](https://realfavicongenerator.net/) - To Create the favicon for the website
- [ColorHunt](https://colorhunt.co/palette/091057024caaec8305dbd3d3) - For the colour pallette