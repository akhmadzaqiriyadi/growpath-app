import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, XCircle, Database } from 'lucide-react'

export default async function TestConnectionPage() {
  let connectionStatus = {
    connected: false,
    message: '',
    details: null as any
  }

  try {
    const supabase = await createClient()
    
    // Test basic connection by checking auth status
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }
    
    // If we can call the API without errors, connection is successful
    connectionStatus = {
      connected: true,
      message: 'Supabase connection successful!',
      details: {
        status: 'Connected',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        authenticated: !!session,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: any) {
    connectionStatus = {
      connected: false,
      message: 'Failed to connect to Supabase',
      details: {
        status: 'Error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="size-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Supabase Connection Test
            </h1>
          </div>

          <div className="space-y-6">
            <div className={`flex items-start gap-4 p-6 rounded-lg border-2 ${
              connectionStatus.connected 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-500' 
                : 'bg-red-50 dark:bg-red-950/20 border-red-500'
            }`}>
              {connectionStatus.connected ? (
                <CheckCircle2 className="size-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h2 className={`text-xl font-semibold mb-2 ${
                  connectionStatus.connected 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {connectionStatus.message}
                </h2>
                <p className={`text-sm ${
                  connectionStatus.connected 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {connectionStatus.connected 
                    ? 'Your application is successfully connected to Supabase.' 
                    : 'Unable to establish connection. Please check your configuration.'}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Connection Details
              </h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-semibold ${
                    connectionStatus.connected 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {connectionStatus.details?.status}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Authenticated:</span>
                  <span className={`font-semibold ${
                    connectionStatus.details?.authenticated 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {connectionStatus.details?.authenticated ? 'Yes' : 'No (Guest)'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Supabase URL:</span>
                  <span className="text-foreground truncate ml-4 max-w-xs">
                    {connectionStatus.details?.url || 'Not configured'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="text-foreground">
                    {connectionStatus.details?.timestamp}
                  </span>
                </div>
                {connectionStatus.details?.error && (
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-2">Error:</span>
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded p-3 text-red-800 dark:text-red-200">
                      {connectionStatus.details.error}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
                Setup Instructions
              </h3>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Create a Supabase project at <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">supabase.com</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Copy your project URL and anon key from Settings → API</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Add them to your <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env.local</code> file</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Restart your development server</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}