## Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query, React Hook Form, Zod, and Axios.
- **Backend**: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL, bcryptjs, and JSON Web Tokens (JWT).

## Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database (e.g., Supabase, Neon, or local instance)

## Getting Started

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

#### Environment Variables

Create a `.env` file in the `backend` directory based on your environment. Here are the expected variables:

```env
PORT=3001
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
JWT_SECRET=your_jwt_secret_key_here
```

#### Database Configuration

Run the Drizzle schema push to initialize or update your database schema automatically:

```bash
npm run db:push
```

#### Start the Backend Server

```bash
npm run dev
```

By default, the backend runs on `http://localhost:3001`.

### 2. Frontend Setup

Open a new terminal session, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

#### Environment Variables

Create a `.env` file in the `frontend` directory based on your environment. Here are the expected variables:

```env
VITE_API_BASE_URL=http://localhost:3001


#### Start the Frontend Server

```bash
npm run dev
```

Vite will start the development server, typically accessible at `http://localhost:5173`.

---

## Available Commands

### Backend

- `npm run dev` - Starts the backend server with hot-reloading using `nodemon`.
- `npm run build` - Compiles the TypeScript backend into JavaScript in the `dist` folder.
- `npm run start` - Runs the compiled production code.
- `npm run db:push` - Synchronizes your local Drizzle schema with the remote PostgreSQL database.

### Frontend

- `npm run dev` - Starts the Vite development server.
- `npm run build` - Type-checks and creates an optimized production build.
- `npm run preview` - Previews the built application locally.
- `npm run lint` - Runs ESLint.
