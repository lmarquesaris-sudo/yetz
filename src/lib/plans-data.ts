/**
 * Real Barcelona spots for plan generation.
 * Organized by neighborhood with zone detection.
 * Integrates real events from mock-events.ts.
 */

import { MOCK_EVENTS } from "./mock-events";
import type { Event } from "./types";

export interface Restaurant {
  name: string;
  type: string;
  priceRange: "€" | "€€";
  zone: Zone;
  vibe: string;
}

export interface Bar {
  name: string;
  type: string;
  zone: Zone;
  vibe: string;
}

export interface Walk {
  name: string;
  zone: Zone;
  description: string;
  duration: string;
}

export interface CulturalSpot {
  name: string;
  type: "museo" | "galeria" | "centre cultural" | "teatre" | "sala" | "espai";
  zone: Zone;
  what: string;
  price: string;
}

// ─── Zones ────────────────────────────────────────────────────

export type Zone =
  | "gotic"           // 1. Gòtic / Centro Histórico
  | "born"            // 2. Born
  | "raval"           // 3. Raval
  | "barceloneta"     // 4. Barceloneta / Port Vell
  | "sant-antoni"     // 5. Sant Antoni
  | "poble-sec"       // 6. Poble-sec / Paral·lel
  | "eixample-esquerra" // 7. Eixample Esquerra
  | "eixample-dreta"  // 8. Eixample Dreta / Passeig de Gràcia
  | "sagrada-familia" // 9. Sagrada Família / Fort Pienc
  | "gracia"          // 10. Gràcia
  | "poblenou"        // 11. Poblenou / 22@
  | "vila-olimpica"   // 12. Vila Olímpica / Front Marítim
  | "sant-marti"      // 13. Sant Martí (Clot, Camp de l'Arpa, Diagonal Mar)
  | "sant-andreu"     // 14. Sant Andreu / La Sagrera
  | "nou-barris"      // 15. Nou Barris
  | "sarria-pedralbes" // Extra: Sarrià (kept for existing venues)
  | "les-corts"       // Extra: Les Corts (kept for existing venues)
  | "horta-guinardo"  // Extra: Horta-Guinardó (kept for existing venues)
  | "any";

const ZONE_KEYWORDS: Record<Zone, string[]> = {
  // 1. GÒTIC / CENTRO HISTÓRICO
  "gotic": [
    "gòtic", "gotic", "gótic", "gothic", "catedral", "barri gòtic",
    "la rambla", "las ramblas", "rambla", "portal de l'àngel", "portal del angel",
    "ferran", "avinyó", "portaferrissa", "ciutat vella",
    "liceu", "drassanes", "plaça reial", "plaza real",
    "plaça sant jaume", "plaça nova", "plaça del rei", "call",
    "carrer ferran", "centro historico", "centro histórico",
  ],
  // 2. BORN
  "born": [
    "born", "sant pere", "santa caterina", "ribera", "la ribera",
    "passeig del born", "princesa", "argenteria", "comerç", "rec",
    "jaume i", "jaume", "arc de triomf", "urquinaona",
    "carrer montcada", "museu picasso", "meam", "moco museum",
    "palau de la música", "mercat santa caterina",
    "santa maria del mar", "casc antic", "via laietana",
  ],
  // 3. RAVAL
  "raval": [
    "raval", "macba", "cccb", "rambla del raval", "joaquín costa",
    "joaquin costa", "tallers", "hospital", "sant pau del camp",
    "filmoteca", "arts santa mònica", "plaça dels àngels",
    "carrer del carme", "robador", "plaça gardunya",
    "boqueria",
  ],
  // 4. BARCELONETA / PORT VELL
  "barceloneta": [
    "barceloneta", "port vell", "joan de borbó", "passeig joan de borbó",
    "moll de la fusta", "w hotel", "hotel vela", "maremagnum", "maremàgnum",
    "platja barceloneta", "playa barceloneta",
  ],
  // 5. SANT ANTONI
  "sant-antoni": [
    "sant antoni", "san antonio", "mercat sant antoni", "parlament",
    "manso", "comte borrell", "tamarit", "sant antoni market",
    "ronda sant pau", "ronda sant antoni", "calàbria", "viladomat",
    "floridablanca",
  ],
  // 6. POBLE-SEC / PARAL·LEL
  "poble-sec": [
    "poble-sec", "poble sec", "poblesec", "paral·lel", "paralel", "parallel",
    "blai", "carrer blai", "margarit", "apolo", "sala apolo",
    "montjuïc", "montjuic", "mnac", "fundació miró", "miró", "miro",
    "caixaforum", "font màgica", "font magica", "mercat de les flors",
    "teatre lliure", "jardí botànic", "grec", "anella olímpica",
    "plaça espanya", "plaça españa",
    "poeta cabanyes", "carrer nou de la rambla",
  ],
  // 7. EIXAMPLE ESQUERRA
  "eixample-esquerra": [
    "eixample esquerra", "enric granados", "aribau", "muntaner",
    "consell de cent", "universitat", "hospital clínic", "clinic",
    "urgell", "rocafort", "entença", "calabria", "casanova",
    "nova esquerra", "antiga esquerra",
    "mercat ninot", "london bar",
  ],
  // 8. EIXAMPLE DRETA / PASSEIG DE GRÀCIA
  "eixample-dreta": [
    "eixample dreta", "passeig de gràcia", "paseo de gracia",
    "rambla catalunya", "rambla de catalunya",
    "girona", "pau claris", "roger de llúria",
    "tetuan", "casa batlló", "la pedrera", "casa milà", "casa mila",
    "casa amatller", "fundació tàpies", "tapies",
    "plaça catalunya", "plaza cataluña", "plaça de catalunya",
    "mercat concepció", "eixample", "dreta",
    "balmes",
  ],
  // 9. SAGRADA FAMÍLIA / FORT PIENC
  "sagrada-familia": [
    "sagrada familia", "sagrada família", "fort pienc",
    "avinguda gaudí", "marina", "sicília",
    "monumental", "hospital de sant pau", "sant pau",
    "encants", "mercat dels encants",
  ],
  // 10. GRÀCIA
  "gracia": [
    "gràcia", "gracia", "vila de gràcia",
    "verdi", "torrent de l'olla", "gran de gràcia", "gran de gracia",
    "fontana", "joanic", "lesseps",
    "plaça del sol", "plaça de la virreina", "plaça diamant",
    "plaça revolució", "plaça rius i taulet",
    "casa vicens", "mercat abaceria",
    "camp d'en grassot", "camp grassot", "vallcarca",
    "carrer astúries",
  ],
  // 11. POBLENOU / 22@
  "poblenou": [
    "poblenou", "poble nou", "22@",
    "rambla del poblenou", "rambla poblenou",
    "pere iv", "llacuna", "bogatell",
    "palo alto", "can framis", "museu del disseny", "dhub",
    "torre glòries", "torre agbar", "provençals",
    "selva de mar",
  ],
  // 12. VILA OLÍMPICA / FRONT MARÍTIM
  "vila-olimpica": [
    "vila olímpica", "vila olimpica", "front marítim", "front maritim",
    "ciutadella", "ciutadella vila olímpica",
    "icària", "icaria", "nova icària", "nova icaria",
    "port olímpic", "port olimpic",
    "opium", "shoko", "cdlc", "casino barcelona",
    "zoo",
  ],
  // 13. SANT MARTÍ (Clot, Camp de l'Arpa, Diagonal Mar)
  "sant-marti": [
    "sant martí", "sant marti", "clot", "camp de l'arpa", "camp arpa",
    "diagonal mar", "besòs", "besos", "provençals del poblenou",
    "bac de roda", "el maresme", "verneda",
    "mercat del clot", "parc del clot",
    "glòries", "glories", "forum", "fòrum",
  ],
  // 14. SANT ANDREU / LA SAGRERA
  "sant-andreu": [
    "sant andreu", "la sagrera", "sagrera", "navas", "congrés",
    "fabra i puig", "fabra i coats", "sant andreu de palomar",
    "bon pastor", "baró de viver", "trinitat vella",
  ],
  // 15. NOU BARRIS
  "nou-barris": [
    "nou barris", "porta", "prosperitat", "verdum", "verdun",
    "roquetes", "trinitat nova", "torre baró", "torre baro",
    "llucmajor", "via júlia", "via julia", "canyelles",
    "ciutat meridiana", "guineueta", "vilapicina", "turó de la peira",
  ],
  // Extra zones (kept for existing venue data)
  "sarria-pedralbes": [
    "sarrià", "sarria", "pedralbes", "tibidabo", "bonanova",
    "sant gervasi", "tres torres", "zona alta", "cosmocaixa",
    "monestir de pedralbes", "turó park", "la bonanova",
    "vallvidrera", "collserola", "carretera de les aigües",
  ],
  "les-corts": [
    "les corts", "camp nou", "spotify camp nou", "barça", "barca",
    "maternitat", "collblanc",
  ],
  "horta-guinardo": [
    "horta", "guinardó", "guinardo", "carmel",
    "park güell", "parc güell", "park guell", "parc guell",
    "laberint", "laberint d'horta", "laberinto de horta",
    "bunkers", "bunkers del carmel", "turó de la rovira",
    "vall d'hebron",
  ],
  "any": [],
};

const ZONE_NAMES: Record<Zone, string> = {
  "gotic": "el Gòtic",
  "born": "el Born",
  "raval": "el Raval",
  "barceloneta": "la Barceloneta",
  "sant-antoni": "Sant Antoni",
  "poble-sec": "Poble-sec i Paral·lel",
  "eixample-esquerra": "Eixample Esquerra",
  "eixample-dreta": "Eixample Dreta / Passeig de Gràcia",
  "sagrada-familia": "Sagrada Família / Fort Pienc",
  "gracia": "Gràcia",
  "poblenou": "Poblenou / 22@",
  "vila-olimpica": "Vila Olímpica",
  "sant-marti": "Sant Martí (Clot, Diagonal Mar)",
  "sant-andreu": "Sant Andreu / La Sagrera",
  "nou-barris": "Nou Barris",
  "sarria-pedralbes": "Sarrià-Pedralbes",
  "les-corts": "Les Corts",
  "horta-guinardo": "Horta-Guinardó",
  "any": "Barcelona",
};

// ─── Restaurants ──────────────────────────────────────────────

