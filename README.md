# PingVirtual - Step 1 (Scaffold + Auth)

## What's in this step
- Next.js 14 App Router project
- Tailwind CSS styling
- Supabase email/password auth (signup, login, logout)
- A protected `/dashboard` route (middleware redirects logged-out users to `/login`)
- No database tables, no wallet, no SMS providers yet - that's the next steps

## Setup in Termux

```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts git -y
node -v   # confirm it installed
```

Unzip the project (assuming it downloaded to your Downloads folder):

```bash
cd ~
unzip /sdcard/Download/pingvirtual.zip -d pingvirtual
cd pingvirtual
```

Install dependencies:

```bash
npm install
```

Set up your environment file:

```bash
cp .env.local.example .env.local
```

Now open `.env.local` (e.g. `nano .env.local`) and fill in your Supabase URL and anon key - you'll get these from your Supabase project's Settings > API page after running the SQL I'm giving you separately.

Run it locally:

```bash
npm run dev
```

Open the printed `http://localhost:3000` link in your phone's browser.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Step 1: scaffold + auth"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pingvirtual.git
git push -u origin main
```

## Deploying to Vercel
1. Go to vercel.com, "Add New Project", import the `pingvirtual` GitHub repo.
2. In the project's Environment Variables settings, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as your `.env.local`).
3. Deploy.

## Before you run this
You need a Supabase project first (free tier is fine): create one at supabase.com, then run the SQL I'm sending in the next message in the Supabase SQL Editor. Come back and tell me once both the app runs locally and you can sign up + land on `/dashboard` - then we move to Step 2 (wallet + orders schema).
