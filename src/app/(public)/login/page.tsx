import { Suspense } from 'react'
import { signIn } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

// 1. Kita buat komponen kecil baru HANYA untuk menampilkan pesan.
// Ini mengisolasi bagian "dinamis" dari halaman.
function LoginMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-center text-red-600">
      {message}
    </p>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md p-8 space-y-6 bg-card border rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-2">
            <span className="text-white font-bold text-2xl">GP</span>
          </div>
          <h1 className="text-2xl font-bold text-center">Tenant Login</h1>
          <p className="text-center text-muted-foreground text-sm">
            Masuk ke akun cashflow Anda
          </p>
        </div>

        <form action={signIn} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              className="w-full px-3 py-2 border rounded-md bg-background border-border"
              name="email"
              type="email"
              placeholder="tenant@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              className="w-full px-3 py-2 border rounded-md bg-background border-border"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>

          {/* 2. Kita bungkus komponen pesan tadi dengan <Suspense>.
               Ini memberi tahu Next.js bahwa konten di dalamnya dinamis 
               dan harus ditunggu.
          */}
          <Suspense fallback={null}>
            <LoginMessage message={params.message} />
          </Suspense>
        </form>
      </div>
    </div>
  );
}