-- ═══════════════════════════════════════════════════════════════
-- Nettoyage des CLUBS EN DOUBLON (même nom, importés 2× avec un slug
-- différent, ex. "1-fc-koln" et "1-fc-koln-de"). Vérifié : ~217 paires,
-- toutes les copies "perdantes" sont VIDES (0 produit / 0 commande / 0 favori
-- / 0 billetterie). On garde UN exemplaire par nom :
--   1) celui qui a le plus de données ; 2) sinon le slug SANS suffixe "-de" ;
--   3) sinon le slug le plus court.
-- On ne supprime QUE les doublons à score de données = 0 (sécurité).
--
-- ⚠️ À exécuter une fois dans l'éditeur SQL Supabase. Si erreur de clé
-- étrangère (une autre table référence un doublon), noter la table → me la
-- transmettre pour ajouter un garde. Sinon, voir le repli "désactivation" en bas.
-- ═══════════════════════════════════════════════════════════════

with scored as (
  select
    t.id, t.name, t.slug,
    (
      (exists (select 1 from products p            where p.tenant_id = t.id))::int
    + (exists (select 1 from orders o              where o.tenant_id = t.id))::int
    + (exists (select 1 from fan_favorite_clubs f  where f.tenant_id = t.id))::int
    + ((coalesce(jsonb_array_length(t.metadata->'ticketing'->'subscriptions'), 0)
      + coalesce(jsonb_array_length(t.metadata->'ticketing'->'tickets'), 0)) > 0)::int
    + (coalesce((t.metadata->>'is_federation_hub')::boolean, false))::int * 5
    ) as data_score
  from tenants t
),
ranked as (
  select
    s.*,
    row_number() over (
      partition by s.name
      order by s.data_score desc, (s.slug like '%-de') asc, length(s.slug) asc
    ) as rn
  from scored s
)
delete from tenants
where id in (select id from ranked where rn > 1 and data_score = 0);

-- ── REPLI (si le DELETE échoue à cause d'une clé étrangère) ──────────
-- Au lieu de supprimer, on DÉSACTIVE les doublons (ils disparaissent des
-- listes/menus sans risque). Décommente ce bloc et commente le DELETE ci-dessus.
--
-- with scored as ( ...même CTE... ),
-- ranked  as ( ...même CTE... )
-- update tenants set status = 'inactive'
-- where id in (select id from ranked where rn > 1 and data_score = 0);
