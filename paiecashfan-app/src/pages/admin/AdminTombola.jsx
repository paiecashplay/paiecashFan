import { TombolaManager } from '@/components/tombola/TombolaManager';

// Vue plateforme (super_admin) — toutes les tombolas.
export function AdminTombola() {
  return (
    <div className="max-w-5xl">
      <TombolaManager subtitle="Crée et gère les tombolas plateforme (tirage auto à la date de fin)." />
    </div>
  );
}
