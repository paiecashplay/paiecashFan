import { Gift, Heart, Share2, UserPlus } from 'lucide-react';

export function LiveQuickActions({ mode = 'club', club, onReact, fanPoints = 0}) {

    const handleShare = async () => {
                const shareData = {
                title: `Fan Club - ${club.name}`,
                text: `Rejoins le Fan Club de ${club.name} sur PaieCashFan`,
                url: window.location.href
                };

                try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Lien copié dans le presse-papiers');
                }
                } catch {
                // partage annulé
                }
    }

    const handleInvite = async () => {
                const inviteUrl = `${window.location.origin}/fan-club?mode=${mode}`;

                try {
                await navigator.clipboard.writeText(inviteUrl);
                alert('Lien d’invitation copié');
                } catch {
                alert('Impossible de copier le lien');
                }
    }

  return (
    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {/* Réagir */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{
            background: `${club.primaryColor}22`,
            color: club.primaryColor
            }}
        >
            <Heart size={18} />
        </div>

        <h3 className="mt-3 text-sm font-black text-bone-50">
            Réagir
        </h3>

        <div className="mt-3 flex gap-2">
            {['🔥', '👏', '❤️', '😂'].map((emoji) => (
            <button
                key={emoji}
                onClick={() => onReact?.(emoji)}
                aria-label={`Réagir avec ${emoji}`}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:scale-110"
            >
                {emoji}
            </button>
            ))}
        </div>
        </div>

        {/* Partager */}
        <button
            type="button"
            onClick={handleShare}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"
        >
            <Share2 size={18} className="text-sky-400" />
            <h3 className="mt-3 text-sm font-black text-bone-50">
                Partager
            </h3>
            <p className="mt-1 text-xs text-bone-500">
                Partager le Fan Club
            </p>
        </button>

        {/* Inviter */}
        <button
            type="button"
            onClick={handleInvite}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"
            >
            <UserPlus size={18} className="text-emerald-400" />
            <h3 className="mt-3 text-sm font-black text-bone-50">
                {mode === 'club' ? 'Inviter' : 'Inviter mes amis'}
            </h3>
            <p className="mt-1 text-xs text-bone-500">
                {mode === 'club'
                ? 'Copier le lien du Fan Club'
                : 'Copier le lien du salon privé'}
            </p>
        </button>

        {/* Récompenses */}
        <button 
            type="button"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]">
            <Gift size={18} className="text-yellow-400" />
            <h3 className="mt-3 text-sm font-black text-bone-50">
                Récompenses
            </h3>
            <p className="mt-1 text-xs text-bone-500">
                {fanPoints} Fan Points gagnés
            </p>
        </button>

    </section>);
}