export const RESTAURANTS_BUDGET: Restaurant[] = [
  // Born
  { name: "Tres Mentiras", type: "Mexicana", priceRange: "€", zone: "born", vibe: "tacos d'autor en un local petit amb molt rotllo" },
  { name: "Bodega la Palma", type: "Ibèrica", priceRange: "€", zone: "born", vibe: "bodega clàssica amb pernil, formatges i vins de barril" },
  { name: "Fragments", type: "Mediterrània", priceRange: "€", zone: "born", vibe: "cuina de mercat en una placeta amagada, plats per compartir" },
  { name: "El Xampanyet", type: "Catalana", priceRange: "€", zone: "born", vibe: "cava i tapes de tota la vida en un bar amb rajoles que porta aquí més de cent anys" },
  // Raval
  { name: "Bar Cañete", type: "Mediterrània", priceRange: "€", zone: "raval", vibe: "barra de mercat amb tapes espectaculars, del millor del Raval" },
  { name: "Dos Palillos", type: "Asiàtica fusió", priceRange: "€", zone: "raval", vibe: "tapes asiàtiques a la barra, cuina oberta i molta personalitat" },
  { name: "Caravelle", type: "Brunch / casual", priceRange: "€", zone: "raval", vibe: "brunch amb producte, bowls i bon cafè en un local bonic" },
  // Eixample Esquerra
  { name: "Kasa Ramen", type: "Japonesa", priceRange: "€", zone: "eixample-esquerra", vibe: "ramen reconfortant i ben fet a bon preu, al cor de l'Eixample" },
  { name: "La Flauta", type: "Catalana", priceRange: "€", zone: "eixample-esquerra", vibe: "flautetes farcides, tapes de mercat i vins per copes al carrer Aribau — institució del barri" },
  { name: "De Tapa Madre", type: "Tapes", priceRange: "€", zone: "eixample-esquerra", vibe: "tapes creatives i generoses a Enric Granados, bona terrassa i ambient animat" },
  { name: "Amaltea", type: "Vegetariana", priceRange: "€", zone: "eixample-esquerra", vibe: "cuina vegetariana de mercat amb menú del dia excel·lent, al carrer Diputació" },
  { name: "Céleri", type: "Healthy", priceRange: "€", zone: "eixample-esquerra", vibe: "brunch i menjar saludable amb producte fresc a Enric Granados, ambient bonic i lluminós" },
  // Eixample Esquerra (moved from wrong zones)
  { name: "Moritz", type: "Variada", priceRange: "€", zone: "sant-antoni", vibe: "la fàbrica de cervesa reconvertida en un espai brutal amb terrassa i menjar per compartir" },
  { name: "Flax & Kale", type: "Healthy", priceRange: "€", zone: "raval", vibe: "cuina saludable i flexitariana amb terrassa al carrer Tallers" },
  // Gràcia
  { name: "La Pepita", type: "Entrepans", priceRange: "€", zone: "gracia", vibe: "els millors entrepans gourmet de Barcelona, sense discussió" },
  { name: "Chivuo's", type: "Hamburgueses", priceRange: "€", zone: "gracia", vibe: "hamburgueses de qualitat amb tocs creatius en ple Gràcia" },
  { name: "Café Godot", type: "Mediterrània", priceRange: "€", zone: "gracia", vibe: "menú del dia bo i bonic en una cantonada amb encant" },
  { name: "Sol Soler", type: "Tapes", priceRange: "€", zone: "gracia", vibe: "tapes catalanes a la Plaça del Sol, institució del barri" },
  // Poblenou
  { name: "Els Pescadors", type: "Marinera", priceRange: "€", zone: "poblenou", vibe: "arrossos i peix de mercat a la plaça de Prim, un clàssic del barri" },
  { name: "La Llavor dels Orígens", type: "Catalana", priceRange: "€", zone: "poblenou", vibe: "tot producte català quilòmetre zero, en un local preciós" },
  { name: "Can Recasens", type: "Catalana", priceRange: "€", zone: "poblenou", vibe: "bodega-colmado de tota la vida, embotits, formatges i vins a granel" },
  { name: "Parking Pizza", type: "Italiana", priceRange: "€", zone: "poblenou", vibe: "pizza napolitana de massa mare en un antic pàrquing industrial" },
  // Barceloneta
  { name: "Bronzo", type: "Italiana", priceRange: "€", zone: "barceloneta", vibe: "pasta fresca artesanal amb vistes al mar" },
  { name: "La Mar Salada", type: "Marinera", priceRange: "€", zone: "barceloneta", vibe: "arrossos i fideuà amb producte fresc del dia, bé de preu" },
  { name: "Bitácora", type: "Mediterrània", priceRange: "€", zone: "barceloneta", vibe: "terrassa al passeig marítim amb tapes de mercat i bon ambient" },
  // Poble-sec
  { name: "Can Vilaró", type: "Catalana", priceRange: "€", zone: "poble-sec", vibe: "cuina catalana casolana i honesta, menú del dia per menys de quinze euros" },
  { name: "Quimet & Quimet", type: "Tapes", priceRange: "€", zone: "poble-sec", vibe: "muntaditos increïbles en un local minúscul ple d'ampolles — mític de Poble-sec" },
  { name: "Bodega Saltó", type: "Tapes", priceRange: "€", zone: "poble-sec", vibe: "bodega castissa amb vermut de tap, tapes i decoració impossible" },
  // Sant Antoni
  { name: "Gèlida", type: "Mediterrània", priceRange: "€", zone: "sant-antoni", vibe: "vins naturals i plats per compartir en un ambient relaxat" },
  { name: "Federal Café", type: "Brunch", priceRange: "€", zone: "sant-antoni", vibe: "brunch australià amb terrassa interior, bon cafè i ous perfectes" },
  // Sarrià / Zona Alta
  { name: "Flash Flash", type: "Truites", priceRange: "€", zone: "sarria-pedralbes", vibe: "mític de Barcelona — truites espectaculars i decoració pop dels 70" },
  { name: "Vivanda", type: "Catalana", priceRange: "€", zone: "sarria-pedralbes", vibe: "cuina catalana de mercat en un jardí preciós de Sarrià" },
  { name: "Bar Tomás", type: "Tapes", priceRange: "€", zone: "sarria-pedralbes", vibe: "les patates braves més famoses de Barcelona, punt" },
  // Les Corts
  { name: "A Contraluz", type: "Mediterrània", priceRange: "€", zone: "les-corts", vibe: "terrassa amb jardí interior amagada a Les Corts, un oasi que pocs coneixen" },
  { name: "La Tagliatella (Les Corts)", type: "Italiana", priceRange: "€", zone: "les-corts", vibe: "pasta fresca i pizzes fiables en ple barri, bé per anar-hi sense pensar-hi gaire" },
  { name: "Can Culleretes de Les Corts", type: "Catalana", priceRange: "€", zone: "les-corts", vibe: "cuina catalana casolana de tota la vida, menú del dia honest" },
  // Sant Martí (Clot / Camp de l'Arpa)
  { name: "El 58", type: "Tapes fusió", priceRange: "€", zone: "sant-marti", vibe: "tapes creatives amb toc internacional, una de les sorpreses del Clot" },
  { name: "La Mundana", type: "Mediterrània", priceRange: "€", zone: "sant-marti", vibe: "producte de mercat i carta curta que canvia cada setmana, ambient acollidor" },
  { name: "Can Vallès", type: "Catalana", priceRange: "€", zone: "sant-marti", vibe: "cuina de mercat de barri com la d'abans, amb guisats que reconforten" },
  // Sant Martí / Vila Olímpica
  { name: "Honest Greens (Glòries)", type: "Healthy", priceRange: "€", zone: "sant-marti", vibe: "menjar sa i ben fet a bon preu, perfecte per anar-hi ràpid" },
  { name: "Bar Leo", type: "Tapes", priceRange: "€", zone: "sant-marti", vibe: "braves, bombes i calamars en un bar de barri que porta dècades" },
  { name: "La Lluna (Vila Olímpica)", type: "Marinera", priceRange: "€", zone: "vila-olimpica", vibe: "paelles i fideuà amb vistes al Port Olímpic, bon pla de diumenge" },
  // Horta-Guinardó
  { name: "Can Travi Nou", type: "Catalana", priceRange: "€", zone: "horta-guinardo", vibe: "masia del XVII amb jardí, cuina catalana en un lloc que no sembla Barcelona" },
  { name: "El Rincón de Horta", type: "Mediterrània", priceRange: "€", zone: "horta-guinardo", vibe: "terrassa tranquil·la amb menú casolà, el secret més ben guardat d'Horta" },
  { name: "La Vermutería del Guinardó", type: "Tapes", priceRange: "€", zone: "horta-guinardo", vibe: "vermut de tap, anxoves i braves en un bar amb ànima de barri" },
  // Sant Andreu
  { name: "Can Sadurní", type: "Catalana", priceRange: "€", zone: "sant-andreu", vibe: "cuina catalana de tota la vida a la rambla de Sant Andreu, com menjar a casa" },
  { name: "El Petit Andreu", type: "Tapes", priceRange: "€", zone: "sant-andreu", vibe: "tapes i vins en un bar bonic del barri, bon ambient local" },
  // Nou Barris
  { name: "Can Paixano Nou Barris", type: "Catalana", priceRange: "€", zone: "nou-barris", vibe: "cuina casolana catalana sense pretensions i a bon preu" },
  { name: "El Mirador de Roquetes", type: "Mediterrània", priceRange: "€", zone: "nou-barris", vibe: "restaurant amb terrassa i vistes a la ciutat, la recompensa després de pujar" },
  // Gòtic
  { name: "Can Culleretes", type: "Catalana", priceRange: "€", zone: "gotic", vibe: "el restaurant més antic de Barcelona, des de 1786 — escudella, carn d'olla i cuina catalana de tota la vida" },
  { name: "Café de l'Acadèmia", type: "Catalana", priceRange: "€", zone: "gotic", vibe: "cuina catalana de mercat a la Plaça Sant Just, un dels racons més bonics del Gòtic" },
  { name: "Los Caracoles", type: "Catalana", priceRange: "€", zone: "gotic", vibe: "cargols al forn, pollastre rostit i arrossos des de 1835 — institució de Barcelona" },
  // Sagrada Família
  { name: "La Paradeta", type: "Marinera", priceRange: "€", zone: "sagrada-familia", vibe: "tries el peix i marisc a pes com al mercat i te'l cuinen al moment — format únic i divertit" },
  { name: "Arume", type: "Gallega", priceRange: "€", zone: "sagrada-familia", vibe: "cuina gallega autèntica amb polp, pimentos de Padrón i vins del Rías Baixas" },
  // Eixample Dreta
  { name: "Cervecería Catalana", type: "Tapes", priceRange: "€", zone: "eixample-dreta", vibe: "la barra de tapes més famosa de Barcelona — patates braves, anxoves i croquetes de tota la vida" },
  { name: "Ciudad Condal", type: "Tapes", priceRange: "€", zone: "eixample-dreta", vibe: "tapes generoses i cerveses fredes a Rambla Catalunya, institució del barri" },
  { name: "Taktika Berri", type: "Basca", priceRange: "€", zone: "eixample-dreta", vibe: "pintxos bascos autèntics a la barra, txacolí i ambient de taberna de San Sebastián" },
];

export const RESTAURANTS_PREMIUM: Restaurant[] = [
  // Born
  { name: "Coure", type: "Catalana", priceRange: "€€", zone: "born", vibe: "alta cuina catalana accessible, menú degustació molt bo" },
  { name: "Shunka", type: "Japonesa", priceRange: "€€", zone: "born", vibe: "el japonès de referència de Barcelona, barra de sushi increïble" },
  { name: "Cal Pep", type: "Marinera", priceRange: "€€", zone: "born", vibe: "barra mítica amb el millor producte de mercat, menjar aquí és una experiència" },
  // Raval
  { name: "Ca l'Isidre", type: "Catalana", priceRange: "€€", zone: "raval", vibe: "cuina catalana clàssica de tota la vida, un dels grans de la ciutat" },
  // Eixample Dreta
  { name: "Nairod", type: "Catalana", priceRange: "€€", zone: "eixample-dreta", vibe: "cuina catalana contemporània amb producte de temporada" },
  { name: "Gresca", type: "Catalana", priceRange: "€€", zone: "eixample-dreta", vibe: "cuina creativa d'autor, una de les millors relacions qualitat-preu de la ciutat" },
  { name: "Nomo", type: "Japonesa", priceRange: "€€", zone: "eixample-dreta", vibe: "japonesa premium amb omakase i productes de primera" },
  { name: "Leku", type: "Basca", priceRange: "€€", zone: "eixample-dreta", vibe: "pintxos i cuina basca de nivell amb una barra espectacular" },
  // Gràcia
  { name: "Deliri", type: "Catalana", priceRange: "€€", zone: "gracia", vibe: "cuina catalana moderna en un espai íntim" },
  { name: "Botafumeiro", type: "Gallega", priceRange: "€€", zone: "gracia", vibe: "marisc gallec de primer nivell, dels millors de Barcelona" },
  // Poblenou
  { name: "Cinc Sentits", type: "Catalana", priceRange: "€€", zone: "eixample-esquerra", vibe: "cuina catalana d'autor amb producte de temporada, menú degustació que val molt la pena — estrella Michelin accessible" },
  { name: "Mordisco", type: "Mediterrània", priceRange: "€€", zone: "eixample-esquerra", vibe: "cuina mediterrània informal però amb molt de nivell a Enric Granados, terrassa i ambient cuidat" },
  { name: "La Barca del Salamanca", type: "Marinera", priceRange: "€€", zone: "poblenou", vibe: "arrossos amb vistes al port olímpic, cuina marinera de nivell" },
  // Barceloneta
  { name: "Can Paixano (La Xampanyeria)", type: "Catalana", priceRange: "€€", zone: "barceloneta", vibe: "cava i entrepans a preu de riure al bar més divertit del barri" },
  // Poble-sec
  { name: "Tickets", type: "Creativa", priceRange: "€€", zone: "poble-sec", vibe: "tapes creatives dels Adrià, cada plat és un espectacle" },
  // Sant Antoni
  { name: "Maleducat", type: "Catalana", priceRange: "€€", zone: "sant-antoni", vibe: "arrossos espectaculars i cuina de mercat amb personalitat" },
  // Sarrià / Zona Alta
  { name: "Asador de Aranda", type: "Castellana", priceRange: "€€", zone: "sarria-pedralbes", vibe: "xai i porcella en un edifici modernista espectacular" },
  { name: "Hofmann", type: "Creativa", priceRange: "€€", zone: "sarria-pedralbes", vibe: "escola de cuina i restaurant, creativitat amb base clàssica impecable" },
  // Les Corts
  { name: "Via Veneto", type: "Clàssica", priceRange: "€€", zone: "les-corts", vibe: "alta cuina clàssica amb estrella Michelin, elegància d'una altra època" },
  // Sant Martí (Clot / Camp de l'Arpa)
  { name: "Xemei", type: "Italiana", priceRange: "€€", zone: "sant-marti", vibe: "cuina veneciana d'autor amb cícheti i pastes fetes a casa" },
  { name: "La Mundana (degustación)", type: "Mediterrània", priceRange: "€€", zone: "sant-marti", vibe: "menú degustació amb producte de mercat que canvia cada setmana" },
  // Sant Martí
  { name: "Arola (Hotel Arts)", type: "Mediterrània", priceRange: "€€", zone: "vila-olimpica", vibe: "terrassa vora el mar de l'Hotel Arts, cuina mediterrània de nivell amb vistes" },
  // Horta-Guinardó
  { name: "Can Travi Nou (menú)", type: "Catalana premium", priceRange: "€€", zone: "horta-guinardo", vibe: "menú degustació en una masia històrica amb jardí, experiència única fora del centre" },
  // Sant Andreu
  { name: "La Fonda del Recó", type: "Catalana", priceRange: "€€", zone: "sant-andreu", vibe: "cuina catalana actualitzada amb producte de mercat a Sant Andreu" },
  // Gòtic
  { name: "Koy Shunka", type: "Japonesa", priceRange: "€€", zone: "gotic", vibe: "japonès d'alt nivell davant la Catedral, estrella Michelin — omakase que deixa sense paraules" },
  { name: "Sensi Tapas", type: "Mediterrània", priceRange: "€€", zone: "gotic", vibe: "tapes d'autor mediterrànies amb producte de primera, al cor del Gòtic" },
  // Sagrada Família
  { name: "Alkimia", type: "Catalana", priceRange: "€€", zone: "sagrada-familia", vibe: "cuina catalana d'autor del chef Jordi Vilà, producte de temporada elevat al màxim" },
];

// ─── Bars ─────────────────────────────────────────────────────

