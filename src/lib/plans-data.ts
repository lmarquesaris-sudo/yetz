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
  type: "museo" | "galería" | "centro cultural" | "teatro" | "sala" | "espacio";
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
  { name: "Tres Mentiras", type: "Mexicana", priceRange: "€", zone: "born", vibe: "tacos de autor en un local pequeño con mucho rollo" },
  { name: "Bodega la Palma", type: "Ibérica", priceRange: "€", zone: "born", vibe: "bodega clásica con jamón, quesos y vinos de barril" },
  { name: "Fragments", type: "Mediterránea", priceRange: "€", zone: "born", vibe: "cocina de mercado en una placita escondida, platos para compartir" },
  { name: "El Xampanyet", type: "Catalana", priceRange: "€", zone: "born", vibe: "cava y tapas de toda la vida en un bar con azulejos que lleva ahí más de cien años" },
  // Raval
  { name: "Bar Cañete", type: "Mediterránea", priceRange: "€", zone: "raval", vibe: "barra de mercado con tapas espectaculares, de lo mejor del Raval" },
  { name: "Dos Palillos", type: "Asiática fusión", priceRange: "€", zone: "raval", vibe: "tapas asiáticas en barra, cocina abierta y mucha personalidad" },
  { name: "Caravelle", type: "Brunch / casual", priceRange: "€", zone: "raval", vibe: "brunch con producto, bowls y buen café en un local bonito" },
  // Eixample Esquerra
  { name: "Kasa Ramen", type: "Japonesa", priceRange: "€", zone: "eixample-esquerra", vibe: "ramen reconfortante y bien hecho a buen precio" },
  { name: "Moritz", type: "Variada", priceRange: "€", zone: "eixample-esquerra", vibe: "la fábrica de cerveza reconvertida en un espacio brutal" },
  { name: "Flax & Kale", type: "Healthy", priceRange: "€", zone: "eixample-esquerra", vibe: "cocina saludable y flexiteriana con terraza en Tallers" },
  // Gràcia
  { name: "La Pepita", type: "Bocadillos", priceRange: "€", zone: "gracia", vibe: "los mejores bocadillos gourmet de Barcelona, sin discusión" },
  { name: "Chivuo's", type: "Burgers", priceRange: "€", zone: "gracia", vibe: "burgers de calidad con toques creativos en plena Gràcia" },
  { name: "Café Godot", type: "Mediterránea", priceRange: "€", zone: "gracia", vibe: "menú del día bueno y bonito en una esquina con encanto" },
  { name: "Sol Soler", type: "Tapas", priceRange: "€", zone: "gracia", vibe: "tapas catalanas en Plaça del Sol, institución del barrio" },
  // Poblenou
  { name: "Els Pescadors", type: "Marinera", priceRange: "€", zone: "poblenou", vibe: "arroces y pescado de mercado en la plaça de Prim, un clásico del barrio" },
  { name: "La Llavor dels Orígens", type: "Catalana", priceRange: "€", zone: "poblenou", vibe: "todo producto catalán kilómetro cero, en un local precioso" },
  { name: "Can Recasens", type: "Catalana", priceRange: "€", zone: "poblenou", vibe: "bodega-colmado de toda la vida, embutidos, quesos y vinos a granel" },
  { name: "Parking Pizza", type: "Italiana", priceRange: "€", zone: "poblenou", vibe: "pizza napolitana de masa madre en un antiguo parking industrial" },
  // Barceloneta
  { name: "Bronzo", type: "Italiana", priceRange: "€", zone: "barceloneta", vibe: "pasta fresca artesanal con vistas al mar" },
  { name: "La Mar Salada", type: "Marinera", priceRange: "€", zone: "barceloneta", vibe: "arroces y fideuà con producto fresco del día, bien de precio" },
  { name: "Bitácora", type: "Mediterránea", priceRange: "€", zone: "barceloneta", vibe: "terraza en el passeig marítim con tapas de mercado y buen ambiente" },
  // Poble-sec
  { name: "Can Vilaró", type: "Catalana", priceRange: "€", zone: "poble-sec", vibe: "cocina catalana casera y honesta, menú del día por menos de quince euros" },
  { name: "Quimet & Quimet", type: "Tapas", priceRange: "€", zone: "poble-sec", vibe: "montaditos increíbles en un local minúsculo lleno de botellas — mítico de Poble-sec" },
  { name: "Bodega Saltó", type: "Tapas", priceRange: "€", zone: "poble-sec", vibe: "bodega castiza con vermouth de grifo, tapas y decoración imposible" },
  // Sant Antoni
  { name: "Gèlida", type: "Mediterránea", priceRange: "€", zone: "sant-antoni", vibe: "vinos naturales y platos para compartir en un ambiente relajado" },
  { name: "Federal Café", type: "Brunch", priceRange: "€", zone: "sant-antoni", vibe: "brunch australiano con terraza interior, buen café y huevos perfectos" },
  // Sarrià / Zona Alta
  { name: "Flash Flash", type: "Tortillas", priceRange: "€", zone: "sarria-pedralbes", vibe: "mítico de Barcelona — tortillas espectaculares y decoración pop de los 70" },
  { name: "Vivanda", type: "Catalana", priceRange: "€", zone: "sarria-pedralbes", vibe: "cocina catalana de mercado en un jardín precioso de Sarrià" },
  { name: "Bar Tomás", type: "Tapas", priceRange: "€", zone: "sarria-pedralbes", vibe: "las patatas bravas más famosas de Barcelona, punto" },
  // Les Corts
  { name: "A Contraluz", type: "Mediterránea", priceRange: "€", zone: "les-corts", vibe: "terraza con jardín interior escondida en Les Corts, un oasis que pocos conocen" },
  { name: "La Tagliatella (Les Corts)", type: "Italiana", priceRange: "€", zone: "les-corts", vibe: "pasta fresca y pizzas fiables en pleno barrio, bien para ir sin pensar mucho" },
  { name: "Can Culleretes de Les Corts", type: "Catalana", priceRange: "€", zone: "les-corts", vibe: "cocina catalana casera de toda la vida, menú del día honesto" },
  // Sant Martí (Clot / Camp de l'Arpa)
  { name: "El 58", type: "Tapas fusión", priceRange: "€", zone: "sant-marti", vibe: "tapas creativas con toque internacional, una de las sorpresas del Clot" },
  { name: "La Mundana", type: "Mediterránea", priceRange: "€", zone: "sant-marti", vibe: "producto de mercado y carta corta que cambia cada semana, ambiente acogedor" },
  { name: "Can Vallès", type: "Catalana", priceRange: "€", zone: "sant-marti", vibe: "cocina de mercado de barrio como la de antes, con guisos que reconfortan" },
  // Sant Martí / Vila Olímpica
  { name: "Honest Greens (Glòries)", type: "Healthy", priceRange: "€", zone: "sant-marti", vibe: "comida sana y bien hecha a buen precio, perfecto para ir rápido" },
  { name: "Bar Leo", type: "Tapas", priceRange: "€", zone: "sant-marti", vibe: "bravas, bombas y calamares en un bar de barrio que lleva décadas" },
  { name: "La Lluna (Vila Olímpica)", type: "Marinera", priceRange: "€", zone: "vila-olimpica", vibe: "paellas y fideuà con vistas al Port Olímpic, buen plan de domingo" },
  // Horta-Guinardó
  { name: "Can Travi Nou", type: "Catalana", priceRange: "€", zone: "horta-guinardo", vibe: "masía del XVII con jardín, cocina catalana en un sitio que no parece Barcelona" },
  { name: "El Rincón de Horta", type: "Mediterránea", priceRange: "€", zone: "horta-guinardo", vibe: "terraza tranquila con menú casero, el secreto mejor guardado de Horta" },
  { name: "La Vermutería del Guinardó", type: "Tapas", priceRange: "€", zone: "horta-guinardo", vibe: "vermut de grifo, anchoas y bravas en un bar con alma de barrio" },
  // Sant Andreu
  { name: "Can Sadurní", type: "Catalana", priceRange: "€", zone: "sant-andreu", vibe: "cocina catalana de tota la vida en la rambla de Sant Andreu, como comer en casa" },
  { name: "El Petit Andreu", type: "Tapas", priceRange: "€", zone: "sant-andreu", vibe: "tapas y vinos en un bar bonito del barrio, buen ambiente local" },
  // Nou Barris
  { name: "Can Paixano Nou Barris", type: "Catalana", priceRange: "€", zone: "nou-barris", vibe: "cocina casera catalana sin pretensiones y a buen precio" },
  { name: "El Mirador de Roquetes", type: "Mediterránea", priceRange: "€", zone: "nou-barris", vibe: "restaurante con terraza y vistas a la ciudad, la recompensa después de subir" },
  // Gòtic
  { name: "Can Culleretes", type: "Catalana", priceRange: "€", zone: "gotic", vibe: "el restaurant més antic de Barcelona, des de 1786 — escudella, carn d'olla i cuina catalana de tota la vida" },
  { name: "Café de l'Acadèmia", type: "Catalana", priceRange: "€", zone: "gotic", vibe: "cuina catalana de mercat a la Plaça Sant Just, un dels racons més bonics del Gòtic" },
  { name: "Los Caracoles", type: "Catalana", priceRange: "€", zone: "gotic", vibe: "cargols al forn, pollastre rostit i arrossos des de 1835 — institució de Barcelona" },
  // Sagrada Família
  { name: "La Paradeta", type: "Marinera", priceRange: "€", zone: "sagrada-familia", vibe: "tries el peix i marisc a pes com al mercat i te'l cuinen al moment — format únic i divertit" },
  { name: "Arume", type: "Gallega", priceRange: "€", zone: "sagrada-familia", vibe: "cuina gallega autèntica amb polp, pimentos de Padrón i vins del Rías Baixas" },
  // Eixample Dreta
  { name: "Cervecería Catalana", type: "Tapas", priceRange: "€", zone: "eixample-dreta", vibe: "la barra de tapes més famosa de Barcelona — patates braves, anxoves i croquetes de tota la vida" },
  { name: "Ciudad Condal", type: "Tapas", priceRange: "€", zone: "eixample-dreta", vibe: "tapes generoses i cerveses fredes a Rambla Catalunya, institució del barri" },
  { name: "Taktika Berri", type: "Basca", priceRange: "€", zone: "eixample-dreta", vibe: "pintxos bascos autèntics a la barra, txacolí i ambient de taberna de San Sebastián" },
];

