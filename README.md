# The Slow Turn

**Team command center** — Landing page + Chat. Safe to port.

## Structure

- `server/` — Node.js + Express backend (chat API, Socket.io)
- `client/` — React frontend (landing page, chat UI)
- `Dockerfile` — For Digital Ocean deployment

## Local Development

```bash
npm run install:all    # Install all dependencies
npm run dev            # Start server + client (concurrently)
```

Then:
- **Frontend:** http://localhost:5173 (Vite dev server)
- **Backend:** http://localhost:5000 (Express server)
- **Chat:** WebSocket via Socket.io

## Deployment

Push to GitHub main branch → Digital Ocean auto-deploys via App Platform.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
PORT=5000
NODE_ENV=production
```

## Next

- [ ] Add landing page design (reuse old Lovable version)
- [ ] Add chat UI styling
- [ ] Add PostgreSQL database (when needed)
- [ ] Add authentication (later)
- [ ] Add Kade's developer workspace
