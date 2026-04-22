# Bias Auditor

Bias Auditor is a React + TypeScript app that analyzes writing for potential bias across four lenses:

- Political framing
- Gender language
- Emotional loading
- Logical fallacy

The app highlights flagged phrases, provides explanations, suggests neutral rewrites, and includes a counter-bias coaching point.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a local env file and add your API key:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run test:run` - Run tests
