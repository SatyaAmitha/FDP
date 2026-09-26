# FDP GenAI Lab (single project)

One app for all 6 FDP modules — **sidebar navigation** + **AI API on the same server**.

Lead ask: UI demos + real AI (Azure) in one project.

## Run (only this)

```bash
cd d:\fdp
npm install
npm run dev
```

Open **http://localhost:5173**

- Left sidebar → click Module 1–6  
- Live AI modules: **2, 4, 6** (uses Azure from `.env`)  
- Health: http://localhost:5173/health  

## Project layout

```
d:\fdp\
  server/          ← Express AI API + Vite (same process)
  src/
    components/    ← sidebar layout, provider picker
    modules/       ← Module1…Module6 pages
    App.tsx        ← routes
  .env             ← AI_PROVIDER=azure + keys
```

## Azure `.env`

```env
AI_PROVIDER=azure
PORT=5173
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://ainexlayer.services.ai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```