export const RESTAURANTS_PREMIUM: Restaurant[] = [
  // Born
  { name: "Coure", type: "Catalana", priceRange: "€€", zone: "born", vibe: "alta cocina catalana accesible, menú degustación muy bueno" },
  { name: "Shunka", type: "Japonesa", priceRange: "€€", zone: "born", vibe: "el japonés de referencia de Barcelona, barra de sushi increíble" },
  { name: "Cal Pep", type: "Marinera", priceRange: "€€", zone: "born", vibe: "barra mítica con el mejor producto de mercado, comer aquí es una experiencia" },
  // Raval
  { name: "Ca l'Isidre", type: "Catalana", priceRange: "€€", zone: "raval", vibe: "cocina catalana clásica de toda la vida, uno de los grandes de la ciudad" },
  // Eixample Dreta
  { name: "Nairod", type: "Catalana", priceRange: "€€", zone: "eixample-dreta", vibe: "cocina catalana contemporánea con producto de temporada" },
  { name: "Gresca", type: "Catalana", priceRange: "€€", zone: "eixample-dreta", vibe: "cocina creativa de autor, una de las mejores relaciones calidad-precio de la ciudad" },
  { name: "Nomo", type: "Japonesa", priceRange: "€€", zone: "eixample-dreta", vibe: "japonesa premium con omakase y productos de primera" },
  { name: "Leku", type: "Vasca", priceRange: "€€", zone: "eixample-dreta", vibe: "pintxos y cocina vasca de nivel con una barra espectacular" },
  // Gràcia
  { name: "Deliri", type: "Catalana", priceRange: "€€", zone: "gracia", vibe: "cocina catalana moderna en un espacio íntimo" },
  { name: "Botafumeiro", type: "Gallega", priceRange: "€€", zone: "gracia", vibe: "marisco gallego de primer nivel, de los mejores de Barcelona" },
  // Poblenou
  { name: "Disfrutar", type: "Creativa", priceRange: "€€", zone: "eixample-esquerra", vibe: "tres estrellas Michelin, cocina creativa de los ex-chefs de El Bulli — experiencia única" },
  { name: "La Barca del Salamanca", type: "Marinera", priceRange: "€€", zone: "poblenou", vibe: "arroces con vistas al puerto olímpico, cocina marinera de nivel" },
  // Barceloneta
  { name: "Can Paixano (La Xampanyeria)", type: "Catalana", priceRange: "€€", zone: "barceloneta", vibe: "cava y bocadillos a precio de risa en el bar más divertido del barrio" },
  // Poble-sec
  { name: "Tickets", type: "Creativa", priceRange: "€€", zone: "poble-sec", vibe: "tapas creativas de los Adrià, cada plato es un espectáculo" },
  // Sant Antoni
  { name: "Maleducat", type: "Catalana", priceRange: "€€", zone: "sant-antoni", vibe: "arroces espectaculares y cocina de mercado con personalidad" },
  // Sarrià / Zona Alta
  { name: "Asador de Aranda", type: "Castellana", priceRange: "€€", zone: "sarria-pedralbes", vibe: "cordero y cochinillo en un edificio modernista espectacular" },
  { name: "Hofmann", type: "Creativa", priceRange: "€€", zone: "sarria-pedralbes", vibe: "escuela de cocina y restaurante, creatividad con base clásica impecable" },
  // Les Corts
  { name: "Via Veneto", type: "Clásica", priceRange: "€€", zone: "les-corts", vibe: "alta cocina clásica con estrella Michelin, elegancia de otra época" },
  // Sant Martí (Clot / Camp de l'Arpa)
  { name: "Xemei", type: "Italiana", priceRange: "€€", zone: "sant-marti", vibe: "cocina veneciana de autor con cícheti y pastas hechas en casa" },
  { name: "La Mundana (degustación)", type: "Mediterránea", priceRange: "€€", zone: "sant-marti", vibe: "menú degustación con producto de mercado que cambia cada semana" },
  // Sant Martí
  { name: "Arola (Hotel Arts)", type: "Mediterránea", priceRange: "€€", zone: "vila-olimpica", vibe: "terraza junto al mar del Hotel Arts, cocina mediterránea de nivel con vistas" },
  // Horta-Guinardó
  { name: "Can Travi Nou (menú)", type: "Catalana premium", priceRange: "€€", zone: "horta-guinardo", vibe: "menú degustación en una masía histórica con jardín, experiencia única fuera del centro" },
  // Sant Andreu
  { name: "La Fonda del Recó", type: "Catalana", priceRange: "€€", zone: "sant-andreu", vibe: "cocina catalana actualizada con producto de mercado en Sant Andreu" },
  // Gòtic
  { name: "Koy Shunka", type: "Japonesa", priceRange: "€€", zone: "gotic", vibe: "japonès d'alt nivell davant la Catedral, estrella Michelin — omakase que deixa sense paraules" },
  { name: "Sensi Tapas", type: "Mediterrània", priceRange: "€€", zone: "gotic", vibe: "tapes d'autor mediterrànies amb producte de primera, al cor del Gòtic" },
  // Sagrada Família
  { name: "Alkimia", type: "Catalana", priceRange: "€€", zone: "sagrada-familia", vibe: "cuina catalana d'autor del chef Jordi Vilà, producte de temporada elevat al màxim" },
];

