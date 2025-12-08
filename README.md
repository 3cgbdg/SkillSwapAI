# SkillSwapAI 🚀

**AI-powered platform for skill exchange and finding mentors.**

SkillSwapAI connects people who want to learn with those who want to teach. The system utilizes Artificial Intelligence to analyze user profiles and provide intelligent matchmaking, facilitating real-time communication and learning sessions.

![Project Status](https://img.shields.io/badge/Status-MVP_Live-success)
![Tech Stack](https://img.shields.io/badge/Stack-Full_Stack-blue)
![License](https://img.shields.io/badge/License-MIT-green)


## 🏗 Architecture

The project follows a **microservices-based architecture**, ensuring separation of concerns and scalability.

<img width="1521" height="1764" alt="Untitled-2025-12-05-0011" src="https://github.com/user-attachments/assets/263bd663-7880-4afc-8b0e-1ca84979070a" />




* **Frontend (Client):** Next.js application for user interaction.
* **Core Backend (NestJS):** NestJS server handling users, chats, sessions, and core business logic.
* **AI Service (Microservice):** A dedicated Python (FastAPI) service responsible for ML logic, OpenAI API integration, and recommendation algorithms.
* **External Services:** PostgreSQL (Neon.tech), AWS S3 (Storage), OpenAI API.

## 🛠 Tech Stack

### Frontend
* **Framework:** Next.js 15 (React)
* **Language:** TypeScript
* **Styling:** TailwindCSS
* **State Management:** Redux Toolkit
* **Real-time:** Socket.io Client

### Backend (Core)
* **Framework:** NestJS
* **Language:** TypeScript
* **Database ORM:** Prisma
* **Real-time:** Socket.io Gateway

### AI Engine
* **Framework:** FastAPI
* **Language:** Python
* **AI/ML:** OpenAI API integration (LLM)

### Infrastructure & DevOps
* **Containerization:** Docker (for services), Docker Compose (for local orchestration).
* **Database:** PostgreSQL (Cloud-hosted on Neon.tech).
* **Storage:** AWS S3 (via AWS SDK).
* **Deployment:** Vercel (Frontend) + Render (Backend Services).

## ✨ Key Features

* **🔐 Secure Authentication:** JWT-based registration and login system.
* **🆕 Custom Skill Input:** Users can manually input unique skills during registration if they are not yet in the database. The system automatically indexes these new skills for future AI matching.
* **🤖 AI Matching:** Intelligent prompt algorithm that pairs users based on "Skills to Learn" vs. "Known Skills".
* **🤖 AI Skill Suggestions:** Prompt algorithm that generates 5-4 recommended skills for person to learn.
* **💬 Real-time Chat:** Instant messaging between users powered by WebSockets (Socket.io).
* **📅 Session Scheduling:** Ability to request and schedule learning sessions.
* **🔔 Notification System:** Real-time alerts for new matches,session-creation and messages.

## 🚀 How to Run Locally

To run the entire system locally using Docker Compose:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/3cgbdg/SkillSwapAI.git
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root directory based on the provided `.env.example`.

3.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```

4.  **Access the application:**
    * Frontend: `http://localhost:3000`
    * Backend API: `http://localhost:4000`
    * AI Service: `http://localhost:8000`

## 🐛 Known Issues & Roadmap

This project is currently in the **Active MVP Phase**.
* **Socket Synchronization:** Occasionally, a page refresh might be required to verify the initial connection in a new chat room due to race conditions. Fix is planned for v1.1.

## 👨‍💻 Author

**Bogdan Tytysh**
* Full-Stack Engineer (NestJS, Python, AWS)
* [LinkedIn](https://www.linkedin.com/in/bogdan-tytysh-0b76b1290)
* [GitHub](https://github.com/3cgbdg)

---
*Built as a showcase of modern cloud-native architecture.*
