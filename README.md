# Fortiz Bank - Modern Digital Banking

<div align="center">
  <img src="public/fortiz.png" alt="Fortiz Bank Logo" width="120" height="120" />
  
  <h3>Professional, Secure, and Modern Banking</h3>
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
  [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-purple?style=flat-square)](https://ui.shadcn.com/)
  
</div>

---

## 🏦 About

**Fortiz Bank** is a full-featured digital banking application built with modern web technologies. It provides a comprehensive banking experience including account management, KYC verification, transfers, refunds, card services, and a complete admin dashboard.

---

## ✨ Key Features

- 🔐 **Secure Authentication** - Email/password with verification
- 📋 **KYC Verification** - Multi-step identity verification with document upload
- 💳 **Account Management** - Checking and savings accounts with real-time balances
- 💸 **Transfers** - Internal and external money transfers to 70+ US banks
- 🔄 **Refunds System** - Complete refund workflow with status tracking
- 💳 **Card Services** - Request and manage debit, credit, and prepaid cards
- 📊 **Analytics Dashboard** - Spending insights, charts, and transaction history
- 👨‍💼 **Admin Panel** - Complete management interface for administrators
- 🌓 **Dark/Light Theme** - Seamless theme switching with no hydration errors
- 📱 **Fully Responsive** - Mobile-first design for all devices
- 🎨 **Modern UI** - Professional banking-grade interface with shadcn/ui

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd web-banking

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

---

## 📖 Documentation

**For complete documentation, architecture, and feature details, see:**

👉 **[FORTIZ_BANK_COMPLETE_SUMMARY.md](./FORTIZ_BANK_COMPLETE_SUMMARY.md)**

This comprehensive guide covers:

- Complete feature list
- Database schema
- Project structure
- Security implementation
- API documentation
- Deployment instructions
- And much more!

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: shadcn/ui, Radix UI, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

---

## 📁 Project Structure

```
web-banking/
├── src/
│   ├── app/              # Next.js pages and routes
│   ├── components/       # React components (shadcn/ui)
│   ├── contexts/         # React Context providers
│   └── lib/              # Utilities and configurations
├── supabase/             # Database schemas and migrations
├── public/               # Static assets (logo, images)
└── FORTIZ_BANK_COMPLETE_SUMMARY.md  # 📚 Complete documentation
```

---

## 🔐 Security

- Row-Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- Email verification required
- Encrypted sensitive data (card details)
- Protected API routes
- Role-based access control (RBAC)

---

## 🎨 Design

- Professional banking-grade UI
- Consistent design system with shadcn/ui
- Accessible components (ARIA labels)
- Responsive mobile-first layout
- Dark/Light theme support
- Skeleton loaders for all async data

---

## 📞 Support

For questions or issues:

- Visit the [Contact Page](/contact)
- Email: support@fortizbank.com
- Phone: 1-800-FORTIZ-1

---

## 📄 License

Proprietary - Fortiz Bank © 2025

---

## 🌟 Highlights

✅ **30+ Testimonials** - Real customer reviews  
✅ **Zero ESLint Errors** - Clean, linted codebase  
✅ **100% TypeScript** - Fully type-safe  
✅ **Production Ready** - Deployable to Vercel  
✅ **Complete RLS** - Secure data access  
✅ **Mobile Optimized** - Perfect on all devices

---

<div align="center">
  <strong>Built with ❤️ using Next.js, Supabase, and shadcn/ui</strong>
</div>
