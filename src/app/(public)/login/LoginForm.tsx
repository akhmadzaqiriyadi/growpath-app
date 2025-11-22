'use client';

import { useState } from 'react';
import { signIn } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('LoginForm rendered, isLoading:', isLoading);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted, setting loading to true');
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      console.log('Calling signIn...');
      await signIn(formData);
      console.log('signIn completed');
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          className="w-full px-3 py-2 border rounded-md bg-background border-border disabled:opacity-50 disabled:cursor-not-allowed"
          name="email"
          type="email"
          placeholder="tenant@example.com"
          required
          disabled={isLoading}
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
          className="w-full px-3 py-2 border rounded-md bg-background border-border disabled:opacity-50 disabled:cursor-not-allowed"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
}
