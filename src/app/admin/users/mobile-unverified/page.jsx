import { redirect } from 'next/navigation';

export default function AdminMobileUnverifiedUsersRedirectPage() {
  redirect('/admin/users');
}
