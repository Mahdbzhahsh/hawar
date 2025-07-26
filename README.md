# Patient Management System

A Next.js application for managing patient records with authentication via Supabase.

## Database Setup

To ensure the application works correctly with Supabase, you need to create the required database table:

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to the SQL Editor
4. Create a new query and paste the contents of `src/lib/create-patients-table.sql`
5. Run the query to create the patients table with proper permissions

Alternatively, you can run the setup script:

```bash
npm run setup-db
```

## Authentication

The application supports two authentication methods:

1. **Admin login**: Use username `admin` and password `root` for a quick demo
2. **Supabase authentication**: For regular users with email/password

Both authentication methods now store data in Supabase, ensuring data persistence across devices and sessions.

## Environment Variables

The application uses the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://guuhuookghgjwfljsolq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dWh1b29rZ2hnandmbGpzb2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDI5NjksImV4cCI6MjA2OTAxODk2OX0.yd1XGuSydXY7rAZPvHMVLPPG0zD-rPJgqLmrmKGvZFM
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Troubleshooting

If you're experiencing issues with data persistence:

1. Make sure the patients table is created in your Supabase database
2. Check that Row Level Security policies are properly set up
3. Verify that your Supabase URL and API key are correct
4. Ensure you're properly authenticated before trying to add/edit patients
5. If you recently updated from a previous version, run the SQL script again to update the table structure