// ─── Bars ─────────────────────────────────────────────────────

export const BARS: Bar[] = [
  // Born
  { name: "Paradiso", type: "Speakeasy", zone: "born", vibe: "se esconde detrás de una nevera de un bar de pastrami — top 50 mundial" },
  { name: "La Vinya del Senyor", type: "Wine bar", zone: "born", vibe: "terraza frente a Santa Maria del Mar con una carta de vinos brutal" },
  { name: "Bodega Maestrazgo", type: "Bodega", zone: "born", vibe: "vermut de grifo y conservas, bodega con cincuenta años de historia" },
  { name: "Collage Cocktail Bar", type: "Cocktail bar", zone: "born", vibe: "cocktails de autor en un local íntimo con ladrillo visto" },
  // Raval
  { name: "33|45", type: "Bar musical", zone: "raval", vibe: "vinilos, cocktails y buena música en un bar con alma" },
  { name: "Betty Ford's", type: "Cocktail bar", zone: "raval", vibe: "bar americano kitsch con cocktails potentes y buen rollo" },
  { name: "Casa Almirall", type: "Bar histórico", zone: "raval", vibe: "el bar más antiguo del Raval, con el absenta de siempre y un interior modernista precioso" },
  { name: "Negroni", type: "Cocktail bar", zone: "raval", vibe: "cocktails clásicos bien hechos en un local oscuro y acogedor de Joaquín Costa" },
  // Eixample Dreta
  { name: "Dry Martini", type: "Cocktail bar clásico", zone: "eixample-dreta", vibe: "el bar de cocktails clásico por excelencia, barra de madera y camareros de chaqueta" },
  { name: "Bar Mut", type: "Wine bar", zone: "eixample-dreta", vibe: "vermut, anchoas y ese punto de bar clásico barcelonés que siempre funciona" },
  { name: "Bobby's Free", type: "Speakeasy", zone: "eixample-dreta", vibe: "speakeasy dentro de una barbería — encuentras la puerta y es otro mundo" },
  { name: "El Maravillas", type: "Rooftop", zone: "eixample-dreta", vibe: "Aperol Spritz en la azotea del Hotel Almanac con vistas a la ciudad" },
  { name: "Bridge 48", type: "Cocktail bar", zone: "eixample-dreta", vibe: "cocktails de autor en un espacio industrial muy cuidado" },
  // Gràcia
  { name: "Elephanta", type: "Bar musical", zone: "gracia", vibe: "cocktails, música en vinilo y una barra preciosa en el corazón de Gràcia" },
  { name: "Bobby Gin", type: "Gin bar", zone: "gracia", vibe: "gin-tonics de autor con botánicos propios, en un local con mucho carácter" },
  { name: "Virreina Bar", type: "Terraza", zone: "gracia", vibe: "terraza en la Plaça de la Virreina con cañas y vermut, paz total" },
  { name: "Café del Sol", type: "Terraza", zone: "gracia", vibe: "la terraza clásica de Plaça del Sol, cañas y atardecer" },
  // Poblenou
  { name: "Madame George", type: "Cocktail bar", zone: "poblenou", vibe: "cocktails creativos en un local precioso con planta y ladrillo visto" },
  { name: "Nomad Coffee", type: "Specialty coffee", zone: "poblenou", vibe: "el mejor café de especialidad de Barcelona, tostado aquí mismo" },
  { name: "La Cervecita Nuestra de Cada Día", type: "Cervecería craft", zone: "poblenou", vibe: "treinta grifos de cerveza artesana y el mejor pulled pork de la zona" },
  { name: "Oso", type: "Wine bar", zone: "poblenou", vibe: "vinos naturales y tapas de mercado en un espacio industrial del Poblenou" },
  // Barceloneta
  { name: "La Cervecería", type: "Cervecería", zone: "barceloneta", vibe: "cañas y bravas frente al mar, institución de la Barceloneta" },
  { name: "Vai Moana", type: "Chiringuito", zone: "barceloneta", vibe: "mojitos con los pies casi en la arena y atardecer delante" },
  { name: "Santa Marta", type: "Terraza", zone: "barceloneta", vibe: "terraza con vistas al mar y cocina mediterránea informal" },
  // Poble-sec
  { name: "Bar Calders", type: "Terraza", zone: "poble-sec", vibe: "la terraza más buscada de Poble-sec, vermut y platos para picar" },
  { name: "La Caseta del Migdia", type: "Chiringuito", zone: "poble-sec", vibe: "chiringuito escondido en Montjuïc entre pinos — cuesta encontrarlo pero merece la pena" },
  { name: "Absenta Bar", type: "Bar histórico", zone: "poble-sec", vibe: "absenta y cocktails en un local lleno de muñecos y arte urbano" },
  // Sant Antoni
  { name: "Bar Brutal", type: "Wine bar", zone: "sant-antoni", vibe: "vinos naturales y tapas en Can Cisa, el colmado reconvertido más bonito del barrio" },
  { name: "La Confitería", type: "Bar histórico", zone: "sant-antoni", vibe: "antigua confitería del XIX reconvertida en bar de cocktails, el techo es una obra de arte" },
  // Sarrià / Zona Alta
  { name: "Mirablau", type: "Bar con vistas", zone: "sarria-pedralbes", vibe: "cocktails con las vistas más espectaculares de Barcelona, al pie del Tibidabo" },
  { name: "Terraza del Hotel Ohla", type: "Rooftop", zone: "sarria-pedralbes", vibe: "piscina y cocktails con vistas panorámicas de la ciudad" },
  { name: "Marcel", type: "Wine bar", zone: "sarria-pedralbes", vibe: "vinoteca tranquila en Sarrià con buena selección y tapas de autor" },
  // Les Corts
  { name: "Garage Beer Co (Les Corts)", type: "Cervecería craft", zone: "les-corts", vibe: "cerveza artesana de barrio con terraza, buen plan informal" },
  { name: "Cocktail Bar Les Corts", type: "Cocktail bar", zone: "les-corts", vibe: "cocktails clásicos bien hechos en un bar de barrio con encanto" },
  // Sant Martí (Clot / Camp de l'Arpa)
  { name: "La Rovira", type: "Terraza", zone: "sant-marti", vibe: "terraza de barrio con vermut, cañas y ese rollo de Clot auténtico" },
  { name: "Bar Eléctric", type: "Cocktail bar", zone: "sant-marti", vibe: "cocktails creativos en un local pequeño con mucha personalidad en Camp de l'Arpa" },
  { name: "La Cervecería del Clot", type: "Cervecería craft", zone: "sant-marti", vibe: "grifos de cerveza artesana local y tapas, ambiente joven y relajado" },
  // Vila Olímpica
  { name: "Shôko", type: "Lounge", zone: "vila-olimpica", vibe: "cocktails frente al mar en el Port Olímpic, terraza con atardecer" },
  { name: "Opium Barcelona", type: "Lounge", zone: "vila-olimpica", vibe: "cocktails y música junto a la playa, ambiente nocturno con estilo" },
  { name: "Ice Barcelona", type: "Bar temático", zone: "vila-olimpica", vibe: "bar de hielo con cocktails incluidos y la experiencia de estar a -5 grados" },
  // Horta-Guinardó
  { name: "El Mirador del Carmel", type: "Terraza", zone: "horta-guinardo", vibe: "cervezas con las mejores vistas de Barcelona desde los Bunkers, atardecer obligatorio" },
  { name: "Bar del Laberint", type: "Terraza", zone: "horta-guinardo", vibe: "terraza tranquila cerca del Laberint d'Horta, vermut y calma" },
  { name: "La Vermutería del Guinardó", type: "Vermutería", zone: "horta-guinardo", vibe: "vermut artesano, aceitunas gordas y esa vida de barrio que no encuentras en el centro" },
  // Sant Andreu
  { name: "Bar La Rambla de Sant Andreu", type: "Terraza", zone: "sant-andreu", vibe: "vermut y tapas en la rambla peatonal, el centro de la vida del barrio" },
  { name: "La Fábrica (Fabra i Coats)", type: "Bar cultural", zone: "sant-andreu", vibe: "bar en el recinto cultural de Fabra i Coats, cerveza y exposiciones" },
  // Nou Barris
  { name: "Bar Mirador Torre Baró", type: "Terraza", zone: "nou-barris", vibe: "cervezas con vistas panorámicas desde lo alto de Nou Barris, un secreto de la ciudad" },
  { name: "El Chiringuito de Roquetes", type: "Terraza", zone: "nou-barris", vibe: "terraza de barrio con ambiente local y precios populares, buen vermut" },
  // Gòtic
  { name: "L'Ascensor", type: "Cocktail bar", zone: "gotic", vibe: "cocktails en un local amb porta d'ascensor antiga, un clàssic amagat del Gòtic" },
  { name: "Sor Rita", type: "Bar", zone: "gotic", vibe: "decoració kitsch i camp, vermuts i ambient desinhibit a la Plaça George Orwell" },
  { name: "Glaciar", type: "Terrassa", zone: "gotic", vibe: "la terrassa de tota la vida a Plaça Reial, cerveses i veure la gent passar" },
  // Sagrada Família
  { name: "Garage Beer Co", type: "Cerveceria craft", zone: "sagrada-familia", vibe: "cervesa artesana feta aquí mateix, grifos rotatius i ambient informal" },
  { name: "La Vermuteria de la Sagrada Família", type: "Vermuteria", zone: "sagrada-familia", vibe: "vermut de grifo, olives i aquell rotllo de barri que no trobes al centre" },
  // Eixample Esquerra
  { name: "Milano Cocktail Bar", type: "Cocktail bar", zone: "eixample-esquerra", vibe: "cocktails clàssics en un soterrani elegant, un dels secrets més ben guardats de l'Eixample" },
];

