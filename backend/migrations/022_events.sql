-- ============================================================
-- 022_events.sql
-- Gestion générique des événements
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_name VARCHAR(100),

    -- Présentation
    description TEXT,
    image_url TEXT,
    logo_url TEXT,

    -- Classification
    event_type VARCHAR(100) NOT NULL,
    sport VARCHAR(100),
    organizer VARCHAR(255),

    -- Dates
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,

    -- Localisation
    location_name VARCHAR(255),
    city VARCHAR(150),
    host_countries JSONB NOT NULL DEFAULT '[]'::jsonb,
    venue VARCHAR(255),

    -- Informations provenant de la source officielle
    source_name VARCHAR(255),
    source_url TEXT,

    -- État de l'événement
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    -- Sections disponibles sur la page de l'événement
    features JSONB NOT NULL DEFAULT '{
        "teams": false,
        "fixtures": false,
        "standings": false,
        "stadiums": false,
        "news": false
    }'::jsonb,

    -- Données supplémentaires propres à certains événements
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Ordre d'affichage
    display_order INTEGER NOT NULL DEFAULT 0,

    -- Dates techniques
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Recherche rapide par slug
CREATE INDEX IF NOT EXISTS idx_events_slug
ON events(slug);


-- Filtrage par statut
CREATE INDEX IF NOT EXISTS idx_events_status
ON events(status);


-- Filtrage des événements publiés
CREATE INDEX IF NOT EXISTS idx_events_published
ON events(is_published);


-- Filtrage par sport
CREATE INDEX IF NOT EXISTS idx_events_sport
ON events(sport);


-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trigger_events_updated_at ON events;

CREATE TRIGGER trigger_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_events_updated_at();