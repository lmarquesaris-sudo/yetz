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
  | "born-gotic"
  | "raval"
  | "eixample"
  | "gracia"
  | "poblenou"
  | "barceloneta"
  | "montjuic-poblesec"
  | "sarria-pedralbes"
  | "sant-antoni"
  | "horta-guinardo"
  | "nou-barris"
  | "sant-andreu"
  | "sant-marti"
  | "les-corts"
  | "clot"
  | "any";

const ZONE_KEYWORDS: Record<Zone, string[]> = {
  // Ciutat Vella
  "born-gotic": [
    "born", "gótic", "gotic", "gòtic", "catedral", "santa maria del mar",
    "barri gòtic", "plaça reial", "via laietana", "ribera", "sant pere",
    "santa caterina", "casc antic", "ciutat vella", "portal de l'àngel",
    "portal del angel", "jaume", "arc de triomf", "palau de la música",
    "mercat santa caterina", "carrer montcada", "passeig del born",
  ],
  "raval": [
    "raval", "macba", "cccb", "rambla del raval", "tallers", "joaquín costa",
    "joaquin costa", "rambla", "la rambla", "las ramblas", "liceu",
    "boqueria", "sant pau del camp", "carme", "hospital", "sant agustí",
    "filmoteca", "arts santa mònica", "plaça dels àngels",
  ],
  // Eixample
  "eixample": [
    "eixample", "passeig de gràcia", "paseo de gracia", "rambla catalunya",
    "enric granados", "sagrada familia", "dreta", "esquerra", "sant pau",
    "hospital de sant pau", "casa batlló", "la pedrera", "casa milà",
    "casa mila", "casa amatller", "fundació tàpies", "tapies",
    "diagonal", "roger de llúria", "pau claris", "girona", "tetuan",
    "universitat", "urgell", "rocafort", "entença", "calabria",
    "nova esquerra", "antiga esquerra", "fort pienc",
  ],
  // Gràcia
  "gracia": [
    "gràcia", "gracia", "plaça del sol", "verdi", "vila de gràcia",
    "fontana", "travessera", "casa vicens", "penitents", "vallcarca",
    "coll", "la salut", "camp d'en grassot", "camp grassot",
    "plaça de la virreina", "plaça diamant", "plaça revolució",
    "mercat abaceria", "joanic", "lesseps",
  ],
  // Sant Martí
  "poblenou": [
    "poblenou", "poble nou", "22@", "rambla del poblenou", "palo alto",
    "diagonal mar", "glòries", "glories", "selva de mar", "bogatell",
    "llacuna", "pere iv", "museu del disseny", "can framis", "dhub",
    "torre glòries", "torre agbar", "provençals", "front marítim",
    "campus audiovisual", "marina", "zoo",
  ],
  "clot": [
    "clot", "camp de l'arpa", "camp arpa", "navas", "sagrera",
    "sant martí de provençals", "verneda", "la pau", "besòs",
    "besos", "maresme", "forum", "fòrum",
  ],
  // Barceloneta / Port
  "barceloneta": [
    "barceloneta", "playa", "platja", "port", "puerto", "mar",
    "passeig marítim", "maremàgnum", "maremagnum", "olimpic", "olímpic",
    "port olímpic", "port vell", "w hotel", "hotel vela",
    "moll", "world trade center", "rambla de mar", "museu marítim",
    "drassanes", "nova icària", "nova icaria",
  ],
  // Sants-Montjuïc
  "montjuic-poblesec": [
    "montjuïc", "montjuic", "poble-sec", "poble sec", "poblesec",
    "paral·lel", "paralel", "parallel", "mnac", "miró", "miro",
    "grec", "fundació miró", "caixaforum", "font màgica", "font magica",
    "mercat de les flors", "teatre lliure", "anella olímpica",
    "estadi olímpic", "jardí botànic", "sants", "estació sants",
    "plaça espanya", "plaça españa", "fira", "hostafrancs",
    "la bordeta", "badal", "marina",
  ],
  // Sarrià-Sant Gervasi + Les Corts
  "sarria-pedralbes": [
    "sarrià", "sarria", "pedralbes", "tibidabo", "bonanova",
    "sant gervasi", "tres torres", "zona alta", "cosmocaixa",
    "monestir de pedralbes", "jardins pedralbes", "putxet", "putget",
    "el putget", "farró", "galvany", "turó park", "la bonanova",
    "vallvidrera", "collserola", "carretera de les aigües", "aigues",
  ],
  "les-corts": [
    "les corts", "camp nou", "spotify camp nou", "barça", "barca",
    "maternitat", "jardins de la maternitat", "travessera de les corts",
    "collblanc", "la torrassa",
  ],
  // Sant Antoni
  "sant-antoni": [
    "sant antoni", "san antonio", "mercat sant antoni", "manso",
    "parlament", "ronda sant pau", "ronda sant antoni", "calàbria",
    "comte borrell", "viladomat",
  ],
  // Horta-Guinardó
  "horta-guinardo": [
    "horta", "guinardó", "guinardo", "carmel", "park güell", "park guell",
    "parc güell", "parc guell", "laberint", "laberint d'horta",
    "laberinto de horta", "vall d'hebron", "teixonera", "montbau",
    "sant genís", "sant genis", "font del gat", "bunkers", "bunkers del carmel",
    "turó de la rovira",
  ],
  // Nou Barris
  "nou-barris": [
    "nou barris", "torre baró", "torre baro", "ciutat meridiana",
    "trinitat", "roquetes", "verdun", "canyelles", "guineueta",
    "prosperitat", "vilapicina", "turó de la peira",
  ],
  // Sant Andreu
  "sant-andreu": [
    "sant andreu", "bon pastor", "baró de viver", "trinitat vella",
    "sant andreu de palomar", "fabra i coats", "la sagrera", "congrés",
    "navas", "maldà",
  ],
  // Sant Martí (resto)
  "sant-marti": [
    "sant martí", "sant marti", "el parc", "vila olímpica",
    "vila olimpica", "ciutadella", "estació de frança",
  ],
  "any": [],
};