export const BARS: Bar[] = [
  // Born
  { name: "Paradiso", type: "Speakeasy", zone: "born", vibe: "s'amaga darrere d'una nevera d'un bar de pastrami — top 50 mundial" },
  { name: "La Vinya del Senyor", type: "Wine bar", zone: "born", vibe: "terrassa davant de Santa Maria del Mar amb una carta de vins brutal" },
  { name: "Bodega Maestrazgo", type: "Bodega", zone: "born", vibe: "vermut de tap i conserves, bodega amb cinquanta anys d'història" },
  { name: "Collage Cocktail Bar", type: "Cocktail bar", zone: "born", vibe: "còctels d'autor en un local íntim amb maó vist" },
  // Raval
  { name: "33|45", type: "Bar musical", zone: "raval", vibe: "vinils, còctels i bona música en un bar amb ànima" },
  { name: "Betty Ford's", type: "Cocktail bar", zone: "raval", vibe: "bar americà kitsch amb còctels potents i bon rotllo" },
  { name: "Casa Almirall", type: "Bar històric", zone: "raval", vibe: "el bar més antic del Raval, amb l'absenta de sempre i un interior modernista preciós" },
  { name: "Negroni", type: "Cocktail bar", zone: "raval", vibe: "còctels clàssics ben fets en un local fosc i acollidor de Joaquín Costa" },
  // Eixample Dreta
  { name: "Dry Martini", type: "Cocktail bar clàssic", zone: "eixample-dreta", vibe: "el bar de còctels clàssic per excel·lència, barra de fusta i cambrers de jaqueta" },
  { name: "Bar Mut", type: "Wine bar", zone: "eixample-dreta", vibe: "vermut, anxoves i aquell punt de bar clàssic barceloní que sempre funciona" },
  { name: "Bobby's Free", type: "Speakeasy", zone: "eixample-dreta", vibe: "speakeasy dins d'una barberia — trobes la porta i és un altre món" },
  { name: "El Maravillas", type: "Rooftop", zone: "eixample-dreta", vibe: "Aperol Spritz a l'àtic de l'Hotel Almanac amb vistes a la ciutat" },
  { name: "Bridge 48", type: "Cocktail bar", zone: "eixample-dreta", vibe: "còctels d'autor en un espai industrial molt cuidat" },
  // Gràcia
  { name: "Elephanta", type: "Bar musical", zone: "gracia", vibe: "còctels, música en vinil i una barra preciosa al cor de Gràcia" },
  { name: "Bobby Gin", type: "Gin bar", zone: "gracia", vibe: "gin-tonics d'autor amb botànics propis, en un local amb molt de caràcter" },
  { name: "Virreina Bar", type: "Terrassa", zone: "gracia", vibe: "terrassa a la Plaça de la Virreina amb canyes i vermut, pau total" },
  { name: "Café del Sol", type: "Terrassa", zone: "gracia", vibe: "la terrassa clàssica de Plaça del Sol, canyes i capvespre" },
  // Poblenou
  { name: "Madame George", type: "Cocktail bar", zone: "poblenou", vibe: "còctels creatius en un local preciós amb planta i maó vist" },
  { name: "Nomad Coffee", type: "Specialty coffee", zone: "poblenou", vibe: "el millor cafè d'especialitat de Barcelona, torrat aquí mateix" },
  { name: "La Cervecita Nuestra de Cada Día", type: "Cerveseria craft", zone: "poblenou", vibe: "trenta grifons de cervesa artesana i el millor pulled pork de la zona" },
  { name: "Oso", type: "Wine bar", zone: "poblenou", vibe: "vins naturals i tapes de mercat en un espai industrial del Poblenou" },
  // Barceloneta
  { name: "La Cervecería", type: "Cerveseria", zone: "barceloneta", vibe: "canyes i braves davant del mar, institució de la Barceloneta" },
  { name: "Vai Moana", type: "Chiringuito", zone: "barceloneta", vibe: "mojitos amb els peus gairebé a la sorra i capvespre davant" },
  { name: "Santa Marta", type: "Terrassa", zone: "barceloneta", vibe: "terrassa amb vistes al mar i cuina mediterrània informal" },
  // Poble-sec
  { name: "Bar Calders", type: "Terrassa", zone: "poble-sec", vibe: "la terrassa més buscada de Poble-sec, vermut i plats per picar" },
  { name: "La Caseta del Migdia", type: "Chiringuito", zone: "poble-sec", vibe: "chiringuito amagat a Montjuïc entre pins — costa trobar-lo però val la pena" },
  { name: "Absenta Bar", type: "Bar històric", zone: "poble-sec", vibe: "absenta i còctels en un local ple de nines i art urbà" },
  // Sant Antoni
  { name: "Bar Brutal", type: "Wine bar", zone: "sant-antoni", vibe: "vins naturals i tapes a Can Cisa, el colmado reconvertit més bonic del barri" },
  { name: "La Confitería", type: "Bar històric", zone: "sant-antoni", vibe: "antiga confiteria del XIX reconvertida en bar de còctels, el sostre és una obra d'art" },
  // Sarrià / Zona Alta
  { name: "Mirablau", type: "Bar amb vistes", zone: "sarria-pedralbes", vibe: "còctels amb les vistes més espectaculars de Barcelona, al peu del Tibidabo" },
  { name: "Terraza del Hotel Ohla", type: "Rooftop", zone: "sarria-pedralbes", vibe: "piscina i còctels amb vistes panoràmiques de la ciutat" },
  { name: "Marcel", type: "Wine bar", zone: "sarria-pedralbes", vibe: "vinoteca tranquil·la a Sarrià amb bona selecció i tapes d'autor" },
  // Les Corts
  { name: "Garage Beer Co (Les Corts)", type: "Cerveseria craft", zone: "les-corts", vibe: "cervesa artesana de barri amb terrassa, bon pla informal" },
  { name: "Cocktail Bar Les Corts", type: "Cocktail bar", zone: "les-corts", vibe: "còctels clàssics ben fets en un bar de barri amb encant" },
  // Sant Martí (Clot / Camp de l'Arpa)
  { name: "La Rovira", type: "Terrassa", zone: "sant-marti", vibe: "terrassa de barri amb vermut, canyes i aquell rotllo de Clot autèntic" },
  { name: "Bar Eléctric", type: "Cocktail bar", zone: "sant-marti", vibe: "còctels creatius en un local petit amb molta personalitat a Camp de l'Arpa" },
  { name: "La Cervecería del Clot", type: "Cerveseria craft", zone: "sant-marti", vibe: "grifons de cervesa artesana local i tapes, ambient jove i relaxat" },
  // Vila Olímpica
  { name: "Shôko", type: "Lounge", zone: "vila-olimpica", vibe: "còctels davant del mar al Port Olímpic, terrassa amb capvespre" },
  { name: "Opium Barcelona", type: "Lounge", zone: "vila-olimpica", vibe: "còctels i música vora la platja, ambient nocturn amb estil" },
  { name: "Ice Barcelona", type: "Bar temàtic", zone: "vila-olimpica", vibe: "bar de gel amb còctels inclosos i l'experiència d'estar a -5 graus" },
  // Horta-Guinardó
  { name: "El Mirador del Carmel", type: "Terrassa", zone: "horta-guinardo", vibe: "cerveses amb les millors vistes de Barcelona des dels Bunkers, capvespre obligatori" },
  { name: "Bar del Laberint", type: "Terrassa", zone: "horta-guinardo", vibe: "terrassa tranquil·la a prop del Laberint d'Horta, vermut i calma" },
  { name: "La Vermutería del Guinardó", type: "Vermuteria", zone: "horta-guinardo", vibe: "vermut artesà, olives grosses i aquella vida de barri que no trobes al centre" },
  // Sant Andreu
  { name: "Bar La Rambla de Sant Andreu", type: "Terrassa", zone: "sant-andreu", vibe: "vermut i tapes a la rambla per a vianants, el centre de la vida del barri" },
  { name: "La Fábrica (Fabra i Coats)", type: "Bar cultural", zone: "sant-andreu", vibe: "bar al recinte cultural de Fabra i Coats, cervesa i exposicions" },
  // Nou Barris
  { name: "Bar Mirador Torre Baró", type: "Terrassa", zone: "nou-barris", vibe: "cerveses amb vistes panoràmiques des de dalt de Nou Barris, un secret de la ciutat" },
  { name: "El Chiringuito de Roquetes", type: "Terrassa", zone: "nou-barris", vibe: "terrassa de barri amb ambient local i preus populars, bon vermut" },
  // Gòtic
  { name: "L'Ascensor", type: "Cocktail bar", zone: "gotic", vibe: "cocktails en un local amb porta d'ascensor antiga, un clàssic amagat del Gòtic" },
  { name: "Sor Rita", type: "Bar", zone: "gotic", vibe: "decoració kitsch i camp, vermuts i ambient desinhibit a la Plaça George Orwell" },
  { name: "Glaciar", type: "Terrassa", zone: "gotic", vibe: "la terrassa de tota la vida a Plaça Reial, cerveses i veure la gent passar" },
  // Sagrada Família
  { name: "Garage Beer Co", type: "Cerveceria craft", zone: "sagrada-familia", vibe: "cervesa artesana feta aquí mateix, grifos rotatius i ambient informal" },
  { name: "La Vermuteria de la Sagrada Família", type: "Vermuteria", zone: "sagrada-familia", vibe: "vermut de tap, olives i aquell rotllo de barri que no trobes al centre" },
  // Eixample Esquerra
  { name: "Milano Cocktail Bar", type: "Cocktail bar", zone: "eixample-esquerra", vibe: "còctels clàssics en un soterrani elegant, un dels secrets més ben guardats de l'Eixample" },
  { name: "Slow Barcelona", type: "Wine bar", zone: "eixample-esquerra", vibe: "vins naturals i tapes d'autor a Enric Granados, ambient íntim i carta curta però impecable" },
  { name: "Garage Beer Co", type: "Cerveceria craft", zone: "eixample-esquerra", vibe: "cervesa artesana elaborada aquí mateix amb grifos rotatius, ambient industrial i informal" },
];

// ─── Walks ────────────────────────────────────────────────────

export const WALKS: Walk[] = [
  { name: "el Born", zone: "born", description: "carrerons plens de galeries, botigues boniques i terrasses fins a Santa Maria del Mar", duration: "45 min" },
  { name: "el Gòtic", zone: "gotic", description: "des de la Catedral per la Plaça del Rei, el Call Jueu i placetes que porten segles allà", duration: "40 min" },
  { name: "el Raval", zone: "raval", description: "del MACBA pel Carrer dels Tallers, ambient multicultural i llocs inesperats", duration: "35 min" },
  { name: "Gràcia", zone: "gracia", description: "placetes amb terrasses, botigues vintage i aquell rotllo de poble dins la ciutat", duration: "40 min" },
  { name: "la Rambla del Poblenou", zone: "poblenou", description: "la rambla de barri més autèntica de Barcelona, terrasses, plataners i veïns de tota la vida", duration: "30 min" },
  { name: "Poblenou industrial", zone: "poblenou", description: "naus reconvertides, street art, Palo Alto i el Poblenou que mira al futur sense oblidar les fàbriques", duration: "50 min" },
  { name: "la Barceloneta", zone: "barceloneta", description: "pel Port Vell, travessar els carrerons de pescadors i acabar a la platja", duration: "50 min" },
  { name: "el passeig marítim", zone: "barceloneta", description: "des de la Barceloneta fins al Port Olímpic amb el Mediterrani a l'esquerra", duration: "40 min" },
  { name: "Montjuïc", zone: "poble-sec", description: "pujar fins al MNAC amb vistes de tota Barcelona, jardins i aquell silenci de muntanya enmig de la ciutat", duration: "1h" },
  { name: "Poble-sec y Paral·lel", zone: "poble-sec", description: "del Paral·lel pujant pels carrers empinats del barri, horts urbans i terrasses amagades", duration: "35 min" },
  { name: "el Eixample", zone: "eixample-dreta", description: "Passeig de Gràcia, façanes modernistes, Enric Granados i el ritme pausat de les illes del Cerdà", duration: "1h" },
  { name: "Sarrià pueblo", zone: "sarria-pedralbes", description: "carrers de poble dins la ciutat, el Mercat de Sarrià i el Monestir de Pedralbes", duration: "45 min" },
  { name: "Sant Antoni y alrededores", zone: "sant-antoni", description: "des del Mercat de Sant Antoni per Parlament i Manso, bon ambient i botigues de disseny", duration: "30 min" },
  // Nuevas zonas
  { name: "Les Corts y el Camp Nou", zone: "les-corts", description: "per la zona universitària fins al Camp Nou, barri residencial amb racons tranquils", duration: "40 min" },
  { name: "el Clot y Camp de l'Arpa", zone: "sant-marti", description: "carrers amb ambient de barri, places amagades i murals d'art urbà que pocs turistes veuen", duration: "35 min" },
  { name: "la Vila Olímpica al port", zone: "vila-olimpica", description: "des de Ciutadella pel Port Olímpic fins a la platja de la Nova Icària, passeig entre art i mar", duration: "45 min" },
  { name: "Horta y el Laberint", zone: "horta-guinardo", description: "pujar al Laberint d'Horta, el jardí neoclàssic més antic de Barcelona, i baixar per carrers amb història", duration: "1h" },
  { name: "los Bunkers del Carmel", zone: "horta-guinardo", description: "la pujada fins al mirador més famós de Barcelona — l'esforç val cada vista", duration: "50 min" },
  { name: "Rambla de Sant Andreu", zone: "sant-andreu", description: "passeig per la rambla per a vianants del barri, mercat, església i ambient de poble dins la ciutat", duration: "30 min" },
  { name: "Nou Barris y miradores", zone: "nou-barris", description: "pujar a Torre Baró per vistes que competeixen amb Montjuïc però sense un sol turista", duration: "50 min" },
  { name: "l'Avinguda Gaudí", zone: "sagrada-familia", description: "el passeig peatonal que connecta la Sagrada Família amb l'Hospital de Sant Pau, modernisme a banda i banda", duration: "20 min" },
  { name: "Enric Granados", zone: "eixample-esquerra", description: "el carrer peatonal més bonic de l'Eixample, terrasses, galeries i botigues de disseny entre illes del Cerdà", duration: "30 min" },
];

