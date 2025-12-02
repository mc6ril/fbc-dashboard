This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

[![CI](https://github.com/mc6ril/fbc-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/mc6ril/fbc-dashboard/actions/workflows/ci.yml)

## Getting Started

### Prerequisites

-   Node.js 18+ installed
-   Yarn package manager (or npm/pnpm/bun)
-   Access to Supabase project (for authentication and database)

### Environment Variables Setup

Before running the development server, you need to configure environment variables for Supabase authentication.

1. **Create `.env.local` file** in the project root:

```bash
touch .env.local
```

2. **Add the following environment variables** to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Get your Supabase credentials**:

    - Go to your [Supabase Dashboard](https://app.supabase.com/)
    - Select your project (or create a new one)
    - Go to **Settings** → **API**
    - Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
    - Copy the **anon/public** key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Example values format**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

**⚠️ Security Note**: Never commit `.env.local` to git. This file contains sensitive credentials and is already included in `.gitignore`. If you need to share environment variable names with your team, use `.env.local.example` as a template (without actual values).

### Running the Development Server

Once environment variables are configured, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Code Conventions

- **Always use braces for control statements**: Avoid single-line `if` (and similar) without braces.

  Do not do:

  ```ts
  if (condition) result;
  ```

  Do:

  ```ts
  if (condition) {
      result;
  }
  ```

  This is enforced in code review and via ESLint (`curly: "all"`).

## Continuous Integration

This project uses GitHub Actions for CI/CD. The CI workflow runs automatically on:
- Pull requests targeting the `main` branch
- Pushes to the `main` branch

The workflow executes:
- Linting (ESLint)
- Tests (Jest)
- Build (Next.js)

See `.github/workflows/ci.yml` for the complete workflow configuration.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
