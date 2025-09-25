# Edge Tycoon

A visually stunning, retro-themed multiplayer property trading board game with CPU opponents, built on Cloudflare's edge network.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/albertxiao/edge-tycoon)

## 📖 About The Project

Edge Tycoon is a multiplayer, retro-themed digital board game inspired by classic property trading games like Monopoly. Built on Cloudflare's serverless platform, it offers a visually striking experience with a nostalgic, early-internet aesthetic. Players roll dice, move around a pixel-art board, purchase properties, collect rent, and aim to bankrupt their opponents.

The game supports both multiplayer gameplay against friends via a simple room code system and a single-player mode against a CPU opponent. All game state is managed centrally in a Cloudflare Durable Object, ensuring a consistent and synchronized experience for all players in a session. The user interface is designed to be a piece of interactive art, featuring neon color palettes, pixelated fonts, CRT scanline effects, and delightful 'glitch' animations, creating an immersive retro-gaming atmosphere.

## ✨ Key Features

*   **Retro-Futuristic Aesthetic:** Immerse yourself in a UI with neon glows, pixelated fonts, and CRT scanline effects.
*   **Classic Gameplay:** Roll the dice, buy properties, build your empire, and bankrupt your opponents.
*   **Local & Multiplayer:** Play in "hot-seat" mode locally, or create/join rooms to play with friends online.
*   **CPU Opponents:** Don't have friends available? Challenge our custom-built AI.
*   **Built on the Edge:** Powered by Cloudflare Workers and Durable Objects for a globally fast and synchronized experience.

## 🛠️ Technology Stack

This project is a monorepo containing both the frontend and backend, built with a modern, type-safe stack.

*   **Frontend:**
    *   [React](https://react.dev/)
    *   [Vite](https://vitejs.dev/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [shadcn/ui](https://ui.shadcn.com/)
    *   [Framer Motion](https://www.framer.com/motion/) for animations
    *   [Zustand](https://zustand-demo.pmnd.rs/) for client-side state management
*   **Backend:**
    *   [Hono](https://hono.dev/) on [Cloudflare Workers](https://workers.cloudflare.com/)
    *   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) for real-time state synchronization
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/) as the package manager and runtime
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up)
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated:
    ```sh
    bun install -g wrangler
    wrangler login
    ```

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/edge_tycoon.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd edge_tycoon
    ```
3.  Install dependencies:
    ```sh
    bun install
    ```

## 💻 Development

To start the local development server, which includes the Vite frontend and a local instance of the Cloudflare Worker, run:

```sh
bun run dev
```

This will typically start the frontend on `http://localhost:3000` and the local worker on a different port. The Vite development server is pre-configured to proxy API requests (`/api/*`) to the local worker, so everything works seamlessly.

## 🏗️ Project Structure

*   `src/`: Contains the React frontend application source code.
    *   `pages/`: Top-level page components.
    *   `components/`: Reusable UI components.
    *   `hooks/`: Custom React hooks, including the Zustand game store.
    *   `lib/`: Utility functions and constants.
*   `worker/`: Contains the Hono backend application for the Cloudflare Worker.
    *   `index.ts`: The main worker entry point (do not modify).
    *   `userRoutes.ts`: Where all API routes are defined.
    *   `durableObject.ts`: The implementation of the `GlobalDurableObject` for state management.
*   `shared/`: Contains TypeScript types and constants shared between the frontend and backend.

## ☁️ Deployment

Deploying the application to Cloudflare is a one-step process.

1.  Make sure you have logged in with `wrangler login`.
2.  Run the deploy script:
    ```sh
    bun run deploy
    ```

This command will build the frontend application, then deploy both the static assets and the worker (including the Durable Object) to your Cloudflare account.

Alternatively, you can deploy your own version of Edge Tycoon with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/albertxiao/edge-tycoon)