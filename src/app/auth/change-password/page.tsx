import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: { required?: string; error?: string };
}) {
  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const isRequired = searchParams.required === 'true';
  const error = searchParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isRequired ? 'Password Reset Required' : 'Change Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRequired 
              ? 'For security reasons, you must change your default password before accessing the system.'
              : 'Update your password to keep your account secure.'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-8">
          <ChangePasswordForm isRequired={isRequired} />
        </div>

        {isRequired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-xs text-center">
              ⚠️ You cannot access the dashboard until you change your password
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