// ─── Walks ────────────────────────────────────────────────────

export const WALKS: Walk[] = [
  { name: "el Born", zone: "born", description: "callejuelas llenas de galerías, tiendas bonitas y terrazas hasta Santa Maria del Mar", duration: "45 min" },
  { name: "el Gòtic", zone: "gotic", description: "desde la Catedral por la Plaça del Rei, el Call Jueu y placitas que llevan siglos ahí", duration: "40 min" },
  { name: "el Raval", zone: "raval", description: "del MACBA por Carrer dels Tallers, ambiente multicultural y sitios inesperados", duration: "35 min" },
  { name: "Gràcia", zone: "gracia", description: "placitas con terrazas, tiendas vintage y ese rollo de pueblo dentro de la ciudad", duration: "40 min" },
  { name: "la Rambla del Poblenou", zone: "poblenou", description: "la rambla de barrio más auténtica de Barcelona, terrazas, plátanos y vecinos de toda la vida", duration: "30 min" },
  { name: "Poblenou industrial", zone: "poblenou", description: "naves reconvertidas, street art, Palo Alto y el Poblenou que mira al futuro sin olvidar las fábricas", duration: "50 min" },
  { name: "la Barceloneta", zone: "barceloneta", description: "por el Port Vell, cruzar las callejuelas de pescadores y acabar en la playa", duration: "50 min" },
  { name: "el passeig marítim", zone: "barceloneta", description: "desde la Barceloneta hasta el Port Olímpic con el Mediterráneo a la izquierda", duration: "40 min" },
  { name: "Montjuïc", zone: "poble-sec", description: "subir hasta el MNAC con vistas de toda Barcelona, jardines y ese silencio de montaña en medio de la ciudad", duration: "1h" },
  { name: "Poble-sec y Paral·lel", zone: "poble-sec", description: "del Paral·lel subiendo por las calles empinadas del barrio, huertos urbanos y terrazas escondidas", duration: "35 min" },
  { name: "el Eixample", zone: "eixample-dreta", description: "Passeig de Gràcia, fachadas modernistas, Enric Granados y el ritmo pausado de las manzanas del Cerdà", duration: "1h" },
  { name: "Sarrià pueblo", zone: "sarria-pedralbes", description: "calles de pueblo dentro de la ciudad, el Mercat de Sarrià y el Monestir de Pedralbes", duration: "45 min" },
  { name: "Sant Antoni y alrededores", zone: "sant-antoni", description: "desde el Mercat de Sant Antoni por Parlament y Manso, buen ambiente y tiendas de diseño", duration: "30 min" },
  // Nuevas zonas
  { name: "Les Corts y el Camp Nou", zone: "les-corts", description: "por la zona universitaria hasta el Camp Nou, barrio residencial con rincones tranquilos", duration: "40 min" },
  { name: "el Clot y Camp de l'Arpa", zone: "sant-marti", description: "calles con ambiente de barrio, plazas escondidas y murales de arte urbano que pocos turistas ven", duration: "35 min" },
  { name: "la Vila Olímpica al port", zone: "vila-olimpica", description: "desde Ciutadella por el Port Olímpic hasta la playa de la Nova Icària, paseo entre arte y mar", duration: "45 min" },
  { name: "Horta y el Laberint", zone: "horta-guinardo", description: "subir al Laberint d'Horta, el jardín neoclásico más antiguo de Barcelona, y bajar por calles con historia", duration: "1h" },
  { name: "los Bunkers del Carmel", zone: "horta-guinardo", description: "la subida hasta el mirador más famoso de Barcelona — el esfuerzo merece cada vista", duration: "50 min" },
  { name: "Rambla de Sant Andreu", zone: "sant-andreu", description: "paseo por la rambla peatonal del barrio, mercado, iglesia y ambiente de pueblo dentro de la ciudad", duration: "30 min" },
  { name: "Nou Barris y miradores", zone: "nou-barris", description: "subir a Torre Baró por vistas que compiten con Montjuïc pero sin un solo turista", duration: "50 min" },
  { name: "l'Avinguda Gaudí", zone: "sagrada-familia", description: "el passeig peatonal que connecta la Sagrada Família amb l'Hospital de Sant Pau, modernisme a banda i banda", duration: "20 min" },
  { name: "Enric Granados", zone: "eixample-esquerra", description: "el carrer peatonal més bonic de l'Eixample, terrasses, galeries i botigues de disseny entre illes del Cerdà", duration: "30 min" },
];

