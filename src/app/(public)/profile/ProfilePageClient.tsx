'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
import { 
  User, 
  Store, 
  Mail, 
  Phone, 
  Calendar,
  LogOut,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Info,
  KeyRound,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updatePassword } from '@/app/auth/actions';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function ProfilePageClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalProducts: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const supabase = createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profileData || profileData.role !== 'tenant') {
      router.push('/login');
      return;
    }

    setProfile(profileData);

    // Get stats
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('tenant_id', user.id)
      .is('deleted_at', null);

    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('tenant_id', user.id)
      .is('deleted_at', null);

    if (transactions) {
      const income = transactions
        .filter(t => t.type === 'PEMASUKAN')
        .reduce((sum, t) => sum + t.total_amount, 0);
      
      const expense = transactions
        .filter(t => t.type === 'PENGELUARAN')
        .reduce((sum, t) => sum + t.total_amount, 0);

      setStats({
        totalIncome: income,
        totalExpense: expense,
        totalProducts: products?.length || 0,
        totalTransactions: transactions.length,
      });
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    const formData = new FormData();
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    const result = await updatePassword(formData);
    
    if (result.success) {
      setPasswordMessage({ type: 'success', text: result.message });
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } else {
      setPasswordMessage({ type: 'error', text: result.message });
    }
    
    setPasswordLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!profile) return null;

  const netIncome = stats.totalIncome - stats.totalExpense;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.full_name}</h1>
            <p className="text-primary-foreground/80 text-sm">{profile.email}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-primary-foreground/30">
          <p className="text-primary-foreground/80 text-xs mb-1">Net Cashflow</p>
          <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-white' : 'text-red-200'}`}>
            {formatCurrency(netIncome)}
          </p>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Informasi Usaha
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Nama Usaha</p>
              <p className="text-sm font-medium text-gray-900">{profile.tenant_name}</p>
            </div>
          </div>

          {profile.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Telepon</p>
                <p className="text-sm font-medium text-gray-900">{profile.phone}</p>
              </div>
            </div>
          )}

          {profile.business_category && (
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Kategori Usaha</p>
                <p className="text-sm font-medium text-gray-900">{profile.business_category}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Bergabung Sejak</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Ringkasan Statistik
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">Pemasukan</span>
            </div>
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(stats.totalIncome)}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700">Pengeluaran</span>
            </div>
            <p className="text-lg font-bold text-red-900">
              {formatCurrency(stats.totalExpense)}
            </p>
          </div>

          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary/80">Total Produk</span>
            </div>
            <p className="text-lg font-bold text-primary">{stats.totalProducts}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-purple-700">Transaksi</span>
            </div>
            <p className="text-lg font-bold text-purple-900">{stats.totalTransactions}</p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Informasi Akun
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{profile.role}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Terdaftar Sejak</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Ubah Password
          </h2>
          {!showPasswordForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordForm(true)}
            >
              Ubah
            </Button>
          )}
        </div>

        {passwordMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            passwordMessage.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {passwordMessage.text}
          </div>
        )}

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Password Baru</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPasswordForm(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordMessage(null);
                }}
                disabled={passwordLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={passwordLoading || newPassword.length < 8}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Password'
                )}
              </Button>
            </div>
          </form>
        )}

        {!showPasswordForm && (
          <p className="text-xs text-gray-500">
            Untuk keamanan akun, disarankan mengubah password secara berkala.
          </p>
        )}
      </div>

      {/* Logout Button */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Button
          onClick={handleLogout}
          disabled={loggingOut}
          variant="destructive"
          className="w-full"
          size="lg"
        >
          <LogOut className="h-5 w-5 mr-2" />
          {loggingOut ? 'Logging out...' : 'Keluar'}
        </Button>
      </div>

      {/* App Version Info */}
      <div className="text-center text-xs text-gray-400">
        <p>UTY Gropath App v1.0.0</p>
        <p>© 2024 All rights reserved</p>
      </div>
    </div>
  );
}
