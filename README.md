# Chat-Based Layout Agent

A local web app for editing design layout JSON through chat. The frontend shows the current JSON and a wireframe preview, while the Express backend interprets natural language layout instructions and safely returns an updated layout.

## Prerequisites

- Node.js 18 or newer
- npm
- Anthropic API key for full LLM behavior

## Setup

```bash
cd layout-agent/server
npm install
copy .env.example .env
```

Edit `server/.env`:

```env
ANTHROPIC_API_KEY=your_key_here
PORT=3001
```

Then install the frontend:

```bash
cd ../client
npm install
```

On Windows PowerShell, if `npm` is blocked by the execution policy, use `npm.cmd`:

```bash
npm.cmd install
npm.cmd run dev
```

## Run Locally

Start the backend:

```bash
cd layout-agent/server
npm run dev
```

Start the frontend in another terminal:

```bash
cd layout-agent/client
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Try These Prompts

- Convert this design to 9:16
- Keep the product large
- Move the headline to the top
- Move the offer badge higher
- Make the headline smaller
- Change the headline color to red
- Make the discount badge bigger
- Center the product

## Tech Stack

- React + Vite frontend
- Express backend
- Anthropic Claude API
- Axios for API calls
- CSS-based wireframe preview

## Notes

The backend includes deterministic transforms for common layout math, such as aspect ratio conversion, moving nodes, resizing nodes, and changing colors. The LLM is used for broader natural-language reasoning, and every returned layout is validated before the frontend applies it.

## GitHub Progress Workflow

Commit after each useful milestone:

```bash
git add .
git commit -m "feat: add layout viewer"
git commit -m "feat: add chat interface"
git commit -m "feat: add backend layout endpoint"
git commit -m "feat: add deterministic transforms"
git commit -m "docs: add setup and approach notes"
```

## AWS Deployment Plan

- Deploy `client/` with AWS Amplify Hosting.
- Deploy `server/` with AWS Elastic Beanstalk or another Node.js hosting target.
- Store `ANTHROPIC_API_KEY` only as a backend environment variable.
- Set frontend `VITE_API_URL` to the deployed backend URL.
