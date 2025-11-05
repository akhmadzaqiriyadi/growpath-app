#!/bin/zsh
# =================================================================
# UTY GROWPATH - PROJECT STRUCTURE SETUP
# Run this script from your project root directory
# =================================================================

echo "🚀 Setting up UTY Growpath project structure..."

# =================================================================
# PART 1: CLEAN UP OLD STRUCTURE (OPTIONAL)
# =================================================================
echo "\n📦 Cleaning up old structure..."

# Remove old empty folders if they exist
rm -rf src/components/features/.gitkeep 2>/dev/null
rm -rf src/components/layout/.gitkeep 2>/dev/null
rm -rf src/components/ui/.gitkeep 2>/dev/null
rm -rf src/hooks/.gitkeep 2>/dev/null
rm -rf src/constants/index.ts 2>/dev/null

# =================================================================
# PART 2: CREATE NEW FOLDER STRUCTURE
# =================================================================
echo "\n📁 Creating new folder structure..."

# -------------------------------------------------------------
# App Routes Structure (Route Groups)
# -------------------------------------------------------------

# Public routes
mkdir -p src/app/(public)
mkdir -p src/app/(public)/login

# Admin routes (Dashboard UI)
mkdir -p src/app/(admin)/admin
mkdir -p src/app/(admin)/admin/dashboard
mkdir -p src/app/(admin)/admin/tenants
mkdir -p src/app/(admin)/admin/tenants/[id]
mkdir -p src/app/(admin)/admin/transactions
mkdir -p src/app/(admin)/admin/analytics
mkdir -p src/app/(admin)/admin/visitors
mkdir -p src/app/(admin)/admin/settings

# Tenant routes (PWA Mobile)
mkdir -p src/app/(tenant)/tenant
mkdir -p src/app/(tenant)/tenant/dashboard
mkdir -p src/app/(tenant)/tenant/setup
mkdir -p src/app/(tenant)/tenant/products
mkdir -p src/app/(tenant)/tenant/products/[id]
mkdir -p src/app/(tenant)/tenant/transactions
mkdir -p src/app/(tenant)/tenant/transactions/new
mkdir -p src/app/(tenant)/tenant/transactions/[id]
mkdir -p src/app/(tenant)/tenant/profile

# API routes
mkdir -p src/app/api/auth
mkdir -p src/app/api/tenants
mkdir -p src/app/api/products
mkdir -p src/app/api/transactions
mkdir -p src/app/api/analytics
mkdir -p src/app/api/visitors
mkdir -p src/app/api/upload

# -------------------------------------------------------------
# Components Structure
# -------------------------------------------------------------

# Admin components
mkdir -p src/components/admin/dashboard
mkdir -p src/components/admin/tenants
mkdir -p src/components/admin/transactions
mkdir -p src/components/admin/analytics
mkdir -p src/components/admin/layout

# Tenant components
mkdir -p src/components/tenant/dashboard
mkdir -p src/components/tenant/products
mkdir -p src/components/tenant/transactions
mkdir -p src/components/tenant/layout

# Shared/Common components
mkdir -p src/components/common/forms
mkdir -p src/components/common/tables
mkdir -p src/components/common/charts
mkdir -p src/components/common/modals
mkdir -p src/components/common/cards

# UI components (already exists from shadcn)
# mkdir -p src/components/ui

# -------------------------------------------------------------
# Library Structure
# -------------------------------------------------------------

# Actions (Server Actions)
mkdir -p src/lib/actions/auth
mkdir -p src/lib/actions/tenants
mkdir -p src/lib/actions/products
mkdir -p src/lib/actions/transactions
mkdir -p src/lib/actions/analytics

# Supabase (already exists)
# mkdir -p src/lib/supabase

# Utilities
mkdir -p src/lib/validations
mkdir -p src/lib/helpers
mkdir -p src/lib/constants

# -------------------------------------------------------------
# Hooks Structure
# -------------------------------------------------------------
mkdir -p src/hooks/admin
mkdir -p src/hooks/tenant
mkdir -p src/hooks/shared

# -------------------------------------------------------------
# Types Structure
# -------------------------------------------------------------
mkdir -p src/types/admin
mkdir -p src/types/tenant
mkdir -p src/types/api

# -------------------------------------------------------------
# Styles Structure (if needed)
# -------------------------------------------------------------
mkdir -p src/styles/admin
mkdir -p src/styles/tenant

# -------------------------------------------------------------
# Public Assets
# -------------------------------------------------------------
mkdir -p public/images/admin
mkdir -p public/images/tenant
mkdir -p public/images/common
mkdir -p public/icons

# =================================================================
# PART 3: CREATE ESSENTIAL FILES WITH BOILERPLATE
# =================================================================
echo "\n📝 Creating essential files..."

