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