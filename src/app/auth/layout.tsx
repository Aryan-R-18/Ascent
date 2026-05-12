import { Suspense } from 'react';
import { Footer } from '@/components/layout/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1">
        <Suspense>{children}</Suspense>
      </div>
      <Footer />
    </div>
  );
}
