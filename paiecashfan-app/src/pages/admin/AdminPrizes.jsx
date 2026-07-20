import { PrizeFulfillmentPanel } from '@/components/prizes/PrizeFulfillmentPanel';

// BO Super Admin — remise des lots gagnés (toutes tombolas, y compris plateforme).
export function AdminPrizes() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-black text-bone-50">Gains & lots à expédier</h1>
        <p className="text-sm text-bone-400 mt-1">Suis les lots gagnés, relance les gagnants sans adresse, saisis le suivi postal et marque l'expédition/la livraison.</p>
      </div>
      <PrizeFulfillmentPanel />
    </div>
  );
}