const ZONE_NAMES: Record<Zone, string> = {
  "born-gotic": "el Born y el Gòtic",
  "raval": "el Raval",
  "eixample": "el Eixample",
  "gracia": "Gràcia",
  "poblenou": "Poblenou",
  "clot": "el Clot y alrededores",
  "barceloneta": "la Barceloneta y el Port",
  "montjuic-poblesec": "Montjuïc y Poble-sec",
  "sarria-pedralbes": "Sarrià y la zona alta",
  "les-corts": "Les Corts",
  "sant-antoni": "Sant Antoni",
  "horta-guinardo": "Horta-Guinardó",
  "nou-barris": "Nou Barris",
  "sant-andreu": "Sant Andreu",
  "sant-marti": "Sant Martí",
  "any": "Barcelona",
};

// ─── Restaurants ──────────────────────────────────────────────

export const RESTAURANTS_BUDGET: Restaurant[] = [
  // Born / Gòtic
  { name: "Tres Mentiras", type: "Mexicana", priceRange: "€", zone: "born-gotic", vibe: "tacos de autor en un local pequeño con mucho rollo" },
  { name: "Bodega la Palma", type: "Ibérica", priceRange: "€", zone: "born-gotic", vibe: "bodega clásica con jamón, quesos y vinos de barril" },
  { name: "Fragments", type: "Mediterránea", priceRange: "€", zone: "born-gotic", vibe: "cocina de mercado en una placita escondida, platos para compartir" },
  { name: "El Xampanyet", type: "Catalana", priceRange: "€", zone: "born-gotic", vibe: "cava y tapas de toda la vida en un bar con azulejos que lleva ahí más de cien años" },
  // Raval
  { name: "Bar Cañete", type: "Mediterránea", priceRange: "€", zone: "raval", vibe: "barra de mercado con tapas espectaculares, de lo mejor del Raval" },
  { name: "Dos Palillos", type: "Asiática fusión", priceRange: "€", zone: "raval", vibe: "tapas asiáticas en barra, cocina abierta y mucha personalidad" },
  { name: "Caravelle", type: "Brunch / casual", priceRange: "€", zone: "raval", vibe: "brunch con producto, bowls y buen café en un local bonito" },
  // Eixample
  { name: "Kasa Ramen", type: "Japonesa", priceRange: "€", zone: "eixample", vibe: "ramen reconfortante y bien hecho a buen precio" },
  { name: "Moritz", type: "Variada", priceRange: "€", zone: "eixample", vibe: "la fábrica de cerveza reconvertida en un espacio brutal" },
  { name: "Flax & Kale", type: "Healthy", priceRange: "€", zone: "eixample", vibe: "cocina saludable y flexiteriana con terraza en Tallers" },
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
  // Montjuïc / Poble-sec
  { name: "Can Vilaró", type: "Catalana", priceRange: "€", zone: "montjuic-poblesec", vibe: "cocina catalana casera y honesta, menú del día por menos de quince euros" },
  { name: "Quimet & Quimet", type: "Tapas", priceRange: "€", zone: "montjuic-poblesec", vibe: "montaditos increíbles en un local minúsculo lleno de botellas — mítico de Poble-sec" },
  { name: "Bodega Saltó", type: "Tapas", priceRange: "€", zone: "montjuic-poblesec", vibe: "bodega castiza con vermouth de grifo, tapas y decoración imposible" },
  // Sant Antoni
  { name: "Gèlida", type: "Mediterránea", priceRange: "€", zone: "sant-antoni", vibe: "vinos naturales y platos para compartir en un ambiente relajado" },
  { name: "Federal Café", type: "Brunch", priceRange: "€", zone: "sant-antoni", vibe: "brunch australiano con terraza interior, buen café y huevos perfectos" },
  // Sarrià / Zona Alta
  { name: "Flash Flash", type: "Tortillas", priceRange: "€", zone: "sarria-pedralbes", vibe: "mítico de Barcelona — tortillas espectaculares y decoración pop de los 70" },
  { name: "Vivanda", type: "Catalana", priceRange: "€", zone: "sarria-pedralbes", vibe: "cocina catalana de mercado en un jardín precioso de Sarrià" },
  { name: "Bar Tomás", type: "Tapas", priceRange: "€", zone: "sarria-pedralbes", vibe: "las patatas bravas más famosas de Barcelona, punto" },
];

