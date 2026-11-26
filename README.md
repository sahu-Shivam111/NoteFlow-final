# ✨ AI-Powered Notes: From Chaos to Clarity

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![AI Powered](https://img.shields.io/badge/AI-Gemini-orange.svg)](https://ai.google.dev/gemini-api/docs)
[![Security](https://img.shields.io/badge/Security-Production--Ready-green.svg)](#security--hardening)

## 📖 The Story
We live in an age of **information overload**. We capture ideas, links, and documents, but they often get lost in a digital graveyard of "things to read later." 

I built this **AI-Powered Notes App** to solve a simple problem: **Time.** 
*   Why read a 10-page meeting transcript when an AI can summarize it in 3 bullet points? 
*   Why worry about security when you can have production-grade encryption?

This isn't just a place to store text; it's a productivity partner designed to summarize, organize, and protect your digital life.

---

## 🚀 Key Features

### 🧠 Intelligent AI Summarization
Stop drowning in long notes. With one click, our **Gemini API integration** summarizes your notes and attached PDFs.

### 📎 Secure Document Management
Attach PDFs and images directly to your notes. Unlike traditional apps, our files are stored securely in **MongoDB** as binary data, ensuring they stay linked to your account forever.

### 🛡️ Production-Grade Security
*   **BCrypt Hashing**: Your passwords are encrypted at rest. Even we can't see them.
*   **JWT Authentication**: Secure, token-based session management.
*   **Global Rate Limiting**: Protection against brute-force attacks and API abuse.
*   **CORS Lockdown**: Only authorized frontends can access the API.

### 🎨 Modern & Responsive UI
*   **Dark/Light Mode**: Beautifully optimized for day or night productivity.
*   **Rich Text Editing**: Powered by Quill for professional formatting.
*   **Instant Export**: Export your notes as **PDF**, **Markdown**, or **JSON**.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, Multer |
| **Database** | MongoDB Atlas (Mongoose) |
| **Artificial Intelligence** | Google Gemini API |
| **Security** | BCrypt.js, JSON Web Tokens (JWT), Express-Rate-Limit |

---

## ⚙️ Step-by-Step Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/notes-app.git
cd notes-app
```

### 2. Backend Configuration
1.  Navigate to the backend: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file and add:
    ```env
    MONGO_URL=your_mongodb_uri
    ACCESS_TOKEN_SECRET=your_random_secret
    GEMINI_API_KEY=your_google_ai_studio_api_key
    GEMINI_MODEL=gemini-3.5-flash-lite
    ```
4.  Start the server: `npm start`

`gemini-3.5-flash-lite` is listed as free on Google's Gemini API Free tier, subject to project-specific rate limits and availability. Check your active quota in [Google AI Studio](https://aistudio.google.com/rate-limit?timeRange=last-28-days). Google may use Free-tier content to improve its products; do not send sensitive notes.

### 3. Frontend Configuration
1.  Navigate to the frontend: `cd ../frontend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file and add:
    ```env
    VITE_BASE_URL=http://localhost:8000
    ```
4.  Launch the app: `npm run dev`

---

## 🤝 Contributing
We love contributors! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Crafted with ❤️ to make your digital life simpler.**