// ─── Cultural spots ───────────────────────────────────────────

export const CULTURAL_SPOTS: CulturalSpot[] = [
  // Born
  { name: "Museu Picasso", type: "museo", zone: "born", what: "cinco palacios medievales con la etapa más joven de Picasso", price: "12 €" },
  { name: "MEAM", type: "museo", zone: "born", what: "arte figurativo contemporáneo en un palacio del Born — sorprende mucho", price: "11 €" },
  { name: "Moco Museum", type: "museo", zone: "born", what: "Banksy, KAWS, Haring — arte moderno y contemporáneo muy visual", price: "16 €" },
  // Gòtic
  { name: "Museu d'Història de Barcelona (MUHBA)", type: "museo", zone: "gotic", what: "la Barcelona romana bajo tus pies, una pasada caminar por calles del siglo I", price: "7 €" },
  { name: "Basílica de Santa Maria del Mar", type: "espacio", zone: "born", what: "gótico catalán en estado puro, la luz que entra es mágica", price: "gratuita" },
  // Raval
  { name: "MACBA", type: "museo", zone: "raval", what: "arte contemporáneo con la plaza llena de skaters y buen ambiente", price: "11 €" },
  { name: "CCCB", type: "centro cultural", zone: "raval", what: "exposiciones que te hacen pensar y un patio de cristal precioso", price: "6 €" },
  { name: "Filmoteca de Catalunya", type: "centro cultural", zone: "raval", what: "cine de autor, ciclos y retrospectivas a precio de risa en la Plaça de Salvador Seguí", price: "4 €" },
  { name: "Arts Santa Mònica", type: "centro cultural", zone: "raval", what: "arte y cultura contemporánea con entrada gratis al final de la Rambla", price: "gratuita" },
  // Eixample Dreta
  { name: "Fundació Antoni Tàpies", type: "museo", zone: "eixample-dreta", what: "la obra de Tàpies en un edificio modernista de Domènech i Montaner", price: "8 €" },
  { name: "Casa Batlló", type: "museo", zone: "eixample-dreta", what: "Gaudí en estado puro, la fachada del dragón y un interior que parece el fondo del mar", price: "35 €" },
  { name: "La Pedrera", type: "museo", zone: "eixample-dreta", what: "la azotea de guerreros de Gaudí y la exposición del piso modernista", price: "25 €" },
  { name: "Fundació Suñol", type: "galería", zone: "eixample-dreta", what: "arte contemporáneo de la colección Suñol, gratis y siempre con alguna joya", price: "gratuita" },
  // Gràcia
  { name: "Casa Vicens", type: "museo", zone: "gracia", what: "la primera casa de Gaudí, azulejos imposibles y un jardín precioso", price: "18 €" },
  { name: "Mercat de l'Abaceria", type: "espacio", zone: "gracia", what: "mercado de barrio con producto fresco y buen ambiente local", price: "gratuita" },
  // Poblenou
  { name: "Museu del Disseny", type: "museo", zone: "poblenou", what: "diseño, moda y artes decorativas en el edificio Dhub de Glòries — gratuito el primer domingo", price: "8 €" },
  { name: "Can Framis", type: "museo", zone: "poblenou", what: "pintura contemporánea catalana en una antigua fábrica textil reconvertida", price: "5 €" },
  { name: "Palo Alto Market", type: "espacio", zone: "poblenou", what: "mercadillo creativo el primer fin de semana de mes en un recinto industrial con jardín — música, food trucks y diseñadores locales", price: "gratuita" },
  { name: "Centre Cívic Can Felipa", type: "centro cultural", zone: "poblenou", what: "exposiciones y actividades culturales en una antigua fábrica del barrio", price: "gratuita" },
  { name: "Espai Nyamnyam", type: "espacio", zone: "poblenou", what: "artes vivas y performativas en un espacio independiente del Poblenou", price: "5-10 €" },
  // Barceloneta
  { name: "Museu d'Història de Catalunya", type: "museo", zone: "barceloneta", what: "la historia de Catalunya de forma interactiva, con una terraza en la azotea con vistas al puerto", price: "6 €" },
  // Poble-sec / Montjuïc
  { name: "Fundació Joan Miró", type: "museo", zone: "poble-sec", what: "el universo de Miró en un edificio de Sert con una luz increíble", price: "16 €" },
  { name: "MNAC", type: "museo", zone: "poble-sec", what: "la mejor colección de arte románico del mundo, y las vistas desde la explanada", price: "12 € (gratis domingos tarde)" },
  { name: "CaixaForum", type: "centro cultural", zone: "poble-sec", what: "grandes exposiciones internacionales en la antigua fábrica Casaramona", price: "6 €" },
  { name: "Jardí Botànic de Barcelona", type: "espacio", zone: "poble-sec", what: "plantas mediterráneas con vistas al mar, un paseo de naturaleza en medio de la ciudad", price: "5 €" },
  // Sarrià / Zona Alta
  { name: "CosmoCaixa", type: "museo", zone: "sarria-pedralbes", what: "el mejor museo de ciencia de España, con un bosque tropical dentro", price: "6 €" },
  { name: "Monestir de Pedralbes", type: "museo", zone: "sarria-pedralbes", what: "claustro gótico con tres pisos y unos frescos medievales que quitan el hipo", price: "5 €" },
  { name: "Jardins de Pedralbes", type: "espacio", zone: "sarria-pedralbes", what: "jardines señoriales y festival de música en verano", price: "gratuita" },
  // Sant Antoni
  { name: "Mercat de Sant Antoni", type: "espacio", zone: "sant-antoni", what: "el mercado más bonito de Barcelona tras su reforma, domingos hay mercadillo de libros", price: "gratuita" },
  // Les Corts
  { name: "Camp Nou Experience", type: "museo", zone: "les-corts", what: "el museo del Barça y el nuevo estadio, una peregrinación para cualquier culé", price: "28 €" },
  { name: "Jardins de la Maternitat", type: "espacio", zone: "les-corts", what: "jardines del antiguo complejo modernista de la Maternitat, un remanso de paz en Les Corts", price: "gratuita" },
  // Sant Martí (Clot)
  { name: "Mercat del Clot", type: "espacio", zone: "sant-marti", what: "mercado de barrio con producto fresco y ambiente local auténtico", price: "gratuita" },
  { name: "Parc del Clot", type: "espacio", zone: "sant-marti", what: "parque construido sobre una antigua estación de tren con arcos de ladrillo originales", price: "gratuita" },
  // Vila Olímpica
  { name: "Museu Olímpic i de l'Esport", type: "museo", zone: "vila-olimpica", what: "la historia de los JJOO del 92 y del deporte, interactivo y divertido", price: "5,80 €" },
  { name: "Parc de la Ciutadella", type: "espacio", zone: "vila-olimpica", what: "el pulmón verde de Barcelona con la cascada monumental, lago y el zoo — pasear aquí es obligatorio", price: "gratuita" },
  // Horta-Guinardó
  { name: "Laberint d'Horta", type: "espacio", zone: "horta-guinardo", what: "el jardín neoclásico más antiguo de Barcelona con un laberinto de cipreses, precioso y tranquilo", price: "gratuita dom/mié" },
  { name: "Bunkers del Carmel", type: "espacio", zone: "horta-guinardo", what: "antiguas baterías antiaéreas convertidas en el mirador más espectacular de Barcelona — 360 grados de ciudad", price: "gratuita" },
  { name: "Park Güell", type: "museo", zone: "horta-guinardo", what: "el parque de Gaudí con el dragón, el banco ondulado y vistas de toda Barcelona", price: "10 €" },
  // Sant Andreu
  { name: "Fabra i Coats", type: "centro cultural", zone: "sant-andreu", what: "antigua fábrica textil reconvertida en centro de creación artística con exposiciones y residencias", price: "gratuita" },
  { name: "Església de Sant Andreu de Palomar", type: "espacio", zone: "sant-andreu", what: "iglesia románica en el corazón del barrio, la plaza alrededor tiene mucha vida", price: "gratuita" },
  // Nou Barris
  { name: "Mirador de Torre Baró", type: "espacio", zone: "nou-barris", what: "vistas panorámicas brutales de Barcelona y el Vallès, sin un solo turista", price: "gratuita" },
  { name: "Ateneu Popular de Nou Barris", type: "centro cultural", zone: "nou-barris", what: "circo, teatro y cultura comunitaria en un espacio autogestionado con mucha historia", price: "5-10 €" },
  // Sagrada Família
  { name: "Recinte Modernista de Sant Pau", type: "museo", zone: "sagrada-familia", what: "el conjunt modernista més gran d'Europa, Patrimoni UNESCO de Domènech i Montaner — una meravella", price: "15 €" },
  // Eixample Esquerra
  { name: "Museu del Modernisme", type: "museo", zone: "eixample-esquerra", what: "art modernista català en una planta baixa de l'Eixample — mobles, pintures i escultures de Gaudí, Casas i companyia", price: "10 €" },
  { name: "Universitat de Barcelona (Edifici Històric)", type: "espacio", zone: "eixample-esquerra", what: "l'edifici neogòtic de la UB amb els seus claustres i jardins, un tresor amagat al bell mig de la ciutat", price: "gratuita" },
];

