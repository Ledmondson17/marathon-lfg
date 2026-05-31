# Marathon LFG

A LinkedIn-style looking-for-group website for Bungie's Marathon.

## Project Structure

```
client/   React + Vite + Tailwind frontend
server/   Node + Express + PostgreSQL backend
```

## Getting Started

### Prerequisites
- Node.js (LTS) — nodejs.org
- PostgreSQL — postgresql.org
- Cloudinary account (free) — cloudinary.com

### 1. Install dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 2. Set up the database

Create a Postgres database, then run the schema:

```bash
psql -d marathon_lfg -f server/db/schema.sql
```

### 3. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env with your DB connection string, JWT secret, and Cloudinary keys
```

### 4. Run in development

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000
