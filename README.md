💻 WebDev Projects – swiyasree.github.io

This repository contains a set of web development projects completed as part of a course series. Each project demonstrates progressive learning in frontend, backend, and full-stack development using technologies such as HTML/CSS, Flask, and Angular.

📁 HW1 – Static Personal Website

Overview:
A basic static website built using HTML and CSS. It showcases personal information and navigation between multiple pages.

Key Features:

Clean layout styled with custom CSS (HW1.css)
Multiple pages (HW1.html, page2.html)
Image assets displayed through the /images folder
No backend; fully frontend-based
📁 HW2 – Flask Web App

Overview:
A dynamic web application built with Flask using a Jinja2 template. It simulates server-side rendering with static files and a minimal Python backend.

Key Features:

Flask server logic (mediate.py)
HTML rendering via Jinja2 (templates/HW2.html)
Static files (index.css, home.js, images)
Virtual environment management with Pipfile
Flask project structure: /templates, /static, and __pycache__
📁 HW3 – Full-Stack Angular + Node.js App

Overview:
A full-stack web application using Angular on the frontend and Node.js as the backend server. This is a production-grade scaffolded project using Angular CLI.

Key Features:

Frontend written in Angular (src/app, main.ts, styles.css)
Node.js backend (server.js, server.ts)
Project setup with package.json, angular.json, tsconfig.json
Modular structure for deployment and testing
Asset management via src/assets
Local server configuration with TypeScript support
🛠 Technologies Used

Frontend: HTML, CSS, JavaScript, Angular
Backend: Flask, Node.js
Tools: GitHub Pages, VSCode, Python (venv), Angular CLI
DevOps: Pipenv, npm, workspace settings
📂 Directory Structure

├── HW1/              # Static website using HTML/CSS
├── HW2/              # Flask + Jinja + JS web app
├── HW3/              # Angular + Node.js full-stack app
├── index.html        # Entry point (likely for GitHub Pages)
├── requirements.txt  # Python dependency list
└── Pipfile           # Virtual environment config
🚀 Setup Instructions

HW2 (Flask App)
cd HW2
pip install pipenv
pipenv install
pipenv run python mediate.py
HW3 (Angular + Node App)
cd HW3/frontend
npm install
ng serve   # For frontend
node server.js   # For backend
👩‍💻 Author

Sree Swiya Yarlagadda
Personal Portfolio: swiyasree.github.io