export const THEATERS: CulturalSpot[] = [
  { name: "Teatre Nacional de Catalunya", type: "teatro", zone: "sagrada-familia", what: "el edificio de Bofill, todo cristal y columnas, con programación de primer nivel", price: "15-30 €" },
  { name: "Teatre Lliure (Montjuïc)", type: "teatro", zone: "poble-sec", what: "teatro independiente con propuestas arriesgadas que casi siempre aciertan", price: "12-28 €" },
  { name: "Teatre Lliure (Gràcia)", type: "teatro", zone: "gracia", what: "la sala de Gràcia del Lliure, más íntima y con obras de formato pequeño", price: "10-22 €" },
  { name: "Sala Beckett", type: "sala", zone: "poblenou", what: "dramaturgia contemporánea en un espacio íntimo — las obras pegan fuerte", price: "10-18 €" },
  { name: "Teatre Romea", type: "teatro", zone: "raval", what: "uno de los teatros más antiguos de Barcelona, siempre con buenas obras", price: "15-28 €" },
  { name: "Mercat de les Flors", type: "teatro", zone: "poble-sec", what: "danza contemporánea y artes del movimiento, cosas que no ves en otro sitio", price: "10-22 €" },
  { name: "Teatre Condal", type: "teatro", zone: "eixample-esquerra", what: "musicales y comedia en Paral·lel, buen plan para pasar un rato divertido", price: "15-35 €" },
  { name: "Antic Teatre", type: "sala", zone: "born", what: "teatro alternativo con un bar-terraza con jardín que es un oasis escondido", price: "8-15 €" },
  { name: "Teatre Poliorama", type: "teatro", zone: "raval", what: "en plena Rambla, programación variada y siempre con algo interesante", price: "12-30 €" },
  // Nuevos teatros — zonas expandidas + más variedad
  { name: "Sala Flyhard", type: "sala", zone: "sant-antoni", what: "teatro de texto contemporáneo en un espacio pequeño donde sientes la respiración de los actores", price: "12-18 €" },
  { name: "Teatre Gaudí Barcelona", type: "teatro", zone: "eixample-esquerra", what: "teatro de barrio con programación ecléctica — desde comedia hasta drama social, siempre sorprende", price: "12-24 €" },
  { name: "Teatre Victoria", type: "teatro", zone: "poble-sec", what: "musicales y grandes producciones en Paral·lel, la Broadway barcelonesa", price: "20-45 €" },
  { name: "Almeria Teatre", type: "sala", zone: "sant-andreu", what: "sala independiente en Sant Andreu con propuestas frescas y mucho teatro emergente", price: "10-15 €" },
  { name: "Versus Teatre", type: "sala", zone: "eixample-esquerra", what: "sala íntima con obras que te remueven, de esas que sales pensando durante días", price: "12-18 €" },
  { name: "La Seca Espai Brossa", type: "sala", zone: "born", what: "magia, circo y artes parateatrales en un edificio con historia en el Born — algo distinto", price: "10-20 €" },
  { name: "Teatre Tantarantana", type: "sala", zone: "born", what: "sala alternativa en el corazón del Born, obras con garra y un público fiel", price: "10-16 €" },
  { name: "Sala Hiroshima", type: "sala", zone: "poblenou", what: "artes escénicas experimentales y danza contemporánea, de lo más vanguardista de la ciudad", price: "8-15 €" },
  { name: "La Villarroel", type: "teatro", zone: "eixample-esquerra", what: "teatro de autor con producciones propias que llevan años llenando — calidad asegurada", price: "15-28 €" },
  { name: "Teatre Apolo", type: "teatro", zone: "poble-sec", what: "musicales a lo grande en Paral·lel, decoración de época y ese rollo de teatro clásico", price: "20-50 €" },
  { name: "Teatre del Raval", type: "sala", zone: "raval", what: "sala de barrio con teatro social y comunitario, producciones que hablan de lo que pasa en la calle", price: "8-15 €" },
  { name: "Teatreneu", type: "teatro", zone: "gracia", what: "comedia y microteatro en Gràcia — si te ríes pagas, el concepto más genial del mundo", price: "paga por risa" },
  { name: "SAT! Sant Andreu Teatre", type: "teatro", zone: "sant-andreu", what: "el teatro de referencia del barrio, programación familiar y clásicos con buen nivel", price: "10-22 €" },
  { name: "Teatre BARTS", type: "teatro", zone: "poble-sec", what: "sala polivalente en Paral·lel con teatro, humor y conciertos, siempre pasa algo", price: "15-30 €" },
  { name: "Sala Planeta", type: "sala", zone: "sarria-pedralbes", what: "teatro íntimo en la zona alta con obras de calidad en un espacio recogido", price: "12-20 €" },
  { name: "Ateneu Popular de Nou Barris (teatro)", type: "sala", zone: "nou-barris", what: "circo contemporáneo y teatro comunitario con una energía que no encuentras en el centro", price: "5-12 €" },
  { name: "Teatre Ovidi Montllor", type: "teatro", zone: "horta-guinardo", what: "teatro de barrio en Horta con programación para todos, nombrado en honor al gran cantautor", price: "8-18 €" },
  { name: "Sala Fènix", type: "sala", zone: "les-corts", what: "espacio escénico independiente en Les Corts con teatro de texto y propuestas emergentes", price: "10-16 €" },
  { name: "El Molino", type: "teatro", zone: "poble-sec", what: "cabaret, revista y espectáculos en el mítico Molino del Paral·lel — historia viva de Barcelona", price: "20-40 €" },
];

