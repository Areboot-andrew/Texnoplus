# Texnoplus (sitecomp)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Deployment via Coolify using Docker

This site is prepared for containerized deployment through Coolify using a custom multi-stage Dockerfile.

### Coolify setup (Dockerfile build pack)

- Resource type: Application from GitHub repo (public or via GitHub App)
- Build Pack: Dockerfile (instead of Nixpacks)
- Port: 80
- In Environment Variables (Production), add the build-time vars (passed as Docker ARGs):
  - VITE_TELEGRAM_BOT_TOKEN
  - VITE_TELEGRAM_CHAT_ID

Coolify will clone, docker build, and serve via the nginx in the final image. Client-side routing and prerendered pages (via react-snap) are supported.

Alternative (simpler, no Dockerfile): 
- Build Pack: Nixpacks
- Check "Is it a static site?"
- Publish Directory: dist
- Same env vars (but may have issues with react-snap prerendering in some Nixpacks versions)

### Local testing with Docker

```bash
docker build -t technoplus-service .
docker run --rm -p 8080:80 technoplus-service
```
Open http://localhost:8080

### Local development

```bash
cp .env.example .env
npm install
npm run dev
```

See Dockerfile, nginx.conf, .dockerignore and .env.example for implementation details.