export const RESTAURANTS_PREMIUM: Restaurant[] = [
  // Born / Gòtic
  { name: "Coure", type: "Catalana", priceRange: "€€", zone: "born-gotic", vibe: "alta cocina catalana accesible, menú degustación muy bueno" },
  { name: "Shunka", type: "Japonesa", priceRange: "€€", zone: "born-gotic", vibe: "el japonés de referencia de Barcelona, barra de sushi increíble" },
  { name: "Cal Pep", type: "Marinera", priceRange: "€€", zone: "born-gotic", vibe: "barra mítica con el mejor producto de mercado, comer aquí es una experiencia" },
  // Raval
  { name: "Ca l'Isidre", type: "Catalana", priceRange: "€€", zone: "raval", vibe: "cocina catalana clásica de toda la vida, uno de los grandes de la ciudad" },
  // Eixample
  { name: "Nairod", type: "Catalana", priceRange: "€€", zone: "eixample", vibe: "cocina catalana contemporánea con producto de temporada" },
  { name: "Gresca", type: "Catalana", priceRange: "€€", zone: "eixample", vibe: "cocina creativa de autor, una de las mejores relaciones calidad-precio de la ciudad" },
  { name: "Nomo", type: "Japonesa", priceRange: "€€", zone: "eixample", vibe: "japonesa premium con omakase y productos de primera" },
  { name: "Leku", type: "Vasca", priceRange: "€€", zone: "eixample", vibe: "pintxos y cocina vasca de nivel con una barra espectacular" },
  // Gràcia
  { name: "Deliri", type: "Catalana", priceRange: "€€", zone: "gracia", vibe: "cocina catalana moderna en un espacio íntimo" },
  { name: "Botafumeiro", type: "Gallega", priceRange: "€€", zone: "gracia", vibe: "marisco gallego de primer nivel, de los mejores de Barcelona" },
  // Poblenou
  { name: "Disfrutar", type: "Creativa", priceRange: "€€", zone: "poblenou", vibe: "tres estrellas Michelin, cocina creativa de los ex-chefs de El Bulli — experiencia única" },
  { name: "La Barca del Salamanca", type: "Marinera", priceRange: "€€", zone: "poblenou", vibe: "arroces con vistas al puerto olímpico, cocina marinera de nivel" },
  // Barceloneta
  { name: "Can Paixano (La Xampanyeria)", type: "Catalana", priceRange: "€€", zone: "barceloneta", vibe: "cava y bocadillos a precio de risa en el bar más divertido del barrio" },
  // Montjuïc / Poble-sec
  { name: "Tickets", type: "Creativa", priceRange: "€€", zone: "montjuic-poblesec", vibe: "tapas creativas de los Adrià, cada plato es un espectáculo" },
  // Sant Antoni
  { name: "Maleducat", type: "Catalana", priceRange: "€€", zone: "sant-antoni", vibe: "arroces espectaculares y cocina de mercado con personalidad" },
  // Sarrià / Zona Alta
  { name: "Asador de Aranda", type: "Castellana", priceRange: "€€", zone: "sarria-pedralbes", vibe: "cordero y cochinillo en un edificio modernista espectacular" },
  { name: "Hofmann", type: "Creativa", priceRange: "€€", zone: "sarria-pedralbes", vibe: "escuela de cocina y restaurante, creatividad con base clásica impecable" },
];

// ─── Bars ─────────────────────────────────────────────────────

export const BARS: Bar[] = [
  // Born / Gòtic
  { name: "Paradiso", type: "Speakeasy", zone: "born-gotic", vibe: "se esconde detrás de una nevera de un bar de pastrami — top 50 mundial" },
  { name: "La Vinya del Senyor", type: "Wine bar", zone: "born-gotic", vibe: "terraza frente a Santa Maria del Mar con una carta de vinos brutal" },
  { name: "Bodega Maestrazgo", type: "Bodega", zone: "born-gotic", vibe: "vermut de grifo y conservas, bodega con cincuenta años de historia" },
  { name: "Collage Cocktail Bar", type: "Cocktail bar", zone: "born-gotic", vibe: "cocktails de autor en un local íntimo con ladrillo visto" },
  // Raval
  { name: "33|45", type: "Bar musical", zone: "raval", vibe: "vinilos, cocktails y buena música en un bar con alma" },
  { name: "Betty Ford's", type: "Cocktail bar", zone: "raval", vibe: "bar americano kitsch con cocktails potentes y buen rollo" },
  { name: "Casa Almirall", type: "Bar histórico", zone: "raval", vibe: "el bar más antiguo del Raval, con el absenta de siempre y un interior modernista precioso" },
  { name: "Negroni", type: "Cocktail bar", zone: "raval", vibe: "cocktails clásicos bien hechos en un local oscuro y acogedor de Joaquín Costa" },
  // Eixample
  { name: "Dry Martini", type: "Cocktail bar clásico", zone: "eixample", vibe: "el bar de cocktails clásico por excelencia, barra de madera y camareros de chaqueta" },
  { name: "Bar Mut", type: "Wine bar", zone: "eixample", vibe: "vermut, anchoas y ese punto de bar clásico barcelonés que siempre funciona" },
  { name: "Bobby's Free", type: "Speakeasy", zone: "eixample", vibe: "speakeasy dentro de una barbería — encuentras la puerta y es otro mundo" },
  { name: "El Maravillas", type: "Rooftop", zone: "eixample", vibe: "Aperol Spritz en la azotea del Hotel Almanac con vistas a la ciudad" },
  { name: "Bridge 48", type: "Cocktail bar", zone: "eixample", vibe: "cocktails de autor en un espacio industrial muy cuidado" },
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
  // Montjuïc / Poble-sec
  { name: "Bar Calders", type: "Terraza", zone: "montjuic-poblesec", vibe: "la terraza más buscada de Poble-sec, vermut y platos para picar" },
  { name: "La Caseta del Migdia", type: "Chiringuito", zone: "montjuic-poblesec", vibe: "chiringuito escondido en Montjuïc entre pinos — cuesta encontrarlo pero merece la pena" },
  { name: "Absenta Bar", type: "Bar histórico", zone: "montjuic-poblesec", vibe: "absenta y cocktails en un local lleno de muñecos y arte urbano" },
  // Sant Antoni
  { name: "Bar Brutal", type: "Wine bar", zone: "sant-antoni", vibe: "vinos naturales y tapas en Can Cisa, el colmado reconvertido más bonito del barrio" },
  { name: "La Confitería", type: "Bar histórico", zone: "sant-antoni", vibe: "antigua confitería del XIX reconvertida en bar de cocktails, el techo es una obra de arte" },
  // Sarrià / Zona Alta
  { name: "Mirablau", type: "Bar con vistas", zone: "sarria-pedralbes", vibe: "cocktails con las vistas más espectaculares de Barcelona, al pie del Tibidabo" },
  { name: "Terraza del Hotel Ohla", type: "Rooftop", zone: "sarria-pedralbes", vibe: "piscina y cocktails con vistas panorámicas de la ciudad" },
  { name: "Marcel", type: "Wine bar", zone: "sarria-pedralbes", vibe: "vinoteca tranquila en Sarrià con buena selección y tapas de autor" },
];

