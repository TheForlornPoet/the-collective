# The Collective (Vercel, no Cloudflare)

Frontend: /public (static).  
Backend: /api (Vercel Functions).  
Storage: Vercel Blob.

## Environment (Vercel → Project → Settings → Environment Variables)
- JWT_SECRET = (generate something random)
- BLOB_READ_WRITE_TOKEN = (Vercel → Storage → Blob → Create token → Read/Write)

## Local preview (frontend only)
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Deploy
- Push to GitHub
- Import repo into Vercel
- Add env vars (above)
- Deploy
