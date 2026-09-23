import { redirect } from 'next/navigation';

export default function KycUnverifiedRedirectPage() {
  redirect('/admin/users');
}