# -------------------------------------------------------------
# Route Group Layouts
# -------------------------------------------------------------

# Admin Layout
cat > src/app/\(admin\)/layout.tsx << 'EOF'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/tenant/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin layout will be added here */}
      {children}
    </div>
  )
}
EOF

# Tenant Layout
cat > src/app/\(tenant\)/layout.tsx << 'EOF'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'tenant') {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Tenant mobile layout will be added here */}
      {children}
    </div>
  )
}
EOF

# Public Layout
cat > src/app/\(public\)/layout.tsx << 'EOF'
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
EOF

# -------------------------------------------------------------
# Page Placeholders
# -------------------------------------------------------------

# Admin Dashboard
cat > src/app/\(admin\)/admin/dashboard/page.tsx << 'EOF'
export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome to UTY Growpath Admin Panel</p>
    </div>
  )
}
EOF

# Admin Tenants
cat > src/app/\(admin\)/admin/tenants/page.tsx << 'EOF'
export default function TenantsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Tenant Management</h1>
      <p className="text-muted-foreground mt-2">Manage all tenants here</p>
    </div>
  )
}
EOF

# Tenant Dashboard
cat > src/app/\(tenant\)/tenant/dashboard/page.tsx << 'EOF'
export default function TenantDashboardPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Your sales overview</p>
    </div>
  )
}
EOF

# Login Page
cat > src/app/\(public\)/login/page.tsx << 'EOF'
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center">Login</h1>
        <p className="text-center text-muted-foreground mt-2">
          UTY Growpath
        </p>
      </div>
    </div>
  )
}
EOF

# -------------------------------------------------------------
# Constants
# -------------------------------------------------------------

cat > src/lib/constants/index.ts << 'EOF'
// Business categories
export const BUSINESS_CATEGORIES = [
  'Kuliner',
  'Fashion',
  'Kerajinan',
  'Jasa',
  'Industri',
  'Bisnis Digital',
  'Other',
] as const

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number]

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: 'PEMASUKAN',
  EXPENSE: 'PENGELUARAN',
} as const

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TENANT: 'tenant',
} as const

// Currency formatter
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Date formatter
export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}
EOF

# -------------------------------------------------------------
# Validation Schemas (Zod will be added later)
# -------------------------------------------------------------

cat > src/lib/validations/index.ts << 'EOF'
// Validation schemas will be added here
// Using Zod for type-safe validation

export * from './tenant'
export * from './product'
export * from './transaction'
EOF

cat > src/lib/validations/tenant.ts << 'EOF'
// Tenant validation schemas
// TODO: Add Zod schemas
EOF

cat > src/lib/validations/product.ts << 'EOF'
// Product validation schemas
// TODO: Add Zod schemas
EOF

cat > src/lib/validations/transaction.ts << 'EOF'
// Transaction validation schemas
// TODO: Add Zod schemas
EOF

# -------------------------------------------------------------
# Type Definitions (will be updated after DB types)
# -------------------------------------------------------------

cat > src/types/admin/index.ts << 'EOF'
// Admin-specific types
export interface TenantWithStats {
  id: string
  full_name: string
  tenant_name: string
  npm: string
  business_category: string
  total_transactions: number
  total_revenue: number
}

export interface DashboardStats {
  totalTenants: number
  totalRevenue: number
  totalTransactions: number
  activeToday: number
}
EOF

cat > src/types/tenant/index.ts << 'EOF'
// Tenant-specific types
export interface ProductFormData {
  name: string
  description?: string
  price: number
  stock: number
  category?: string
}

export interface TransactionFormData {
  type: 'PEMASUKAN' | 'PENGELUARAN'
  items: TransactionItemFormData[]
  note?: string
}

export interface TransactionItemFormData {
  product_id: number
  quantity: number
}
EOF

# -------------------------------------------------------------
# README for structure
# -------------------------------------------------------------

cat > FOLDER_STRUCTURE.md << 'EOF'
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
EOF

echo "\n✅ Folder structure created successfully!"

# =================================================================
# PART 4: DISPLAY STRUCTURE
# =================================================================
echo "\n📊 Project Structure:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

tree -L 4 -I 'node_modules|.next|.git' src/ 2>/dev/null || find src -type d | sed 's|[^/]*/| |g'

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "\n✨ Setup complete! Check FOLDER_STRUCTURE.md for details"
echo "\n📌 Next steps:"
echo "   1. Update src/types/database.types.ts with new schema"
echo "   2. Build admin dashboard layout"
echo "   3. Build tenant mobile layout"
echo "   4. Add PWA configuration"
echo "\n🚀 Happy coding!"
