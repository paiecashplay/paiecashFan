// BO Super Admin — Paramètres plateforme
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

export function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(null);
  const [toast, setToast]       = useState('');

  useEffect(() => {
    apiFetch('/api/v2/admin/settings')
      .then((json) => setSettings(json.data?.settings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function save(key, value) {
    setSaving(key);
    try {
      await apiFetch(`/api/v2/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value, adminId: 'super_admin' })
      });
      setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value } : s));
      setToast('Sauvegardé');
      setTimeout(() => setToast(''), 2000);
    } catch (e) {
      setToast('Erreur : ' + e.message);
      setTimeout(() => setToast(''), 3000);
    }
    setSaving(null);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-black text-bone-50">Paramètres</h1>
        <p className="text-sm text-bone-400 mt-1">Configuration de la plateforme</p>
      </div>

      {toast && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
          {toast}
        </div>
      )}

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          : settings.length === 0
            ? <p className="text-sm text-bone-500 py-8 text-center">Aucun paramètre configuré</p>
            : settings.map((s) => (
                <SettingRow key={s.key} setting={s} saving={saving === s.key} onSave={save} />
              ))
        }
      </div>
    </div>
  );
}

function SettingRow({ setting, saving, onSave }) {
  const [value, setValue] = useState(String(setting.value ?? ''));
  const dirty = value !== String(setting.value ?? '');

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-ink-800/40 px-5 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-bone-200 font-mono">{setting.key}</p>
        {setting.description && <p className="text-[11px] text-bone-500 mt-0.5">{setting.description}</p>}
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-40 h-9 px-3 rounded-lg border border-white/10 bg-ink-900/60 text-sm text-bone-100 focus:outline-none focus:border-emerald-500/40 font-mono"
      />
      <button
        onClick={() => onSave(setting.key, value)}
        disabled={!dirty || saving}
        className="h-9 w-9 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 grid place-items-center transition-colors disabled:opacity-30"
      >
        {saving
          ? <span className="h-3.5 w-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          : <Save size={13} />
        }
      </button>
    </div>
  );
}