// ─── Walks ────────────────────────────────────────────────────

export const WALKS: Walk[] = [
  { name: "el Born", zone: "born-gotic", description: "callejuelas llenas de galerías, tiendas bonitas y terrazas hasta Santa Maria del Mar", duration: "45 min" },
  { name: "el Gòtic", zone: "born-gotic", description: "desde la Catedral por la Plaça del Rei, el Call Jueu y placitas que llevan siglos ahí", duration: "40 min" },
  { name: "el Raval", zone: "raval", description: "del MACBA por Carrer dels Tallers, ambiente multicultural y sitios inesperados", duration: "35 min" },
  { name: "Gràcia", zone: "gracia", description: "placitas con terrazas, tiendas vintage y ese rollo de pueblo dentro de la ciudad", duration: "40 min" },
  { name: "la Rambla del Poblenou", zone: "poblenou", description: "la rambla de barrio más auténtica de Barcelona, terrazas, plátanos y vecinos de toda la vida", duration: "30 min" },
  { name: "Poblenou industrial", zone: "poblenou", description: "naves reconvertidas, street art, Palo Alto y el Poblenou que mira al futuro sin olvidar las fábricas", duration: "50 min" },
  { name: "la Barceloneta", zone: "barceloneta", description: "por el Port Vell, cruzar las callejuelas de pescadores y acabar en la playa", duration: "50 min" },
  { name: "el passeig marítim", zone: "barceloneta", description: "desde la Barceloneta hasta el Port Olímpic con el Mediterráneo a la izquierda", duration: "40 min" },
  { name: "Montjuïc", zone: "montjuic-poblesec", description: "subir hasta el MNAC con vistas de toda Barcelona, jardines y ese silencio de montaña en medio de la ciudad", duration: "1h" },
  { name: "Poble-sec y Paral·lel", zone: "montjuic-poblesec", description: "del Paral·lel subiendo por las calles empinadas del barrio, huertos urbanos y terrazas escondidas", duration: "35 min" },
  { name: "el Eixample", zone: "eixample", description: "Passeig de Gràcia, fachadas modernistas, Enric Granados y el ritmo pausado de las manzanas del Cerdà", duration: "1h" },
  { name: "Sarrià pueblo", zone: "sarria-pedralbes", description: "calles de pueblo dentro de la ciudad, el Mercat de Sarrià y el Monestir de Pedralbes", duration: "45 min" },
  { name: "Sant Antoni y alrededores", zone: "sant-antoni", description: "desde el Mercat de Sant Antoni por Parlament y Manso, buen ambiente y tiendas de diseño", duration: "30 min" },
];

// ─── Cultural spots ───────────────────────────────────────────

