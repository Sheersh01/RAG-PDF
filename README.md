# InterviewPilot: AI-Powered Resume Analysis & Interview Preparation Platform

InterviewPilot is a production-grade Full-Stack RAG (Retrieval-Augmented Generation) application designed to accelerate candidate interview preparation. By combining modern React features with a robust Express back-end, LangChain, Google Gemini, and MongoDB Atlas Vector Search, the application indexes resumes as semantic vector embeddings to provide hyper-personalized feedback, ATS compatibility scores, mock interview simulators, and real-time coaching with citations.

---

## 🚀 Key Features

*   **Secure Cookie Sessions**: Standard HTTP-only sameSite strict session management storing JWT validation secure against XSS.
*   **Resume Ingestion & Vector Indexing**: 
    *   Uploads PDF resumes via `multer` capped at a strict 10MB size limit.
    *   Parses text from PDFs asynchronously using `pdf-parse` protected by a 30-second execution timeout.
    *   Splits text into chunks of `1000` characters with a `200` character overlap via LangChain's `RecursiveCharacterTextSplitter`.
    *   Generates 3072-dimensional embeddings using the Google Generative AI embeddings model (`gemini-embedding-2`).
    *   Stores vectorized chunks in MongoDB Atlas using a `$vectorSearch` index.
*   **Automatic Resume Replacement**: Automatically purges any previous resume documents and their corresponding vector index chunks upon new uploads to prevent context pollution.
*   **AI Resume Analyzer**: Reviews parsed resume content and returns structured JSON outlining core strengths, critical gaps, and immediate action items.
*   **ATS Optimizer / Score Matcher**: Evaluates resume vectors against job descriptions to calculate compatibility scores (0–100%) and pinpoint missing keyword gaps.
*   **Mock Interview Simulator**: Conducts tailored QA sessions based on resume qualifications and roles, grading submissions with constructive qualitative reviews.
*   **Interactive AI Coach**: Real-time chat dialogue featuring starter prompts and source citation lookups.
*   **Diagnostic Search**: Gates a direct vector lookup interface behind a local Vite development flag (`import.meta.env.DEV`).

---

## 🛠 Tech Stack

### Frontend
*   **Vite + React 19**: Super-fast React application compiler.
*   **Tailwind CSS (v4)**: Modern, responsive glassmorphic interfaces.
*   **Zustand**: Clean, reactive state store for user context synchronization.
*   **React Router DOM (v7)**: Route configuration and guard patterns (`PrivateRoute`, `PublicRoute`).
*   **React Dropzone**: Interactive drag-and-drop file uploader.
*   **React Hook Form & Zod**: Form schema validations.
*   **Lucide React**: Clean vector icon suite.
*   **React Hot Toast**: Action alerts notifications.

### Backend
*   **Node.js & Express.js (v5)**: High-performance server engine with request rate limiters.
*   **Mongoose**: Database model definitions and schemas.
*   **MongoDB Atlas Vector Search**: Semantic vector KNN matching pipelines.
*   **LangChain JS**: Manages LLM text splitting and embeddings generation.
*   **Google Generative AI**: Configurable access to Google Gemini LLMs via environment variables.
*   **Multer**: Handles file uploads with explicit size limits.
*   **PDF-Parse**: Local binary stream text converter.
*   **BcryptJS & JSONWebToken (JWT)**: Auth hashing and session generation.

---

## 📂 Project Structure

### Backend
```
backend/
├── config/
│   └── db.js                 # Mongoose database connection client
├── controllers/
│   ├── atsController.js      # Processes ATS matching & parses Gemini JSON responses
│   ├── authController.js     # User registration, login, logout, and me context
│   ├── chatController.js     # Manages standard QA prompt generation and model responses
│   ├── documentController.js  # Uploads resumes and handles vector index cleanups
│   ├── interviewController.js # Prepares mock QA sessions and responses
│   ├── ragController.js      # Unused: Retrieves top document chunks and queries Gemini
│   ├── resumeAnalysisController.js # Compiles strengths, gaps, and improvements
│   └── searchController.js   # Similarity searches raw database document chunks
├── middleware/
│   ├── authMiddleware.js     # Verifies cookie JWTs and attaches user payload
│   └── uploadMiddleware.js   # Multer file configurations (10MB size limit)
├── models/
│   ├── Document.js           # Holds parsed text metadata (type, fileName, rawText)
│   ├── DocumentChunk.js      # Stores 768-dim vector arrays, compound indexes, & snippets
│   └── User.js               # Holds user authentication credentials
├── rag/
│   ├── chunker.js            # Standard Recursive Text Splitter setups
│   ├── promptBuilder.js      # Builds system prompts for LLM outputs (JSON/text)
│   ├── prompts.js            # Prepares general QA prompt templates
│   └── retriever.js          # Invokes MongoDB Atlas vectorSearch pipelines
├── routes/
│   ├── atsRoutes.js
│   ├── authRoutes.js
│   ├── chatRoutes.js
│   ├── documentRoutes.js
│   ├── interviewRoutes.js
│   ├── ragRoutes.js
│   ├── resumeRoutes.js
│   └── searchRoutes.js
├── services/
│   ├── geminiService.js      # Unified model instance configuration (gemini-2.5-flash)
│   └── pdfService.js         # Extracts text blocks from local PDFs (30s timeout)
├── app.js                    # CORS configuration, log key redaction, & rate limiters
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── assets/               # Image/icon assets
│   ├── components/
│   │   ├── CircularProgress.jsx # Renders ATS score visual percentages
│   │   ├── ErrorBoundary.jsx    # React error boundaries catching rendering crashes
│   │   ├── MainLayout.jsx       # Layout containing sidebar (gates Search in prod)
│   │   ├── PrivateRoute.jsx     # Protects sensitive paths requiring login
│   │   └── PublicRoute.jsx      # Prevents authenticated users from viewing login/signup
│   ├── pages/
│   │   ├── AiCoach.jsx          # Live grounded chat with sources citations
│   │   ├── AtsMatcher.jsx       # Pastes JDs to calculate compatibility percentages
│   │   ├── Dashboard.jsx        # Skeleton loaders UI, resume dropzone, & prep tools
│   │   ├── Login.jsx            # Sign-in portal
│   │   ├── MockInterview.jsx    # Tailored QA simulation with answer rating
│   │   ├── Register.jsx         # Sign-up portal
│   │   ├── ResumeAnalyzer.jsx   # Strengths, weaknesses, and optimization reviews
│   │   └── ResumeSearch.jsx     # Diagnostic raw chunk similarity lookup (dev-only)
│   ├── services/
│   │   └── api.js               # Intercepted Axios connection maps (withCredentials)
│   ├── store/
│   │   └── authStore.js         # zustand global state management (cookie session check)
│   ├── App.jsx                  # Main browser routing path definitions
│   ├── index.css                # Base stylesheet and custom Tailwind utilities
│   └── main.jsx                 # Mounts the React virtual DOM tree
├── vite.config.js
└── package.json
```

