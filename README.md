# typeCode ⌨️

> **Improve Typing Speed. Master Coding Accuracy.**  
> A clean, cinematic typing practice platform built for programmers and everyday typists.

---

## ✨ Features

- **🚀 Dual Typing Modes**: Practice normal text passages or real code syntax (`{}`, `()`, `=>`, `;`) across multiple languages.
- **🎬 Cinematic Intro with Auto-Skip**: Features a terminal typing intro with instant click/keypress skip and `sessionStorage` memory so returning visitors jump right in.
- **📊 Real-Time Analytics**: Track WPM, accuracy %, keystroke heatmaps, and progress history.
- **🏆 Leaderboard & Profiles**: Global rankings with secure JWT authentication and account management.

---

## 🛠 Tech Stack

- **Frontend**:  HTML5, CSS3, JavaScript (Google Fonts: *Inconsolata* & *Inter*)
- **Backend**: Python 3, Flask, SQLAlchemy, JWT Extended, PyMySQL
- **Database**: MySQL

---

## 📁 Project Structure

```text
typecode/
├── backend/               # Flask REST API, database models, and auth routes (`app.py`)
└── frontend/              # HTML/CSS/JS web pages (`index.html`, `typing.html`, `dashboard.html`)
```

---

## 🚀 Quick Start

### 1. Backend Setup (Flask API)

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # On macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env      # Configure your database credentials in .env
python app.py               # Starts API server on http://localhost:5000
```

*To verify the backend is running, visit `http://localhost:5000/api/health`.*

### 2. Frontend Setup

Simply open `frontend/index.html` in your browser using **VS Code Live Server** or Python's HTTP server:

```bash
cd frontend
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

---

## 📄 License

This project is open-source and available under the [MIT License](file:///C:/Users/HP/OneDrive/Desktop/Projects/typecode/LICENSE).


