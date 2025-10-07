# 🚀 Snippet Vault

**Snippet Vault** is a full-stack web application that helps developers **save, organize, and manage code snippets efficiently** — with built-in **AI-powered suggestions** for improving and reusing snippets.

> 📦 Built using **React**, **Node.js (Express)**, and **MongoDB** — designed to be fast, minimal, and developer-friendly.

---

## 🧠 Features

- 💾 **Store and categorize** code snippets (with title, language, and tags)
- 🔍 **Full-text search** across snippets
- 🧩 **AI-powered snippet suggestions** (using OpenAI API)
- 🏷️ Tag-based filtering and sorting
- ✨ Modern, responsive UI built with **React + Tailwind CSS**
- ⚡ **JWT-based authentication** with access and refresh tokens
- 🧠 **Smart caching** using Redis (for snippet retrieval)
- 🧰 RESTful APIs with **Express.js**
- 🗄️ **MongoDB Atlas** as the primary database

---

## 🖼️ Demo

👉 [Live Demo](#) *(Coming Soon)*  
🎥 Screenshots:

| Dashboard | Snippet View | Add Snippet |
|------------|---------------|-------------|
| ![Dashboard](assets/dashboard.png) | ![Snippet View](assets/snippet-view.png) | ![Add Snippet](assets/add-snippet.png) |

---

## 🧱 Tech Stack

**Frontend**
- React (Vite)
- React Router DOM
- React Hook Form
- Tailwind CSS

**Backend**
- Node.js + Express
- MongoDB (Mongoose ODM)
- JWT Authentication
- Redis for caching
- BullMQ (for async task queue, future enhancement)

**AI Integration**
- OpenAI API (for snippet suggestions)

**Deployment**
- Render (Frontend + Backend)
- Railway (Database)