export const MUSIC_VENUES: CulturalSpot[] = [
  { name: "Jamboree Jazz Club", type: "sala", zone: "gotic", what: "jazz en directo cada noche en un sótano de Plaça Reial con mucha historia", price: "15 €" },
  { name: "Sala Apolo", type: "sala", zone: "poble-sec", what: "música en directo con una energía especial, desde indie hasta electrónica", price: "15-25 €" },
  { name: "Razzmatazz", type: "sala", zone: "poblenou", what: "cinco salas con estilos distintos, siempre encuentras algo que te va", price: "15-20 €" },
  { name: "Palau de la Música", type: "sala", zone: "born", what: "una de las salas de conciertos más bonitas del mundo — el modernismo en su máxima expresión", price: "20-50 €" },
  { name: "L'Auditori", type: "sala", zone: "sagrada-familia", what: "la sala grande de Barcelona para clásica y contemporánea, sonido impecable", price: "10-40 €" },
  { name: "Heliogàbal", type: "sala", zone: "gracia", what: "música en directo y poesía en un sótano de Gràcia, espíritu underground de verdad", price: "5-10 €" },
  { name: "Sidecar", type: "sala", zone: "gotic", what: "rock y músicas alternativas en Plaça Reial desde los 80", price: "10-15 €" },
  { name: "La [2] de Apolo", type: "sala", zone: "poble-sec", what: "la sala pequeña de Apolo, más íntima, sesiones electrónicas y DJ sets de nivel", price: "10-15 €" },
  { name: "Upload", type: "sala", zone: "poblenou", what: "sala de conciertos nueva en Poblenou, buen sonido y propuestas actuales", price: "10-20 €" },
  // Nuevas salas de música — zonas expandidas + más variedad
  { name: "Luz de Gas", type: "sala", zone: "eixample-esquerra", what: "sala de conciertos en un antiguo music hall modernista, desde jazz hasta pop con clase", price: "15-30 €" },
  { name: "Bikini", type: "sala", zone: "les-corts", what: "tres ambientes musicales distintos bajo el mismo techo, referente nocturno de la zona alta", price: "12-25 €" },
  { name: "Sala BARTS", type: "sala", zone: "poble-sec", what: "conciertos y shows en Paral·lel con un sonido brutal y capacidad perfecta — ni muy grande ni muy pequeño", price: "15-30 €" },
  { name: "Harlem Jazz Club", type: "sala", zone: "gotic", what: "jazz, blues y swing en un local diminuto del Gòtic donde la música te envuelve", price: "8-12 €" },
  { name: "Moog", type: "sala", zone: "raval", what: "techno y electrónica en un club compacto del Raval que lleva décadas siendo referencia", price: "10-15 €" },
  { name: "Marula Café", type: "sala", zone: "gotic", what: "funk, soul y ritmos afro en un sótano de Plaça Reial donde el cuerpo se mueve solo", price: "8-15 €" },
  { name: "Freedonia", type: "sala", zone: "raval", what: "soul, funk y r&b en directo en un bar-sala del Raval con mucha personalidad", price: "8-12 €" },
  { name: "Vol", type: "sala", zone: "sant-antoni", what: "sala de conciertos nueva en Sant Antoni, propuestas actuales y buena cerveza artesana", price: "10-18 €" },
  { name: "Jazz Sí Club", type: "sala", zone: "raval", what: "jam sessions y conciertos de jazz, flamenco y cubana a precio de ganga en el Taller de Músics", price: "5-10 €" },
  { name: "La Nau", type: "sala", zone: "barceloneta", what: "espacio cultural junto al mar con conciertos, DJ sets y noches temáticas", price: "10-20 €" },
  { name: "Garage442", type: "sala", zone: "eixample-esquerra", what: "sala independiente con bandas emergentes y ese sonido crudo de local pequeño que mola mucho", price: "8-15 €" },
  { name: "Sala Salamandra", type: "sala", zone: "sant-andreu", what: "rock, metal y músicas alternativas en una sala con historia en la zona nord", price: "10-20 €" },
  { name: "Laut", type: "sala", zone: "sant-marti", what: "sala de conciertos en el Clot con programación indie y electrónica, descubrimiento de bandas", price: "8-15 €" },
  { name: "Café Royale", type: "sala", zone: "gotic", what: "música en directo y DJ sessions en un espacio acogedor cerca de Plaça Reial", price: "8-12 €" },
];

// ─── Cinemas ─────────────────────────────────────────────────

export const CINEMAS: CulturalSpot[] = [
  { name: "Filmoteca de Catalunya", type: "centro cultural", zone: "raval", what: "cine de autor, retrospectivas y ciclos temáticos a precio ridículo — el templo cinéfilo de Barcelona", price: "4 €" },
  { name: "Cinemes Girona", type: "sala", zone: "eixample-dreta", what: "cine independiente y de autor en versión original, programación cuidadísima y buen café en el vestíbulo", price: "8-10 €" },
  { name: "Phenomena", type: "sala", zone: "sagrada-familia", what: "la experiencia de ver cine como antes — pantalla enorme, sonido perfecto y clásicos que merecen sala grande", price: "9-11 €" },
  { name: "Renoir Floridablanca", type: "sala", zone: "sant-antoni", what: "cine europeo y de autor en V.O., de esos sitios donde siempre encuentras algo que no está en las plataformas", price: "8-10 €" },
  { name: "Zumzeig Cinema", type: "sala", zone: "les-corts", what: "cine cooperativo con bar y programación militante — pelis que no pasan en otro sitio y debates después", price: "7-9 €" },
  { name: "Cinemes Texas", type: "sala", zone: "gracia", what: "sala de barrio en Gràcia con cine independiente y reestrenos, ambiente de cinéfilos de verdad", price: "7-9 €" },
  { name: "Verdi", type: "sala", zone: "gracia", what: "el cine en V.O. de toda la vida en Gràcia, multisalas con buena selección y helados artesanos en el bar", price: "8-10 €" },
  { name: "Verdi Park", type: "sala", zone: "gracia", what: "la extensión del Verdi, más salas con la misma filosofía de cine en versión original", price: "8-10 €" },
  { name: "Cine Maldà", type: "sala", zone: "gotic", what: "microcine escondido en una galería del Gòtic con pelis raras, anime y sesiones golfa — un sitio con culto", price: "6-8 €" },
  { name: "CCCB Xcèntric", type: "centro cultural", zone: "raval", what: "ciclos de cine experimental y videoarte en el CCCB, para cuando quieres ver algo que rompa moldes", price: "4-6 €" },
];

// ─── Outdoor spots ───────────────────────────────────────────

export interface OutdoorSpot {
  name: string;
  zone: Zone;
  description: string;
  bestTime: string;
}

