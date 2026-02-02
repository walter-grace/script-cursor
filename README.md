# ScriptCursor

A specialized IDE for screenwriting with AI assistance, built with Next.js 15, Tiptap, and OpenRouter.

## Features

- 🎬 **Fountain Format Support**: Native screenplay editing with proper formatting
- 🤖 **AI-Powered Editing**: Cmd+K inline editing with multiple AI models
- 💬 **Context-Aware Chat**: Composer sidebar for full-document analysis
- 💾 **Auto-Save**: Automatic saving to NeonDB
- 🎨 **Modern UI**: Built with Shadcn UI and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Editor**: Tiptap with custom Fountain extensions
- **Database**: NeonDB (PostgreSQL) with Drizzle ORM
- **AI**: OpenRouter (Claude, DeepSeek, Gemini, Llama)
- **State**: Zustand
- **UI**: Shadcn UI + Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- NeonDB account (for database)
- OpenRouter API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd scriptcursor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file:
   ```env
   DATABASE_URL=your_neon_connection_string
   OPENROUTER_API_KEY=your_openrouter_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

Quick deploy to Vercel:

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Run `npm run db:push` locally with Vercel env vars, or use Neon SQL editor

## Project Structure

```
scriptcursor/
├── app/                    # Next.js app router
│   ├── actions/           # Server actions
│   ├── api/               # API routes
│   ├── editor/            # Editor pages
│   └── page.tsx           # Home page
├── components/
│   ├── ai/               # AI components (Cmd+K, Diff viewer)
│   ├── composer/         # Composer sidebar
│   ├── editor/           # Script editor
│   └── ui/               # Shadcn UI components
├── lib/
│   ├── ai/               # AI client and models
│   ├── db/               # Database schema and functions
│   ├── fountain/         # Fountain parser
│   ├── hooks/            # React hooks
│   ├── store/            # Zustand store
│   └── tiptap/           # Tiptap extensions
└── drizzle.config.ts     # Drizzle configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | NeonDB connection string | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL (auto-set in Vercel) | No |

## License

MIT

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tiptap Documentation](https://tiptap.dev)
- [Fountain Format](https://fountain.io)
- [OpenRouter Documentation](https://openrouter.ai/docs)
