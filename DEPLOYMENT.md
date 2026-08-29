# Deployment Guide

## Prerequisites

- MongoDB Atlas cluster with vector search index (`vector_index` on `documentchunks`)
- Google Gemini API key
- GitHub repository connected to hosting providers

## Frontend (Vercel)

1. Import the repository in [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
4. Deploy

## Backend (Render)

1. Create a new Web Service from this repository
2. Use the `render.yaml` blueprint or configure manually:
   - **Root Directory:** `backend`
   - **Build Command:** `npm ci`
   - **Start Command:** `node app.js`
   - **Health Check Path:** `/api/health`
3. Set environment variables from `backend/.env.example`:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — a strong random secret
   - `GEMINI_API_KEY` — your Google AI API key
   - `FRONTEND_URL` — your Vercel deployment URL (e.g. `https://interviewpilot.vercel.app`)
4. Deploy and copy the service URL

## MongoDB Atlas Vector Index

Create a vector search index on the `documentchunks` collection:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 3072,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    }
  ]
}
```

Index name: `vector_index`

## Docker (Local)

```bash
# Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

## Post-Deploy Checklist

- [ ] Update `VITE_API_URL` on Vercel to point to live backend
- [ ] Set `FRONTEND_URL` on Render to match Vercel URL
- [ ] Verify `/api/health` returns `database: connected`
- [ ] Test register → upload resume → chat flow on live demo
- [ ] Add live demo URL to README

## Live Demo URLs

After deployment, update these placeholders in README.md:

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-api.onrender.com`
- **API Docs:** `https://your-api.onrender.com/api/docs`
