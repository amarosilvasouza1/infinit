'use client';

import { AppProvider } from '@/contexts/AppContext';
import { MediaProvider } from '@/contexts/MediaContext';
import { CallProvider } from '@/contexts/CallContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import AuthGuard from '@/components/auth/AuthGuard';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppProvider>
        <MediaProvider>
          <ProfileProvider>
            <CallProvider>
              {children}
            </CallProvider>
          </ProfileProvider>
        </MediaProvider>
      </AppProvider>
    </AuthGuard>
  );
}
