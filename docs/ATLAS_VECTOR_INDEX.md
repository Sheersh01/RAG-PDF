# MongoDB Atlas Vector Search Setup

InterviewPilot requires an Atlas Vector Search index on the `documentchunks` collection. Without it, semantic search falls back to keyword matching (less accurate).

## Prerequisites

- MongoDB Atlas cluster (M10+ recommended for vector search; free tier may not support it)
- Resume uploaded at least once (chunks with 3072-dim embeddings in `documentchunks`)

## Step-by-step (Atlas UI)

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your **project** and **cluster**
3. Click the **Search** tab (or **Atlas Search** in sidebar)
4. Click **Create Search Index**
5. Choose **Atlas Vector Search** → **JSON Editor**
6. Select your **database** and collection: **`documentchunks`**
7. Set **Index Name** to exactly: `vector_index`
8. Paste this configuration:

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
    },
    {
      "type": "filter",
      "path": "chunkType"
    }
  ]
}
```

9. Click **Create Search Index**
10. Wait until status shows **Active** (can take several minutes)

## Verify from your machine

```bash
cd backend
npm run verify:index
```

Expected output: `PASS: Atlas vector_index is working.`

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `index not found` | Index name must be `vector_index` (not `default` or `vector_index_1`) |
| 0 results but index Active | Re-upload resume; Atlas indexes documents at insert time |
| Wrong dimensions error | Embeddings use `gemini-embedding-2` (3072 dims). Index must match. |
| `$vectorSearch only allowed on Atlas` | Local MongoDB does not support vector search; use Atlas URI |
| Filter returns 0, unfiltered works | Ensure `chunkType` filter field is in index definition |

## After index is live

1. Run `npm run verify:index` — should PASS
2. Re-upload your resume (purges old chunks, creates fresh indexed vectors)
3. Test Resume Search and AI Coach for semantic matches

## Reference

Index JSON also stored at [`docs/search_index.json`](search_index.json).
