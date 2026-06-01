import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

export function FanClub() {
  return (
    <section className="relative min-h-[60vh] py-24">
      <Container className="text-center">
        <Badge variant="indigo">À venir — Phase B</Badge>
        <h1 className="mt-6 font-display text-display-xl font-bold tracking-tight">
          <span className="text-gradient-hero">Fan club</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-bone-300">
          Chat exclusif entre fans, événements VIP, rencontres avec les joueurs.
          Reprend le flux Whaazs / costreaming de l'ancien site.
        </p>
      </Container>
    </section>
  );
}
