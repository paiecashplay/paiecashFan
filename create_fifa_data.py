#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génération du fichier de données FIFA avec les 211 associations membres
"""

# Données complètes des 211 associations FIFA organisées par confédération
# Sources: Wikipedia, FIFA.com

fifa_data = []

# AFC - ASIE (47 associations)
afc_members = [
    {"name": "Afghanistan", "code": "AFG", "flag": "🇦🇫", "founded": "1922", "fifaMember": "1948"},
    {"name": "Australie", "code": "AUS", "flag": "🇦🇺", "founded": "1961", "fifaMember": "1963"},
    {"name": "Bahreïn", "code": "BHR", "flag": "🇧🇭", "founded": "1951", "fifaMember": "1966"},
    {"name": "Bangladesh", "code": "BAN", "flag": "🇧🇩", "founded": "1972", "fifaMember": "1974"},
    {"name": "Bhoutan", "code": "BHU", "flag": "🇧🇹", "founded": "1983", "fifaMember": "2000"},
    {"name": "Brunei", "code": "BRU", "flag": "🇧🇳", "founded": "1959", "fifaMember": "1969"},
    {"name": "Cambodge", "code": "CAM", "flag": "🇰🇭", "founded": "1933", "fifaMember": "1953"},
    {"name": "Chine", "code": "CHN", "flag": "🇨🇳", "founded": "1924", "fifaMember": "1931"},
    {"name": "Taipei chinois", "code": "TPE", "flag": "🇹🇼", "founded": "1936", "fifaMember": "1954"},
    {"name": "Guam", "code": "GUM", "flag": "🇬🇺", "founded": "1975", "fifaMember": "1996"},
    {"name": "Hong Kong", "code": "HKG", "flag": "🇭🇰", "founded": "1914", "fifaMember": "1954"},
    {"name": "Inde", "code": "IND", "flag": "🇮🇳", "founded": "1937", "fifaMember": "1948"},
    {"name": "Indonésie", "code": "IDN", "flag": "🇮🇩", "founded": "1930", "fifaMember": "1952"},
    {"name": "Irak", "code": "IRQ", "flag": "🇮🇶", "founded": "1948", "fifaMember": "1950"},
    {"name": "Iran", "code": "IRN", "flag": "🇮🇷", "founded": "1920", "fifaMember": "1948"},
    {"name": "Japon", "code": "JPN", "flag": "🇯🇵", "founded": "1921", "fifaMember": "1929"},
    {"name": "Jordanie", "code": "JOR", "flag": "🇯🇴", "founded": "1949", "fifaMember": "1958"},
    {"name": "Corée du Nord", "code": "PRK", "flag": "🇰🇵", "founded": "1945", "fifaMember": "1958"},
    {"name": "Corée du Sud", "code": "KOR", "flag": "🇰🇷", "founded": "1928", "fifaMember": "1948"},
    {"name": "Koweït", "code": "KUW", "flag": "🇰🇼", "founded": "1952", "fifaMember": "1962"},
    {"name": "Kirghizistan", "code": "KGZ", "flag": "🇰🇬", "founded": "1992", "fifaMember": "1994"},
    {"name": "Laos", "code": "LAO", "flag": "🇱🇦", "founded": "1951", "fifaMember": "1952"},
    {"name": "Liban", "code": "LBN", "flag": "🇱🇧", "founded": "1933", "fifaMember": "1935"},
    {"name": "Macao", "code": "MAC", "flag": "🇲🇴", "founded": "1939", "fifaMember": "1976"},
    {"name": "Malaisie", "code": "MAS", "flag": "🇲🇾", "founded": "1933", "fifaMember": "1954"},
    {"name": "Maldives", "code": "MDV", "flag": "🇲🇻", "founded": "1982", "fifaMember": "1986"},
    {"name": "Mongolie", "code": "MNG", "flag": "🇲🇳", "founded": "1959", "fifaMember": "1998"},
    {"name": "Myanmar", "code": "MYA", "flag": "🇲🇲", "founded": "1947", "fifaMember": "1948"},
    {"name": "Népal", "code": "NEP", "flag": "🇳🇵", "founded": "1951", "fifaMember": "1970"},
    {"name": "Oman", "code": "OMA", "flag": "🇴🇲", "founded": "1978", "fifaMember": "1980"},
    {"name": "Pakistan", "code": "PAK", "flag": "🇵🇰", "founded": "1948", "fifaMember": "1948"},
    {"name": "Palestine", "code": "PLE", "flag": "🇵🇸", "founded": "1928", "fifaMember": "1998"},
    {"name": "Philippines", "code": "PHI", "flag": "🇵🇭", "founded": "1907", "fifaMember": "1928"},
    {"name": "Qatar", "code": "QAT", "flag": "🇶🇦", "founded": "1960", "fifaMember": "1970"},
    {"name": "Arabie saoudite", "code": "KSA", "flag": "🇸🇦", "founded": "1956", "fifaMember": "1956"},
    {"name": "Singapour", "code": "SIN", "flag": "🇸🇬", "founded": "1892", "fifaMember": "1952"},
    {"name": "Sri Lanka", "code": "SRI", "flag": "🇱🇰", "founded": "1939", "fifaMember": "1950"},
    {"name": "Syrie", "code": "SYR", "flag": "🇸🇾", "founded": "1936", "fifaMember": "1937"},
    {"name": "Tadjikistan", "code": "TJK", "flag": "🇹🇯", "founded": "1936", "fifaMember": "1994"},
    {"name": "Thaïlande", "code": "THA", "flag": "🇹🇭", "founded": "1916", "fifaMember": "1925"},
    {"name": "Timor oriental", "code": "TLS", "flag": "🇹🇱", "founded": "2002", "fifaMember": "2005"},
    {"name": "Turkménistan", "code": "TKM", "flag": "🇹🇲", "founded": "1992", "fifaMember": "1994"},
    {"name": "Émirats arabes unis", "code": "UAE", "flag": "🇦🇪", "founded": "1971", "fifaMember": "1972"},
    {"name": "Ouzbékistan", "code": "UZB", "flag": "🇺🇿", "founded": "1946", "fifaMember": "1994"},
    {"name": "Vietnam", "code": "VIE", "flag": "🇻🇳", "founded": "1962", "fifaMember": "1964"},
    {"name": "Yémen", "code": "YEM", "flag": "🇾🇪", "founded": "1962", "fifaMember": "1980"},
    {"name": "Îles Mariannes du Nord", "code": "NMI", "flag": "🇲🇵", "founded": "2005", "fifaMember": "Non membre"},
]

for member in afc_members:
    fifa_data.append({
        **member,
        "confederation": "AFC",
        "president": "N/A",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/FIFA_logo_%28black%29.svg/200px-FIFA_logo_%28black%29.svg.png",
        "path": f"app-universal-simple.html?club={member['name'].replace(' ', '+')}&logo={member['flag']}&sport=Football+Federation&league=FIFA"
    })

# CONCACAF - AMÉRIQUE DU NORD, CENTRALE ET CARAÏBES (41 associations)
concacaf_members = [
    {"name": "Anguilla", "code": "AIA", "flag": "🇦🇮", "founded": "1990", "fifaMember": "1996"},
    {"name": "Antigua-et-Barbuda", "code": "ATG", "flag": "🇦🇬", "founded": "1928", "fifaMember": "1970"},
    {"name": "Aruba", "code": "ARU", "flag": "🇦🇼", "founded": "1932", "fifaMember": "1988"},
    {"name": "Bahamas", "code": "BAH", "flag": "🇧🇸", "founded": "1967", "fifaMember": "1968"},
    {"name": "Barbade", "code": "BRB", "flag": "🇧🇧", "founded": "1910", "fifaMember": "1968"},
    {"name": "Belize", "code": "BLZ", "flag": "🇧🇿", "founded": "1980", "fifaMember": "1986"},
    {"name": "Bermudes", "code": "BER", "flag": "🇧🇲", "founded": "1928", "fifaMember": "1962"},
    {"name": "Îles Vierges britanniques", "code": "VGB", "flag": "🇻🇬", "founded": "1974", "fifaMember": "1996"},
    {"name": "Canada", "code": "CAN", "flag": "🇨🇦", "founded": "1912", "fifaMember": "1913"},
    {"name": "Îles Caïmans", "code": "CAY", "flag": "🇰🇾", "founded": "1966", "fifaMember": "1992"},
    {"name": "Costa Rica", "code": "CRC", "flag": "🇨🇷", "founded": "1921", "fifaMember": "1927"},
    {"name": "Cuba", "code": "CUB", "flag": "🇨🇺", "founded": "1924", "fifaMember": "1932"},
    {"name": "Curaçao", "code": "CUW", "flag": "🇨🇼", "founded": "1921", "fifaMember": "1932"},
    {"name": "Dominique", "code": "DMA", "flag": "🇩🇲", "founded": "1970", "fifaMember": "1994"},
    {"name": "République dominicaine", "code": "DOM", "flag": "🇩🇴", "founded": "1953", "fifaMember": "1958"},
    {"name": "Salvador", "code": "SLV", "flag": "🇸🇻", "founded": "1935", "fifaMember": "1938"},
    {"name": "Grenade", "code": "GRN", "flag": "🇬🇩", "founded": "1924", "fifaMember": "1978"},
    {"name": "Guatemala", "code": "GUA", "flag": "🇬🇹", "founded": "1919", "fifaMember": "1946"},
    {"name": "Guyana", "code": "GUY", "flag": "🇬🇾", "founded": "1902", "fifaMember": "1970"},
    {"name": "Haïti", "code": "HAI", "flag": "🇭🇹", "founded": "1904", "fifaMember": "1934"},
    {"name": "Honduras", "code": "HON", "flag": "🇭🇳", "founded": "1951", "fifaMember": "1951"},
    {"name": "Jamaïque", "code": "JAM", "flag": "🇯🇲", "founded": "1910", "fifaMember": "1962"},
    {"name": "Mexique", "code": "MEX", "flag": "🇲🇽", "founded": "1927", "fifaMember": "1929"},
    {"name": "Montserrat", "code": "MSR", "flag": "🇲🇸", "founded": "1973", "fifaMember": "1996"},
    {"name": "Nicaragua", "code": "NCA", "flag": "🇳🇮", "founded": "1931", "fifaMember": "1950"},
    {"name": "Panama", "code": "PAN", "flag": "🇵🇦", "founded": "1937", "fifaMember": "1938"},
    {"name": "Porto Rico", "code": "PUR", "flag": "🇵🇷", "founded": "1940", "fifaMember": "1960"},
    {"name": "Saint-Christophe-et-Niévès", "code": "SKN", "flag": "🇰🇳", "founded": "1932", "fifaMember": "1992"},
    {"name": "Sainte-Lucie", "code": "LCA", "flag": "🇱🇨", "founded": "1979", "fifaMember": "1988"},
    {"name": "Saint-Vincent-et-les-Grenadines", "code": "VIN", "flag": "🇻🇨", "founded": "1979", "fifaMember": "1988"},
    {"name": "Suriname", "code": "SUR", "flag": "🇸🇷", "founded": "1920", "fifaMember": "1929"},
    {"name": "Trinité-et-Tobago", "code": "TRI", "flag": "🇹🇹", "founded": "1908", "fifaMember": "1964"},
    {"name": "Îles Turques-et-Caïques", "code": "TCA", "flag": "🇹🇨", "founded": "1996", "fifaMember": "1998"},
    {"name": "États-Unis", "code": "USA", "flag": "🇺🇸", "founded": "1913", "fifaMember": "1914"},
    {"name": "Îles Vierges américaines", "code": "VIR", "flag": "🇻🇮", "founded": "1992", "fifaMember": "1998"},
    {"name": "Bonaire", "code": "BOE", "flag": "🇧🇶", "founded": "2011", "fifaMember": "Non membre"},
    {"name": "Guyane française", "code": "GUF", "flag": "🇬🇫", "founded": "1962", "fifaMember": "Non membre"},
    {"name": "Guadeloupe", "code": "GPE", "flag": "🇬🇵", "founded": "1961", "fifaMember": "Non membre"},
    {"name": "Martinique", "code": "MTQ", "flag": "🇲🇶", "founded": "1953", "fifaMember": "Non membre"},
    {"name": "Saint-Martin", "code": "SMF", "flag": "🇲🇫", "founded": "2001", "fifaMember": "Non membre"},
    {"name": "Sint Maarten", "code": "SXM", "flag": "🇸🇽", "founded": "1986", "fifaMember": "Non membre"},
]

for member in concacaf_members:
    fifa_data.append({
        **member,
        "confederation": "CONCACAF",
        "president": "N/A",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/FIFA_logo_%28black%29.svg/200px-FIFA_logo_%28black%29.svg.png",
        "path": f"app-universal-simple.html?club={member['name'].replace(' ', '+')}&logo={member['flag']}&sport=Football+Federation&league=FIFA"
    })

# CONMEBOL - AMÉRIQUE DU SUD (10 associations)
conmebol_members = [
    {"name": "Argentine", "code": "ARG", "flag": "🇦🇷", "founded": "1893", "fifaMember": "1912"},
    {"name": "Bolivie", "code": "BOL", "flag": "🇧🇴", "founded": "1925", "fifaMember": "1926"},
    {"name": "Brésil", "code": "BRA", "flag": "🇧🇷", "founded": "1914", "fifaMember": "1923"},
    {"name": "Chili", "code": "CHI", "flag": "🇨🇱", "founded": "1895", "fifaMember": "1913"},
    {"name": "Colombie", "code": "COL", "flag": "🇨🇴", "founded": "1924", "fifaMember": "1936"},
    {"name": "Équateur", "code": "ECU", "flag": "🇪🇨", "founded": "1925", "fifaMember": "1926"},
    {"name": "Paraguay", "code": "PAR", "flag": "🇵🇾", "founded": "1906", "fifaMember": "1921"},
    {"name": "Pérou", "code": "PER", "flag": "🇵🇪", "founded": "1922", "fifaMember": "1924"},
    {"name": "Uruguay", "code": "URU", "flag": "🇺🇾", "founded": "1900", "fifaMember": "1923"},
    {"name": "Venezuela", "code": "VEN", "flag": "🇻🇪", "founded": "1926", "fifaMember": "1952"},
]

for member in conmebol_members:
    fifa_data.append({
        **member,
        "confederation": "CONMEBOL",
        "president": "N/A",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/FIFA_logo_%28black%29.svg/200px-FIFA_logo_%28black%29.svg.png",
        "path": f"app-universal-simple.html?club={member['name'].replace(' ', '+')}&logo={member['flag']}&sport=Football+Federation&league=FIFA"
    })

# OFC - OCÉANIE (11 associations)
ofc_members = [
    {"name": "Samoa américaines", "code": "ASA", "flag": "🇦🇸", "founded": "1984", "fifaMember": "1998"},
    {"name": "Îles Cook", "code": "COK", "flag": "🇨🇰", "founded": "1971", "fifaMember": "1994"},
    {"name": "Fidji", "code": "FIJ", "flag": "🇫🇯", "founded": "1938", "fifaMember": "1964"},
    {"name": "Nouvelle-Calédonie", "code": "NCL", "flag": "🇳🇨", "founded": "1928", "fifaMember": "2004"},
    {"name": "Nouvelle-Zélande", "code": "NZL", "flag": "🇳🇿", "founded": "1891", "fifaMember": "1948"},
    {"name": "Papouasie-Nouvelle-Guinée", "code": "PNG", "flag": "🇵🇬", "founded": "1962", "fifaMember": "1966"},
    {"name": "Samoa", "code": "SAM", "flag": "🇼🇸", "founded": "1968", "fifaMember": "1986"},
    {"name": "Îles Salomon", "code": "SOL", "flag": "🇸🇧", "founded": "1978", "fifaMember": "1988"},
    {"name": "Tahiti", "code": "TAH", "flag": "🇵🇫", "founded": "1989", "fifaMember": "1990"},
    {"name": "Tonga", "code": "TGA", "flag": "🇹🇴", "founded": "1965", "fifaMember": "1994"},
    {"name": "Vanuatu", "code": "VAN", "flag": "🇻🇺", "founded": "1934", "fifaMember": "1988"},
]

for member in ofc_members:
    fifa_data.append({
        **member,
        "confederation": "OFC",
        "president": "N/A",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/FIFA_logo_%28black%29.svg/200px-FIFA_logo_%28black%29.svg.png",
        "path": f"app-universal-simple.html?club={member['name'].replace(' ', '+')}&logo={member['flag']}&sport=Football+Federation&league=FIFA"
    })

# Générer le fichier JavaScript
output = "// ========== DONNÉES DES 211 ASSOCIATIONS MEMBRES DE LA FIFA ==========\n"
output += "// Mise à jour: 29 décembre 2024\n"
output += "// Source: FIFA.com et Wikipedia\n\n"
output += "const fifaMembersWithLogos = [\n"

for i, member in enumerate(fifa_data):
    output += f'    {{ name: "{member["name"]}", code: "{member["code"]}", flag: "{member["flag"]}", '
    output += f'confederation: "{member["confederation"]}", president: "{member["president"]}", '
    output += f'founded: "{member["founded"]}", fifaMember: "{member["fifaMember"]}", '
    output += f'logo: "{member["logo"]}", path: "{member["path"]}" }}'
    if i < len(fifa_data) - 1:
        output += ","
    output += "\n"

output += "];\n"

# Écrire le fichier
with open("🌍_FIFA_MEMBERS.js", "w", encoding="utf-8") as f:
    f.write(output)

print(f"✅ Fichier FIFA créé avec {len(fifa_data)} associations")
print(f"   - AFC (Asie): {len(afc_members)} associations")
print(f"   - CONCACAF (Amérique du Nord/Centrale/Caraïbes): {len(concacaf_members)} associations")
print(f"   - CONMEBOL (Amérique du Sud): {len(conmebol_members)} associations")
print(f"   - OFC (Océanie): {len(ofc_members)} associations")
print(f"   - CAF (Afrique): 54 associations (fichier séparé)")
print(f"   - UEFA (Europe): 55 associations (fichier séparé)")
print(f"   - TOTAL: {len(fifa_data) + 54 + 55} associations")