export const CULTURAL_SPOTS: CulturalSpot[] = [
  // Born / Gòtic
  { name: "Museu Picasso", type: "museo", zone: "born-gotic", what: "cinco palacios medievales con la etapa más joven de Picasso", price: "12 €" },
  { name: "MEAM", type: "museo", zone: "born-gotic", what: "arte figurativo contemporáneo en un palacio del Born — sorprende mucho", price: "11 €" },
  { name: "Moco Museum", type: "museo", zone: "born-gotic", what: "Banksy, KAWS, Haring — arte moderno y contemporáneo muy visual", price: "16 €" },
  { name: "Museu d'Història de Barcelona (MUHBA)", type: "museo", zone: "born-gotic", what: "la Barcelona romana bajo tus pies, una pasada caminar por calles del siglo I", price: "7 €" },
  { name: "Basílica de Santa Maria del Mar", type: "espacio", zone: "born-gotic", what: "gótico catalán en estado puro, la luz que entra es mágica", price: "gratuita" },
  // Raval
  { name: "MACBA", type: "museo", zone: "raval", what: "arte contemporáneo con la plaza llena de skaters y buen ambiente", price: "11 €" },
  { name: "CCCB", type: "centro cultural", zone: "raval", what: "exposiciones que te hacen pensar y un patio de cristal precioso", price: "6 €" },
  { name: "Filmoteca de Catalunya", type: "centro cultural", zone: "raval", what: "cine de autor, ciclos y retrospectivas a precio de risa en la Plaça de Salvador Seguí", price: "4 €" },
  { name: "Arts Santa Mònica", type: "centro cultural", zone: "raval", what: "arte y cultura contemporánea con entrada gratis al final de la Rambla", price: "gratuita" },
  // Eixample
  { name: "Fundació Antoni Tàpies", type: "museo", zone: "eixample", what: "la obra de Tàpies en un edificio modernista de Domènech i Montaner", price: "8 €" },
  { name: "Casa Batlló", type: "museo", zone: "eixample", what: "Gaudí en estado puro, la fachada del dragón y un interior que parece el fondo del mar", price: "35 €" },
  { name: "La Pedrera", type: "museo", zone: "eixample", what: "la azotea de guerreros de Gaudí y la exposición del piso modernista", price: "25 €" },
  { name: "Fundació Suñol", type: "galería", zone: "eixample", what: "arte contemporáneo de la colección Suñol, gratis y siempre con alguna joya", price: "gratuita" },
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
  // Montjuïc / Poble-sec
  { name: "Fundació Joan Miró", type: "museo", zone: "montjuic-poblesec", what: "el universo de Miró en un edificio de Sert con una luz increíble", price: "16 €" },
  { name: "MNAC", type: "museo", zone: "montjuic-poblesec", what: "la mejor colección de arte románico del mundo, y las vistas desde la explanada", price: "12 € (gratis domingos tarde)" },
  { name: "CaixaForum", type: "centro cultural", zone: "montjuic-poblesec", what: "grandes exposiciones internacionales en la antigua fábrica Casaramona", price: "6 €" },
  { name: "Jardí Botànic de Barcelona", type: "espacio", zone: "montjuic-poblesec", what: "plantas mediterráneas con vistas al mar, un paseo de naturaleza en medio de la ciudad", price: "5 €" },
  // Sarrià / Zona Alta
  { name: "CosmoCaixa", type: "museo", zone: "sarria-pedralbes", what: "el mejor museo de ciencia de España, con un bosque tropical dentro", price: "6 €" },
  { name: "Monestir de Pedralbes", type: "museo", zone: "sarria-pedralbes", what: "claustro gótico con tres pisos y unos frescos medievales que quitan el hipo", price: "5 €" },
  { name: "Jardins de Pedralbes", type: "espacio", zone: "sarria-pedralbes", what: "jardines señoriales y festival de música en verano", price: "gratuita" },
  // Sant Antoni
  { name: "Mercat de Sant Antoni", type: "espacio", zone: "sant-antoni", what: "el mercado más bonito de Barcelona tras su reforma, domingos hay mercadillo de libros", price: "gratuita" },
];

export const THEATERS: CulturalSpot[] = [
  { name: "Teatre Nacional de Catalunya", type: "teatro", zone: "poblenou", what: "el edificio de Bofill, todo cristal y columnas, con programación de primer nivel", price: "15-30 €" },
  { name: "Teatre Lliure (Montjuïc)", type: "teatro", zone: "montjuic-poblesec", what: "teatro independiente con propuestas arriesgadas que casi siempre aciertan", price: "12-28 €" },
  { name: "Teatre Lliure (Gràcia)", type: "teatro", zone: "gracia", what: "la sala de Gràcia del Lliure, más íntima y con obras de formato pequeño", price: "10-22 €" },
  { name: "Sala Beckett", type: "sala", zone: "poblenou", what: "dramaturgia contemporánea en un espacio íntimo — las obras pegan fuerte", price: "10-18 €" },
  { name: "Teatre Romea", type: "teatro", zone: "raval", what: "uno de los teatros más antiguos de Barcelona, siempre con buenas obras", price: "15-28 €" },
  { name: "Mercat de les Flors", type: "teatro", zone: "montjuic-poblesec", what: "danza contemporánea y artes del movimiento, cosas que no ves en otro sitio", price: "10-22 €" },
  { name: "Teatre Condal", type: "teatro", zone: "eixample", what: "musicales y comedia en Paral·lel, buen plan para pasar un rato divertido", price: "15-35 €" },
  { name: "Antic Teatre", type: "sala", zone: "born-gotic", what: "teatro alternativo con un bar-terraza con jardín que es un oasis escondido", price: "8-15 €" },
  { name: "Teatre Poliorama", type: "teatro", zone: "raval", what: "en plena Rambla, programación variada y siempre con algo interesante", price: "12-30 €" },
];

export const MUSIC_VENUES: CulturalSpot[] = [
  { name: "Jamboree Jazz Club", type: "sala", zone: "born-gotic", what: "jazz en directo cada noche en un sótano de Plaça Reial con mucha historia", price: "15 €" },
  { name: "Sala Apolo", type: "sala", zone: "montjuic-poblesec", what: "música en directo con una energía especial, desde indie hasta electrónica", price: "15-25 €" },
  { name: "Razzmatazz", type: "sala", zone: "poblenou", what: "cinco salas con estilos distintos, siempre encuentras algo que te va", price: "15-20 €" },
  { name: "Palau de la Música", type: "sala", zone: "born-gotic", what: "una de las salas de conciertos más bonitas del mundo — el modernismo en su máxima expresión", price: "20-50 €" },
  { name: "L'Auditori", type: "sala", zone: "poblenou", what: "la sala grande de Barcelona para clásica y contemporánea, sonido impecable", price: "10-40 €" },
  { name: "Heliogàbal", type: "sala", zone: "gracia", what: "música en directo y poesía en un sótano de Gràcia, espíritu underground de verdad", price: "5-10 €" },
  { name: "Sidecar", type: "sala", zone: "born-gotic", what: "rock y músicas alternativas en Plaça Reial desde los 80", price: "10-15 €" },
  { name: "La [2] de Apolo", type: "sala", zone: "montjuic-poblesec", what: "la sala pequeña de Apolo, más íntima, sesiones electrónicas y DJ sets de nivel", price: "10-15 €" },
  { name: "Upload", type: "sala", zone: "poblenou", what: "sala de conciertos nueva en Poblenou, buen sonido y propuestas actuales", price: "10-20 €" },
];

