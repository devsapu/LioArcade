'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { User } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user: currentUser, logout } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [currentUser, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<{ user: User }>('/user/profile');
      setUser(response.data.user);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load profile';
      setError(errorMessage);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      // Don't set Content-Type header - let axios/browser handle it for FormData
      const response = await apiClient.post<{ user: User; imageUrl: string }>(
        '/user/profile/image',
        formData
      );

      setUser(response.data.user);
      // Update auth store with new user data
      useAuthStore.setState({ user: response.data.user });
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const response = await apiClient.delete<{ user: User }>('/user/profile/image');
      setUser(response.data.user);
      // Update auth store with new user data
      useAuthStore.setState({ user: response.data.user });
    } catch (err: any) {
      console.error('Failed to delete image:', err);
      setError(err.response?.data?.error || 'Failed to delete image');
    } finally {
      setIsUploading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const displayUser = user || currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Logo size="md" href="/dashboard" />
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 dark:text-gray-300">Profile</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">⏳</div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profile Image Section */}
              <div className="border-b pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Image</h2>
                <div className="flex items-center space-x-6">
                  <Avatar
                    src={displayUser.profileImage}
                    username={displayUser.username}
                    size="xl"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a profile image to personalize your account. JPG, PNG, GIF, or WEBP (max 5MB)
                    </p>
                    <div className="flex space-x-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="profile-image-input"
                        disabled={isUploading}
                      />
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (!isUploading && fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        isLoading={isUploading}
                        disabled={isUploading}
                      >
                        {displayUser.profileImage ? 'Change Image' : 'Upload Image'}
                      </Button>
                      {displayUser.profileImage && (
                        <Button
                          variant="secondary"
                          onClick={handleDeleteImage}
                          disabled={isUploading}
                        >
                          Remove Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information Section */}
              <div className="border-b pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">{displayUser.username}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{displayUser.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 capitalize">{displayUser.role.toLowerCase()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {displayUser.createdAt
                          ? new Date(displayUser.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
