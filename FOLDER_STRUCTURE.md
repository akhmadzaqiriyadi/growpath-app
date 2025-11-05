# UTY Growpath - Folder Structure

## 📁 Directory Overview

```
src/
├── app/
│   ├── (admin)/              # Admin routes (Desktop Dashboard)
│   │   └── admin/
│   │       ├── dashboard/    # Admin overview
│   │       ├── tenants/      # CRUD tenants
│   │       ├── transactions/ # View all transactions
│   │       ├── analytics/    # Data exploration
│   │       └── settings/     # App settings
│   │
│   ├── (tenant)/             # Tenant routes (Mobile PWA)
│   │   └── tenant/
│   │       ├── dashboard/    # Sales overview
│   │       ├── setup/        # Initial product setup
│   │       ├── products/     # Manage products
│   │       ├── transactions/ # Record sales
│   │       └── profile/      # Tenant profile
│   │
│   ├── (public)/             # Public routes
│   │   └── login/            # Login page
│   │
│   └── api/                  # API routes
│       ├── auth/
│       ├── tenants/
│       ├── products/
│       └── transactions/
│
├── components/
│   ├── admin/                # Admin-only components
│   ├── tenant/               # Tenant-only components
│   ├── common/               # Shared components
│   └── ui/                   # shadcn/ui components
│
├── lib/
│   ├── actions/              # Server Actions
│   │   ├── auth/
│   │   ├── tenants/
│   │   ├── products/
│   │   └── transactions/
│   │
│   ├── supabase/             # Supabase clients
│   ├── validations/          # Zod schemas
│   ├── helpers/              # Utility functions
│   └── constants/            # App constants
│
├── hooks/                    # Custom React hooks
│   ├── admin/
│   ├── tenant/
│   └── shared/
│
└── types/                    # TypeScript types
    ├── admin/
    ├── tenant/
    └── api/
```

## 🎯 Routing Strategy

### Route Groups (parentheses)
- `(admin)` - Admin dashboard routes
- `(tenant)` - Tenant mobile app routes
- `(public)` - Public routes (no auth required)

### Why Route Groups?
- Separate layouts for admin vs tenant
- Better code organization
- Independent middleware/protection
- Cleaner URL structure

## 🔐 Authentication Flow

1. User visits `/login`
2. After login, middleware checks role:
   - Admin → redirect to `/admin/dashboard`
   - Tenant → redirect to `/tenant/dashboard`
3. Route group layouts enforce role-based access

## 📦 Component Organization

### Admin Components (`components/admin/`)
- Desktop-optimized
- Complex data tables
- Analytics charts
- Bulk operations

### Tenant Components (`components/tenant/`)
- Mobile-first design
- Touch-optimized
- Simplified forms
- Quick actions

### Common Components (`components/common/`)
- Reusable across both
- Forms, tables, modals
- Can be customized per role

## 🚀 Next Steps

1. ✅ Structure created
2. ⏳ Update database types
3. ⏳ Build admin dashboard
4. ⏳ Build tenant PWA
5. ⏳ Add PWA manifest
6. ⏳ Deploy

## 📝 Notes

- All server components by default (Next.js 15)
- Use 'use client' only when needed
- Server Actions for mutations
- Middleware handles auth checks
