import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Save,
  Upload,
} from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { useImageUpload } from '@/hooks/useImageUpload';

const EMPTY_FORM = {
  name: '',
  slug: '',
  short_name: '',
  description: '',
  image_url: '',
  logo_url: '',
  event_type: '',
  sport: '',
  organizer: '',
  start_date: '',
  end_date: '',
  location_name: '',
  city: '',
  host_countries: '',
  venue: '',
  source_name: '',
  source_url: '',
  status: 'upcoming',
  is_published: false,
  display_order: 0,
};

function slugifyEvent(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getMinDateTime() {
  const now = new Date();

  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  return now.toISOString().slice(0, 16);
}

function toInputDate(value) {
  if (!value) return '';

  try {
    const date = new Date(value);

    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    return date.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const { uploadImage, uploading } = useImageUpload();

  const imageRef = useRef(null);
  const logoRef = useRef(null);

  async function loadEvents() {
    setLoading(true);
    setError('');

    try {
      const json = await apiFetch('/api/v2/admin/events');

      setEvents(json?.data || []);
    } catch (err) {
      console.error('Erreur chargement événements :', err);

      setError(
        err?.message || 'Impossible de charger les événements.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function setField(field) {
    return (e) => {
      const value =
        e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value;

      setForm((prev) => {
        const next = {
          ...prev,
          [field]: value,
        };

        if (field === 'name' || field === 'short_name') {
          const source =
            field === 'short_name'
              ? value || prev.name
              : prev.short_name || value;

          next.slug = slugifyEvent(source);
        }

        return next;
      });

      setFieldErrors((prev) => ({
        ...prev,
        [field]: false,
      }));
    };
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError('');
    setFormOpen(true);
  }

  function openEdit(event) {
    setEditingId(event.id);
    setFieldErrors({});
    setError('');

    setForm({
      name: event.name || '',
      slug: event.slug || '',
      short_name: event.short_name || '',
      description: event.description || '',
      image_url: event.image_url || '',
      logo_url: event.logo_url || '',
      event_type: event.event_type || '',
      sport: event.sport || '',
      organizer: event.organizer || '',
      start_date: toInputDate(event.start_date),
      end_date: toInputDate(event.end_date),
      location_name: event.location_name || '',
      city: event.city || '',
      host_countries: Array.isArray(event.host_countries)
        ? event.host_countries.join(', ')
        : '',
      venue: event.venue || '',
      source_name: event.source_name || '',
      source_url: event.source_url || '',
      status: event.status || 'upcoming',
      is_published: Boolean(event.is_published),
      display_order: event.display_order || 0,
    });

    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError('');
  }

  async function handleImageUpload(file) {
    if (!file) return;

    try {
      setError('');

      const url = await uploadImage(file, 'events');

      if (url) {
        setForm((prev) => ({
          ...prev,
          image_url: url,
        }));
      }
    } catch (err) {
      console.error('Erreur upload image :', err);

      setError(
        err?.message ||
          "Impossible d'uploader l'image de l'événement."
      );
    } finally {
      if (imageRef.current) {
        imageRef.current.value = '';
      }
    }
  }

  async function handleLogoUpload(file) {
    if (!file) return;

    try {
      setError('');

      const url = await uploadImage(file, 'events-logos');

      if (url) {
        setForm((prev) => ({
          ...prev,
          logo_url: url,
        }));
      }
    } catch (err) {
      console.error('Erreur upload logo :', err);

      setError(
        err?.message ||
          "Impossible d'uploader le logo de l'événement."
      );
    } finally {
      if (logoRef.current) {
        logoRef.current.value = '';
      }
    }
  }

  function validateForm() {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = 'Le nom est obligatoire.';
    }

    if (!form.event_type) {
      errors.event_type = "Le type d'événement est obligatoire.";
    }

    if (!form.start_date) {
      errors.start_date = 'La date de début est obligatoire.';
    }

    if (form.start_date) {
      const selectedStart = new Date(form.start_date);
      const now = new Date();

      if (!editingId && selectedStart < now) {
        errors.start_date =
          'La date de début ne peut pas être dans le passé.';
      }
    }

    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);

      if (end < start) {
        errors.end_date =
          'La date de fin doit être postérieure à la date de début.';
      }
    }

    return errors;
  }

  async function submit(e) {
    e.preventDefault();

    setError('');

    const errors = validateForm();

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(
        'Veuillez corriger les champs indiqués en rouge.'
      );

      return;
    }

    const generatedSlug =
      form.slug ||
      slugifyEvent(form.short_name || form.name);

    setSaving(true);

    const payload = {
      name: form.name.trim(),

      slug: generatedSlug,

      short_name:
        form.short_name.trim() || null,

      description:
        form.description.trim() || null,

      image_url:
        form.image_url || null,

      logo_url:
        form.logo_url || null,

      event_type:
        form.event_type,

      sport:
        form.sport.trim() || null,

      organizer:
        form.organizer.trim() || null,

      start_date:
        form.start_date
          ? new Date(form.start_date).toISOString()
          : null,

      end_date:
        form.end_date
          ? new Date(form.end_date).toISOString()
          : null,

      location_name:
        form.location_name.trim() || null,

      city:
        form.city.trim() || null,

      host_countries:
        form.host_countries
          .split(',')
          .map((country) => country.trim())
          .filter(Boolean),

      venue:
        form.venue.trim() || null,

      source_name:
        form.source_name.trim() || null,

      source_url:
        form.source_url.trim() || null,

      status:
        form.status,

      is_published:
        form.is_published,

      display_order:
        Number(form.display_order) || 0,
    };

    try {
      if (editingId) {
        await apiFetch(
          `/api/v2/admin/events/${editingId}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          }
        );
      } else {
        await apiFetch('/api/v2/admin/events', {
          method: 'POST',

          body: JSON.stringify({
            ...payload,

            features: {
              teams: false,
              fixtures: false,
              standings: false,
              stadiums: false,
              news: false,
            },

            metadata: {},
          }),
        });
      }

      closeForm();

      await loadEvents();
    } catch (err) {
      console.error('Erreur sauvegarde événement :', err);

      setError(
        err?.message ||
          "Impossible d'enregistrer l'événement."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(event) {
    const confirmed = window.confirm(
      `Supprimer l'événement "${
        event.short_name || event.name
      }" ?`
    );

    if (!confirmed) return;

    try {
      setError('');

      await apiFetch(
        `/api/v2/admin/events/${event.id}`,
        {
          method: 'DELETE',
        }
      );

      await loadEvents();
    } catch (err) {
      console.error('Erreur suppression événement :', err);

      setError(
        err?.message ||
          "Impossible de supprimer l'événement."
      );
    }
  }

  const input =
    'w-full h-10 rounded-xl border border-white/10 bg-ink-900/60 px-3 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40';

  const textarea =
    'w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-3 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40';

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-bone-50">
            Événements
          </h1>

          <p className="text-xs text-bone-400 mt-1">
            Créer, modifier et publier les événements PaieCashFan.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-gradient-hero text-sm font-bold text-white"
        >
          <Plus size={15} />

          Nouvel événement
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-400" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <Calendar
            size={30}
            className="mx-auto text-bone-500 mb-3"
          />

          <p className="text-sm text-bone-300">
            Aucun événement enregistré.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-bone-500">
                <tr>
                  <th className="px-4 py-3">
                    Événement
                  </th>

                  <th className="px-4 py-3">
                    Date
                  </th>

                  <th className="px-4 py-3">
                    Lieu
                  </th>

                  <th className="px-4 py-3">
                    Statut
                  </th>

                  <th className="px-4 py-3">
                    Publication
                  </th>

                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="text-sm text-bone-300 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {event.logo_url ? (
                          <div className="h-10 w-10 shrink-0 rounded-lg border border-white/10 bg-white/5 p-1">
                            <img
                              src={event.logo_url}
                              alt={event.short_name || event.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 shrink-0 grid place-items-center rounded-lg border border-white/10 bg-white/5">
                            <Calendar
                              size={16}
                              className="text-bone-500"
                            />
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-bone-100">
                            {event.short_name || event.name}
                          </p>

                          {event.short_name && (
                            <p className="text-[11px] text-bone-500 mt-0.5">
                              {event.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs">
                      {event.start_date
                        ? new Date(
                            event.start_date
                          ).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>

                    <td className="px-4 py-4 text-xs">
                      {event.location_name || '—'}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase">
                        {event.status || '—'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          event.is_published
                            ? 'text-xs text-emerald-400'
                            : 'text-xs text-bone-500'
                        }
                      >
                        {event.is_published
                          ? 'Publié'
                          : 'Brouillon'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(event)}
                          className="h-8 w-8 grid place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-emerald-400"
                          title="Modifier"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeEvent(event)
                          }
                          className="h-8 w-8 grid place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-red-400"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-ink-800 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-bone-50">
                  {editingId
                    ? "Modifier l'événement"
                    : 'Nouvel événement'}
                </h2>

                <p className="text-[11px] text-bone-500 mt-1">
                  Les champs marqués d'un * sont obligatoires.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="text-bone-400 hover:text-bone-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field
                label="Nom *"
                error={fieldErrors.name}
              >
                <input
                  value={form.name}
                  onChange={setField('name')}
                  className={`${input} ${
                    fieldErrors.name
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                  placeholder="Ex : Coupe d'Afrique des Nations 2027"
                />

                {fieldErrors.name && (
                  <ErrorText>
                    {fieldErrors.name}
                  </ErrorText>
                )}
              </Field>

              <Field label="Nom court">
                <input
                  value={form.short_name}
                  onChange={setField('short_name')}
                  className={input}
                  placeholder="Ex : CAN 2027"
                />

                <p className="mt-1.5 text-[10px] text-bone-500">
                  Utilisé dans les cartes et les petits espaces.
                </p>
              </Field>

              <Field
                label="Type d'événement *"
                error={fieldErrors.event_type}
              >
                <select
                  value={form.event_type}
                  onChange={setField('event_type')}
                  className={`${input} ${
                    fieldErrors.event_type
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                >
                  <option value="">
                    Sélectionner un type
                  </option>

                  <option value="tournament">
                    Tournoi
                  </option>

                  <option value="competition">
                    Compétition
                  </option>

                  <option value="fan_meeting">
                    Rencontre fans
                  </option>

                  <option value="ceremony">
                    Cérémonie
                  </option>

                  <option value="other">
                    Autre
                  </option>
                </select>

                {fieldErrors.event_type && (
                  <ErrorText>
                    {fieldErrors.event_type}
                  </ErrorText>
                )}
              </Field>

              <Field label="Sport">
                <input
                  value={form.sport}
                  onChange={setField('sport')}
                  className={input}
                  placeholder="Ex : football"
                />
              </Field>

              <Field label="Organisateur">
                <input
                  value={form.organizer}
                  onChange={setField('organizer')}
                  className={input}
                  placeholder="Ex : CAF"
                />
              </Field>

              <Field label="Statut">
                <select
                  value={form.status}
                  onChange={setField('status')}
                  className={input}
                >
                  <option value="upcoming">
                    À venir
                  </option>

                  <option value="ongoing">
                    En cours
                  </option>

                  <option value="finished">
                    Terminé
                  </option>

                  <option value="cancelled">
                    Annulé
                  </option>
                </select>
              </Field>

              <Field
                label="Date de début *"
                error={fieldErrors.start_date}
              >
                <input
                  type="datetime-local"
                  min={getMinDateTime()}
                  value={form.start_date}
                  onChange={setField('start_date')}
                  className={`${input} ${
                    fieldErrors.start_date
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                />

                {fieldErrors.start_date && (
                  <ErrorText>
                    {fieldErrors.start_date}
                  </ErrorText>
                )}
              </Field>

              <Field
                label="Date de fin"
                error={fieldErrors.end_date}
              >
                <input
                  type="datetime-local"
                  min={
                    form.start_date ||
                    getMinDateTime()
                  }
                  value={form.end_date}
                  onChange={setField('end_date')}
                  className={`${input} ${
                    fieldErrors.end_date
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                />

                {fieldErrors.end_date && (
                  <ErrorText>
                    {fieldErrors.end_date}
                  </ErrorText>
                )}
              </Field>

              <Field label="Lieu">
                <input
                  value={form.location_name}
                  onChange={setField('location_name')}
                  className={input}
                  placeholder="Ex : Kenya · Tanzanie · Ouganda"
                />
              </Field>

              <Field label="Ville">
                <input
                  value={form.city}
                  onChange={setField('city')}
                  className={input}
                  placeholder="Ex : Nairobi"
                />
              </Field>

              <Field label="Pays hôtes">
                <input
                  value={form.host_countries}
                  onChange={setField('host_countries')}
                  className={input}
                  placeholder="Kenya, Tanzanie, Ouganda"
                />

                <p className="mt-1.5 text-[10px] text-bone-500">
                  Sépare les pays par des virgules.
                </p>
              </Field>

              <Field label="Stade / lieu précis">
                <input
                  value={form.venue}
                  onChange={setField('venue')}
                  className={input}
                  placeholder="Ex : Stade..."
                />
              </Field>

              <Field label="Logo">
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleLogoUpload(
                      e.target.files?.[0]
                    )
                  }
                />

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() =>
                    logoRef.current?.click()
                  }
                  className="w-full min-h-10 rounded-xl border border-dashed border-white/15 bg-ink-900/60 px-4 py-3 text-sm text-bone-300 hover:border-emerald-500/40 hover:text-bone-100 transition-colors disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    {uploading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload size={16} />
                    )}

                    {form.logo_url
                      ? 'Changer le logo'
                      : 'Uploader un logo'}
                  </span>
                </button>

                {form.logo_url && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-24 w-24 rounded-xl border border-white/10 bg-white/5 p-2">
                      <img
                        src={form.logo_url}
                        alt="Aperçu du logo"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          logo_url: '',
                        }))
                      }
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </Field>

              <Field label="Image de couverture">
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageUpload(
                      e.target.files?.[0]
                    )
                  }
                />

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() =>
                    imageRef.current?.click()
                  }
                  className="w-full min-h-10 rounded-xl border border-dashed border-white/15 bg-ink-900/60 px-4 py-3 text-sm text-bone-300 hover:border-emerald-500/40 hover:text-bone-100 transition-colors disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    {uploading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload size={16} />
                    )}

                    {form.image_url
                      ? "Changer l'image"
                      : 'Uploader une image'}
                  </span>
                </button>

                {form.image_url && (
                  <div className="mt-3">
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={form.image_url}
                        alt="Aperçu événement"
                        className="h-36 w-full object-cover"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          image_url: '',
                        }))
                      }
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Supprimer l'image
                    </button>
                  </div>
                )}
              </Field>

              <Field label="Nom de la source">
                <input
                  value={form.source_name}
                  onChange={setField('source_name')}
                  className={input}
                  placeholder="Ex : CAF"
                />
              </Field>

              <Field label="Lien de la source">
                <input
                  type="url"
                  value={form.source_url}
                  onChange={setField('source_url')}
                  className={input}
                  placeholder="https://..."
                />
              </Field>

              <Field label="Ordre d'affichage">
                <input
                  type="number"
                  min="0"
                  value={form.display_order}
                  onChange={setField('display_order')}
                  className={input}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={setField('description')}
                    className={textarea}
                    placeholder="Description de l'événement..."
                  />
                </Field>
              </div>

              <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={setField('is_published')}
                  className="h-4 w-4"
                />

                <div>
                  <p className="text-sm font-semibold text-bone-100">
                    Publier l'événement
                  </p>

                  <p className="text-[11px] text-bone-500 mt-0.5">
                    Lorsqu'il est publié, l'événement
                    devient visible dans la partie publique.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-bone-500 mb-1">
                URL générée automatiquement
              </p>

              <p className="text-xs font-mono text-emerald-400">
                /events/
                {form.slug ||
                  slugifyEvent(
                    form.short_name ||
                      form.name
                  ) ||
                  'nom-evenement'}
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-7">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="h-10 px-4 rounded-xl border border-white/10 text-sm text-bone-300 hover:text-bone-100 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-hero text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={14} />
                )}

                {saving
                  ? 'Enregistrement...'
                  : editingId
                    ? 'Enregistrer les modifications'
                    : "Créer l'événement"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}) {
  return (
    <label className="block">
      <span
        className={`block mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${
          error
            ? 'text-red-400'
            : 'text-bone-500'
        }`}
      >
        {label}
      </span>

      {children}
    </label>
  );
}

function ErrorText({ children }) {
  return (
    <p className="mt-1.5 text-xs text-red-400">
      {children}
    </p>
  );
}