// ─── Cultural spots ───────────────────────────────────────────

export const CULTURAL_SPOTS: CulturalSpot[] = [
  // Born
  { name: "Museu Picasso", type: "museo", zone: "born", what: "cinc palaus medievals amb l'etapa més jove de Picasso", price: "12 €" },
  { name: "MEAM", type: "museo", zone: "born", what: "art figuratiu contemporani en un palau del Born — sorprèn molt", price: "11 €" },
  { name: "Moco Museum", type: "museo", zone: "born", what: "Banksy, KAWS, Haring — art modern i contemporani molt visual", price: "16 €" },
  // Gòtic
  { name: "Museu d'Història de Barcelona (MUHBA)", type: "museo", zone: "gotic", what: "la Barcelona romana sota els teus peus, una passada caminar per carrers del segle I", price: "7 €" },
  { name: "Basílica de Santa Maria del Mar", type: "espai", zone: "born", what: "gòtic català en estat pur, la llum que hi entra és màgica", price: "gratuïta" },
  // Raval
  { name: "MACBA", type: "museo", zone: "raval", what: "art contemporani amb la plaça plena de skaters i bon ambient", price: "11 €" },
  { name: "CCCB", type: "centre cultural", zone: "raval", what: "exposicions que et fan pensar i un pati de vidre preciós", price: "6 €" },
  { name: "Filmoteca de Catalunya", type: "centre cultural", zone: "raval", what: "cinema d'autor, cicles i retrospectives a preu de riure a la Plaça de Salvador Seguí", price: "4 €" },
  { name: "Arts Santa Mònica", type: "centre cultural", zone: "raval", what: "art i cultura contemporània amb entrada gratuïta al final de la Rambla", price: "gratuïta" },
  // Eixample Dreta
  { name: "Fundació Antoni Tàpies", type: "museo", zone: "eixample-dreta", what: "l'obra de Tàpies en un edifici modernista de Domènech i Montaner", price: "8 €" },
  { name: "Casa Batlló", type: "museo", zone: "eixample-dreta", what: "Gaudí en estat pur, la façana del drac i un interior que sembla el fons del mar", price: "35 €" },
  { name: "La Pedrera", type: "museo", zone: "eixample-dreta", what: "l'àtic de guerrers de Gaudí i l'exposició del pis modernista", price: "25 €" },
  { name: "Fundació Suñol", type: "galeria", zone: "eixample-dreta", what: "art contemporani de la col·lecció Suñol, gratis i sempre amb alguna joia", price: "gratuïta" },
  // Gràcia
  { name: "Casa Vicens", type: "museo", zone: "gracia", what: "la primera casa de Gaudí, rajoles impossibles i un jardí preciós", price: "18 €" },
  { name: "Mercat de l'Abaceria", type: "espai", zone: "gracia", what: "mercat de barri amb producte fresc i bon ambient local", price: "gratuïta" },
  // Poblenou
  { name: "Museu del Disseny", type: "museo", zone: "poblenou", what: "disseny, moda i arts decoratives a l'edifici Dhub de Glòries — gratuït el primer diumenge", price: "8 €" },
  { name: "Can Framis", type: "museo", zone: "poblenou", what: "pintura contemporània catalana en una antiga fàbrica tèxtil reconvertida", price: "5 €" },
  { name: "Palo Alto Market", type: "espai", zone: "poblenou", what: "mercat creatiu el primer cap de setmana de mes en un recinte industrial amb jardí — música, food trucks i dissenyadors locals", price: "gratuïta" },
  { name: "Centre Cívic Can Felipa", type: "centre cultural", zone: "poblenou", what: "exposicions i activitats culturals en una antiga fàbrica del barri", price: "gratuïta" },
  { name: "Espai Nyamnyam", type: "espai", zone: "poblenou", what: "arts vives i performatives en un espai independent del Poblenou", price: "5-10 €" },
  // Barceloneta
  { name: "Museu d'Història de Catalunya", type: "museo", zone: "barceloneta", what: "la història de Catalunya de forma interactiva, amb una terrassa a l'àtic amb vistes al port", price: "6 €" },
  // Poble-sec / Montjuïc
  { name: "Fundació Joan Miró", type: "museo", zone: "poble-sec", what: "l'univers de Miró en un edifici de Sert amb una llum increïble", price: "16 €" },
  { name: "MNAC", type: "museo", zone: "poble-sec", what: "la millor col·lecció d'art romànic del món, i les vistes des de l'esplanada", price: "12 € (gratis diumenges tarda)" },
  { name: "CaixaForum", type: "centre cultural", zone: "poble-sec", what: "grans exposicions internacionals a l'antiga fàbrica Casaramona", price: "6 €" },
  { name: "Jardí Botànic de Barcelona", type: "espai", zone: "poble-sec", what: "plantes mediterrànies amb vistes al mar, un passeig de natura enmig de la ciutat", price: "5 €" },
  // Sarrià / Zona Alta
  { name: "CosmoCaixa", type: "museo", zone: "sarria-pedralbes", what: "el millor museu de ciència d'Espanya, amb un bosc tropical a dins", price: "6 €" },
  { name: "Monestir de Pedralbes", type: "museo", zone: "sarria-pedralbes", what: "claustre gòtic amb tres pisos i uns frescos medievals que treuen l'alè", price: "5 €" },
  { name: "Jardins de Pedralbes", type: "espai", zone: "sarria-pedralbes", what: "jardins senyorials i festival de música a l'estiu", price: "gratuïta" },
  // Sant Antoni
  { name: "Mercat de Sant Antoni", type: "espai", zone: "sant-antoni", what: "el mercat més bonic de Barcelona després de la reforma, diumenges hi ha mercat de llibres", price: "gratuïta" },
  // Les Corts
  { name: "Camp Nou Experience", type: "museo", zone: "les-corts", what: "el museu del Barça i el nou estadi, una peregrinació per a qualsevol culer", price: "28 €" },
  { name: "Jardins de la Maternitat", type: "espai", zone: "les-corts", what: "jardins de l'antic complex modernista de la Maternitat, un racó de pau a Les Corts", price: "gratuïta" },
  // Sant Martí (Clot)
  { name: "Mercat del Clot", type: "espai", zone: "sant-marti", what: "mercat de barri amb producte fresc i ambient local autèntic", price: "gratuïta" },
  { name: "Parc del Clot", type: "espai", zone: "sant-marti", what: "parc construït sobre una antiga estació de tren amb arcs de maó originals", price: "gratuïta" },
  // Vila Olímpica
  { name: "Museu Olímpic i de l'Esport", type: "museo", zone: "vila-olimpica", what: "la història dels JJOO del 92 i de l'esport, interactiu i divertit", price: "5,80 €" },
  { name: "Parc de la Ciutadella", type: "espai", zone: "vila-olimpica", what: "el pulmó verd de Barcelona amb la cascada monumental, el llac i el zoo — passejar-hi és obligatori", price: "gratuïta" },
  // Horta-Guinardó
  { name: "Laberint d'Horta", type: "espai", zone: "horta-guinardo", what: "el jardí neoclàssic més antic de Barcelona amb un laberint de xiprers, preciós i tranquil", price: "gratuïta dg/dc" },
  { name: "Bunkers del Carmel", type: "espai", zone: "horta-guinardo", what: "antigues bateries antiaèries convertides en el mirador més espectacular de Barcelona — 360 graus de ciutat", price: "gratuïta" },
  { name: "Park Güell", type: "museo", zone: "horta-guinardo", what: "el parc de Gaudí amb el drac, el banc ondulat i vistes de tota Barcelona", price: "10 €" },
  // Sant Andreu
  { name: "Fabra i Coats", type: "centre cultural", zone: "sant-andreu", what: "antiga fàbrica tèxtil reconvertida en centre de creació artística amb exposicions i residències", price: "gratuïta" },
  { name: "Església de Sant Andreu de Palomar", type: "espai", zone: "sant-andreu", what: "església romànica al cor del barri, la plaça del voltant té molta vida", price: "gratuïta" },
  // Nou Barris
  { name: "Mirador de Torre Baró", type: "espai", zone: "nou-barris", what: "vistes panoràmiques brutals de Barcelona i el Vallès, sense un sol turista", price: "gratuïta" },
  { name: "Ateneu Popular de Nou Barris", type: "centre cultural", zone: "nou-barris", what: "circ, teatre i cultura comunitària en un espai autogestionat amb molta història", price: "5-10 €" },
  // Sagrada Família
  { name: "Recinte Modernista de Sant Pau", type: "museo", zone: "sagrada-familia", what: "el conjunt modernista més gran d'Europa, Patrimoni UNESCO de Domènech i Montaner — una meravella", price: "15 €" },
  // Eixample Esquerra
  { name: "Museu del Modernisme", type: "museo", zone: "eixample-esquerra", what: "art modernista català en una planta baixa de l'Eixample — mobles, pintures i escultures de Gaudí, Casas i companyia", price: "10 €" },
  { name: "Universitat de Barcelona (Edifici Històric)", type: "espai", zone: "eixample-esquerra", what: "l'edifici neogòtic de la UB amb els seus claustres i jardins, un tresor amagat al bell mig de la ciutat", price: "gratuïta" },
];

export const THEATERS: CulturalSpot[] = [
  { name: "Teatre Nacional de Catalunya", type: "teatre", zone: "sagrada-familia", what: "l'edifici de Bofill, tot vidre i columnes, amb programació de primer nivell", price: "15-30 €" },
  { name: "Teatre Lliure (Montjuïc)", type: "teatre", zone: "poble-sec", what: "teatre independent amb propostes arriscades que gairebé sempre encerten", price: "12-28 €" },
  { name: "Teatre Lliure (Gràcia)", type: "teatre", zone: "gracia", what: "la sala de Gràcia del Lliure, més íntima i amb obres de format petit", price: "10-22 €" },
  { name: "Sala Beckett", type: "sala", zone: "poblenou", what: "dramatúrgia contemporània en un espai íntim — les obres peguen fort", price: "10-18 €" },
  { name: "Teatre Romea", type: "teatre", zone: "raval", what: "un dels teatres més antics de Barcelona, sempre amb bones obres", price: "15-28 €" },
  { name: "Mercat de les Flors", type: "teatre", zone: "poble-sec", what: "dansa contemporània i arts del moviment, coses que no veus enlloc més", price: "10-22 €" },
  { name: "Teatre Condal", type: "teatre", zone: "eixample-esquerra", what: "musicals i comèdia al Paral·lel, bon pla per passar una bona estona", price: "15-35 €" },
  { name: "Antic Teatre", type: "sala", zone: "born", what: "teatre alternatiu amb un bar-terrassa amb jardí que és un oasi amagat", price: "8-15 €" },
  { name: "Teatre Poliorama", type: "teatre", zone: "raval", what: "en plena Rambla, programació variada i sempre amb alguna cosa interessant", price: "12-30 €" },
  // Nuevos teatros — zonas expandidas + más variedad
  { name: "Sala Flyhard", type: "sala", zone: "sant-antoni", what: "teatre de text contemporani en un espai petit on sents la respiració dels actors", price: "12-18 €" },
  { name: "Teatre Gaudí Barcelona", type: "teatre", zone: "eixample-esquerra", what: "teatre de barri amb programació eclèctica — des de comèdia fins a drama social, sempre sorprèn", price: "12-24 €" },
  { name: "Teatre Victoria", type: "teatre", zone: "poble-sec", what: "musicals i grans produccions al Paral·lel, la Broadway barcelonina", price: "20-45 €" },
  { name: "Almeria Teatre", type: "sala", zone: "sant-andreu", what: "sala independent a Sant Andreu amb propostes fresques i molt teatre emergent", price: "10-15 €" },
  { name: "Versus Teatre", type: "sala", zone: "eixample-esquerra", what: "sala íntima amb obres que et remouen, d'aquelles que surts pensant durant dies", price: "12-18 €" },
  { name: "La Seca Espai Brossa", type: "sala", zone: "born", what: "màgia, circ i arts parateatrals en un edifici amb història al Born — alguna cosa diferent", price: "10-20 €" },
  { name: "Teatre Tantarantana", type: "sala", zone: "born", what: "sala alternativa al cor del Born, obres amb urpa i un públic fidel", price: "10-16 €" },
  { name: "Sala Hiroshima", type: "sala", zone: "poblenou", what: "arts escèniques experimentals i dansa contemporània, del més avantguardista de la ciutat", price: "8-15 €" },
  { name: "La Villarroel", type: "teatre", zone: "eixample-esquerra", what: "teatre d'autor amb produccions pròpies que porten anys omplint — qualitat assegurada", price: "15-28 €" },
  { name: "Teatre Apolo", type: "teatre", zone: "poble-sec", what: "musicals a lo grande al Paral·lel, decoració d'època i aquell rotllo de teatre clàssic", price: "20-50 €" },
  { name: "Teatre del Raval", type: "sala", zone: "raval", what: "sala de barri amb teatre social i comunitari, produccions que parlen del que passa al carrer", price: "8-15 €" },
  { name: "Teatreneu", type: "teatre", zone: "gracia", what: "comèdia i microteatre a Gràcia — si rius pagues, el concepte més genial del món", price: "paga per riure" },
  { name: "SAT! Sant Andreu Teatre", type: "teatre", zone: "sant-andreu", what: "el teatre de referència del barri, programació familiar i clàssics de bon nivell", price: "10-22 €" },
  { name: "Teatre BARTS", type: "teatre", zone: "poble-sec", what: "sala polivalent al Paral·lel amb teatre, humor i concerts, sempre hi passa alguna cosa", price: "15-30 €" },
  { name: "Sala Planeta", type: "sala", zone: "sarria-pedralbes", what: "teatre íntim a la zona alta amb obres de qualitat en un espai recollit", price: "12-20 €" },
  { name: "Ateneu Popular de Nou Barris (teatro)", type: "sala", zone: "nou-barris", what: "circ contemporani i teatre comunitari amb una energia que no trobes al centre", price: "5-12 €" },
  { name: "Teatre Ovidi Montllor", type: "teatre", zone: "horta-guinardo", what: "teatre de barri a Horta amb programació per a tothom, anomenat en honor al gran cantautor", price: "8-18 €" },
  { name: "Sala Fènix", type: "sala", zone: "les-corts", what: "espai escènic independent a Les Corts amb teatre de text i propostes emergents", price: "10-16 €" },
  { name: "El Molino", type: "teatre", zone: "poble-sec", what: "cabaret, revista i espectacles al mític Molino del Paral·lel — història viva de Barcelona", price: "20-40 €" },
];

