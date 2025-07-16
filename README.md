# Web Development Projects

This repository contains three individual web development assignments completed as part of a course series. Each homework builds upon previous skills, progressing from static websites to dynamic backend and full-stack applications.

## Static Personal Website

A basic static website built using HTML and CSS.

Contents:
- HW1.html: Main homepage with personal information
- page2.html: Second page linked from the homepage
- HW1.css: Stylesheet used across pages
- images/: Folder containing image assets

Key Concepts:
- HTML structure and navigation
- CSS for layout and styling
- Linking between pages

## Flask Web Application

A dynamic web app using Python Flask with server-side rendering.

Contents:
- mediate.py: Flask backend application
- templates/HW2.html: Jinja2 template for the HTML page
- static/: Contains index.css, home.js, and image assets
- Pipfile: Python dependency and virtual environment manager

Key Concepts:
- Flask routing and template rendering
- Use of static files (CSS, JS) in a backend setup
- Local development with Python

To run locally:
cd HW2
pip install pipenv
pipenv install
pipenv run python mediate.py


## Full-Stack Angular + Node.js Application

A complete full-stack web application using Angular for the frontend and Node.js for the backend.

Contents:
- frontend/src/: Contains Angular source files (HTML, CSS, TypeScript)
- server.js and server.ts: Node.js backend entry points
- angular.json, package.json, tsconfig.json: Project configuration files

Key Concepts:
- Angular CLI project setup with components and routing
- Node.js backend integration
- TypeScript build configurations

To run locally:
cd HW3/frontend
npm install
ng serve (starts the Angular frontend)

node server.js (in parallel, starts the Node backend)



## Project Structure

- HW1/: HTML and CSS static website
- HW2/: Flask web app with server-side templates and static files
- HW3/: Full-stack Angular frontend and Node.js backend
- index.html: Entry-point used for GitHub Pages or testing
- Pipfile, requirements.txt: Python dependencies for HW2

## Author

Sree Swiya Yarlagadda  
https://swiyasree.github.io
