# Backend

E-Commerce Enterprise Template - Backend API

## Environment Setup

### 1. Copy the example environment file

```bash
cp .env.example .env
```

### 2. Configure your secrets

The `.env` file contains all required environment variables. Here's what each secret is for:

| Variable | Purpose | How to Rotate |
|----------|---------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | Regenerate from Supabase dashboard |
| `JWT_SECRET` | Signs JWT tokens for auth | Generate new random 32+ char string |
| `STRIPE_SECRET_KEY` | Stripe API access | From Stripe Dashboard → Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | Client-side Stripe | From Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Validates Stripe webhooks | Regenerate in Stripe Dashboard → Webhooks |
| `GOOGLE_CLIENT_ID` | Google OAuth | From Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | From Google Cloud Console → APIs & Services → Credentials |
| `CLOUDINARY_API_KEY` | Image uploads | From Cloudinary Dashboard → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Image uploads | From Cloudinary Dashboard → Settings → API Keys |
| `RESEND_API_KEY` | Email sending | From Resend.com → API Keys |
| `VERIFACTU_API_KEY` | Spanish invoicing | From Verifactu provider |

### 3. Secret Rotation

When rotating secrets:

1. Generate new secret value
2. Update `.env` file (never commit this file)
3. Restart the server
4. Test that the service still works

### 4. Pre-commit Protection

This project uses [Lefthook](https://github.com/evilmartians/lefthook) to prevent accidentally committing `.env` files. The pre-commit hook checks if any `.env` file is staged and blocks the commit if so.

To manually install the hook:
```bash
npx lefthook install
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Architecture

See `ARCHITECTURE.md` in the project root for full architecture documentation.