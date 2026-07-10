import { Radio, Users, Heart, MessageCircle } from 'lucide-react';

export function LiveMatchBanner({ mode, match }) {

    return (

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex flex-wrap items-center justify-between gap-5">

                <div>

                    <div className="flex items-center gap-2 text-red-400">

                        <Radio size={18} />

                        <span className="text-xs font-black uppercase">
                            En direct
                        </span>

                    </div>

                    <h2 className="mt-3 text-3xl font-black text-bone-50">

                        {match.homeTeam}

                        <span className="mx-4 text-bone-500">
                            {match.homeScore} - {match.awayScore}
                        </span>

                        {match.awayTeam}

                    </h2>

                    <p className="mt-2 text-sm text-bone-400">

                        {match.competition} • {match.minute}'

                    </p>

                </div>

                <div className="grid grid-cols-3 gap-5">

                    <Stat
                        icon={<Users size={18}/>}
                        value={match.supporters}
                        label="Supporters"
                    />

                    <Stat
                        icon={<MessageCircle size={18}/>}
                        value={match.messages}
                        label="Messages"
                    />

                    <Stat
                        icon={<Heart size={18}/>}
                        value={match.reactions}
                        label="Réactions"
                    />

                </div>

            </div>

        </section>

    );

}

function Stat({ icon, value, label }) {

    return (

        <div className="rounded-2xl bg-white/[0.04] p-4 text-center">

            <div className="mb-2 flex justify-center text-emerald-400">

                {icon}

            </div>

            <p className="text-xl font-black text-bone-50">
                {value}
            </p>

            <p className="text-xs uppercase tracking-[0.15em] text-bone-500">
                {label}
            </p>

        </div>

    );

}