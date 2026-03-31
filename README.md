# 🌳 B-Tree Student Manager

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

A Data Structures and Algorithms (DSA) project. This is a web-based student management system that visually simulates a **B-Tree (Order 3 / 2-3 Tree)** data structure in real-time.

🚀 **[LIVE DEMO](https://btree-student-manager.vercel.app/)**
*(Note: The free backend server might take ~30 seconds to wake up on the first request. Please be patient!)*

---

## ✨ Features
- **Insert:** Add new students with auto-balancing and dynamic node splitting.
- **Search:** Find students by ID with visual path highlighting from Root to Leaf.
- **Delete:** Remove records with instant tree reconstruction.
- **Visualization:** Smooth SVG animations calculating coordinates for bezier curves between nodes.

## 🛠 Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (DOM Manipulation & SVG) - Deployed on **Vercel**
- **Backend:** Python 3, Flask, RESTful API - Deployed on **Render**
- **Keep-alive:** UptimeRobot (Ping monitoring)

## 📂 Folder Structure

```text
btree-project/
├── backend/
│   ├── app.py               # B-Tree logic & Flask API Routes
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html           # UI Layout
│   ├── style.css            # Styling & Animations
│   └── script.js            # API fetching & SVG drawing logic
└── README.md
```
## 💻 Local Setup

If you want to run this project locally, follow these steps:

**1. Clone the repository:**
```bash
git clone [https://github.com/YourUsername/btree-student-manager.git](https://github.com/YourUsername/btree-student-manager.git)
cd btree-student-manager
```
**2. Run Backend (API):**
```bash
cd backend
pip install -r requirements.txt
python app.py
```
(The server will start at http://127.0.0.1:5000)

**3. Run Frontend (UI):**
- Open the frontend folder in VS Code.
- Important: In script.js, change the fetch URLs back to http://127.0.0.1:5000.
- Open index.html using the Live Server extension
