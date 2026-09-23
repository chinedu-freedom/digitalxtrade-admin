'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogoFaviconPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/setting/general');
  }, [router]);

  return null;
}
