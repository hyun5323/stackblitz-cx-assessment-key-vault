# Key Stash

A secure secrets management application with Pro subscription features powered by Stripe.

## Features

- **Secure Secret Storage**: Store and manage API keys, passwords, and other sensitive data
- **Free Tier**: Store up to 3 secrets
- **Pro Tier**: Unlimited secret storage with Stripe subscription
- **Authentication**: Email/password auth powered by Supabase
- **Real-time Updates**: Instant sync across sessions
- **Visibility Toggle**: Show/hide secret values for security

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Payments**: Stripe Checkout + Webhooks
- **Routing**: React Router v7

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth.tsx
│   ├── AuthGuard.tsx
│   ├── Header.tsx
│   ├── LoginForm.tsx
│   ├── PricingCard.tsx
│   ├── ProductCard.tsx
│   └── SubscriptionStatus.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useStripe.ts
│   ├── useSubscription.ts
│   └── useUserProfile.ts
├── lib/                # Core utilities
│   └── supabase.ts
├── pages/              # Route pages
│   ├── Dashboard.tsx
│   ├── Home.tsx
│   ├── Pricing.tsx
│   └── Success.tsx
└── stripe-config.ts    # Stripe product configuration
```

## Database Schema

### Tables

**user_profiles**
- `id` (uuid, FK to auth.users)
- `email` (text)
- `is_pro` (boolean)
- `stripe_customer_id` (text, nullable)
- `stripe_subscription_id` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**secrets**
- `id` (uuid)
- `user_id` (uuid, FK to auth.users)
- `project_name` (text)
- `key_label` (text)
- `secret_value` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Authenticated-only policies for data access

## Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How to Test "Pro" Features

1. Click the **"Upgrade to Pro"** button on the dashboard.
2. Use the Stripe Test Card: 4242 4242 4242 4242.
3. Once redirected back, verify the **"PRO"** badge appears and you can add more than 3 keys.

## Stripe Integration

### Edge Functions

**stripe-checkout**
- Creates Stripe Checkout sessions for Pro subscriptions
- Handles customer creation and session configuration

**stripe-webhook**
- Processes Stripe webhook events
- Updates user Pro status on successful subscription
- Handles subscription lifecycle events

### Webhook Configuration

Configure your Stripe webhook to point to:
```
https://your-project.supabase.co/functions/v1/stripe-webhook
```

Listen for events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Development

```bash
# Run dev server (auto-starts)
npm run dev

# Type checking
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

## Key Features Explained

### Secret Management
- Add, edit, and delete secrets
- Secrets are encrypted at rest in Supabase
- Toggle visibility to prevent shoulder surfing

### Subscription Tiers

**Free Tier**
- Up to 3 secrets
- Full CRUD operations
- Secure storage

**Pro Tier ($9.99/month)**
- Unlimited secrets
- All Free tier features
- Instant upgrade via Stripe Checkout

### Authentication Flow
1. User signs up with email/password
2. Profile automatically created in `user_profiles`
3. RLS policies restrict data access to authenticated user
4. Session persists across refreshes

### Payment Flow
1. User clicks "Upgrade to Pro"
2. Stripe Checkout session created via Edge Function
3. User completes payment
4. Webhook updates `is_pro` status
5. UI updates instantly, hiding upgrade button

## Security Considerations

- All secrets stored with RLS protection
- Stripe keys never exposed to frontend
- Edge Functions proxy all Stripe API calls
- CORS properly configured
- Authentication required for all data operations

## License

Private project - All rights reserved
