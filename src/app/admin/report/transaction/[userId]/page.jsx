'use client';

import { useParams } from 'next/navigation';
import AdminTransactionLogsPage from '../../../reports/transactions/page';

export default function UserTransactionLogsFilterPage() {
  const routeParams = useParams();
  const userId = routeParams?.userId || null;

  return <AdminTransactionLogsPage userId={userId} />;
}
