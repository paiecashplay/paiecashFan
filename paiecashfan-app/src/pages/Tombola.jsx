import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

export function Tombola() {
  return (
    <section className="relative min-h-[60vh] py-24">
      <Container className="text-center">
        <Badge variant="gold">À venir — Phase B</Badge>
        <h1 className="mt-6 font-display text-display-xl font-bold tracking-tight">
          <span className="text-gradient-hero">Tombola</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-bone-300">
          La tombola quotidienne avec compte à rebours, sponsors officiels et
          historique des tirages. Reprend les endpoints /api/tombola et /api/games.
        </p>
      </Container>
    </section>
  );
}
