import { redirect } from 'next/navigation';

export default function UpgradePage(): never {
  redirect('/dashboard/settings/subscription');
}
