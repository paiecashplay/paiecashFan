import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

export function Boutique() {
  return (
    <section className="relative min-h-[60vh] py-24">
      <Container className="text-center">
        <Badge variant="cyan">À venir — Phase B</Badge>
        <h1 className="mt-6 font-display text-display-xl font-bold tracking-tight">
          <span className="text-gradient-hero">Boutique</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-bone-300">
          Cette page accueillera la boutique officielle des clubs partenaires.
          Reprend les produits et le paiement Lyra de l'ancien site, avec le
          nouveau design system.
        </p>
      </Container>
    </section>
  );
}