---

## 🗄 Database Models & Vector Setup

### MongoDB Collections
1.  **Users (`User`)**
    *   `name` (String)
    *   `email` (String, unique)
    *   `password` (String, hashed)
2.  **Documents (`Document`)**
    *   `userId` (ObjectId -> User)
    *   `type` (String: `"resume" | "jd" | "notes"`)
    *   `fileName` (String)
    *   `extractedText` (String)
3.  **Document Chunks (`DocumentChunk`)**
    *   `userId` (ObjectId -> User)
    *   `documentId` (ObjectId -> Document)
    *   `content` (String)
    *   `embedding` (Array of Numbers, size 3072, custom validator protected)
    *   **Index**: Compound index on `{ userId: 1, documentId: 1 }` for faster lookups.

### MongoDB Atlas Vector Search Index Setup (Step-by-Step UI Guide)
To enable semantic vector search on your Atlas cluster:
1. Log in to your MongoDB Atlas dashboard.
2. Select your Database Deployment and click on **Search** tab.
3. Click **Create Search Index** and select **JSON Editor** under **Atlas Vector Search**.
4. Select your database name and choose the `documentchunks` collection.
5. Enter **`vector_index`** as the Index Name.
6. Paste the configuration from [search_index.json](file:///c:/Users/HP/Desktop/Programming/Projects/Full-Stack/RAG/docs/search_index.json):
   ```json
   {
     "mappings": {
       "dynamic": true,
       "fields": {
         "embedding": {
           "dimensions": 3072,
           "similarity": "cosine",
           "type": "knnVector"
         },
         "userId": {
           "type": "objectId"
         }
       }
     }
   }
   ```
7. Click **Next**, review the setup, and hit **Create Search Index**. Atlas will begin building the index on your collection chunks.

---

## 🔑 Environment Configuration

Do not copy the production `.env` to git tracking. Use the reference file [backend/.env.example](file:///c:/Users/HP/Desktop/Programming/Projects/Full-Stack/RAG/backend/.env.example) to bootstrap local setup:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>
JWT_SECRET=your_super_secure_jwt_secret_key
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:5173
```

### CORS Policies
The backend explicitly enables credential-based CORS. When connecting, the incoming client origin must match the `FRONTEND_URL` environment parameter for httpOnly cookie insertion.

---

## 📡 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new account and set cookie | `{ name, email, password }` |
| **POST** | `/api/auth/login` | Login and set cookie session | `{ email, password }` |
| **POST** | `/api/auth/logout` | Clear cookie session details | None |
| **GET** | `/api/auth/me` | Fetch active user profile from session | None |

### Document Management
| Method | Endpoint | Description | Request Headers & Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/documents/resume` | Upload PDF and build vector chunks (Capped at 10MB) | `Bearer Cookie` + Multipart File Form |
| **GET** | `/api/documents/resume` | Fetch active user's resume details | `Bearer Cookie` |

### AI Prep Tools & RAG Pipeline (Protected by Rate Limiting: 15 req/15 min)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/analyze-resume` | Analyze indexed resume details | None |
| **POST** | `/api/ats-score` | Compute JD match score & gaps | `{ jobDescription }` |
| **POST** | `/api/interview/questions` | Generate 3 customized mock questions | `{ topic }` |
| **POST** | `/api/chat` | Chat with AI Coach (grounded context) | `{ question }` |
| **POST** | `/api/search` | Search raw vector database matches (dev-only) | `{ question }` |

---

## 🛠 Installation & Running

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Atlas Account with a cluster running

### Step 1: Clone and install backend dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment
Create the `.env` file inside the `backend/` directory referencing `.env.example`.

### Step 3: Run the Backend server
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

### Step 4: Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Step 5: Run the Frontend application
```bash
npm run dev
```
Open `http://localhost:5173` (or the port specified by Vite) in your browser.

---

## 🧪 Test Coverage
> [!NOTE]
> Currently, the codebase is in a diagnostic/prototype deployment state. No automated test suites are integrated yet. Contributions involving Jest/Supertest for API endpoints, or Playwright/React Testing Library for frontend component validation are welcome.
