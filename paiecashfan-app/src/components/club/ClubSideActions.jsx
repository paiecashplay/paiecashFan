import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Ticket,
  Radio,
  Trophy,
  Dices,
  Heart,
  Share2,
  Search,
  Volleyball,
} from 'lucide-react';

import { SideDock } from '@/components/SideDock';
import { useFavoriteClub } from '@/hooks/useFavoriteClub';

 
export function ClubSideActions({primaryColor, isFederationHub = false, clubSlug, clubId, onSearch, showSearch = true}) {

  const {
    favorite,
    busy: favoriteBusy,
    toggleFavorite,
  } = useFavoriteClub(clubId);

  const navigate = useNavigate();
  
  const goToClubSection = (sectionId) => {
    const currentPath = window.location.pathname;
    const clubHomePath = `/clubs/${clubSlug}`;

    // Si on est déjà sur la page principale du club
    if (currentPath === clubHomePath) {
      const el = document.getElementById(sectionId);

      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      return;
    }

    // Sinon on revient d'abord sur la page du club
    navigate(`${clubHomePath}#${sectionId}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: 'Découvre cette page sur PaieCashFan',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard?.writeText(
          window.location.href
        );
      }
    } catch {
      // partage annulé
    }
  };

  const shopAction = isFederationHub
    ? {
        key: 'clubs',
        icon: Volleyball,
        label: 'Clubs',
        onClick: () => goToClubSection('clubs'),
      }
    : {
        key: 'shop',
        icon: ShoppingBag,
        label: 'Boutique',
        onClick: () => goToClubSection('merchandise'),
      };

  const ticketingAction = {
    key: 'ticketing',
    icon: Ticket,
    label: 'Billetterie',
    onClick: () =>
      navigate(`/clubs/${clubSlug}/billetterie`),
  };

  const fanClubAction = {
    key: 'fanclub',
    icon: Radio,
    label: 'Fan Club',
    onClick: () =>
      navigate(`/clubs/${clubSlug}/fan-club`),
  };

  const actions = [
    shopAction,

    ...(!isFederationHub
      ? [ticketingAction, fanClubAction]
      : []),

    {
      key: 'play',
      icon: Trophy,
      label: 'Palmarès',
      onClick: () =>
        goToClubSection('trophies'),
    },

    {
      key: 'games',
      icon: Dices,
      label: 'Effectif',
      onClick: () =>
        goToClubSection('squad'),
    },

    {
      key: 'like',
      icon: Heart,
      label: favorite ? 'Aimé' : "J'aime",
      onClick: toggleFavorite,
      active: favorite,
      disabled: favoriteBusy,
    },

    {
      key: 'share',
      icon: Share2,
      label: 'Partager',
      onClick: handleShare,
    },

    ...(showSearch
    ? [
        {
            key: 'find',
            icon: Search,
            label: 'Rechercher',
            onClick: onSearch,
        },
        ]
    : [])
  ];

  return (
    <SideDock
      actions={actions}
      accent={primaryColor}
    />
  );
}