// ─── Plan generation ───────────────────────────────────────────

export interface Plan {
  title: string;
  subtitle: string;
  paragraphs: string[];
}

type Mood = "relax" | "romantic" | "budget" | "music" | "teatro" | "random";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Zone detection ───────────────────────────────────────────

function detectZone(input: string): Zone | null {
  const lower = input.toLowerCase();
  // Check each zone's keywords — return on first match
  for (const [zone, keywords] of Object.entries(ZONE_KEYWORDS)) {
    if (zone === "any") continue;
    for (const kw of keywords) {
      if (lower.includes(kw)) return zone as Zone;
    }
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
    "born-gotic": ["raval", "barceloneta", "eixample", "sant-marti"],
    "raval": ["born-gotic", "sant-antoni", "montjuic-poblesec"],
    "eixample": ["gracia", "sant-antoni", "born-gotic", "les-corts"],
    "gracia": ["eixample", "sarria-pedralbes", "horta-guinardo"],
    "poblenou": ["barceloneta", "born-gotic", "clot", "sant-marti"],
    "barceloneta": ["born-gotic", "poblenou", "sant-marti"],
    "montjuic-poblesec": ["raval", "sant-antoni", "eixample", "les-corts"],
    "sarria-pedralbes": ["gracia", "eixample", "les-corts"],
    "sant-antoni": ["raval", "eixample", "montjuic-poblesec"],
    "horta-guinardo": ["gracia", "nou-barris", "sant-andreu", "clot"],
    "nou-barris": ["horta-guinardo", "sant-andreu"],
    "sant-andreu": ["nou-barris", "horta-guinardo", "clot", "sant-marti"],
    "sant-marti": ["poblenou", "clot", "born-gotic", "barceloneta"],
    "les-corts": ["sarria-pedralbes", "eixample", "montjuic-poblesec"],
    "clot": ["poblenou", "sant-marti", "sant-andreu", "horta-guinardo"],
    "any": [],
  };
  return map[zone] || [];
}

// ─── Real events integration ──────────────────────────────────

/** Map event neighborhood strings to our Zone system */
function eventToZone(neighborhood: string): Zone | null {
  const n = neighborhood.toLowerCase();
  if (n.includes("born") || n.includes("gòtic") || n.includes("gotic") || n.includes("ciutat vella") || n.includes("sant pere")) return "born-gotic";
  if (n.includes("raval")) return "raval";
  if (n.includes("eixample") || n.includes("l'eixample")) return "eixample";
  if (n.includes("gràcia") || n.includes("gracia")) return "gracia";
  if (n.includes("poblenou")) return "poblenou";
  if (n.includes("clot") || n.includes("camp de l'arpa") || n.includes("navas") || n.includes("sagrera") || n.includes("besòs") || n.includes("besos") || n.includes("fòrum") || n.includes("forum")) return "clot";
  if (n.includes("barceloneta") || n.includes("port")) return "barceloneta";
  if (n.includes("montjuïc") || n.includes("montjuic") || n.includes("poble-sec") || n.includes("poble sec") || n.includes("sants") || n.includes("hostafrancs")) return "montjuic-poblesec";
  if (n.includes("sarrià") || n.includes("sarria") || n.includes("pedralbes") || n.includes("sant gervasi")) return "sarria-pedralbes";
  if (n.includes("les corts") || n.includes("camp nou") || n.includes("collblanc")) return "les-corts";
  if (n.includes("sant antoni")) return "sant-antoni";
  if (n.includes("horta") || n.includes("guinardó") || n.includes("guinardo") || n.includes("carmel") || n.includes("vall d'hebron")) return "horta-guinardo";
  if (n.includes("nou barris") || n.includes("roquetes") || n.includes("prosperitat") || n.includes("torre baró")) return "nou-barris";
  if (n.includes("sant andreu") || n.includes("bon pastor") || n.includes("fabra i coats")) return "sant-andreu";
  if (n.includes("sant martí") || n.includes("vila olímpica") || n.includes("vila olimpica") || n.includes("ciutadella")) return "sant-marti";
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
  const price = event.price ? `${event.price} €` : "gratuita";
  const templates = [
    `Ahora mismo en el **${event.venue}** tienen *${event.title}*. ${event.description} La entrada son ${price}.`,
    `Pásate por el **${event.venue}** a ver *${event.title}* — ${event.description.toLowerCase()} Entrada: ${price}.`,
    `En el **${event.venue}** está *${event.title}*. ${event.description} ${price === "gratuita" ? "Gratis, además." : `${price} la entrada.`}`,
  ];
  return pick(templates);
}

function pEventTeatro(event: Event): string {
  const price = event.price ? `${event.price} €` : "precio variable";
  const templates = [
    `En el **${event.venue}** están con *${event.title}*. ${event.description} Entradas desde ${price}. Se apagan las luces y durante un par de horas te olvidas de todo.`,
    `Lo fuerte del plan: *${event.title}* en el **${event.venue}**. ${event.description} Desde ${price}.`,
    `Para el teatro, *${event.title}* en el **${event.venue}** — ${event.description.toLowerCase()} Entradas desde ${price}.`,
  ];
  return pick(templates);
}

function pEventMusica(event: Event): string {
  const price = event.price ? `${event.price} €` : "precio variable";
  const templates = [
    `Por la noche, *${event.title}* en el **${event.venue}**. ${event.description} Entrada unos ${price}.`,
    `El plato fuerte: *${event.title}* en el **${event.venue}**. ${event.description} Sobre ${price}.`,
    `Para la música, *${event.title}* — ${event.description.toLowerCase()} En el **${event.venue}**, unos ${price}.`,
  ];
  return pick(templates);
}

