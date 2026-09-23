import { redirect } from 'next/navigation';

export default function KycDataDirectRedirectPage() {
  redirect('/admin/users');
}
