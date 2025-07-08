# Clerk Authentication Setup Guide

## Quick Setup (5 minutes)

1. **Create a Clerk Account**
   - Go to https://clerk.com and sign up
   - Create a new application
   - Choose "Next.js" as your framework

2. **Get Your API Keys**
   - In your Clerk Dashboard, go to "API Keys"
   - Copy the following keys:
     - Publishable Key (starts with `pk_`)
     - Secret Key (starts with `sk_`)

3. **Update Your .env File**
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
   CLERK_SECRET_KEY=your_secret_key_here
   ```

4. **Set Up Webhook (Optional but Recommended)**
   - In Clerk Dashboard, go to "Webhooks"
   - Add endpoint: `https://your-domain.com/api/webhook/clerk`
   - For local development: Use ngrok or similar
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret to `.env`:
     ```bash
     CLERK_WEBHOOK_SECRET=your_webhook_secret_here
     ```

5. **Configure Authentication Settings**
   - In Clerk Dashboard, go to "User & Authentication"
   - Enable email/password authentication
   - Optionally enable social logins (Google, Facebook, etc.)
   - Set up your branding and colors

## Testing Authentication

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Visit http://localhost:3000
3. Click "Get Started" to sign up
4. After signing up, you'll be redirected to the onboarding page
5. Select your role (Student, Parent, or Teacher)
6. You'll be redirected to the dashboard

## Features Implemented

- ✅ Sign up/Sign in pages
- ✅ User onboarding flow
- ✅ Role selection (Student, Parent, Teacher)
- ✅ Protected routes
- ✅ User dashboard
- ✅ Database sync with Clerk users
- ✅ Webhook integration
- ✅ Navigation bar with user menu

## Next Steps

1. **Parent-Child Relationships**
   - Parents can create child accounts
   - Children can't sign up directly
   - Parent dashboard to manage children

2. **Exercise Components**
   - Build 40+ interactive exercise types
   - Progress tracking
   - Real-time feedback

## Troubleshooting

- **"Invalid API Key"**: Make sure you copied the correct keys and restarted the dev server
- **Redirect loops**: Check that your URLs in `.env` match your actual routes
- **User not syncing**: Verify webhook is configured correctly