// ─── Paragraph templates ───────────────────────────────────────

function pWalkIntro(walk: Walk): string {
  const openers = [
    `Empiezas dando un paseo por **${walk.name}**. ${walk.description.charAt(0).toUpperCase() + walk.description.slice(1)} — unos ${walk.duration} a tu ritmo, sin mapa ni destino fijo.`,
    `Lo primero, caminar. Un paseo por **${walk.name}**: ${walk.description}. Unos ${walk.duration} dejándote llevar.`,
    `Antes de nada, un rato caminando por **${walk.name}**. ${walk.description.charAt(0).toUpperCase() + walk.description.slice(1)}. No hay prisa.`,
  ];
  return pick(openers);
}

function pCulture(spot: CulturalSpot): string {
  const templates = [
    `Te acercas al **${spot.name}**. ${spot.what.charAt(0).toUpperCase() + spot.what.slice(1)}. La entrada son ${spot.price} y merece la pena.`,
    `Parada en el **${spot.name}**. ${spot.what.charAt(0).toUpperCase() + spot.what.slice(1)}. ${spot.price === "gratuita" ? "Entrada gratuita." : `${spot.price} la entrada.`}`,
    `El **${spot.name}** es buena opción — ${spot.what}. ${spot.price === "gratuita" ? "Gratis, además." : `La entrada son ${spot.price}.`}`,
  ];
  return pick(templates);
}

function pRestaurantBudget(r: Restaurant): string {
  const templates = [
    `Para comer, **${r.name}**. ${r.vibe.charAt(0).toUpperCase() + r.vibe.slice(1)}. Comes bien sin pasarte de treinta euros.`,
    `A comer te recomiendo **${r.name}** — ${r.vibe}. No te gastas mucho y sales contento.`,
    `La comida en **${r.name}**. ${r.vibe.charAt(0).toUpperCase() + r.vibe.slice(1)}. Buen precio y buen nivel.`,
  ];
  return pick(templates);
}

function pRestaurantPremium(r: Restaurant): string {
  const templates = [
    `Para cenar, **${r.name}**. ${r.vibe.charAt(0).toUpperCase() + r.vibe.slice(1)}. Sobre cincuenta-sesenta euros, pero merece mucho la pena.`,
    `La cena en **${r.name}**. ${r.vibe.charAt(0).toUpperCase() + r.vibe.slice(1)}. Es de esos sitios donde comes y piensas "qué bien he hecho viniendo aquí".`,
    `Para la cena, apuesta por **${r.name}** — ${r.vibe}. Sobre cincuenta euros. De lo mejor que puedes cenar en la zona.`,
  ];
  return pick(templates);
}

function pBar(bar: Bar): string {
  const templates = [
    `Después, **${bar.name}**. ${bar.vibe.charAt(0).toUpperCase() + bar.vibe.slice(1)}. Buen sitio para acabar la noche.`,
    `Para tomar algo, **${bar.name}** — ${bar.vibe}.`,
    `Y para cerrar, unas copas en **${bar.name}**. ${bar.vibe.charAt(0).toUpperCase() + bar.vibe.slice(1)}.`,
  ];
  return pick(templates);
}

function pBarCasual(bar: Bar): string {
  const templates = [
    `Para el vermut o unas cañas, **${bar.name}**. ${bar.vibe.charAt(0).toUpperCase() + bar.vibe.slice(1)}. Un buen rato.`,
    `Antes de nada, una parada en **${bar.name}** — ${bar.vibe}.`,
    `Y un vermut en **${bar.name}**. ${bar.vibe.charAt(0).toUpperCase() + bar.vibe.slice(1)}.`,
  ];
  return pick(templates);
}

function pTheater(t: CulturalSpot): string {
  const templates = [
    `En el **${t.name}** mira qué tienen en cartelera. ${t.what.charAt(0).toUpperCase() + t.what.slice(1)}. La entrada va de ${t.price}. Se apagan las luces y durante un par de horas te olvidas de todo.`,
    `Lo fuerte del plan: el **${t.name}**. ${t.what.charAt(0).toUpperCase() + t.what.slice(1)}. Entradas entre ${t.price}.`,
    `Por la tarde-noche, teatro en el **${t.name}** — ${t.what}. Entre ${t.price} la entrada. Cuando se apagan las luces es otra cosa.`,
  ];
  return pick(templates);
}

function pMusic(v: CulturalSpot): string {
  const templates = [
    `Por la noche, música en directo en el **${v.name}**. ${v.what.charAt(0).toUpperCase() + v.what.slice(1)}. Entrada unos ${v.price}.`,
    `El plato fuerte: **${v.name}**. ${v.what.charAt(0).toUpperCase() + v.what.slice(1)}. Sobre ${v.price}.`,
    `Para la música, **${v.name}** — ${v.what}. Unos ${v.price}.`,
  ];
  return pick(templates);
}

function pClosing(bar: Bar): string {
  const closings = [
    `Si la noche se alarga, **${bar.name}** — ${bar.vibe}. De esos sitios donde siempre acabas bien.`,
    `Y si queda cuerpo, una última en **${bar.name}**. ${bar.vibe.charAt(0).toUpperCase() + bar.vibe.slice(1)}.`,
    `Para rematar, **${bar.name}**. ${bar.vibe.charAt(0).toUpperCase() + bar.vibe.slice(1)}. El broche perfecto.`,
  ];
  return pick(closings);
}

