import { ModerationQueue } from '@/components/moderation/ModerationQueue';

// Modération des salons Fan Club — vue super_admin (tous les clubs).
export function AdminModeration() {
  return (
    <div className="max-w-5xl">
      <ModerationQueue
        basePath="/api/v2/admin/moderation"
        title="Modération des salons"
        subtitle="Dossiers issus des signalements des supporters. Les signalants restent anonymes."
        showClub
      />
    </div>
  );
}
