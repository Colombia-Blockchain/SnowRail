# Reset Database Guide

## Reset Database in Production (Render)

If you need to reset the database and start fresh (e.g., after migration issues), you have two options:

### Option 1: Using Render Shell (Recommended)

1. Go to your Render dashboard
2. Select your backend service
3. Click on "Shell" tab
4. Run the reset script:

```bash
cd /opt/render/project/src/backend
node scripts/reset-database.js
```

This will:
- Drop all tables and data
- Apply all migrations from scratch
- Give you a clean database

### Option 2: Manual Reset via Prisma CLI

1. Go to your Render dashboard
2. Select your backend service
3. Click on "Shell" tab
4. Run:

```bash
cd /opt/render/project/src/backend
npx prisma migrate reset --force --skip-seed
npx prisma migrate deploy
```

### Option 3: Reset via Render Database Dashboard

1. Go to your Render dashboard
2. Select your PostgreSQL database
3. Click on "Connect" → "Connect via psql"
4. Run:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then redeploy your backend service to apply migrations.

## Local Development

To reset your local database:

```bash
cd backend
node scripts/reset-database.js
```

Or:

```bash
cd backend
npx prisma migrate reset --force
npx prisma migrate deploy
```

## ⚠️ WARNING

**Resetting the database will DELETE ALL DATA!** Only do this if:
- You're in development/testing
- You have backups of important data
- You're okay with losing all existing data