export const MUSIC_VENUES: CulturalSpot[] = [
  { name: "Jamboree Jazz Club", type: "sala", zone: "gotic", what: "jazz en directe cada nit en un soterrani de Plaça Reial amb molta història", price: "15 €" },
  { name: "Sala Apolo", type: "sala", zone: "poble-sec", what: "música en directe amb una energia especial, des d'indie fins a electrònica", price: "15-25 €" },
  { name: "Razzmatazz", type: "sala", zone: "poblenou", what: "cinc sales amb estils diferents, sempre trobes alguna cosa que et va bé", price: "15-20 €" },
  { name: "Palau de la Música", type: "sala", zone: "born", what: "una de les sales de concerts més boniques del món — el modernisme en la seva màxima expressió", price: "20-50 €" },
  { name: "L'Auditori", type: "sala", zone: "sagrada-familia", what: "la sala gran de Barcelona per a clàssica i contemporània, so impecable", price: "10-40 €" },
  { name: "Heliogàbal", type: "sala", zone: "gracia", what: "música en directe i poesia en un soterrani de Gràcia, esperit underground de veritat", price: "5-10 €" },
  { name: "Sidecar", type: "sala", zone: "gotic", what: "rock i músiques alternatives a Plaça Reial des dels 80", price: "10-15 €" },
  { name: "La [2] de Apolo", type: "sala", zone: "poble-sec", what: "la sala petita de l'Apolo, més íntima, sessions electròniques i DJ sets de nivell", price: "10-15 €" },
  { name: "Upload", type: "sala", zone: "poblenou", what: "sala de concerts nova al Poblenou, bon so i propostes actuals", price: "10-20 €" },
  // Nuevas salas de música — zonas expandidas + más variedad
  { name: "Luz de Gas", type: "sala", zone: "eixample-esquerra", what: "sala de concerts en un antic music hall modernista, des de jazz fins a pop amb classe", price: "15-30 €" },
  { name: "Bikini", type: "sala", zone: "les-corts", what: "tres ambients musicals diferents sota el mateix sostre, referent nocturn de la zona alta", price: "12-25 €" },
  { name: "Sala BARTS", type: "sala", zone: "poble-sec", what: "concerts i shows al Paral·lel amb un so brutal i capacitat perfecta — ni massa gran ni massa petit", price: "15-30 €" },
  { name: "Harlem Jazz Club", type: "sala", zone: "gotic", what: "jazz, blues i swing en un local diminut del Gòtic on la música t'envolta", price: "8-12 €" },
  { name: "Moog", type: "sala", zone: "raval", what: "techno i electrònica en un club compacte del Raval que porta dècades sent referència", price: "10-15 €" },
  { name: "Marula Café", type: "sala", zone: "gotic", what: "funk, soul i ritmes afro en un soterrani de Plaça Reial on el cos es mou sol", price: "8-15 €" },
  { name: "Freedonia", type: "sala", zone: "raval", what: "soul, funk i r&b en directe en un bar-sala del Raval amb molta personalitat", price: "8-12 €" },
  { name: "Vol", type: "sala", zone: "sant-antoni", what: "sala de concerts nova a Sant Antoni, propostes actuals i bona cervesa artesana", price: "10-18 €" },
  { name: "Jazz Sí Club", type: "sala", zone: "raval", what: "jam sessions i concerts de jazz, flamenc i cubana a preu de ganga al Taller de Músics", price: "5-10 €" },
  { name: "La Nau", type: "sala", zone: "barceloneta", what: "espai cultural vora el mar amb concerts, DJ sets i nits temàtiques", price: "10-20 €" },
  { name: "Garage442", type: "sala", zone: "eixample-esquerra", what: "sala independent amb bandes emergents i aquell so cru de local petit que mola molt", price: "8-15 €" },
  { name: "Sala Salamandra", type: "sala", zone: "sant-andreu", what: "rock, metal i músiques alternatives en una sala amb història a la zona nord", price: "10-20 €" },
  { name: "Laut", type: "sala", zone: "sant-marti", what: "sala de concerts al Clot amb programació indie i electrònica, descobriment de bandes", price: "8-15 €" },
  { name: "Café Royale", type: "sala", zone: "gotic", what: "música en directe i DJ sessions en un espai acollidor a prop de Plaça Reial", price: "8-12 €" },
];

// ─── Cinemas ─────────────────────────────────────────────────

export const CINEMAS: CulturalSpot[] = [
  { name: "Filmoteca de Catalunya", type: "centre cultural", zone: "raval", what: "cinema d'autor, retrospectives i cicles temàtics a preu ridícul — el temple cinèfil de Barcelona", price: "4 €" },
  { name: "Cinemes Girona", type: "sala", zone: "eixample-dreta", what: "cinema independent i d'autor en versió original, programació cuidadíssima i bon cafè al vestíbul", price: "8-10 €" },
  { name: "Phenomena", type: "sala", zone: "sagrada-familia", what: "l'experiència de veure cinema com abans — pantalla enorme, so perfecte i clàssics que mereixen sala gran", price: "9-11 €" },
  { name: "Renoir Floridablanca", type: "sala", zone: "sant-antoni", what: "cinema europeu i d'autor en V.O., d'aquells llocs on sempre trobes alguna cosa que no és a les plataformes", price: "8-10 €" },
  { name: "Zumzeig Cinema", type: "sala", zone: "les-corts", what: "cinema cooperatiu amb bar i programació militant — pel·lícules que no passen enlloc més i debats després", price: "7-9 €" },
  { name: "Cinemes Texas", type: "sala", zone: "gracia", what: "sala de barri a Gràcia amb cinema independent i reestrenes, ambient de cinèfils de veritat", price: "7-9 €" },
  { name: "Verdi", type: "sala", zone: "gracia", what: "el cinema en V.O. de tota la vida a Gràcia, multisales amb bona selecció i gelats artesans al bar", price: "8-10 €" },
  { name: "Verdi Park", type: "sala", zone: "gracia", what: "l'extensió del Verdi, més sales amb la mateixa filosofia de cinema en versió original", price: "8-10 €" },
  { name: "Cine Maldà", type: "sala", zone: "gotic", what: "microcinema amagat en una galeria del Gòtic amb pel·lícules rares, anime i sessions golfes — un lloc de culte", price: "6-8 €" },
  { name: "CCCB Xcèntric", type: "centre cultural", zone: "raval", what: "cicles de cinema experimental i videoart al CCCB, per quan vols veure alguna cosa que trenqui motlles", price: "4-6 €" },
];

// ─── Outdoor spots ───────────────────────────────────────────

export interface OutdoorSpot {
  name: string;
  zone: Zone;
  description: string;
  bestTime: string;
}

export const OUTDOOR_SPOTS: OutdoorSpot[] = [
  { name: "Parc de la Ciutadella", zone: "vila-olimpica", description: "el parc gran de Barcelona, amb llac, cascada monumental i gent tocant música sota els arbres — ideal per estirar-se amb un llibre", bestTime: "matí" },
  { name: "Platja de la Barceloneta", zone: "barceloneta", description: "la platja de tota la vida, chiringuitos, vòlei i aquell rotllo mediterrani que mai falla", bestTime: "matí" },
  { name: "Jardins de Mossèn Costa i Llobera", zone: "poble-sec", description: "el jardí de cactus més espectacular d'Europa, al vessant de Montjuïc amb vistes al port — sembla un altre país", bestTime: "matí" },
  { name: "Turó Park", zone: "sarria-pedralbes", description: "jardí senyorial a la zona alta amb ànecs, escultures i calma total", bestTime: "qualsevol hora" },
  { name: "Carretera de les Aigües", zone: "sarria-pedralbes", description: "el passeig més bonic de Barcelona a mitja muntanya, camí pla amb vistes panoràmiques de tota la ciutat i el mar", bestTime: "capvespre" },
  { name: "Parc del Laberint d'Horta", zone: "horta-guinardo", description: "jardí neoclàssic del XVIII amb un laberint de xiprers que t'atrapa — tranquil, romàntic i lluny de les masses", bestTime: "matí" },
  { name: "Bunkers del Carmel", zone: "horta-guinardo", description: "les antigues bateries antiaèries amb la millor vista 360 graus de Barcelona — al capvespre és màgic", bestTime: "capvespre" },
  { name: "Platja del Bogatell", zone: "poblenou", description: "platja més tranquil·la que la Barceloneta, bon espai i menys aglomeració, perfecta per a un bany sense multituds", bestTime: "matí" },
  { name: "Jardins de Joan Brossa", zone: "poble-sec", description: "jardins al vessant de Montjuïc amb jocs, escultures i vistes al mar — un dels secrets més ben guardats", bestTime: "qualsevol hora" },
  { name: "Parc del Guinardó", zone: "horta-guinardo", description: "parc frondós amb miradors amagats i escalinates que semblen de pel·lícula, molt menys massificat que el Güell", bestTime: "capvespre" },
  { name: "Parc de Cervantes (Rosaleda)", zone: "les-corts", description: "més de deu mil rosers de dues-centes varietats — al maig i juny és una bogeria de colors i olors", bestTime: "matí" },
  { name: "Jardins de Laribal", zone: "poble-sec", description: "jardins esglaonats amb fonts àrabs i racons amagats a Montjuïc, del més bonic i menys conegut", bestTime: "qualsevol hora" },
  { name: "Parc de la Creueta del Coll", zone: "horta-guinardo", description: "piscina natural d'estiu excavada en una antiga pedrera amb escultura de Chillida penjant — pla perfecte de dia calorós", bestTime: "matí" },
  { name: "Platja de la Nova Icària", zone: "vila-olimpica", description: "la platja més familiar i tranquil·la del front marítim, amb chiringuitos i zona de vòlei", bestTime: "matí" },
  { name: "Parc del Turó de la Peira", zone: "nou-barris", description: "turó verd a Nou Barris amb vistes que ningú espera i un silenci que no sembla Barcelona", bestTime: "capvespre" },
  { name: "Jardins del Palau de Pedralbes", zone: "sarria-pedralbes", description: "jardins amb font de Gaudí, bambú gegant i paons passejant entre tarongers — senyorial i preciós", bestTime: "matí" },
  { name: "Moll de la Fusta", zone: "barceloneta", description: "passeig vora el Port Vell amb la brisa del mar, veleres al fons i el skyline de la ciutat al darrere", bestTime: "capvespre" },
  { name: "Parc Central de Nou Barris", zone: "nou-barris", description: "parc ampli amb aqüeducte romà restaurat i zones de joc, la sala d'estar a l'aire lliure del barri", bestTime: "qualsevol hora" },
  { name: "Mirador de l'Alcalde", zone: "poble-sec", description: "mirador amb mosaics de colors i vistes al port i la ciutat, un dels racons més fotogènics de Montjuïc", bestTime: "capvespre" },
  { name: "Parc del Clot", zone: "sant-marti", description: "parc construït sobre una antiga estació de tren conservant els arcs de maó — industrial i bonic a parts iguals", bestTime: "qualsevol hora" },
  { name: "Plaça Reial", zone: "gotic", description: "la plaça amb les palmeres, els fanals de Gaudí i les terrasses — el cor del Gòtic amb vida a totes hores", bestTime: "tarda" },
  { name: "Plaça del Rei", zone: "gotic", description: "la plaça medieval més espectacular de Barcelona, silenciosa i monumental — concerts d'estiu sota les estrelles", bestTime: "tarda" },
  { name: "Jardins de la Indústria", zone: "sagrada-familia", description: "parc tranquil al cor del barri, amb zona de jocs i bancs a l'ombra — la plaça de la gent del barri", bestTime: "qualsevol hora" },
  { name: "Jardins de la Universitat", zone: "eixample-esquerra", description: "els jardins interiors de l'edifici històric de la UB, un oasi de calma entre el trànsit de la Gran Via", bestTime: "matí" },
  { name: "Jardins de la Torre de les Aigües", zone: "eixample-dreta", description: "un pati interior de l'Eixample amb una torre de distribució d'aigües del XIX i piscina a l'estiu — sorpresa total", bestTime: "matí" },
  { name: "Pla de Palau i Port Vell", zone: "born", description: "baixar del Born cap al port, passar per l'Estació de França i arribar al mar sense adonar-te'n", bestTime: "tarda" },
  { name: "Jardins de les Tres Xemeneies", zone: "sant-antoni", description: "espai obert amb les tres xemeneies de l'antiga central elèctrica, skaters, bancs i vida de barri", bestTime: "tarda" },
  { name: "Jardins de la Vila Amèlia", zone: "gracia", description: "jardins romàntics a l'alta Gràcia amb estanys, pins i aquella calma que sembla impossible tan a prop de Diagonal", bestTime: "matí" },
  { name: "Jardins de Rubió i Lluch", zone: "raval", description: "el pati interior de l'antic Hospital de la Santa Creu, tarongers, bancs i silenci al cor del Raval — un dels secrets de la ciutat", bestTime: "qualsevol hora" },
  { name: "Parc de la Pegaso", zone: "sant-andreu", description: "el parc gran de Sant Andreu amb estany, zona verda i la millor ombra del barri — perfecto per a un matí tranquil", bestTime: "matí" },
];

