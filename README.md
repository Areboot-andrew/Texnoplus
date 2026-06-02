# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
  },
})

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

docker build -t technoplus-service .
docker run --rm -p 8080:80 technoplus-service

Open http://localhost:8080

### Local development

cp .env.example .env
npm install
npm run dev

See Dockerfile, nginx.conf, .dockerignore and .env.example for implementation details.

```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
