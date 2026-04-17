# Novel Writer 📖✨

![Novel Writer Application Preview](./frontend/public/vite.svg)

Novel Writer is a modern, responsive, and deeply customizable workspace designed exclusively for authors. The platform combines a gorgeous, distraction-free text editor with intuitive novel/chapter management and an integrated AI assistant capable of performing real-time offline grammar checks and AI-powered paragraph enhancements.

## 🌟 Features

* **Beautiful Aesthetic Themes**: Effortlessly toggle between 4 meticulously crafted design specs:
  * 🌌 **Tokyo Night**
  * ☕ **Cappuccino** 
  * 🌙 **Dark**
  * 💻 **VSCode Dark+**
* **Typography Controls**: Quick-select generic, serif, monospaced, or display font variants (Inter, Merriweather, Fira Code, Outfit).
* **AI-Assisted Writing**: 
  * **Offline Grammar Checking**: Utilizes `language_tool_python` running entirely locally over Python.
  * **Paragraph Enhancement**: Select a Google Gemini API Key in the settings, and seamlessly request the LLM to rewrite your paragraphs to be more vivid and engaging.
* **Organized Library**: Keep your writing streamlined with distinct Novel entities and underlying chapters. Auto-saves locally.

## 🚀 Tech Stack

**Frontend**:
- Vite + React
- Zustand (Global state, dynamic theme management)
- Lucide React (Icons)
- Axios (Requests)

**Backend**:
- Python / FastAPI
- SQLite (Effortless local DB)
- SQLAlchemy / Pydantic
- `language_tool_python` & `google-generativeai`

---

## 🐋 Getting Started (Docker - Recommended)

The absolute easiest way to start writing is to run the entire backend and frontend suite inside a single Docker command.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/novel-writer.git
   cd novel-writer
   ```

2. **Spin up the stack:**
   ```bash
   docker compose up --build
   ```
   *Note: The first spin up might take a few minutes as the Python background service downloads the required LanguageTool Java binaries.*

3. **Open the App:**
   Navigate to [http://localhost:5173](http://localhost:5173) in your browser. 
   *(The FastAPI backend automatically serves endpoint APIs at `localhost:8000`)*

---

## 🛠️ Local Development (Without Docker)

If you prefer to run both servers manually on your local system, follow these steps:

### Backend Setup

1. Make sure you have **Java** (JRE) installed for `language_tool_python`.
2. Navigate to `/backend` and create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the `/frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173).

---

## 🔑 Activating AI Enhancement

While the Grammar Check mechanism does not need an API key, paragraph rewriting uses **Google's Gemini Model**.
1. Grab an API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Inside the Novel Writer app, paste your API Key in the top navigation **Gemini Key** box. Your key is securely stored in your browser's local storage and is only passed via Post request payloads directly to your local FastAPI backend.

Happy Writing! 🖋️