// ─── Plan generation ───────────────────────────────────────────

export interface Plan {
  title: string;
  subtitle: string;
  paragraphs: string[];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Zone detection ───────────────────────────────────────────

function detectZone(input: string): Zone | null {
  const lower = input.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  // Build flat list of [keyword, zone] sorted by keyword length DESC
  // This ensures "passeig de gracia" matches before "gracia"
  const allPairs: [string, Zone][] = [];
  for (const [zone, keywords] of Object.entries(ZONE_KEYWORDS)) {
    if (zone === "any") continue;
    for (const kw of keywords) {
      allPairs.push([kw.normalize("NFD").replace(/[̀-ͯ]/g, ""), zone as Zone]);
    }
  }
  allPairs.sort((a, b) => b[0].length - a[0].length); // longest keywords first

  for (const [kw, zone] of allPairs) {
    if (lower.includes(kw)) return zone;
  }
  return null;
}

function filterByZone<T extends { zone: Zone }>(items: T[], zone: Zone | null): T[] {
  if (!zone) return items;
  return items.filter((i) => i.zone === zone);
}

// ─── Real events integration ──────────────────────────────────

/** Map event neighborhood strings to our Zone system */
function eventToZone(neighborhood: string): Zone | null {
  const n = neighborhood.toLowerCase();
  // Order matters: more specific checks first
  if (n.includes("born") || n.includes("sant pere") || n.includes("ribera") || n.includes("santa caterina")) return "born";
  if (n.includes("gòtic") || n.includes("gotic") || n.includes("ciutat vella") || n.includes("la rambla") || n.includes("las ramblas")) return "gotic";
  if (n.includes("raval")) return "raval";
  if (n.includes("sagrada familia") || n.includes("sagrada família") || n.includes("fort pienc") || n.includes("auditori") || n.includes("glòries") || n.includes("glories")) return "sagrada-familia";
  if (n.includes("eixample esquerra") || n.includes("aribau") || n.includes("muntaner") || n.includes("enric granados") || n.includes("villarroel")) return "eixample-esquerra";
  if (n.includes("eixample dreta") || n.includes("passeig de gràcia") || n.includes("paseo de gracia") || n.includes("rambla catalunya")) return "eixample-dreta";
  if (n.includes("eixample") || n.includes("l'eixample")) return "eixample-dreta";
  if (n.includes("gràcia") || n.includes("gracia")) return "gracia";
  if (n.includes("poblenou")) return "poblenou";
  if (n.includes("vila olímpica") || n.includes("vila olimpica") || n.includes("ciutadella") || n.includes("port olímpic") || n.includes("port olimpic")) return "vila-olimpica";
  if (n.includes("clot") || n.includes("camp de l'arpa") || n.includes("navas") || n.includes("besòs") || n.includes("besos") || n.includes("fòrum") || n.includes("forum") || n.includes("diagonal mar")) return "sant-marti";
  if (n.includes("barceloneta") || n.includes("port vell")) return "barceloneta";
  if (n.includes("montjuïc") || n.includes("montjuic") || n.includes("poble-sec") || n.includes("poble sec") || n.includes("paral·lel") || n.includes("paralel") || n.includes("sants") || n.includes("hostafrancs")) return "poble-sec";
  if (n.includes("sarrià") || n.includes("sarria") || n.includes("pedralbes") || n.includes("sant gervasi")) return "sarria-pedralbes";
  if (n.includes("les corts") || n.includes("camp nou") || n.includes("collblanc")) return "les-corts";
  if (n.includes("sant antoni")) return "sant-antoni";
  if (n.includes("horta") || n.includes("guinardó") || n.includes("guinardo") || n.includes("carmel") || n.includes("vall d'hebron")) return "horta-guinardo";
  if (n.includes("nou barris") || n.includes("roquetes") || n.includes("prosperitat") || n.includes("torre baró")) return "nou-barris";
  if (n.includes("sant andreu") || n.includes("bon pastor") || n.includes("fabra i coats") || n.includes("sagrera")) return "sant-andreu";
  if (n.includes("sant martí")) return "sant-marti";
  return null;
}

/** Get events that are active now OR coming soon (within 45 days), filtered by zone and category */
function getActiveEvents(zone: Zone | null, categories: string[]): Event[] {
  const now = new Date();
  const refDate = now.toISOString().slice(0, 10);
  const future = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  // Include events happening now OR starting within the next 45 days
  let events = MOCK_EVENTS.filter(
    (e) => categories.includes(e.category) && e.endDate >= refDate && e.startDate <= future
  );
  if (zone) {
    events = events.filter((e) => eventToZone(e.neighborhood) === zone);
  }
  return events;
}

function pickEvent(zone: Zone | null, categories: string[]): Event | null {
  const events = getActiveEvents(zone, categories);
  return events.length > 0 ? pick(events) : null;
}

// ─── Event paragraph templates ────────────────────────────────

function pEventExpo(event: Event): string {
  const price = event.price ? `${event.price} €` : "gratuïta";
  const templates = [
    `Ara mateix al **${event.venue}** tenen *${event.title}*. ${event.description} L'entrada són ${price}.`,
    `Passa't pel **${event.venue}** a veure *${event.title}* — ${event.description.toLowerCase()} Entrada: ${price}.`,
    `Al **${event.venue}** hi ha *${event.title}*. ${event.description} ${price === "gratuïta" ? "Gratis, a més." : `${price} l'entrada.`}`,
    `No et perdis *${event.title}* al **${event.venue}**. ${event.description} ${price === "gratuïta" ? "I és gratis, que no està malament." : `Preu: ${price}.`}`,
    `Exposició recomanada: *${event.title}* al **${event.venue}**. ${event.description} ${price === "gratuïta" ? "Gratis total." : `Són ${price} d'entrada.`}`,
    `Si t'agrada l'art, avui toca *${event.title}* al **${event.venue}**. ${event.description} ${price === "gratuïta" ? "Sense cost." : `L'entrada va per ${price}.`}`,
  ];
  return pick(templates);
}

function pEventTeatro(event: Event): string {
  const price = event.price ? `${event.price} €` : "preu variable";
  const templates = [
    `Al **${event.venue}** tenen *${event.title}*. ${event.description} Entrades des de ${price}. S'apaguen els llums i durant un parell d'hores t'oblides de tot.`,
    `El plat fort del pla: *${event.title}* al **${event.venue}**. ${event.description} Des de ${price}.`,
    `Per al teatre, *${event.title}* al **${event.venue}** — ${event.description.toLowerCase()} Entrades des de ${price}.`,
    `L'escenari t'espera amb *${event.title}* al **${event.venue}**. ${event.description} ${price}. Barcelona sap de taules.`,
    `Nit de teatre: *${event.title}* al **${event.venue}**. ${event.description} Des de ${price}. No te la perdis.`,
    `Et recomano molt *${event.title}* al **${event.venue}**. ${event.description} Entrades des de ${price}. D'aquelles obres que es queden amb tu.`,
  ];
  return pick(templates);
}

function pEventMusica(event: Event): string {
  const price = event.price ? `${event.price} €` : "preu variable";
  const templates = [
    `A la nit, *${event.title}* al **${event.venue}**. ${event.description} Entrada uns ${price}.`,
    `El plat fort: *${event.title}* al **${event.venue}**. ${event.description} Sobre ${price}.`,
    `Per a la música, *${event.title}* — ${event.description.toLowerCase()} Al **${event.venue}**, uns ${price}.`,
    `El concert de la nit: *${event.title}* al **${event.venue}**. ${event.description} Entrades a ${price}. La nit sona fort.`,
    `Avui la ciutat sona a *${event.title}* al **${event.venue}**. ${event.description} Sobre ${price}. Cal ser-hi.`,
    `Per a les teves orelles: *${event.title}* al **${event.venue}**. ${event.description} Des de ${price}. Sortiràs taral·lejant.`,
  ];
  return pick(templates);
}

function pEventTaller(event: Event): string {
  const price = event.price ? `${event.price} €` : "gratuït";
  const templates = [
    `Avui crees alguna cosa amb les teves mans: *${event.title}* al **${event.venue}**. ${event.description} Preu: ${price}.`,
    `Taller recomanat: *${event.title}* al **${event.venue}**. ${event.description} ${price === "gratuït" ? "I sense cost." : `Costa ${price}, però surts amb alguna cosa feta per tu.`}`,
    `Posa't creatiu amb *${event.title}* al **${event.venue}**. ${event.description} ${price === "gratuït" ? "Entrada lliure." : `Són ${price}.`} Ho gaudiràs.`,
    `Avui el pla té les mans brutes (en el bon sentit). *${event.title}* al **${event.venue}**: ${event.description} ${price === "gratuït" ? "Gratis total." : `Preu: ${price}.`}`,
    `Per fer alguna cosa diferent: *${event.title}* al **${event.venue}**. ${event.description} ${price === "gratuït" ? "I no costa res." : `${price} ben invertits.`} T'emportes alguna cosa única a casa.`,
  ];
  return pick(templates);
}

function pEventCine(event: Event): string {
  const price = event.price ? `${event.price} €` : "gratuïta";
  const templates = [
    `En cartellera: *${event.title}* al **${event.venue}**. ${event.description} Entrades: ${price}.`,
    `Avui projecten *${event.title}* al **${event.venue}**. ${event.description} Des de ${price}. Cinema de veritat.`,
    `Sessió recomanada: *${event.title}* al **${event.venue}**. ${event.description} ${price}.`,
    `Per a cinèfils i curiosos: *${event.title}* al **${event.venue}**. ${event.description} Entrades a ${price}. No és Netflix, és millor.`,
    `Pantalla gran amb *${event.title}* al **${event.venue}**. ${event.description} Preu: ${price}. D'aquelles pel·lícules que es veuen a sala o no es veuen.`,
  ];
  return pick(templates);
}

// ─── Paragraph templates ───────────────────────────────────────

function pWalkIntro(walk: Walk): string {
  const cap = walk.description.charAt(0).toUpperCase() + walk.description.slice(1);
  const templates = [
    `Comences fent una passejada per **${walk.name}**. ${cap} — uns ${walk.duration} al teu ritme, sense mapa ni destinació fixa.`,
    `El primer, caminar. Una passejada per **${walk.name}**: ${walk.description}. Uns ${walk.duration} deixant-te portar.`,
    `Abans de res, una estona caminant per **${walk.name}**. ${cap}. Sense presses.`,
    `Comences amb una passejada tranquil·la per **${walk.name}**. ${cap}. Calcula uns ${walk.duration} per amarar-te bé del lloc.`,
    `Per entrar en mode pla, res com caminar per **${walk.name}**. ${cap} — ${walk.duration} sense presses, que avui no hi ha rellotge.`,
    `Posa't les sabates còmodes i comença per **${walk.name}**. ${cap}. Uns ${walk.duration} i ja estàs en sintonia.`,
    `El pla comença caminant. **${walk.name}** t'espera: ${walk.description}. Dona't uns ${walk.duration} per anar escalfant el dia.`,
  ];
  return pick(templates);
}

function pCulture(spot: CulturalSpot): string {
  const cap = spot.what.charAt(0).toUpperCase() + spot.what.slice(1);
  const free = spot.price === "gratuïta";
  const templates = [
    `T'acostes al **${spot.name}**. ${cap}. ${free ? "Entrada gratuïta." : `L'entrada són ${spot.price} i val la pena.`}`,
    `Parada al **${spot.name}**. ${cap}. ${free ? "Entrada gratuïta." : `${spot.price} l'entrada.`}`,
    `El **${spot.name}** és bona opció — ${spot.what}. ${free ? "Gratis, a més." : `L'entrada són ${spot.price}.`}`,
    `Ara toca cultura: el **${spot.name}**. ${cap}. ${free ? "El millor: no costa ni un euro." : `Per ${spot.price} val molt la pena.`}`,
    `Fes-te un capritx cultural al **${spot.name}**. ${cap}. ${free ? "Ah, i és gratis. Millor impossible." : `Entrada a ${spot.price}.`}`,
    `Et recomano passar pel **${spot.name}** — ${spot.what}. ${free ? "I a sobre gratis." : `Són ${spot.price} d'entrada.`}`,
    `Un imprescindible: el **${spot.name}**. ${cap}. ${free ? "I sense gastar ni un duro, que ja és dir." : `L'entrada ronda els ${spot.price}.`}`,
  ];
  return pick(templates);
}

function pRestaurantBudget(r: Restaurant): string {
  const cap = r.vibe.charAt(0).toUpperCase() + r.vibe.slice(1);
  const templates = [
    `Per menjar, **${r.name}**. ${cap}. Menges bé sense passar dels trenta euros.`,
    `Per menjar et recomano **${r.name}** — ${r.vibe}. No et gastes gaire i surts content.`,
    `El menjar a **${r.name}**. ${cap}. Bon preu i bon nivell.`,
    `El migdia el resols a **${r.name}**. ${cap}. Nivell de despesa baix, nivell de satisfacció alt.`,
    `Per omplir l'estómac sense buidar la cartera: **${r.name}**. ${cap}. Surt rodó.`,
    `Gana? Directe a **${r.name}**. ${cap}. Menges bé i surts amb ganes de més.`,
    `Et proposo menjar a **${r.name}**. ${cap}. La butxaca a penes se n'adona.`,
  ];
  return pick(templates);
}

function pRestaurantPremium(r: Restaurant): string {
  const cap = r.vibe.charAt(0).toUpperCase() + r.vibe.slice(1);
  const templates = [
    `Per sopar, **${r.name}**. ${cap}. Uns cinquanta-seixanta euros, però val molt la pena.`,
    `El sopar a **${r.name}**. ${cap}. És d'aquells llocs on menges i penses "que bé que he fet venint aquí".`,
    `Per al sopar, aposta per **${r.name}** — ${r.vibe}. Uns cinquanta euros. Del millor que pots sopar a la zona.`,
    `Arriba el sopar i cal estar a l'altura. **${r.name}**: ${r.vibe}. Cada euro ben invertit.`,
    `Aquesta nit sopes a **${r.name}**. ${cap}. Hi ha dies que demanen alguna cosa així. Gaudeix-ho.`,
    `Per tancar el dia amb classe: **${r.name}**. ${cap}. Brinda pel dia.`,
    `El sopar es mereix alguna cosa memorable. **${r.name}** — ${r.vibe}. Uns cinquanta euros. Val la pena.`,
  ];
  return pick(templates);
}

function pBar(bar: Bar): string {
  const cap = bar.vibe.charAt(0).toUpperCase() + bar.vibe.slice(1);
  const templates = [
    `Després, **${bar.name}**. ${cap}. Bon lloc per acabar la nit.`,
    `Per fer una copa, **${bar.name}** — ${bar.vibe}.`,
    `I per tancar, unes copes a **${bar.name}**. ${cap}.`,
    `La copa te la prens a **${bar.name}**. ${cap}. Un d'aquells llocs que no fallen.`,
    `Per al got, **${bar.name}**. ${cap}. Impossible no quedar-s'hi a gust.`,
    `Següent: **${bar.name}**. ${cap}. Té aquell punt que busques per a una bona copa.`,
    `Ara toca líquid. **${bar.name}**: ${bar.vibe}. Voldràs quedar-t'hi una bona estona.`,
  ];
  return pick(templates);
}

function pBarCasual(bar: Bar): string {
  const cap = bar.vibe.charAt(0).toUpperCase() + bar.vibe.slice(1);
  const templates = [
    `Per al vermut o unes canyes, **${bar.name}**. ${cap}. Una bona estona.`,
    `Abans de res, una parada a **${bar.name}** — ${bar.vibe}.`,
    `I un vermut a **${bar.name}**. ${cap}.`,
    `Ara toca descansar les cames a **${bar.name}**. ${cap}. Un respir ben merescut.`,
    `Fas una pausa a **${bar.name}**. ${cap}. Demana el que et vingui de gust sense pensar-hi.`,
    `Per agafar forces: **${bar.name}**. ${cap}. D'aquells llocs on el temps s'atura.`,
    `Intermedi ideal: **${bar.name}**. ${cap}. Un vermut, una canya, el que flueixi.`,
  ];
  return pick(templates);
}

function pTheater(t: CulturalSpot): string {
  const cap = t.what.charAt(0).toUpperCase() + t.what.slice(1);
  const templates = [
    `Al **${t.name}** mira què tenen en cartellera. ${cap}. L'entrada va de ${t.price}. S'apaguen els llums i durant un parell d'hores t'oblides de tot.`,
    `El plat fort del pla: el **${t.name}**. ${cap}. Entrades entre ${t.price}.`,
    `A la tarda-nit, teatre al **${t.name}** — ${t.what}. Entre ${t.price} l'entrada. Quan s'apaguen els llums és una altra cosa.`,
    `Avui toca butaca i teló. **${t.name}** — ${t.what}. Entrades per ${t.price}. Val moltíssim la pena.`,
    `Per a la nit, teatre al **${t.name}**. ${cap}. Des de ${t.price} l'entrada.`,
    `Si no has anat al **${t.name}**, avui és el dia. ${cap}. El preu ronda els ${t.price}.`,
    `Barcelona i teatre van de la mà. Aquesta nit: el **${t.name}**. ${cap}. Entrades des de ${t.price}.`,
  ];
  return pick(templates);
}

function pMusic(v: CulturalSpot): string {
  const cap = v.what.charAt(0).toUpperCase() + v.what.slice(1);
  const templates = [
    `A la nit, música en directe al **${v.name}**. ${cap}. Entrada uns ${v.price}.`,
    `El plat fort: **${v.name}**. ${cap}. Sobre ${v.price}.`,
    `Per a la música, **${v.name}** — ${v.what}. Uns ${v.price}.`,
    `Per a les orelles: **${v.name}**. ${cap}. Les entrades costen ${v.price}. Barcelona sona diferent en directe.`,
    `Toca música en directe. **${v.name}** — ${v.what}. Entrades per ${v.price}.`,
    `El pla musical: **${v.name}**. ${cap}. Des de ${v.price}. Sortiràs taral·lejant.`,
    `La nit té banda sonora. **${v.name}**: ${v.what}. Preu: ${v.price}. Deixa't portar pel que soni.`,
  ];
  return pick(templates);
}

function pCinema(cinema: CulturalSpot): string {
  const cap = cinema.what.charAt(0).toUpperCase() + cinema.what.slice(1);
  const templates = [
    `Sessió de cinema al **${cinema.name}**. ${cap}. Entrada: ${cinema.price}. Crispetes opcionals però recomanades.`,
    `Toca pantalla gran: **${cinema.name}**. ${cap}. Preu: ${cinema.price}. D'aquells cinemes que et recorden per què anar a una sala mola.`,
    `Per a la pel·lícula, el **${cinema.name}** — ${cinema.what}. Entrades a ${cinema.price}. Cinema com toca.`,
    `Butaca i foscor: **${cinema.name}**. ${cap}. Des de ${cinema.price}. Barcelona té un cinema independent brutal.`,
    `Ens fiquem al **${cinema.name}** a veure bon cinema. ${cap}. L'entrada ronda els ${cinema.price}. Prepara't per desconnectar del món una estona.`,
  ];
  return pick(templates);
}

function pOutdoor(spot: OutdoorSpot): string {
  const cap = spot.description.charAt(0).toUpperCase() + spot.description.slice(1);
  const timeHint = spot.bestTime === "qualsevol hora" ? "a qualsevol hora del dia" : `millor per la ${spot.bestTime}`;
  const templates = [
    `Primera destinació: **${spot.name}**. ${cap}. Ideal ${timeHint}. Respira fons.`,
    `Comences a l'aire lliure a **${spot.name}** — ${spot.description}. Vés-hi ${timeHint}. Avui toca cel obert.`,
    `Vas directe a **${spot.name}**. ${cap}. Millor anar-hi ${timeHint}, que és quan brilla de veritat.`,
    `Avui el sostre és el cel. **${spot.name}**: ${spot.description}. Vés-hi ${timeHint} per agafar-lo en el seu millor moment.`,
    `Comences a **${spot.name}** — ${spot.description}. El truc: anar-hi ${timeHint}. Al·lucinaràs.`,
  ];
  return pick(templates);
}

function pClosing(bar: Bar): string {
  const cap = bar.vibe.charAt(0).toUpperCase() + bar.vibe.slice(1);
  const templates = [
    `Si la nit s'allarga, **${bar.name}** — ${bar.vibe}. D'aquells llocs on sempre acabes bé.`,
    `I si queda cos, una última a **${bar.name}**. ${cap}.`,
    `Per rematar, **${bar.name}**. ${cap}. El colofó perfecte.`,
    `Per posar el punt final: **${bar.name}**. ${cap}. L'última copa sempre sap millor.`,
    `El tancament perfecte és **${bar.name}** — ${bar.vibe}. Demà ja ho veuràs, avui es gaudeix.`,
    `I per acabar com toca: **${bar.name}**. ${cap}. Un bon final per a un bon dia.`,
    `Última copa a **${bar.name}**. ${cap}. La nit tanca rodona. Salut.`,
  ];
  return pick(templates);
}

// ─── Zone-aware intro paragraph ───────────────────────────────

function pZoneIntro(zone: Zone): string {
  const name = ZONE_NAMES[zone];
  const intros = [
    `Avui el pla va per **${name}**. Un d'aquells barris que val la pena explorar amb calma.`,
    `Et proposo un pla centrat a **${name}** — perquè no hagis de creuar mitja ciutat.`,
    `Anem a **${name}**. Tot el que necessites per a un bon dia és allà.`,
    `Avui toca **${name}**. Un d'aquells racons de Barcelona que sempre té vida.`,
    `El pla es cuina a **${name}**. Barri amb caràcter i mil opcions.`,
    `Ens n'anem a **${name}**. Hi ha dies que demanen aquesta zona, i avui és un d'ells.`,
    `Base d'operacions: **${name}**. Barcelona té molts barris, però avui mana aquest.`,
  ];
  return pick(intros);
}

// ─── Plan generators by mood ──────────────────────────────────

function generateRelax(zone: Zone | null): Plan {
  const walks = filterByZone(WALKS, zone);
  const spots = filterByZone(CULTURAL_SPOTS, zone);
  const budgetR = filterByZone(RESTAURANTS_BUDGET, zone);
  const bars = filterByZone(BARS, zone);

  const walk = pick(walks);
  const [spot1, spot2] = pickN(spots, 2);
  const restaurant = pick(budgetR);
  const bar1 = pick(bars);

  const expoEvent = pickEvent(zone, ["exposición", "museo", "galería"]);
  const cultureParagraph = expoEvent ? pEventExpo(expoEvent) : pCulture(spot1);

  const titles = [
    { title: "Un dia sense presses", subtitle: "Passeig, cultura i bon menjar" },
    { title: "Dissabte tranquil", subtitle: "Art, vermut i fer un tomb" },
    { title: "Barcelona al teu ritme", subtitle: "Cultura, menjar honest i un bon vermut" },
    { title: "Deixa't portar", subtitle: "Passejar, veure alguna cosa bonica i menjar bé" },
    { title: "Calma i bon pla", subtitle: "Passeig, cultura i alguna cosa rica" },
    { title: "Sense rellotge ni presses", subtitle: "Art, menjar i vermut al teu aire" },
  ];
  const t = pick(titles);

  const paragraphs = zone
    ? [pZoneIntro(zone), pWalkIntro(walk), cultureParagraph, pRestaurantBudget(restaurant), pCulture(spot2), pBarCasual(bar1)]
    : [pWalkIntro(walk), cultureParagraph, pRestaurantBudget(restaurant), pCulture(spot2), pBarCasual(bar1)];

  return { ...t, paragraphs };
}

function generateRomantic(zone: Zone | null): Plan {
  const spots = filterByZone(CULTURAL_SPOTS, zone);
  const walks = filterByZone(WALKS, zone);
  const premiumR = filterByZone(RESTAURANTS_PREMIUM, zone);
  const bars = filterByZone(BARS, zone);

  const spot = pick(spots);
  const walk = pick(walks);
  const restaurant = pick(premiumR);
  const [bar1, bar2] = pickN(bars, 2);

  const expoEvent = pickEvent(zone, ["exposición", "museo", "galería"]);
  const cultureParagraph = expoEvent ? pEventExpo(expoEvent) : pCulture(spot);

  const titles = [
    { title: "Pla per a dos", subtitle: "Art, sopar especial i còctels" },
    { title: "Una tarda que es queda", subtitle: "Cultura, bon sopar i la nit per davant" },
    { title: "Barcelona en parella", subtitle: "Passeig, art i sopar amb calma" },
    { title: "D'aquelles nits", subtitle: "Art, sopar amb espelmes i un còctel final" },
    { title: "La ciutat per a dos", subtitle: "Passeig, exposició i sopar bé" },
  ];
  const t = pick(titles);

  const paragraphs = zone
    ? [pZoneIntro(zone), cultureParagraph, pWalkIntro(walk), pBarCasual(bar1), pRestaurantPremium(restaurant), pBar(bar2)]
    : [cultureParagraph, pWalkIntro(walk), pBarCasual(bar1), pRestaurantPremium(restaurant), pBar(bar2)];

  return { ...t, paragraphs };
}

function generateBudget(zone: Zone | null): Plan {
  const walks = filterByZone(WALKS, zone);
  const spots = filterByZone(CULTURAL_SPOTS, zone);
  const budgetR = filterByZone(RESTAURANTS_BUDGET, zone);
  const bars = filterByZone(BARS, zone);

  const walk = pick(walks);
  const spot = pick(spots);
  const restaurant = pick(budgetR);
  const bar = pick(bars);

  const expoEvent = pickEvent(zone, ["exposición", "museo", "galería"]);
  const cultureParagraph = expoEvent ? pEventExpo(expoEvent) : pCulture(spot);

  const titles = [
    { title: "Barcelona per la cara", subtitle: "Cultura, bon menjar i gastar poc" },
    { title: "Pla sense gastar-se un ral", subtitle: "Tot el bo de la ciutat per quatre duros" },
    { title: "Molt per poc", subtitle: "Cultura gratis, menjar bé i gaudir" },
    { title: "Bon pla, poca despesa", subtitle: "Barcelona té molt de gratis si saps on" },
    { title: "A cost zero (gairebé)", subtitle: "Art gratuït, menú del dia i canyes barates" },
  ];
  const t = pick(titles);

  const freeIntro = [
    `Bona dada: molts museus tenen dies gratuïts o tarifes reduïdes. Comença per aquí.`,
    `Barcelona té molta cultura gratis si saps on buscar. El primer diumenge de mes diversos museus obren gratis, i sempre hi ha exposicions amb entrada lliure.`,
    `El truc és saber quan anar-hi. Molts museus tenen tardes gratuïtes, i les galeries sempre són gratis.`,
    `No cal gastar per passar-ho bé. Barcelona és plena de galeries amb entrada lliure, places amb vida i parcs brutals.`,
    `La millor Barcelona no és darrere d'una entrada cara. Moltes de les coses més interessants són gratis o gairebé gratis.`,
  ];

  const paragraphs = zone
    ? [pZoneIntro(zone), pick(freeIntro), pWalkIntro(walk), pRestaurantBudget(restaurant), cultureParagraph, pBarCasual(bar)]
    : [pick(freeIntro), pWalkIntro(walk), pRestaurantBudget(restaurant), cultureParagraph, pBarCasual(bar)];

  return { ...t, paragraphs };
}

function generateMusic(zone: Zone | null): Plan {
  const budgetR = filterByZone(RESTAURANTS_BUDGET, zone);
  const venues = filterByZone(MUSIC_VENUES, zone);
  const bars = filterByZone(BARS, zone);

  const restaurant = pick(budgetR);
  const venue = pick(venues);
  const [bar1, bar2] = pickN(bars, 2);

  const musicEvent = pickEvent(zone, ["música", "festival"]);
  const musicParagraph = musicEvent ? pEventMusica(musicEvent) : pMusic(venue);

  const titles = [
    { title: "La nit sona", subtitle: "Música en directe, sopar i copes" },
    { title: "Nit de bon rotllo", subtitle: "Sopar, escoltar i brindar" },
    { title: "Barcelona sona bé", subtitle: "Música, sopar i la ciutat de nit" },
    { title: "Puja el volum", subtitle: "Sopar, concert i copes fins tard" },
    { title: "La banda sonora de la nit", subtitle: "Música en directe i bons locals" },
  ];
  const t = pick(titles);

  const paragraphs = zone
    ? [pZoneIntro(zone), pRestaurantBudget(restaurant), musicParagraph, pBar(bar1), pClosing(bar2)]
    : [pRestaurantBudget(restaurant), musicParagraph, pBar(bar1), pClosing(bar2)];

  return { ...t, paragraphs };
}

function generateTeatro(zone: Zone | null): Plan {
  const theaters = filterByZone(THEATERS, zone);
  const walks = filterByZone(WALKS, zone);
  const premiumR = filterByZone(RESTAURANTS_PREMIUM, zone);
  const bars = filterByZone(BARS, zone);

  const theater = pick(theaters);
  const walk = pick(walks);
  const restaurant = pick(premiumR);
  const bar = pick(bars);

  const teatroEvent = pickEvent(zone, ["teatro", "danza"]);
  const theaterParagraph = teatroEvent ? pEventTeatro(teatroEvent) : pTheater(theater);

  const titles = [
    { title: "Quan s'apaguen els llums", subtitle: "Teatre, passeig i sopar amb calma" },
    { title: "Nit d'escenari", subtitle: "Teatre, bon sopar i un còctel" },
    { title: "Cultura escènica", subtitle: "Passeig, teatre i sopar bé" },
    { title: "Teló amunt", subtitle: "Passeig, obra de teatre i sopar especial" },
    { title: "Barcelona sobre les taules", subtitle: "Teatre, bona taula i copa final" },
  ];
  const t = pick(titles);

  const paragraphs = zone
    ? [pZoneIntro(zone), pWalkIntro(walk), theaterParagraph, pRestaurantPremium(restaurant), pBar(bar)]
    : [pWalkIntro(walk), theaterParagraph, pRestaurantPremium(restaurant), pBar(bar)];

  return { ...t, paragraphs };
}

function generateGastro(zone: Zone | null): Plan {
  const walks = filterByZone(WALKS, zone);
  const budgetR = filterByZone(RESTAURANTS_BUDGET, zone);
  const premiumR = filterByZone(RESTAURANTS_PREMIUM, zone);
  const bars = filterByZone(BARS, zone);

  const walk = pick(walks);
  const lunch = pick(budgetR);
  const dinner = pick(premiumR);
  const [bar1, bar2] = pickN(bars, 2);

  const titles = [
    { title: "Barcelona sap bé", subtitle: "Un pla per menjar, beure i repetir" },
    { title: "De barra en barra", subtitle: "Avui la ciutat es tasta, no es mira" },
    { title: "Avui es menja bé", subtitle: "Barcelona entra per la boca" },
    { title: "Ruta amb forquilla", subtitle: "De restaurant en bar, sense parar" },
    { title: "Estovalles i copa", subtitle: "Forquilla a la mà, copa enlaire" },
    { title: "La ciutat entre plats", subtitle: "Gastronomia sense filtres" },
  ];
  const t = pick(titles);

  const paragraphs = zone
    ? [pZoneIntro(zone), pWalkIntro(walk), pRestaurantBudget(lunch), pBarCasual(bar1), pRestaurantPremium(dinner), pClosing(bar2)]
    : [pWalkIntro(walk), pRestaurantBudget(lunch), pBarCasual(bar1), pRestaurantPremium(dinner), pClosing(bar2)];

  return { ...t, paragraphs };
}

function generateTaller(zone: Zone | null): Plan {
  const walks = filterByZone(WALKS, zone);
  const spots = filterByZone(CULTURAL_SPOTS, zone);
  const budgetR = filterByZone(RESTAURANTS_BUDGET, zone);
  const bars = filterByZone(BARS, zone);

  const walk = pick(walks);
  const spot = pick(spots);
  const restaurant = pick(budgetR);
  const bar = pick(bars);

  const tallerEvent = pickEvent(zone, ["taller"]);
  const tallerParagraph = tallerEvent ? pEventTaller(tallerEvent) : pCulture(spot);

  const titles = [
    { title: "Crea amb les teves mans", subtitle: "Un pla per crear, menjar i gaudir" },
    { title: "Taller i bon pla", subtitle: "Avui t'emportes alguna cosa feta per tu" },
    { title: "Avui es crea", subtitle: "Barcelona creativa: taller, passeig i bon menjar" },
    { title: "Art en primera persona", subtitle: "Menys pantalla, més mans" },
    { title: "Mans a l'obra", subtitle: "Un dia amb les mans ocupades i l'ànima plena" },
  ];
  const t = pick(titles);

  const paragraphs = zone
    ? [pZoneIntro(zone), tallerParagraph, pWalkIntro(walk), pRestaurantBudget(restaurant), pBarCasual(bar)]
    : [tallerParagraph, pWalkIntro(walk), pRestaurantBudget(restaurant), pBarCasual(bar)];

  return { ...t, paragraphs };
}

function generateCine(zone: Zone | null): Plan {
  const walks = filterByZone(WALKS, zone);
  const cinemas = filterByZone(CINEMAS, zone);
  const premiumR = filterByZone(RESTAURANTS_PREMIUM, zone);
  const bars = filterByZone(BARS, zone);

  const walk = pick(walks);
  const cinema = pick(cinemas);
  const restaurant = pick(premiumR);
  const bar = pick(bars);

  const cineEvent = pickEvent(zone, ["cine"]);
  const cinemaParagraph = cineEvent ? pEventCine(cineEvent) : pCinema(cinema);

  const titles = [
    { title: "Sessió contínua", subtitle: "Cinema, sopar i copa. El clàssic ben fet" },
    { title: "Crispetes i ciutat", subtitle: "Avui toca pantalla gran i bon menjar" },
    { title: "Cinema i bona taula", subtitle: "Versió original, subtitulada amb Barcelona" },
    { title: "Pantalla gran, nit gran", subtitle: "Pel·li, sopar i brindis. Nit rodona" },
    { title: "Barcelona en versió original", subtitle: "Cinema independent i sopar bé" },
    { title: "Llums, càmera, Barcelona", subtitle: "Una sessió de cinema amb tot el que l'envolta" },
  ];
  const t = pick(titles);

  const paragraphs = zone
    ? [pZoneIntro(zone), pWalkIntro(walk), cinemaParagraph, pRestaurantPremium(restaurant), pClosing(bar)]
    : [pWalkIntro(walk), cinemaParagraph, pRestaurantPremium(restaurant), pClosing(bar)];

  return { ...t, paragraphs };
}

function generateAireLibre(zone: Zone | null): Plan {
  const outdoor = filterByZone(OUTDOOR_SPOTS, zone);
  const walks = filterByZone(WALKS, zone);
  const budgetR = filterByZone(RESTAURANTS_BUDGET, zone);
  const bars = filterByZone(BARS, zone);

  const spot = pick(outdoor);
  const walk = pick(walks);
  const restaurant = pick(budgetR);
  const bar = pick(bars);

  const titles = [
    { title: "Barcelona a l'aire lliure", subtitle: "Un dia per respirar, caminar i menjar sota el cel" },
    { title: "Cel obert", subtitle: "Avui el sostre el posa Barcelona" },
    { title: "Sol i ciutat", subtitle: "Parcs, passejos i terrasses. El bo és a fora" },
    { title: "Verd, blau i Barcelona", subtitle: "Sol, aire i bon rotllo. Això és tot" },
    { title: "Fora quatre parets", subtitle: "Barcelona es viu millor a l'aire lliure" },
    { title: "El pla és a fora", subtitle: "Aire fresc, bones vistes i menjar bé" },
  ];
  const t = pick(titles);

  const paragraphs = zone
    ? [pZoneIntro(zone), pOutdoor(spot), pWalkIntro(walk), pRestaurantBudget(restaurant), pBarCasual(bar)]
    : [pOutdoor(spot), pWalkIntro(walk), pRestaurantBudget(restaurant), pBarCasual(bar)];

  return { ...t, paragraphs };
}

// ─── Main generator ────────────────────────────────────────────

type Mood = "relax" | "romantic" | "budget" | "music" | "teatro" | "gastro" | "taller" | "cine" | "airelibre" | "random";

const ALL_GENERATORS = [generateRelax, generateRomantic, generateBudget, generateMusic, generateTeatro, generateGastro, generateTaller, generateCine, generateAireLibre];

export function generatePlan(mood: Mood, zone: Zone | null = null): Plan {
  switch (mood) {
    case "relax": return generateRelax(zone);
    case "romantic": return generateRomantic(zone);
    case "budget": return generateBudget(zone);
    case "music": return generateMusic(zone);
    case "teatro": return generateTeatro(zone);
    case "gastro": return generateGastro(zone);
    case "taller": return generateTaller(zone);
    case "cine": return generateCine(zone);
    case "airelibre": return generateAireLibre(zone);
    default: return pick(ALL_GENERATORS)(zone);
  }
}

export function matchMood(input: string): Mood {
  const lower = input.toLowerCase();
  // Gastro — antes de budget para evitar conflicto con "comer"/"menjar"
  if (/comer|menjar|gastronomía|gastronomia|gastro|tapas|foodie|restaurante|restaurant|menú|menu|comida|dinar/.test(lower)) return "gastro";
  // Taller
  if (/taller|workshop|crear|manualidad|manualitat|cerámica|ceràmica|pintar|artesanía|artesania/.test(lower)) return "taller";
  // Cine
  if (/\bcine\b|película|peli\b|pel·lícula|pel·li\b|film|sesión de cine|sessió de cinema|pantalla/.test(lower)) return "cine";
  // Aire libre
  if (/aire libre|aire lliure|parque|parc|playa|platja|sol\b|jardín|jardí|exterior|picnic|naturaleza|natura|al aire|a l'aire/.test(lower)) return "airelibre";
  // Romántico
  if (/romántic|romàntic|pareja|parella|cena especial|sopar especial|para dos|per a dos|cita|amor/.test(lower)) return "romantic";
  // Budget
  if (/gratis|gratuït|barat|sin gastar|sense gastar|poco|poc\b|por la cara|per la cara|económic|econòmic|barato/.test(lower)) return "budget";
  // Música
  if (/música|musica|concert|noche|nit\b|copas|copes|fiesta|festa|directo|directe|jazz|electrónica|electrònica/.test(lower)) return "music";
  // Teatro
  if (/teatro|teatre|obra|escen|comedia|comèdia|drama|danza|dansa/.test(lower)) return "teatro";
  // Relax
  if (/tranquil|relax|prisas|presses|cultural|paseo|passeig|calma|desconectar|desconnectar/.test(lower)) return "relax";
  return "random";
}

export { detectZone };
