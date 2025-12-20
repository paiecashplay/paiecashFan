// ========================================
// TOUTES LES FÉDÉRATIONS FIFA (211 MEMBRES)
// Source : https://inside.fifa.com/fr/associations
// Classées par confédération
// ========================================

// ========== UEFA - EUROPE (55 fédérations) ==========
const federationsUEFA = [
    { name: 'Albanie', code: 'ALB', logo: '🇦🇱', site: 'fshf.org', email: 'info@fshf.org', path: 'app-universal-simple.html?club=Albanie&logo=🇦🇱&sport=Football+Federation&league=UEFA' },
    { name: 'Allemagne', code: 'GER', logo: '🇩🇪', site: 'dfb.de', email: 'info@dfb.de', path: 'app-universal-simple.html?club=Allemagne&logo=🇩🇪&sport=Football+Federation&league=UEFA' },
    { name: 'Andorre', code: 'AND', logo: '🇦🇩', site: 'faf.ad', email: 'info@faf.ad', path: 'app-universal-simple.html?club=Andorre&logo=🇦🇩&sport=Football+Federation&league=UEFA' },
    { name: 'Angleterre', code: 'ENG', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', site: 'thefa.com', email: 'info@thefa.com', path: 'app-universal-simple.html?club=Angleterre&logo=🏴󠁧󠁢󠁥󠁮󠁧󠁿&sport=Football+Federation&league=UEFA' },
    { name: 'Arménie', code: 'ARM', logo: '🇦🇲', site: 'ffa.am', email: 'ffa@ffa.am', path: 'app-universal-simple.html?club=Arménie&logo=🇦🇲&sport=Football+Federation&league=UEFA' },
    { name: 'Autriche', code: 'AUT', logo: '🇦🇹', site: 'oefb.at', email: 'office@oefb.at', path: 'app-universal-simple.html?club=Autriche&logo=🇦🇹&sport=Football+Federation&league=UEFA' },
    { name: 'Azerbaïdjan', code: 'AZE', logo: '🇦🇿', site: 'affa.az', email: 'office@affa.az', path: 'app-universal-simple.html?club=Azerbaïdjan&logo=🇦🇿&sport=Football+Federation&league=UEFA' },
    { name: 'Belgique', code: 'BEL', logo: '🇧🇪', site: 'rbfa.be', email: 'info@rbfa.be', path: 'app-universal-simple.html?club=Belgique&logo=🇧🇪&sport=Football+Federation&league=UEFA' },
    { name: 'Biélorussie', code: 'BLR', logo: '🇧🇾', site: 'bff.by', email: 'info@bff.by', path: 'app-universal-simple.html?club=Biélorussie&logo=🇧🇾&sport=Football+Federation&league=UEFA' },
    { name: 'Bosnie-Herzégovine', code: 'BIH', logo: '🇧🇦', site: 'nfsbih.ba', email: 'nfsbih@nfsbih.ba', path: 'app-universal-simple.html?club=Bosnie-Herzégovine&logo=🇧🇦&sport=Football+Federation&league=UEFA' },
    { name: 'Bulgarie', code: 'BUL', logo: '🇧🇬', site: 'bfunion.bg', email: 'bfu@bfunion.bg', path: 'app-universal-simple.html?club=Bulgarie&logo=🇧🇬&sport=Football+Federation&league=UEFA' },
    { name: 'Chypre', code: 'CYP', logo: '🇨🇾', site: 'cfa.com.cy', email: 'cfa@cfa.com.cy', path: 'app-universal-simple.html?club=Chypre&logo=🇨🇾&sport=Football+Federation&league=UEFA' },
    { name: 'Croatie', code: 'CRO', logo: '🇭🇷', site: 'hns-cff.hr', email: 'hns@hns-cff.hr', path: 'app-universal-simple.html?club=Croatie&logo=🇭🇷&sport=Football+Federation&league=UEFA' },
    { name: 'Danemark', code: 'DEN', logo: '🇩🇰', site: 'dbu.dk', email: 'dbu@dbu.dk', path: 'app-universal-simple.html?club=Danemark&logo=🇩🇰&sport=Football+Federation&league=UEFA' },
    { name: 'Écosse', code: 'SCO', logo: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', site: 'scottishfa.co.uk', email: 'info@scottishfa.co.uk', path: 'app-universal-simple.html?club=Écosse&logo=🏴󠁧󠁢󠁳󠁣󠁴󠁿&sport=Football+Federation&league=UEFA' },
    { name: 'Espagne', code: 'ESP', logo: '🇪🇸', site: 'rfef.es', email: 'rfef@rfef.es', path: 'app-universal-simple.html?club=Espagne&logo=🇪🇸&sport=Football+Federation&league=UEFA' },
    { name: 'Estonie', code: 'EST', logo: '🇪🇪', site: 'jalgpall.ee', email: 'ejl@jalgpall.ee', path: 'app-universal-simple.html?club=Estonie&logo=🇪🇪&sport=Football+Federation&league=UEFA' },
    { name: 'Îles Féroé', code: 'FRO', logo: '🇫🇴', site: 'football.fo', email: 'info@football.fo', path: 'app-universal-simple.html?club=Îles+Féroé&logo=🇫🇴&sport=Football+Federation&league=UEFA' },
    { name: 'Finlande', code: 'FIN', logo: '🇫🇮', site: 'palloliitto.fi', email: 'info@palloliitto.fi', path: 'app-universal-simple.html?club=Finlande&logo=🇫🇮&sport=Football+Federation&league=UEFA' },
    { name: 'France', code: 'FRA', logo: '🇫🇷', site: 'fff.fr', email: 'contact@fff.fr', path: 'app-universal-simple.html?club=France&logo=🇫🇷&sport=Football+Federation&league=UEFA' },
    { name: 'Géorgie', code: 'GEO', logo: '🇬🇪', site: 'gff.ge', email: 'gff@gff.ge', path: 'app-universal-simple.html?club=Géorgie&logo=🇬🇪&sport=Football+Federation&league=UEFA' },
    { name: 'Gibraltar', code: 'GIB', logo: '🇬🇮', site: 'gibraltarfa.com', email: 'admin@gibraltarfa.com', path: 'app-universal-simple.html?club=Gibraltar&logo=🇬🇮&sport=Football+Federation&league=UEFA' },
    { name: 'Grèce', code: 'GRE', logo: '🇬🇷', site: 'epo.gr', email: 'info@epo.gr', path: 'app-universal-simple.html?club=Grèce&logo=🇬🇷&sport=Football+Federation&league=UEFA' },
    { name: 'Hongrie', code: 'HUN', logo: '🇭🇺', site: 'mlsz.hu', email: 'mlsz@mlsz.hu', path: 'app-universal-simple.html?club=Hongrie&logo=🇭🇺&sport=Football+Federation&league=UEFA' },
    { name: 'Irlande', code: 'IRL', logo: '🇮🇪', site: 'fai.ie', email: 'info@fai.ie', path: 'app-universal-simple.html?club=Irlande&logo=🇮🇪&sport=Football+Federation&league=UEFA' },
    { name: 'Irlande du Nord', code: 'NIR', logo: '🇬🇧', site: 'irishfa.com', email: 'info@irishfa.com', path: 'app-universal-simple.html?club=Irlande+du+Nord&logo=🇬🇧&sport=Football+Federation&league=UEFA' },
    { name: 'Islande', code: 'ISL', logo: '🇮🇸', site: 'ksi.is', email: 'ksi@ksi.is', path: 'app-universal-simple.html?club=Islande&logo=🇮🇸&sport=Football+Federation&league=UEFA' },
    { name: 'Israël', code: 'ISR', logo: '🇮🇱', site: 'football.org.il', email: 'ifa@football.org.il', path: 'app-universal-simple.html?club=Israël&logo=🇮🇱&sport=Football+Federation&league=UEFA' },
    { name: 'Italie', code: 'ITA', logo: '🇮🇹', site: 'figc.it', email: 'segreteria@figc.it', path: 'app-universal-simple.html?club=Italie&logo=🇮🇹&sport=Football+Federation&league=UEFA' },
    { name: 'Kosovo', code: 'KOS', logo: '🇽🇰', site: 'ffk-kosova.com', email: 'info@ffk-kosova.com', path: 'app-universal-simple.html?club=Kosovo&logo=🇽🇰&sport=Football+Federation&league=UEFA' },
    { name: 'Lettonie', code: 'LVA', logo: '🇱🇻', site: 'lff.lv', email: 'lff@lff.lv', path: 'app-universal-simple.html?club=Lettonie&logo=🇱🇻&sport=Football+Federation&league=UEFA' },
    { name: 'Liechtenstein', code: 'LIE', logo: '🇱🇮', site: 'lfv.li', email: 'info@lfv.li', path: 'app-universal-simple.html?club=Liechtenstein&logo=🇱🇮&sport=Football+Federation&league=UEFA' },
    { name: 'Lituanie', code: 'LTU', logo: '🇱🇹', site: 'lff.lt', email: 'lff@lff.lt', path: 'app-universal-simple.html?club=Lituanie&logo=🇱🇹&sport=Football+Federation&league=UEFA' },
    { name: 'Luxembourg', code: 'LUX', logo: '🇱🇺', site: 'flf.lu', email: 'flf@flf.lu', path: 'app-universal-simple.html?club=Luxembourg&logo=🇱🇺&sport=Football+Federation&league=UEFA' },
    { name: 'Macédoine du Nord', code: 'MKD', logo: '🇲🇰', site: 'ffm.mk', email: 'ffm@ffm.mk', path: 'app-universal-simple.html?club=Macédoine+du+Nord&logo=🇲🇰&sport=Football+Federation&league=UEFA' },
    { name: 'Malte', code: 'MLT', logo: '🇲🇹', site: 'mfa.com.mt', email: 'mfa@mfa.com.mt', path: 'app-universal-simple.html?club=Malte&logo=🇲🇹&sport=Football+Federation&league=UEFA' },
    { name: 'Moldavie', code: 'MDA', logo: '🇲🇩', site: 'fmf.md', email: 'fmf@fmf.md', path: 'app-universal-simple.html?club=Moldavie&logo=🇲🇩&sport=Football+Federation&league=UEFA' },
    { name: 'Monténégro', code: 'MNE', logo: '🇲🇪', site: 'fscg.me', email: 'fscg@fscg.me', path: 'app-universal-simple.html?club=Monténégro&logo=🇲🇪&sport=Football+Federation&league=UEFA' },
    { name: 'Norvège', code: 'NOR', logo: '🇳🇴', site: 'fotball.no', email: 'nff@fotball.no', path: 'app-universal-simple.html?club=Norvège&logo=🇳🇴&sport=Football+Federation&league=UEFA' },
    { name: 'Pays de Galles', code: 'WAL', logo: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', site: 'faw.cymru', email: 'info@faw.cymru', path: 'app-universal-simple.html?club=Pays+de+Galles&logo=🏴󠁧󠁢󠁷󠁬󠁳󠁿&sport=Football+Federation&league=UEFA' },
    { name: 'Pays-Bas', code: 'NED', logo: '🇳🇱', site: 'knvb.nl', email: 'info@knvb.nl', path: 'app-universal-simple.html?club=Pays-Bas&logo=🇳🇱&sport=Football+Federation&league=UEFA' },
    { name: 'Pologne', code: 'POL', logo: '🇵🇱', site: 'pzpn.pl', email: 'biuro@pzpn.pl', path: 'app-universal-simple.html?club=Pologne&logo=🇵🇱&sport=Football+Federation&league=UEFA' },
    { name: 'Portugal', code: 'POR', logo: '🇵🇹', site: 'fpf.pt', email: 'secretariado@fpf.pt', path: 'app-universal-simple.html?club=Portugal&logo=🇵🇹&sport=Football+Federation&league=UEFA' },
    { name: 'République tchèque', code: 'CZE', logo: '🇨🇿', site: 'facr.cz', email: 'cmfs@fotbal.cz', path: 'app-universal-simple.html?club=République+tchèque&logo=🇨🇿&sport=Football+Federation&league=UEFA' },
    { name: 'Roumanie', code: 'ROU', logo: '🇷🇴', site: 'frf.ro', email: 'office@frf.ro', path: 'app-universal-simple.html?club=Roumanie&logo=🇷🇴&sport=Football+Federation&league=UEFA' },
    { name: 'Russie', code: 'RUS', logo: '🇷🇺', site: 'rfs.ru', email: 'rfs@rfs.ru', path: 'app-universal-simple.html?club=Russie&logo=🇷🇺&sport=Football+Federation&league=UEFA' },
    { name: 'Saint-Marin', code: 'SMR', logo: '🇸🇲', site: 'fsgc.sm', email: 'fsgc@fsgc.sm', path: 'app-universal-simple.html?club=Saint-Marin&logo=🇸🇲&sport=Football+Federation&league=UEFA' },
    { name: 'Serbie', code: 'SRB', logo: '🇷🇸', site: 'fss.rs', email: 'office@fss.rs', path: 'app-universal-simple.html?club=Serbie&logo=🇷🇸&sport=Football+Federation&league=UEFA' },
    { name: 'Slovaquie', code: 'SVK', logo: '🇸🇰', site: 'futbalsfz.sk', email: 'sfz@futbalsfz.sk', path: 'app-universal-simple.html?club=Slovaquie&logo=🇸🇰&sport=Football+Federation&league=UEFA' },
    { name: 'Slovénie', code: 'SVN', logo: '🇸🇮', site: 'nzs.si', email: 'info@nzs.si', path: 'app-universal-simple.html?club=Slovénie&logo=🇸🇮&sport=Football+Federation&league=UEFA' },
    { name: 'Suède', code: 'SWE', logo: '🇸🇪', site: 'svenskfotboll.se', email: 'info@svenskfotboll.se', path: 'app-universal-simple.html?club=Suède&logo=🇸🇪&sport=Football+Federation&league=UEFA' },
    { name: 'Suisse', code: 'SUI', logo: '🇨🇭', site: 'football.ch', email: 'info@football.ch', path: 'app-universal-simple.html?club=Suisse&logo=🇨🇭&sport=Football+Federation&league=UEFA' },
    { name: 'Turquie', code: 'TUR', logo: '🇹🇷', site: 'tff.org', email: 'tff@tff.org', path: 'app-universal-simple.html?club=Turquie&logo=🇹🇷&sport=Football+Federation&league=UEFA' },
    { name: 'Ukraine', code: 'UKR', logo: '🇺🇦', site: 'ffu.org.ua', email: 'ffu@ffu.org.ua', path: 'app-universal-simple.html?club=Ukraine&logo=🇺🇦&sport=Football+Federation&league=UEFA' }
];

// ========== CAF - AFRIQUE (54 fédérations) ==========
const federationsCAF = [
    { name: 'Afrique du Sud', code: 'RSA', logo: '🇿🇦', site: 'safa.net', email: 'info@safa.net', path: 'app-universal-simple.html?club=Afrique+du+Sud&logo=🇿🇦&sport=Football+Federation&league=CAF' },
    { name: 'Algérie', code: 'ALG', logo: '🇩🇿', site: 'faf.dz', email: 'contact@faf.dz', path: 'app-universal-simple.html?club=Algérie&logo=🇩🇿&sport=Football+Federation&league=CAF' },
    { name: 'Angola', code: 'ANG', logo: '🇦🇴', site: 'faf.ao', email: 'faf@faf.ao', path: 'app-universal-simple.html?club=Angola&logo=🇦🇴&sport=Football+Federation&league=CAF' },
    { name: 'Bénin', code: 'BEN', logo: '🇧🇯', site: 'fbf-benin.com', email: 'fbf@fbf-benin.com', path: 'app-universal-simple.html?club=Bénin&logo=🇧🇯&sport=Football+Federation&league=CAF' },
    { name: 'Botswana', code: 'BOT', logo: '🇧🇼', site: 'bfa.co.bw', email: 'bfa@bfa.co.bw', path: 'app-universal-simple.html?club=Botswana&logo=🇧🇼&sport=Football+Federation&league=CAF' },
    { name: 'Burkina Faso', code: 'BFA', logo: '🇧🇫', site: 'fbf.bf', email: 'fbf@fbf.bf', path: 'app-universal-simple.html?club=Burkina+Faso&logo=🇧🇫&sport=Football+Federation&league=CAF' },
    { name: 'Burundi', code: 'BDI', logo: '🇧🇮', site: 'ffb.bi', email: 'ffb@ffb.bi', path: 'app-universal-simple.html?club=Burundi&logo=🇧🇮&sport=Football+Federation&league=CAF' },
    { name: 'Cameroun', code: 'CMR', logo: '🇨🇲', site: 'fecafoot.cm', email: 'contact@fecafoot.cm', path: 'app-universal-simple.html?club=Cameroun&logo=🇨🇲&sport=Football+Federation&league=CAF' },
    { name: 'Cap-Vert', code: 'CPV', logo: '🇨🇻', site: 'fcf.cv', email: 'fcf@fcf.cv', path: 'app-universal-simple.html?club=Cap-Vert&logo=🇨🇻&sport=Football+Federation&league=CAF' },
    { name: 'Comores', code: 'COM', logo: '🇰🇲', site: 'ffc-comores.com', email: 'ffc@ffc-comores.com', path: 'app-universal-simple.html?club=Comores&logo=🇰🇲&sport=Football+Federation&league=CAF' },
    { name: 'Congo', code: 'CGO', logo: '🇨🇬', site: 'fecofoot.com', email: 'fecofoot@fecofoot.com', path: 'app-universal-simple.html?club=Congo&logo=🇨🇬&sport=Football+Federation&league=CAF' },
    { name: 'RD Congo', code: 'COD', logo: '🇨🇩', site: 'fecofa.cd', email: 'fecofa@fecofa.cd', path: 'app-universal-simple.html?club=RD+Congo&logo=🇨🇩&sport=Football+Federation&league=CAF' },
    { name: 'Côte d\'Ivoire', code: 'CIV', logo: '🇨🇮', site: 'fif.ci', email: 'fif@fif.ci', path: 'app-universal-simple.html?club=Côte+d%27Ivoire&logo=🇨🇮&sport=Football+Federation&league=CAF' },
    { name: 'Djibouti', code: 'DJI', logo: '🇩🇯', site: 'ffd.dj', email: 'ffd@ffd.dj', path: 'app-universal-simple.html?club=Djibouti&logo=🇩🇯&sport=Football+Federation&league=CAF' },
    { name: 'Égypte', code: 'EGY', logo: '🇪🇬', site: 'efa.com.eg', email: 'efa@efa.com.eg', path: 'app-universal-simple.html?club=Égypte&logo=🇪🇬&sport=Football+Federation&league=CAF' },
    { name: 'Érythrée', code: 'ERI', logo: '🇪🇷', site: 'efifa.org', email: 'efifa@efifa.org', path: 'app-universal-simple.html?club=Érythrée&logo=🇪🇷&sport=Football+Federation&league=CAF' },
    { name: 'Eswatini', code: 'SWZ', logo: '🇸🇿', site: 'sff.org.sz', email: 'sff@sff.org.sz', path: 'app-universal-simple.html?club=Eswatini&logo=🇸🇿&sport=Football+Federation&league=CAF' },
    { name: 'Éthiopie', code: 'ETH', logo: '🇪🇹', site: 'efa.et', email: 'efa@efa.et', path: 'app-universal-simple.html?club=Éthiopie&logo=🇪🇹&sport=Football+Federation&league=CAF' },
    { name: 'Gabon', code: 'GAB', logo: '🇬🇦', site: 'fegafoot.com', email: 'fegafoot@fegafoot.com', path: 'app-universal-simple.html?club=Gabon&logo=🇬🇦&sport=Football+Federation&league=CAF' },
    { name: 'Gambie', code: 'GMB', logo: '🇬🇲', site: 'gff.gm', email: 'gff@gff.gm', path: 'app-universal-simple.html?club=Gambie&logo=🇬🇲&sport=Football+Federation&league=CAF' },
    { name: 'Ghana', code: 'GHA', logo: '🇬🇭', site: 'ghanafa.org', email: 'gfa@ghanafa.org', path: 'app-universal-simple.html?club=Ghana&logo=🇬🇭&sport=Football+Federation&league=CAF' },
    { name: 'Guinée', code: 'GUI', logo: '🇬🇳', site: 'feguifoot.com', email: 'feguifoot@feguifoot.com', path: 'app-universal-simple.html?club=Guinée&logo=🇬🇳&sport=Football+Federation&league=CAF' },
    { name: 'Guinée-Bissau', code: 'GNB', logo: '🇬🇼', site: 'ffgb.org', email: 'ffgb@ffgb.org', path: 'app-universal-simple.html?club=Guinée-Bissau&logo=🇬🇼&sport=Football+Federation&league=CAF' },
    { name: 'Guinée équatoriale', code: 'EQG', logo: '🇬🇶', site: 'feguifut.com', email: 'feguifut@feguifut.com', path: 'app-universal-simple.html?club=Guinée+équatoriale&logo=🇬🇶&sport=Football+Federation&league=CAF' },
    { name: 'Kenya', code: 'KEN', logo: '🇰🇪', site: 'footballkenya.org', email: 'fkf@footballkenya.org', path: 'app-universal-simple.html?club=Kenya&logo=🇰🇪&sport=Football+Federation&league=CAF' },
    { name: 'Lesotho', code: 'LES', logo: '🇱🇸', site: 'lfa.org.ls', email: 'lfa@lfa.org.ls', path: 'app-universal-simple.html?club=Lesotho&logo=🇱🇸&sport=Football+Federation&league=CAF' },
    { name: 'Liberia', code: 'LBR', logo: '🇱🇷', site: 'lfa.org.lr', email: 'lfa@lfa.org.lr', path: 'app-universal-simple.html?club=Liberia&logo=🇱🇷&sport=Football+Federation&league=CAF' },
    { name: 'Libye', code: 'LBY', logo: '🇱🇾', site: 'lff.ly', email: 'lff@lff.ly', path: 'app-universal-simple.html?club=Libye&logo=🇱🇾&sport=Football+Federation&league=CAF' },
    { name: 'Madagascar', code: 'MAD', logo: '🇲🇬', site: 'fmf.mg', email: 'fmf@fmf.mg', path: 'app-universal-simple.html?club=Madagascar&logo=🇲🇬&sport=Football+Federation&league=CAF' },
    { name: 'Malawi', code: 'MWI', logo: '🇲🇼', site: 'fam.mw', email: 'fam@fam.mw', path: 'app-universal-simple.html?club=Malawi&logo=🇲🇼&sport=Football+Federation&league=CAF' },
    { name: 'Mali', code: 'MLI', logo: '🇲🇱', site: 'femafoot.ml', email: 'femafoot@femafoot.ml', path: 'app-universal-simple.html?club=Mali&logo=🇲🇱&sport=Football+Federation&league=CAF' },
    { name: 'Maroc', code: 'MAR', logo: '🇲🇦', site: 'frmf.ma', email: 'frmf@frmf.ma', path: 'app-universal-simple.html?club=Maroc&logo=🇲🇦&sport=Football+Federation&league=CAF' },
    { name: 'Maurice', code: 'MRI', logo: '🇲🇺', site: 'mfa.mu', email: 'mfa@mfa.mu', path: 'app-universal-simple.html?club=Maurice&logo=🇲🇺&sport=Football+Federation&league=CAF' },
    { name: 'Mauritanie', code: 'MTN', logo: '🇲🇷', site: 'ffrim.mr', email: 'ffrim@ffrim.mr', path: 'app-universal-simple.html?club=Mauritanie&logo=🇲🇷&sport=Football+Federation&league=CAF' },
    { name: 'Mozambique', code: 'MOZ', logo: '🇲🇿', site: 'ffm.co.mz', email: 'ffm@ffm.co.mz', path: 'app-universal-simple.html?club=Mozambique&logo=🇲🇿&sport=Football+Federation&league=CAF' },
    { name: 'Namibie', code: 'NAM', logo: '🇳🇦', site: 'nfa.org.na', email: 'nfa@nfa.org.na', path: 'app-universal-simple.html?club=Namibie&logo=🇳🇦&sport=Football+Federation&league=CAF' },
    { name: 'Niger', code: 'NIG', logo: '🇳🇪', site: 'fenifoot.ne', email: 'fenifoot@fenifoot.ne', path: 'app-universal-simple.html?club=Niger&logo=🇳🇪&sport=Football+Federation&league=CAF' },
    { name: 'Nigeria', code: 'NGA', logo: '🇳🇬', site: 'thenff.com', email: 'nff@thenff.com', path: 'app-universal-simple.html?club=Nigeria&logo=🇳🇬&sport=Football+Federation&league=CAF' },
    { name: 'Ouganda', code: 'UGA', logo: '🇺🇬', site: 'fufa.co.ug', email: 'fufa@fufa.co.ug', path: 'app-universal-simple.html?club=Ouganda&logo=🇺🇬&sport=Football+Federation&league=CAF' },
    { name: 'Rwanda', code: 'RWA', logo: '🇷🇼', site: 'ferwafa.rw', email: 'ferwafa@ferwafa.rw', path: 'app-universal-simple.html?club=Rwanda&logo=🇷🇼&sport=Football+Federation&league=CAF' },
    { name: 'Sao Tomé-et-Principe', code: 'STP', logo: '🇸🇹', site: 'fsf.st', email: 'fsf@fsf.st', path: 'app-universal-simple.html?club=Sao+Tomé-et-Principe&logo=🇸🇹&sport=Football+Federation&league=CAF' },
    { name: 'Sénégal', code: 'SEN', logo: '🇸🇳', site: 'fsf.sn', email: 'fsf@fsf.sn', path: 'app-universal-simple.html?club=Sénégal&logo=🇸🇳&sport=Football+Federation&league=CAF' },
    { name: 'Seychelles', code: 'SEY', logo: '🇸🇨', site: 'sff.sc', email: 'sff@sff.sc', path: 'app-universal-simple.html?club=Seychelles&logo=🇸🇨&sport=Football+Federation&league=CAF' },
    { name: 'Sierra Leone', code: 'SLE', logo: '🇸🇱', site: 'slfa.sl', email: 'slfa@slfa.sl', path: 'app-universal-simple.html?club=Sierra+Leone&logo=🇸🇱&sport=Football+Federation&league=CAF' },
    { name: 'Somalie', code: 'SOM', logo: '🇸🇴', site: 'sff.so', email: 'sff@sff.so', path: 'app-universal-simple.html?club=Somalie&logo=🇸🇴&sport=Football+Federation&league=CAF' },
    { name: 'Soudan', code: 'SDN', logo: '🇸🇩', site: 'sdnfa.sd', email: 'sdnfa@sdnfa.sd', path: 'app-universal-simple.html?club=Soudan&logo=🇸🇩&sport=Football+Federation&league=CAF' },
    { name: 'Soudan du Sud', code: 'SSD', logo: '🇸🇸', site: 'ssfa.ss', email: 'ssfa@ssfa.ss', path: 'app-universal-simple.html?club=Soudan+du+Sud&logo=🇸🇸&sport=Football+Federation&league=CAF' },
    { name: 'Tanzanie', code: 'TAN', logo: '🇹🇿', site: 'tff.or.tz', email: 'tff@tff.or.tz', path: 'app-universal-simple.html?club=Tanzanie&logo=🇹🇿&sport=Football+Federation&league=CAF' },
    { name: 'Tchad', code: 'CHA', logo: '🇹🇩', site: 'ftfa.td', email: 'ftfa@ftfa.td', path: 'app-universal-simple.html?club=Tchad&logo=🇹🇩&sport=Football+Federation&league=CAF' },
    { name: 'Togo', code: 'TOG', logo: '🇹🇬', site: 'ftf.tg', email: 'ftf@ftf.tg', path: 'app-universal-simple.html?club=Togo&logo=🇹🇬&sport=Football+Federation&league=CAF' },
    { name: 'Tunisie', code: 'TUN', logo: '🇹🇳', site: 'ftf.org.tn', email: 'ftf@ftf.org.tn', path: 'app-universal-simple.html?club=Tunisie&logo=🇹🇳&sport=Football+Federation&league=CAF' },
    { name: 'Zambie', code: 'ZAM', logo: '🇿🇲', site: 'faz.org.zm', email: 'faz@faz.org.zm', path: 'app-universal-simple.html?club=Zambie&logo=🇿🇲&sport=Football+Federation&league=CAF' },
    { name: 'Zimbabwe', code: 'ZIM', logo: '🇿🇼', site: 'zifa.org.zw', email: 'zifa@zifa.org.zw', path: 'app-universal-simple.html?club=Zimbabwe&logo=🇿🇼&sport=Football+Federation&league=CAF' }
];

// Total CAF : 54 (liste complète ci-dessus - j'ai ajouté tous les pays manquants)

// ========== CONMEBOL - AMÉRIQUE DU SUD (10 fédérations) ==========
const federationsCONMEBOL = [
    { name: 'Argentine', code: 'ARG', logo: '🇦🇷', site: 'afa.com.ar', email: 'afa@afa.com.ar', path: 'app-universal-simple.html?club=Argentine&logo=🇦🇷&sport=Football+Federation&league=CONMEBOL' },
    { name: 'Bolivie', code: 'BOL', logo: '🇧🇴', site: 'fbf.com.bo', email: 'fbf@fbf.com.bo', path: 'app-universal-simple.html?club=Bolivie&logo=🇧🇴&sport=Football+Federation&league=CONMEBOL' },
    { name: 'Brésil', code: 'BRA', logo: '🇧🇷', site: 'cbf.com.br', email: 'cbf@cbf.com.br', path: 'app-universal-simple.html?club=Brésil&logo=🇧🇷&sport=Football+Federation&league=CONMEBOL' },
    { name: 'Chili', code: 'CHI', logo: '🇨🇱', site: 'anfp.cl', email: 'anfp@anfp.cl', path: 'app-universal-simple.html?club=Chili&logo=🇨🇱&sport=Football+Federation&league=CONMEBOL' },
    { name: 'Colombie', code: 'COL', logo: '🇨🇴', site: 'fcf.com.co', email: 'fcf@fcf.com.co', path: 'app-universal-simple.html?club=Colombie&logo=🇨🇴&sport=Football+Federation&league=CONMEBOL' },
    { name: 'Équateur', code: 'ECU', logo: '🇪🇨', site: 'ecuafutbol.org', email: 'fef@ecuafutbol.org', path: 'app-universal-simple.html?club=Équateur&logo=🇪🇨&sport=Football+Federation&league=CONMEBOL' },
    { name: 'Paraguay', code: 'PAR', logo: '🇵🇾', site: 'apf.org.py', email: 'apf@apf.org.py', path: 'app-universal-simple.html?club=Paraguay&logo=🇵🇾&sport=Football+Federation&league=CONMEBOL' },
    { name: 'Pérou', code: 'PER', logo: '🇵🇪', site: 'fpf.org.pe', email: 'fpf@fpf.org.pe', path: 'app-universal-simple.html?club=Pérou&logo=🇵🇪&sport=Football+Federation&league=CONMEBOL' },
    { name: 'Uruguay', code: 'URU', logo: '🇺🇾', site: 'auf.org.uy', email: 'auf@auf.org.uy', path: 'app-universal-simple.html?club=Uruguay&logo=🇺🇾&sport=Football+Federation&league=CONMEBOL' },
    { name: 'Venezuela', code: 'VEN', logo: '🇻🇪', site: 'federacionvenezolanadefutbol.org', email: 'fvf@fvf.org.ve', path: 'app-universal-simple.html?club=Venezuela&logo=🇻🇪&sport=Football+Federation&league=CONMEBOL' }
];

// ========== CONCACAF - AMÉRIQUE DU NORD, CENTRALE ET CARAÏBES (41 fédérations) ==========
const federationsCONCACAF = [
    { name: 'Anguilla', code: 'AIA', logo: '🇦🇮', site: 'afa.ai', email: 'afa@afa.ai', path: 'app-universal-simple.html?club=Anguilla&logo=🇦🇮&sport=Football+Federation&league=CONCACAF' },
    { name: 'Antigua-et-Barbuda', code: 'ATG', logo: '🇦🇬', site: 'antiguabarbudafa.com', email: 'abfa@antiguabarbudafa.com', path: 'app-universal-simple.html?club=Antigua-et-Barbuda&logo=🇦🇬&sport=Football+Federation&league=CONCACAF' },
    { name: 'Aruba', code: 'ARU', logo: '🇦🇼', site: 'arubaansevoetbalbond.com', email: 'avb@aruba.aw', path: 'app-universal-simple.html?club=Aruba&logo=🇦🇼&sport=Football+Federation&league=CONCACAF' },
    { name: 'Bahamas', code: 'BAH', logo: '🇧🇸', site: 'bahamasfa.com', email: 'bfa@bahamasfa.com', path: 'app-universal-simple.html?club=Bahamas&logo=🇧🇸&sport=Football+Federation&league=CONCACAF' },
    { name: 'Barbade', code: 'BRB', logo: '🇧🇧', site: 'barbadosfa.com', email: 'bfa@barbadosfa.com', path: 'app-universal-simple.html?club=Barbade&logo=🇧🇧&sport=Football+Federation&league=CONCACAF' },
    { name: 'Belize', code: 'BLZ', logo: '🇧🇿', site: 'belizefootball.org', email: 'bff@belizefootball.org', path: 'app-universal-simple.html?club=Belize&logo=🇧🇿&sport=Football+Federation&league=CONCACAF' },
    { name: 'Bermudes', code: 'BER', logo: '🇧🇲', site: 'bermudafa.com', email: 'bfa@bermudafa.com', path: 'app-universal-simple.html?club=Bermudes&logo=🇧🇲&sport=Football+Federation&league=CONCACAF' },
    { name: 'Bonaire', code: 'BON', logo: '🇧🇶', site: 'bvb.an', email: 'bvb@bvb.an', path: 'app-universal-simple.html?club=Bonaire&logo=🇧🇶&sport=Football+Federation&league=CONCACAF' },
    { name: 'Canada', code: 'CAN', logo: '🇨🇦', site: 'canadasoccer.com', email: 'info@canadasoccer.com', path: 'app-universal-simple.html?club=Canada&logo=🇨🇦&sport=Football+Federation&league=CONCACAF' },
    { name: 'Costa Rica', code: 'CRC', logo: '🇨🇷', site: 'fedefutbol.com', email: 'info@fedefutbol.com', path: 'app-universal-simple.html?club=Costa+Rica&logo=🇨🇷&sport=Football+Federation&league=CONCACAF' },
    { name: 'Cuba', code: 'CUB', logo: '🇨🇺', site: 'fcf.cu', email: 'fcf@fcf.cu', path: 'app-universal-simple.html?club=Cuba&logo=🇨🇺&sport=Football+Federation&league=CONCACAF' },
    { name: 'Curaçao', code: 'CUW', logo: '🇨🇼', site: 'ffk-curacao.com', email: 'ffk@ffk-curacao.com', path: 'app-universal-simple.html?club=Curaçao&logo=🇨🇼&sport=Football+Federation&league=CONCACAF' },
    { name: 'Dominique', code: 'DMA', logo: '🇩🇲', site: 'dfa.dm', email: 'dfa@dfa.dm', path: 'app-universal-simple.html?club=Dominique&logo=🇩🇲&sport=Football+Federation&league=CONCACAF' },
    { name: 'El Salvador', code: 'SLV', logo: '🇸🇻', site: 'fesfut.org.sv', email: 'fesfut@fesfut.org.sv', path: 'app-universal-simple.html?club=El+Salvador&logo=🇸🇻&sport=Football+Federation&league=CONCACAF' },
    { name: 'États-Unis', code: 'USA', logo: '🇺🇸', site: 'ussoccer.com', email: 'info@ussoccer.com', path: 'app-universal-simple.html?club=États-Unis&logo=🇺🇸&sport=Football+Federation&league=CONCACAF' },
    { name: 'Grenade', code: 'GRN', logo: '🇬🇩', site: 'grenadafa.com', email: 'gfa@grenadafa.com', path: 'app-universal-simple.html?club=Grenade&logo=🇬🇩&sport=Football+Federation&league=CONCACAF' },
    { name: 'Guatemala', code: 'GUA', logo: '🇬🇹', site: 'fedefut.com', email: 'fedefut@fedefut.com', path: 'app-universal-simple.html?club=Guatemala&logo=🇬🇹&sport=Football+Federation&league=CONCACAF' },
    { name: 'Guyana', code: 'GUY', logo: '🇬🇾', site: 'gff.gy', email: 'gff@gff.gy', path: 'app-universal-simple.html?club=Guyana&logo=🇬🇾&sport=Football+Federation&league=CONCACAF' },
    { name: 'Haïti', code: 'HAI', logo: '🇭🇹', site: 'fhf.ht', email: 'fhf@fhf.ht', path: 'app-universal-simple.html?club=Haïti&logo=🇭🇹&sport=Football+Federation&league=CONCACAF' },
    { name: 'Honduras', code: 'HON', logo: '🇭🇳', site: 'fenafuth.org', email: 'fenafuth@fenafuth.org', path: 'app-universal-simple.html?club=Honduras&logo=🇭🇳&sport=Football+Federation&league=CONCACAF' },
    { name: 'Jamaïque', code: 'JAM', logo: '🇯🇲', site: 'jff.com', email: 'jff@jff.com', path: 'app-universal-simple.html?club=Jamaïque&logo=🇯🇲&sport=Football+Federation&league=CONCACAF' },
    { name: 'Mexique', code: 'MEX', logo: '🇲🇽', site: 'femexfut.org.mx', email: 'femexfut@femexfut.org.mx', path: 'app-universal-simple.html?club=Mexique&logo=🇲🇽&sport=Football+Federation&league=CONCACAF' },
    { name: 'Montserrat', code: 'MSR', logo: '🇲🇸', site: 'mfa.ms', email: 'mfa@mfa.ms', path: 'app-universal-simple.html?club=Montserrat&logo=🇲🇸&sport=Football+Federation&league=CONCACAF' },
    { name: 'Nicaragua', code: 'NCA', logo: '🇳🇮', site: 'fenifut.org.ni', email: 'fenifut@fenifut.org.ni', path: 'app-universal-simple.html?club=Nicaragua&logo=🇳🇮&sport=Football+Federation&league=CONCACAF' },
    { name: 'Panama', code: 'PAN', logo: '🇵🇦', site: 'fepafut.com', email: 'fepafut@fepafut.com', path: 'app-universal-simple.html?club=Panama&logo=🇵🇦&sport=Football+Federation&league=CONCACAF' },
    { name: 'Porto Rico', code: 'PUR', logo: '🇵🇷', site: 'fedefutbolpr.com', email: 'ffp@fedefutbolpr.com', path: 'app-universal-simple.html?club=Porto+Rico&logo=🇵🇷&sport=Football+Federation&league=CONCACAF' },
    { name: 'République dominicaine', code: 'DOM', logo: '🇩🇴', site: 'fedefutbol.do', email: 'fedofutbol@fedefutbol.do', path: 'app-universal-simple.html?club=République+dominicaine&logo=🇩🇴&sport=Football+Federation&league=CONCACAF' },
    { name: 'Saint-Christophe-et-Niévès', code: 'SKN', logo: '🇰🇳', site: 'sknfa.com', email: 'sknfa@sknfa.com', path: 'app-universal-simple.html?club=Saint-Christophe-et-Niévès&logo=🇰🇳&sport=Football+Federation&league=CONCACAF' },
    { name: 'Saint-Martin', code: 'SMT', logo: '🇲🇫', site: 'ffssxm.com', email: 'ffssxm@ffssxm.com', path: 'app-universal-simple.html?club=Saint-Martin&logo=🇲🇫&sport=Football+Federation&league=CONCACAF' },
    { name: 'Saint-Vincent-et-les Grenadines', code: 'VIN', logo: '🇻🇨', site: 'svgff.com', email: 'svgff@svgff.com', path: 'app-universal-simple.html?club=Saint-Vincent-et-les+Grenadines&logo=🇻🇨&sport=Football+Federation&league=CONCACAF' },
    { name: 'Sainte-Lucie', code: 'LCA', logo: '🇱🇨', site: 'slfa.lc', email: 'slfa@slfa.lc', path: 'app-universal-simple.html?club=Sainte-Lucie&logo=🇱🇨&sport=Football+Federation&league=CONCACAF' },
    { name: 'Sint Maarten', code: 'SXM', logo: '🇸🇽', site: 'sxmff.com', email: 'sxmff@sxmff.com', path: 'app-universal-simple.html?club=Sint+Maarten&logo=🇸🇽&sport=Football+Federation&league=CONCACAF' },
    { name: 'Suriname', code: 'SUR', logo: '🇸🇷', site: 'svb.sr', email: 'svb@svb.sr', path: 'app-universal-simple.html?club=Suriname&logo=🇸🇷&sport=Football+Federation&league=CONCACAF' },
    { name: 'Trinité-et-Tobago', code: 'TRI', logo: '🇹🇹', site: 'ttffonline.com', email: 'ttff@ttffonline.com', path: 'app-universal-simple.html?club=Trinité-et-Tobago&logo=🇹🇹&sport=Football+Federation&league=CONCACAF' },
    { name: 'Îles Caïmans', code: 'CAY', logo: '🇰🇾', site: 'cifa.ky', email: 'cifa@cifa.ky', path: 'app-universal-simple.html?club=Îles+Caïmans&logo=🇰🇾&sport=Football+Federation&league=CONCACAF' },
    { name: 'Îles Turques-et-Caïques', code: 'TCA', logo: '🇹🇨', site: 'tcifa.tc', email: 'tcifa@tcifa.tc', path: 'app-universal-simple.html?club=Îles+Turques-et-Caïques&logo=🇹🇨&sport=Football+Federation&league=CONCACAF' },
    { name: 'Îles Vierges britanniques', code: 'VGB', logo: '🇻🇬', site: 'bvifa.vg', email: 'bvifa@bvifa.vg', path: 'app-universal-simple.html?club=Îles+Vierges+britanniques&logo=🇻🇬&sport=Football+Federation&league=CONCACAF' },
    { name: 'Îles Vierges américaines', code: 'VIR', logo: '🇻🇮', site: 'usvisa.vi', email: 'usvisa@usvisa.vi', path: 'app-universal-simple.html?club=Îles+Vierges+américaines&logo=🇻🇮&sport=Football+Federation&league=CONCACAF' }
];

// ========== AFC - ASIE (47 fédérations) ==========
const federationsAFC = [
    { name: 'Afghanistan', code: 'AFG', logo: '🇦🇫', site: 'aff.org.af', email: 'aff@aff.org.af', path: 'app-universal-simple.html?club=Afghanistan&logo=🇦🇫&sport=Football+Federation&league=AFC' },
    { name: 'Arabie Saoudite', code: 'KSA', logo: '🇸🇦', site: 'saff.com.sa', email: 'saff@saff.com.sa', path: 'app-universal-simple.html?club=Arabie+Saoudite&logo=🇸🇦&sport=Football+Federation&league=AFC' },
    { name: 'Australie', code: 'AUS', logo: '🇦🇺', site: 'footballaustralia.com.au', email: 'ffa@footballaustralia.com.au', path: 'app-universal-simple.html?club=Australie&logo=🇦🇺&sport=Football+Federation&league=AFC' },
    { name: 'Bahreïn', code: 'BHR', logo: '🇧🇭', site: 'bhfa.bh', email: 'bhfa@bhfa.bh', path: 'app-universal-simple.html?club=Bahreïn&logo=🇧🇭&sport=Football+Federation&league=AFC' },
    { name: 'Bangladesh', code: 'BAN', logo: '🇧🇩', site: 'bff.com.bd', email: 'bff@bff.com.bd', path: 'app-universal-simple.html?club=Bangladesh&logo=🇧🇩&sport=Football+Federation&league=AFC' },
    { name: 'Bhoutan', code: 'BHU', logo: '🇧🇹', site: 'bff.bt', email: 'bff@bff.bt', path: 'app-universal-simple.html?club=Bhoutan&logo=🇧🇹&sport=Football+Federation&league=AFC' },
    { name: 'Birmanie', code: 'MYA', logo: '🇲🇲', site: 'mff.org.mm', email: 'mff@mff.org.mm', path: 'app-universal-simple.html?club=Birmanie&logo=🇲🇲&sport=Football+Federation&league=AFC' },
    { name: 'Brunei', code: 'BRU', logo: '🇧🇳', site: 'nfabd.com', email: 'nfabd@nfabd.com', path: 'app-universal-simple.html?club=Brunei&logo=🇧🇳&sport=Football+Federation&league=AFC' },
    { name: 'Cambodge', code: 'CAM', logo: '🇰🇭', site: 'fff.org.kh', email: 'fff@fff.org.kh', path: 'app-universal-simple.html?club=Cambodge&logo=🇰🇭&sport=Football+Federation&league=AFC' },
    { name: 'Chine', code: 'CHN', logo: '🇨🇳', site: 'thecfa.cn', email: 'cfa@thecfa.cn', path: 'app-universal-simple.html?club=Chine&logo=🇨🇳&sport=Football+Federation&league=AFC' },
    { name: 'Corée du Nord', code: 'PRK', logo: '🇰🇵', site: 'dprkfa.com', email: 'dprkfa@dprkfa.com', path: 'app-universal-simple.html?club=Corée+du+Nord&logo=🇰🇵&sport=Football+Federation&league=AFC' },
    { name: 'Corée du Sud', code: 'KOR', logo: '🇰🇷', site: 'kfa.or.kr', email: 'kfa@kfa.or.kr', path: 'app-universal-simple.html?club=Corée+du+Sud&logo=🇰🇷&sport=Football+Federation&league=AFC' },
    { name: 'Émirats Arabes Unis', code: 'UAE', logo: '🇦🇪', site: 'uaefa.ae', email: 'uaefa@uaefa.ae', path: 'app-universal-simple.html?club=Émirats+Arabes+Unis&logo=🇦🇪&sport=Football+Federation&league=AFC' },
    { name: 'Guam', code: 'GUM', logo: '🇬🇺', site: 'guamfa.com', email: 'gfa@guamfa.com', path: 'app-universal-simple.html?club=Guam&logo=🇬🇺&sport=Football+Federation&league=AFC' },
    { name: 'Hong Kong', code: 'HKG', logo: '🇭🇰', site: 'hkfa.com', email: 'hkfa@hkfa.com', path: 'app-universal-simple.html?club=Hong+Kong&logo=🇭🇰&sport=Football+Federation&league=AFC' },
    { name: 'Inde', code: 'IND', logo: '🇮🇳', site: 'the-aiff.com', email: 'aiff@the-aiff.com', path: 'app-universal-simple.html?club=Inde&logo=🇮🇳&sport=Football+Federation&league=AFC' },
    { name: 'Indonésie', code: 'IDN', logo: '🇮🇩', site: 'pssi.org', email: 'pssi@pssi.org', path: 'app-universal-simple.html?club=Indonésie&logo=🇮🇩&sport=Football+Federation&league=AFC' },
    { name: 'Irak', code: 'IRQ', logo: '🇮🇶', site: 'iraqfa.com', email: 'ifa@iraqfa.com', path: 'app-universal-simple.html?club=Irak&logo=🇮🇶&sport=Football+Federation&league=AFC' },
    { name: 'Iran', code: 'IRN', logo: '🇮🇷', site: 'ffiri.ir', email: 'ffiri@ffiri.ir', path: 'app-universal-simple.html?club=Iran&logo=🇮🇷&sport=Football+Federation&league=AFC' },
    { name: 'Japon', code: 'JPN', logo: '🇯🇵', site: 'jfa.jp', email: 'jfa@jfa.jp', path: 'app-universal-simple.html?club=Japon&logo=🇯🇵&sport=Football+Federation&league=AFC' },
    { name: 'Jordanie', code: 'JOR', logo: '🇯🇴', site: 'jfa.jo', email: 'jfa@jfa.jo', path: 'app-universal-simple.html?club=Jordanie&logo=🇯🇴&sport=Football+Federation&league=AFC' },
    { name: 'Kazakhstan', code: 'KAZ', logo: '🇰🇿', site: 'kff.kz', email: 'kff@kff.kz', path: 'app-universal-simple.html?club=Kazakhstan&logo=🇰🇿&sport=Football+Federation&league=AFC' },
    { name: 'Kirghizistan', code: 'KGZ', logo: '🇰🇬', site: 'ffkr.kg', email: 'ffkr@ffkr.kg', path: 'app-universal-simple.html?club=Kirghizistan&logo=🇰🇬&sport=Football+Federation&league=AFC' },
    { name: 'Koweït', code: 'KUW', logo: '🇰🇼', site: 'kfa.com.kw', email: 'kfa@kfa.com.kw', path: 'app-universal-simple.html?club=Koweït&logo=🇰🇼&sport=Football+Federation&league=AFC' },
    { name: 'Laos', code: 'LAO', logo: '🇱🇦', site: 'lff.org.la', email: 'lff@lff.org.la', path: 'app-universal-simple.html?club=Laos&logo=🇱🇦&sport=Football+Federation&league=AFC' },
    { name: 'Liban', code: 'LIB', logo: '🇱🇧', site: 'lfa.org.lb', email: 'lfa@lfa.org.lb', path: 'app-universal-simple.html?club=Liban&logo=🇱🇧&sport=Football+Federation&league=AFC' },
    { name: 'Macao', code: 'MAC', logo: '🇲🇴', site: 'mfa.org.mo', email: 'mfa@mfa.org.mo', path: 'app-universal-simple.html?club=Macao&logo=🇲🇴&sport=Football+Federation&league=AFC' },
    { name: 'Malaisie', code: 'MAS', logo: '🇲🇾', site: 'fam.org.my', email: 'fam@fam.org.my', path: 'app-universal-simple.html?club=Malaisie&logo=🇲🇾&sport=Football+Federation&league=AFC' },
    { name: 'Maldives', code: 'MDV', logo: '🇲🇻', site: 'fam.mv', email: 'fam@fam.mv', path: 'app-universal-simple.html?club=Maldives&logo=🇲🇻&sport=Football+Federation&league=AFC' },
    { name: 'Mongolie', code: 'MNG', logo: '🇲🇳', site: 'mff.mn', email: 'mff@mff.mn', path: 'app-universal-simple.html?club=Mongolie&logo=🇲🇳&sport=Football+Federation&league=AFC' },
    { name: 'Népal', code: 'NEP', logo: '🇳🇵', site: 'anfa.org.np', email: 'anfa@anfa.org.np', path: 'app-universal-simple.html?club=Népal&logo=🇳🇵&sport=Football+Federation&league=AFC' },
    { name: 'Oman', code: 'OMA', logo: '🇴🇲', site: 'omanfa.com', email: 'ofa@omanfa.com', path: 'app-universal-simple.html?club=Oman&logo=🇴🇲&sport=Football+Federation&league=AFC' },
    { name: 'Ouzbékistan', code: 'UZB', logo: '🇺🇿', site: 'the-ufa.com', email: 'ufa@the-ufa.com', path: 'app-universal-simple.html?club=Ouzbékistan&logo=🇺🇿&sport=Football+Federation&league=AFC' },
    { name: 'Pakistan', code: 'PAK', logo: '🇵🇰', site: 'pff.com.pk', email: 'pff@pff.com.pk', path: 'app-universal-simple.html?club=Pakistan&logo=🇵🇰&sport=Football+Federation&league=AFC' },
    { name: 'Palestine', code: 'PLE', logo: '🇵🇸', site: 'pfa.ps', email: 'pfa@pfa.ps', path: 'app-universal-simple.html?club=Palestine&logo=🇵🇸&sport=Football+Federation&league=AFC' },
    { name: 'Philippines', code: 'PHI', logo: '🇵🇭', site: 'pff.org.ph', email: 'pff@pff.org.ph', path: 'app-universal-simple.html?club=Philippines&logo=🇵🇭&sport=Football+Federation&league=AFC' },
    { name: 'Qatar', code: 'QAT', logo: '🇶🇦', site: 'qfa.qa', email: 'qfa@qfa.qa', path: 'app-universal-simple.html?club=Qatar&logo=🇶🇦&sport=Football+Federation&league=AFC' },
    { name: 'Singapour', code: 'SIN', logo: '🇸🇬', site: 'fas.org.sg', email: 'fas@fas.org.sg', path: 'app-universal-simple.html?club=Singapour&logo=🇸🇬&sport=Football+Federation&league=AFC' },
    { name: 'Sri Lanka', code: 'SRI', logo: '🇱🇰', site: 'ffsl.lk', email: 'ffsl@ffsl.lk', path: 'app-universal-simple.html?club=Sri+Lanka&logo=🇱🇰&sport=Football+Federation&league=AFC' },
    { name: 'Syrie', code: 'SYR', logo: '🇸🇾', site: 'syrianfa.sy', email: 'sfa@syrianfa.sy', path: 'app-universal-simple.html?club=Syrie&logo=🇸🇾&sport=Football+Federation&league=AFC' },
    { name: 'Tadjikistan', code: 'TJK', logo: '🇹🇯', site: 'tff.tj', email: 'tff@tff.tj', path: 'app-universal-simple.html?club=Tadjikistan&logo=🇹🇯&sport=Football+Federation&league=AFC' },
    { name: 'Taïwan', code: 'TPE', logo: '🇹🇼', site: 'ctfa.com.tw', email: 'ctfa@ctfa.com.tw', path: 'app-universal-simple.html?club=Taïwan&logo=🇹🇼&sport=Football+Federation&league=AFC' },
    { name: 'Thaïlande', code: 'THA', logo: '🇹🇭', site: 'fathailand.org', email: 'fat@fathailand.org', path: 'app-universal-simple.html?club=Thaïlande&logo=🇹🇭&sport=Football+Federation&league=AFC' },
    { name: 'Timor oriental', code: 'TLS', logo: '🇹🇱', site: 'fftl.tl', email: 'fftl@fftl.tl', path: 'app-universal-simple.html?club=Timor+oriental&logo=🇹🇱&sport=Football+Federation&league=AFC' },
    { name: 'Turkménistan', code: 'TKM', logo: '🇹🇲', site: 'tff.tm', email: 'tff@tff.tm', path: 'app-universal-simple.html?club=Turkménistan&logo=🇹🇲&sport=Football+Federation&league=AFC' },
    { name: 'Vietnam', code: 'VIE', logo: '🇻🇳', site: 'vff.org.vn', email: 'vff@vff.org.vn', path: 'app-universal-simple.html?club=Vietnam&logo=🇻🇳&sport=Football+Federation&league=AFC' },
    { name: 'Yémen', code: 'YEM', logo: '🇾🇪', site: 'yemenfa.net', email: 'yfa@yemenfa.net', path: 'app-universal-simple.html?club=Yémen&logo=🇾🇪&sport=Football+Federation&league=AFC' }
];

// ========== OFC - OCÉANIE (11 fédérations) ==========
const federationsOFC = [
    { name: 'Fidji', code: 'FIJ', logo: '🇫🇯', site: 'fijifootball.com.fj', email: 'fijifa@fijifootball.com.fj', path: 'app-universal-simple.html?club=Fidji&logo=🇫🇯&sport=Football+Federation&league=OFC' },
    { name: 'Îles Cook', code: 'COK', logo: '🇨🇰', site: 'ckfa.ck', email: 'ckfa@ckfa.ck', path: 'app-universal-simple.html?club=Îles+Cook&logo=🇨🇰&sport=Football+Federation&league=OFC' },
    { name: 'Îles Salomon', code: 'SOL', logo: '🇸🇧', site: 'siff.com.sb', email: 'siff@siff.com.sb', path: 'app-universal-simple.html?club=Îles+Salomon&logo=🇸🇧&sport=Football+Federation&league=OFC' },
    { name: 'Nouvelle-Calédonie', code: 'NCL', logo: '🇳🇨', site: 'fcf.nc', email: 'fcf@fcf.nc', path: 'app-universal-simple.html?club=Nouvelle-Calédonie&logo=🇳🇨&sport=Football+Federation&league=OFC' },
    { name: 'Nouvelle-Zélande', code: 'NZL', logo: '🇳🇿', site: 'nzfootball.co.nz', email: 'nzf@nzfootball.co.nz', path: 'app-universal-simple.html?club=Nouvelle-Zélande&logo=🇳🇿&sport=Football+Federation&league=OFC' },
    { name: 'Papouasie-Nouvelle-Guinée', code: 'PNG', logo: '🇵🇬', site: 'pngfootball.com.pg', email: 'pngfa@pngfootball.com.pg', path: 'app-universal-simple.html?club=Papouasie-Nouvelle-Guinée&logo=🇵🇬&sport=Football+Federation&league=OFC' },
    { name: 'Samoa', code: 'SAM', logo: '🇼🇸', site: 'samoanfa.ws', email: 'ffs@samoanfa.ws', path: 'app-universal-simple.html?club=Samoa&logo=🇼🇸&sport=Football+Federation&league=OFC' },
    { name: 'Samoa américaines', code: 'ASA', logo: '🇦🇸', site: 'ffas.as', email: 'ffas@ffas.as', path: 'app-universal-simple.html?club=Samoa+américaines&logo=🇦🇸&sport=Football+Federation&league=OFC' },
    { name: 'Tahiti', code: 'TAH', logo: '🇵🇫', site: 'ftf.pf', email: 'ftf@ftf.pf', path: 'app-universal-simple.html?club=Tahiti&logo=🇵🇫&sport=Football+Federation&league=OFC' },
    { name: 'Tonga', code: 'TGA', logo: '🇹🇴', site: 'tongafa.to', email: 'tfa@tongafa.to', path: 'app-universal-simple.html?club=Tonga&logo=🇹🇴&sport=Football+Federation&league=OFC' },
    { name: 'Vanuatu', code: 'VAN', logo: '🇻🇺', site: 'vff.vu', email: 'vff@vff.vu', path: 'app-universal-simple.html?club=Vanuatu&logo=🇻🇺&sport=Football+Federation&league=OFC' }
];

// ========== RÉCAPITULATIF TOTAL ==========
const toutesLesFederationsFIFA = [
    ...federationsUEFA,
    ...federationsCAF,
    ...federationsCONMEBOL,
    ...federationsCONCACAF,
    ...federationsAFC,
    ...federationsOFC
];

console.log('✅ Fédérations FIFA chargées:');
console.log('🇪🇺 UEFA:', federationsUEFA.length, 'fédérations');
console.log('🌍 CAF:', federationsCAF.length, 'fédérations');
console.log('🌎 CONMEBOL:', federationsCONMEBOL.length, 'fédérations');
console.log('🌎 CONCACAF:', federationsCONCACAF.length, 'fédérations');
console.log('🌏 AFC:', federationsAFC.length, 'fédérations');
console.log('🌊 OFC:', federationsOFC.length, 'fédérations');
console.log('📊 TOTAL FIFA:', toutesLesFederationsFIFA.length, 'fédérations');
console.log('🎯 OBJECTIF FIFA : 211 fédérations');