// ─── Zone-aware intro paragraph ───────────────────────────────

function pZoneIntro(zone: Zone): string {
  const name = ZONE_NAMES[zone];
  const intros = [
    `Hoy el plan va por **${name}**. Uno de esos barrios que merece la pena explorar con calma.`,
    `Te propongo un plan centrado en **${name}** — para que no tengas que cruzar media ciudad.`,
    `Vamos a **${name}**. Todo lo que necesitas para un buen día está ahí.`,
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

  // Try to inject a real event
  const expoEvent = pickEvent(zone, ["exposición", "museo", "galería"]);
  const cultureParagraph = expoEvent ? pEventExpo(expoEvent) : pCulture(spot1);

  const titles = [
    { title: "Un día sin prisas", subtitle: "Paseo, cultura y buen comer" },
    { title: "Sábado tranquilo", subtitle: "Arte, vermut y callejear" },
    { title: "Barcelona a tu ritmo", subtitle: "Cultura, comida honesta y un buen vermut" },
    { title: "Déjate llevar", subtitle: "Pasear, ver algo bonito y comer bien" },
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

  // Try to inject a real expo/gallery event
  const expoEvent = pickEvent(zone, ["exposición", "museo", "galería"]);
  const cultureParagraph = expoEvent ? pEventExpo(expoEvent) : pCulture(spot);

  const titles = [
    { title: "Plan para dos", subtitle: "Arte, cena especial y cocktails" },
    { title: "Una tarde que se queda", subtitle: "Cultura, buena cena y la noche por delante" },
    { title: "Barcelona en pareja", subtitle: "Paseo, arte y cena con calma" },
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

  // Try a free/cheap real event
  const expoEvent = pickEvent(zone, ["exposición", "museo", "galería"]);
  const cultureParagraph = expoEvent ? pEventExpo(expoEvent) : pCulture(spot);

  const titles = [
    { title: "Barcelona por la cara", subtitle: "Cultura, buen comer y gastar poco" },
    { title: "Plan sin rascarse el bolsillo", subtitle: "Todo lo bueno de la ciudad por cuatro duros" },
    { title: "Mucho por poco", subtitle: "Cultura gratis, comer bien y disfrutar" },
  ];
  const t = pick(titles);

  const freeIntro = [
    `Buen dato: muchos museos tienen días gratuitos o tarifas reducidas. Empieza por ahí.`,
    `Barcelona tiene mucha cultura gratis si sabes dónde buscar. Primer domingo de mes varios museos abren gratis, y siempre hay expos con entrada libre.`,
    `El truco es saber cuándo ir. Muchos museos tienen tardes gratuitas, y las galerías siempre son gratis.`,
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

  // Try a real music/festival event
  const musicEvent = pickEvent(zone, ["música", "festival"]);
  const musicParagraph = musicEvent ? pEventMusica(musicEvent) : pMusic(venue);

  const titles = [
    { title: "La noche suena", subtitle: "Música en directo, cena y copas" },
    { title: "Noche de buen rollo", subtitle: "Cenar, escuchar y brindar" },
    { title: "Barcelona suena bien", subtitle: "Música, cena y la ciudad de noche" },
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

  // Try a real theater/dance event
  const teatroEvent = pickEvent(zone, ["teatro", "danza"]);
  const theaterParagraph = teatroEvent ? pEventTeatro(teatroEvent) : pTheater(theater);

  const titles = [
    { title: "Cuando se apagan las luces", subtitle: "Teatro, paseo y cena con calma" },
    { title: "Noche de escenario", subtitle: "Teatro, buena cena y un cocktail" },
    { title: "Cultura escénica", subtitle: "Paseo, teatro y cenar bien" },
  ];
  const t = pick(titles);

  const paragraphs = zone
    ? [pZoneIntro(zone), pWalkIntro(walk), theaterParagraph, pRestaurantPremium(restaurant), pBar(bar)]
    : [pWalkIntro(walk), theaterParagraph, pRestaurantPremium(restaurant), pBar(bar)];

  return { ...t, paragraphs };
}

// ─── Main generator ────────────────────────────────────────────

export function generatePlan(mood: Mood, zone: Zone | null = null): Plan {
  switch (mood) {
    case "relax": return generateRelax(zone);
    case "romantic": return generateRomantic(zone);
    case "budget": return generateBudget(zone);
    case "music": return generateMusic(zone);
    case "teatro": return generateTeatro(zone);
    default: return pick([generateRelax, generateRomantic, generateBudget, generateMusic, generateTeatro])(zone);
  }
}

export function matchMood(input: string): Mood {
  const lower = input.toLowerCase();
  if (lower.includes("romántic") || lower.includes("pareja") || lower.includes("cena especial") || lower.includes("para dos")) {
    return "romantic";
  }
  if (lower.includes("gast") || lower.includes("gratis") || lower.includes("barat") || lower.includes("sin gastar") || lower.includes("poco") || lower.includes("cara")) {
    return "budget";
  }
  if (lower.includes("música") || lower.includes("concert") || lower.includes("noche") || lower.includes("copas") || lower.includes("fiesta") || lower.includes("directo")) {
    return "music";
  }
  if (lower.includes("teatro") || lower.includes("teatre") || lower.includes("obra") || lower.includes("escen")) {
    return "teatro";
  }
  if (lower.includes("tranquil") || lower.includes("relax") || lower.includes("prisas") || lower.includes("cultural") || lower.includes("paseo") || lower.includes("calma")) {
    return "relax";
  }
  return "random";
}

export { detectZone };
