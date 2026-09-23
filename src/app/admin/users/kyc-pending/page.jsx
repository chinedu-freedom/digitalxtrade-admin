import { redirect } from 'next/navigation';

export default function KycPendingRedirectPage() {
  redirect('/admin/users');
}
