// Modale d'import depuis API-Football.
// Deux usages :
//   • Global (BO clubs)   : sans tenantId → crée/complète un club par slug
//   • Par club (AdminClubEdit) : avec tenantId → complète CE club
//
// Non destructif côté serveur : ne remplit que les champs vides et n'ajoute
// que les joueurs absents.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Loader2, Check, X, AlertTriangle, Trophy } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/cn';

export function ImportFromFootball({ tenantId = null, onClose, onImported }) {
  const [query, setQuery]       = useState('');
  const [searching, setSearch]  = useState(false);
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [result, setResult]     = useState(null);   // résumé import
  const [error, setError]       = useState('');

  async function runSearch(e) {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) { setError('Saisis au moins 2 caractères'); return; }
    setError(''); setResult(null); setSearch(true); setSearched(false);
    try {
      const json = await apiFetch(`/api/v2/admin/clubs-crud/football-search?q=${encodeURIComponent(q)}`);
      if (!json.success) throw new Error(json.error);
      setResults(json.data.teams || []);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Recherche échouée');
    } finally {
      setSearch(false);
    }
  }

  async function runImport(team) {
    setImportingId(team.id); setError(''); setResult(null);
    try {
      const json = await apiFetch('/api/v2/admin/clubs-crud/import-from-football', {
        method: 'POST',
        body: JSON.stringify({ teamId: team.id, tenantId })
      });
      if (!json.success) throw new Error(json.error);
      setResult(json.data);
      onImported?.(json.data);
    } catch (err) {
      setError(err.message || 'Import échoué');
    } finally {
      setImportingId(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 grid place-items-center text-emerald-400 shrink-0">
            <Download size={16} />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-bone-50">Importer depuis API-Football</h3>
            <p className="text-xs text-bone-400">
              {tenantId
                ? 'Complète ce club avec les données officielles (champs vides + nouveaux joueurs).'
                : 'Recherche un club et importe ses données dans la base.'}
            </p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg border border-white/10 text-bone-400 hover:text-bone-100 grid place-items-center">
            <X size={14} />
          </button>
        </div>

        {/* Recherche */}
        <form onSubmit={runSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom du club (ex: Olympique Lyonnais)"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40"
            />
          </div>
          <button type="submit" disabled={searching}
            className="h-10 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors inline-flex items-center gap-2">
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Rechercher
          </button>
        </form>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 flex items-center gap-2">
            <X size={13} /> {error}
          </div>
        )}

        {/* Résultat d'import (succès) */}
        {result && (
          <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <Check size={15} /> {result.tenant.name} importé
            </div>
            <ul className="text-xs text-bone-300 space-y-1">
              <li>• Champs complétés : {result.filledFields.length ? result.filledFields.join(', ') : 'aucun (déjà remplis)'}</li>
              <li>• Joueurs ajoutés : <strong className="text-bone-100">{result.playersAdded}</strong>{result.playersSkipped ? ` (${result.playersSkipped} déjà présents)` : ''}</li>
            </ul>
            {result.warnings?.length > 0 && (
              <ul className="pt-1 space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-[11px] text-amber-400/80 flex items-start gap-1.5">
                    <AlertTriangle size={11} className="mt-0.5 shrink-0" /> {w}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={onClose} className="mt-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors">
              Terminé
            </button>
          </div>
        )}

        {/* Résultats de recherche */}
        {!result && searched && results.length === 0 && (
          <p className="py-8 text-center text-sm text-bone-500">Aucun club trouvé pour « {query} ».</p>
        )}

        {!result && results.length > 0 && (
          <div className="space-y-2">
            {results.map((team) => (
              <div key={team.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                {team.logo
                  ? <img src={team.logo} alt="" className="h-10 w-10 rounded-lg object-contain bg-white/5 shrink-0" />
                  : <div className="h-10 w-10 rounded-lg bg-white/5 grid place-items-center text-bone-500 shrink-0"><Trophy size={16} /></div>}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-bone-100 text-sm truncate">{team.name}</p>
                  <p className="text-[11px] text-bone-500">
                    {[team.country, team.founded && `fondé ${team.founded}`, team.stadium].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  onClick={() => runImport(team)}
                  disabled={importingId !== null}
                  className="shrink-0 h-9 px-3 rounded-xl bg-gradient-hero text-xs font-bold text-white hover:opacity-90 disabled:opacity-40 transition-all inline-flex items-center gap-1.5"
                >
                  {importingId === team.id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  Importer
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
