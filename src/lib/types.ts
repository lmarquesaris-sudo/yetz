export type VenueType =
  | "museo"
  | "galería"
  | "teatro"
  | "sala de conciertos"
  | "centro cultural"
  | "restaurante"
  | "bar"
  | "chiringuito"
  | "espacio al aire libre"
  | "cine"
  | "sala de exposiciones"
  | "jardín"
  | "mercado"
  | "auditorio"
  | "librería";

export type Neighborhood =
  | "Poblenou / 22@"
  | "Gràcia"
  | "El Born"
  | "Gótico"
  | "El Raval"
  | "Eixample"
  | "Barceloneta / Port"
  | "Montjuïc"
  | "Sants / Poble-sec"
  | "Sarrià / Pedralbes";

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  neighborhood: Neighborhood;
  address: string;
  description: string;
  url?: string;
  tier: 1 | 2 | 3;
  lat?: number;
  lng?: number;
}

export interface Event {
  id: string;
  title: string;
  venue: string;
  category: Category;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  price: number | null;
  address: string;
  neighborhood: string;
  url: string;
  featured: boolean;
  /** 1 = major museum, 2 = notable space, 3 = other */
  tier?: number;
}

export type Category =
  | "exposición"
  | "museo"
  | "galería"
  | "taller"
  | "teatro"
  | "música"
  | "danza"
  | "cine"
  | "festival";

/** Category groups for the calendar filter */
export type CategoryFilter = "todos" | "arte" | "música" | "teatro" | "talleres";

export const CATEGORY_FILTERS: { key: CategoryFilter; label: string; icon: string }[] = [
  { key: "todos", label: "Todos", icon: "✦" },
  { key: "arte", label: "Arte", icon: "◐" },
  { key: "música", label: "Música", icon: "♪" },
  { key: "teatro", label: "Teatro", icon: "◎" },
  { key: "talleres", label: "Talleres", icon: "✂" },
];

export function getCategoryFilter(category: Category): CategoryFilter {
  switch (category) {
    case "taller":
      return "talleres";
    case "exposición":
    case "museo":
    case "galería":
      return "arte";
    case "música":
    case "festival":
      return "música";
    case "teatro":
    case "danza":
    case "cine":
      return "teatro";
    default:
      return "arte";
  }
}
