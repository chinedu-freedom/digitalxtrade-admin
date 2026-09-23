import { redirect } from 'next/navigation';

export default function KycDataRedirectPage() {
  redirect('/admin/users');
}
