'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, user, hasHydrated } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');

  // Redirect to dashboard if already logged in (after hydration)
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (user) {
      router.replace('/dashboard');
    }
  }, [user, hasHydrated]); // Removed router from deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(formData.email, formData.password);
      
      // Wait a moment to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if login was successful by verifying user state
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        router.push('/dashboard');
      } else {
        const errorMsg = useAuthStore.getState().error || 'Login failed. User not set after login.';
        setFormError(errorMsg);
        console.error('Login failed - user not set:', { currentUser, error: useAuthStore.getState().error });
      }
    } catch (err: any) {
      // Log full error details that persist
      console.error('=== LOGIN ERROR DETAILS ===');
      console.error('Error object:', err);
      console.error('Error message:', err?.message);
      console.error('Error response:', err?.response);
      console.error('Error response data:', err?.response?.data);
      console.error('Error response status:', err?.response?.status);
      console.error('==========================');
      
      // Get detailed error message
      const errorMessage = 
        err?.response?.data?.error || 
        err?.response?.data?.message ||
        err?.message || 
        'Login failed. Please check your credentials and try again.';
      
      // Set error in form (this will persist on screen)
      setFormError(errorMessage);
      
      // Also ensure store error is set
      if (!useAuthStore.getState().error) {
        useAuthStore.setState({ error: errorMessage });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to LioArcade
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || formError) && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm font-medium text-red-800">Error:</p>
              <p className="text-sm text-red-700 mt-1">{error || formError}</p>
              <p className="text-xs text-red-600 mt-2">Check the browser console (F12) for more details.</p>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}