export const OUTDOOR_SPOTS: OutdoorSpot[] = [
  { name: "Parc de la Ciutadella", zone: "vila-olimpica", description: "el parque grande de Barcelona, con lago, cascada monumental y gente tocando música bajo los árboles — ideal para tumbarse con un libro", bestTime: "mañana" },
  { name: "Platja de la Barceloneta", zone: "barceloneta", description: "la playa de toda la vida, chiringuitos, voley y ese rollo mediterráneo que nunca falla", bestTime: "mañana" },
  { name: "Jardins de Mossèn Costa i Llobera", zone: "poble-sec", description: "el jardín de cactus más espectacular de Europa, en la ladera de Montjuïc con vistas al puerto — parece otro país", bestTime: "mañana" },
  { name: "Turó Park", zone: "sarria-pedralbes", description: "jardín señorial en la zona alta con patos, esculturas y calma total", bestTime: "cualquier hora" },
  { name: "Carretera de les Aigües", zone: "sarria-pedralbes", description: "el paseo más bonito de Barcelona a media montaña, camino llano con vistas panorámicas de toda la ciudad y el mar", bestTime: "atardecer" },
  { name: "Parc del Laberint d'Horta", zone: "horta-guinardo", description: "jardín neoclásico del XVIII con un laberinto de cipreses que te atrapa — tranquilo, romántico y lejos de las masas", bestTime: "mañana" },
  { name: "Bunkers del Carmel", zone: "horta-guinardo", description: "las antiguas baterías antiaéreas con la mejor vista 360 grados de Barcelona — al atardecer es mágico", bestTime: "atardecer" },
  { name: "Platja del Bogatell", zone: "poblenou", description: "playa más tranquila que la Barceloneta, buen espacio y menos agobio, perfecta para un baño sin multitudes", bestTime: "mañana" },
  { name: "Jardins de Joan Brossa", zone: "poble-sec", description: "jardines en la ladera de Montjuïc con juegos, esculturas y vistas al mar — uno de los secretos mejor guardados", bestTime: "cualquier hora" },
  { name: "Parc del Guinardó", zone: "horta-guinardo", description: "parque frondoso con miradores escondidos y escalinatas que parecen de película, mucho menos masificado que el Güell", bestTime: "atardecer" },
  { name: "Parc de Cervantes (Rosaleda)", zone: "les-corts", description: "más de diez mil rosales de doscientas variedades — en mayo y junio es una locura de colores y olores", bestTime: "mañana" },
  { name: "Jardins de Laribal", zone: "poble-sec", description: "jardines escalonados con fuentes árabes y rincones escondidos en Montjuïc, de lo más bonito y menos conocido", bestTime: "cualquier hora" },
  { name: "Parc de la Creueta del Coll", zone: "horta-guinardo", description: "piscina natural de verano excavada en una antigua cantera con escultura de Chillida colgando — plan perfecto de día caluroso", bestTime: "mañana" },
  { name: "Platja de la Nova Icària", zone: "vila-olimpica", description: "la playa más familiar y tranquila del frente marítimo, con chiringuitos y zona de vóley", bestTime: "mañana" },
  { name: "Parc del Turó de la Peira", zone: "nou-barris", description: "colina verde en Nou Barris con vistas que nadie espera y un silencio que no parece Barcelona", bestTime: "atardecer" },
  { name: "Jardins del Palau de Pedralbes", zone: "sarria-pedralbes", description: "jardines con fuente de Gaudí, bambú gigante y pavos reales paseando entre naranjos — señorial y precioso", bestTime: "mañana" },
  { name: "Moll de la Fusta", zone: "barceloneta", description: "paseo junto al Port Vell con la brisa del mar, veleros al fondo y el skyline de la ciudad detrás", bestTime: "atardecer" },
  { name: "Parc Central de Nou Barris", zone: "nou-barris", description: "parque amplio con acueducto romano restaurado y zonas de juego, la sala de estar al aire libre del barrio", bestTime: "cualquier hora" },
  { name: "Mirador de l'Alcalde", zone: "poble-sec", description: "mirador con mosaicos de colores y vistas al puerto y la ciudad, uno de los rincones más fotogénicos de Montjuïc", bestTime: "atardecer" },
  { name: "Parc del Clot", zone: "sant-marti", description: "parque construido sobre una antigua estación de tren conservando los arcos de ladrillo — industrial y bonito a partes iguales", bestTime: "cualquier hora" },
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

/** Filter an array of items that have a `zone` field by zone, with fallback to neighbors */
function filterByZone<T extends { zone: Zone }>(items: T[], zone: Zone | null): T[] {
  if (!zone) return items;
  // Direct matches
  const direct = items.filter((i) => i.zone === zone);
  if (direct.length >= 2) return direct;
  // Include neighboring zones if not enough
  const neighbors = getNeighborZones(zone);
  const expanded = items.filter((i) => i.zone === zone || neighbors.includes(i.zone));
  if (expanded.length >= 2) return expanded;
  // Fallback: return all
  return items;
}

function getNeighborZones(zone: Zone): Zone[] {
  const map: Record<Zone, Zone[]> = {
    "gotic": ["born", "raval", "barceloneta", "eixample-dreta"],
    "born": ["gotic", "raval", "barceloneta", "vila-olimpica", "eixample-dreta"],
    "raval": ["gotic", "born", "sant-antoni", "poble-sec"],
    "eixample-dreta": ["eixample-esquerra", "gracia", "born", "gotic", "sagrada-familia"],
    "eixample-esquerra": ["eixample-dreta", "sant-antoni", "gracia", "poble-sec"],
    "sagrada-familia": ["eixample-dreta", "gracia", "sant-marti", "poblenou"],
    "gracia": ["eixample-dreta", "eixample-esquerra", "sarria-pedralbes", "horta-guinardo"],
    "poblenou": ["barceloneta", "born", "sant-marti", "vila-olimpica"],
    "vila-olimpica": ["born", "barceloneta", "poblenou", "sant-marti"],
    "barceloneta": ["born", "gotic", "vila-olimpica", "poblenou"],
    "poble-sec": ["raval", "sant-antoni", "eixample-esquerra", "les-corts"],
    "sarria-pedralbes": ["gracia", "eixample-dreta", "les-corts"],
    "sant-antoni": ["raval", "eixample-esquerra", "poble-sec"],
    "horta-guinardo": ["gracia", "nou-barris", "sant-andreu", "sant-marti"],
    "nou-barris": ["horta-guinardo", "sant-andreu"],
    "sant-andreu": ["nou-barris", "horta-guinardo", "sant-marti"],
    "sant-marti": ["poblenou", "vila-olimpica", "sant-andreu", "horta-guinardo", "sagrada-familia"],
    "les-corts": ["sarria-pedralbes", "eixample-esquerra", "poble-sec"],
    "any": [],
  };
  return map[zone] || [];
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
    const zoneEvents = events.filter((e) => eventToZone(e.neighborhood) === zone);
    const neighbors = getNeighborZones(zone);
    const nearbyEvents = events.filter((e) => {
      const ez = eventToZone(e.neighborhood);
      return ez && neighbors.includes(ez);
    });
    if (zoneEvents.length >= 1) events = [...zoneEvents, ...nearbyEvents.slice(0, 2)];
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
  const free = spot.price === "gratuita";
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
  const timeHint = spot.bestTime === "cualquier hora" ? "a qualsevol hora del dia" : `millor per la ${spot.bestTime}`;
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
