'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '../components/PageLoader';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return <PageLoader />;
}
