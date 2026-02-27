# LaneUp React - Modern Task Management Application

<div align="center">

  [![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
  [![Convex](https://img.shields.io/badge/Convex-1.27-purple.svg)](https://www.convex.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-cyan.svg)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
</div>

## Overview

LaneUp React is the React counterpart of the [LaneUp Vue](https://github.com/calebeaires/laneup) project. Same powerful task management, same real-time collaboration — just wearing a different jersey.

### Key Features

- **Real-time Collaboration** — Instant updates across all users thanks to Convex
- **Multiple Views** — Board (Kanban), List, Table, and Timeline
- **Advanced Filtering** — Filter by status, priority, assignees, labels, and more
- **Drag & Drop** — Intuitive task management
- **Rich Text Editor** — Full-featured text editing
- **File Attachments** — Upload and manage task attachments via Cloudflare R2
- **Comments & Activities** — Track all changes and discussions
- **Dark Mode** — Built-in theme support
- **Mobile Responsive** — Works seamlessly on all devices

## Tech Stack

### Frontend

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Jotai + Zustand
- **Routing**: React Router v7
- **Tables**: TanStack Table
- **Build Tool**: Vite 7

### Backend

- **Database**: Convex (real-time, serverless)
- **Authentication**: Clerk
- **File Storage**: Cloudflare R2
- **Payments**: Stripe

### Libraries

- **Icons**: Lucide React, Tabler Icons, Iconify
- **Dates**: date-fns
- **Commands**: cmdk
- **Animations**: tw-animate-css

## Installation

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- Convex account
- Clerk account

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/calebeaires/laneup-react.git
   cd laneup-react
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Variables**

   Copy the example and fill in your keys:

   ```bash
   cp .env.example .env
   ```

   Update the new `.env` with your keys:

   ```env
   # Convex
   VITE_CONVEX_URL=your_convex_deployment_url

   # Clerk
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

   # Optional: R2 for file uploads
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_ENDPOINT=your_endpoint
   R2_BUCKET=your_bucket_name
   ```

4. **Setup Convex**

   ```bash
   npx convex dev
   ```

5. **Run the development server**

   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. **Open your browser** at `http://localhost:5173`

## Project Structure

```
laneup-react/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Jotai atoms & Zustand stores
│   ├── pages/             # Route pages
│   ├── router/            # React Router config
│   ├── types/             # TypeScript types
│   ├── lib/               # Utilities and helpers
│   └── main.tsx           # App entry point
├── convex/
│   ├── _generated/        # Auto-generated Convex files
│   ├── modules/           # Domain modules
│   ├── schema.ts          # Database schema
│   └── schema.args.ts     # Schema value definitions
├── public/                # Static assets
└── package.json           # Project dependencies
```

## Deployment

### Build for Production

```bash
bun run build
# or
npm run build
```

### Deploy Convex Functions

```bash
npx convex deploy
```

### Deploy Frontend

The built files in `dist/` can be deployed to any static hosting service:

- Vercel
- Netlify
- Cloudflare Pages

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

> **Wait, you like Vue?** The original LaneUp was built with Vue 3 and it's still going strong.
> Check it out: [LaneUp Vue](https://github.com/calebeaires/laneup)

<div align="center">
  Made with ❤️ by the LaneUp Team
</div>
