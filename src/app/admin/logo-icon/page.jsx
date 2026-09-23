'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogoIconAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/setting/general');
  }, [router]);

  return null;
}
