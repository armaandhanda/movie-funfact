

## 1) Prereqs
- Node 18+
- Postgres (local, Docker, or hosted: Neon/Supabase/Render)
- Google Cloud OAuth credentials (Web client)
- An OpenAI API key
# Edit .env with your values
## 2) Setup

### 2.1 Backend
```bash
cd server

npm install
npx prisma migrate dev -n init
npm run dev
# API at http://localhost:4000
```
Google OAuth local redirect URI:
```
http://localhost:4000/auth/google/callback
```

### 2.2 Frontend
```bash
cd ../client
npm install
npm run dev
# UI at http://localhost:5173
```

## 3) Flow
1. Open http://localhost:5173
2. Click "Sign in with Google" -> Google -> redirected back to ui
3. First-time user is prompted for favorite movie, which is saved to DB
4. Dashboard shows name, email, photo, favorite movie, and a fresh fun fact (new on each refresh)
5. Logout clears cookie; visiting again redirects to login

## 4) Env Vars (server/.env)
```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
JWT_SECRET=super_long_random_string
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:5173
PORT=4000
```
## 5 DEMO RECORDINGS:
1:
https://drive.google.com/file/d/1Yx-q6ZkqXeFsKWu1NHCUsU87T4YHKUnV/view?usp=sharing
2:
https://drive.google.com/file/d/1mxnCdLfuvj7s1zBHcNTAnhGRo2ApuNO3/view?usp=sharing