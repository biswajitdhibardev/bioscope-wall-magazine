'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submit
    setTimeout(() => {
      setIsSubmitting(false);
      setToast({ message: 'Password updated successfully', type: 'success' });
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <Card className="p-6 bg-[#141414] border-[#262626]">
        <h2 className="text-lg font-medium text-white mb-1">Site Information</h2>
        <p className="text-sm text-gray-400 mb-6">General information about the platform.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Site Name</label>
            <div className="w-full px-4 py-2 bg-[#262626] border border-[#333] rounded-md text-gray-300 cursor-not-allowed">
              Bioscope Wall Magazine
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <div className="w-full px-4 py-2 bg-[#262626] border border-[#333] rounded-md text-gray-300 cursor-not-allowed min-h-[80px]">
              Premium QR-accessible art exhibition and live feedback platform.
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-[#141414] border-[#262626]">
        <h2 className="text-lg font-medium text-white mb-1">Security</h2>
        <p className="text-sm text-gray-400 mb-6">Update your admin password.</p>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="Current Password" type="password" required />
          <Input label="New Password" type="password" required />
          <Input label="Confirm New Password" type="password" required />
          
          <div className="pt-2">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white shadow-lg`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
