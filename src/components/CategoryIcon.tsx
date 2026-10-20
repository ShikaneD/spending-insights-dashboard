import { getIcon } from '../lib/maps';

export function CategoryIcon({ name, color }: { name: string; color: string }) {
  const Icon = getIcon(name);
  return <Icon aria-hidden="true" size={18} color={color} />;
}
