export interface Space {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  image: string;
  address: string;
  neighborhood: string;
  website: string;
  /** Lowercase substring to match against event.venue */
  venueFilter: string;
  /** Whether it's a "gran museo" shown prominently */
  featured: boolean;
  /** Accent color for the museum card */
  accent: string;
}

export const SPACES: Space[] = [
  {
    slug: "mnac",
    name: "MNAC — Museu Nacional d'Art de Catalunya",
    shortName: "MNAC",
    description:
      "Mil años de arte catalán y europeo, desde el románico hasta las vanguardias, en el Palau Nacional.",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&h=600&fit=crop",
    address: "Palau Nacional, Parc de Montjuïc, 08038 Barcelona",
    neighborhood: "Sants-Montjuïc",
    website: "https://www.museunacional.cat",
    venueFilter: "museu nacional",
    featured: true,
    accent: "#8B6914",
  },
  {
    slug: "fundacio-joan-miro",
    name: "Fundació Joan Miró",
    shortName: "Miró",
    description:
      "El universo de Joan Miró en Montjuïc. Arte moderno y contemporáneo en un edificio icónico de Sert.",
    image:
      "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=900&h=600&fit=crop",
    address: "Parc de Montjuïc, s/n, 08038 Barcelona",
    neighborhood: "Sants-Montjuïc",
    website: "https://www.fmirobcn.org",
    venueFilter: "fundació joan miró",
    featured: true,
    accent: "#C0392B",
  },
  {
    slug: "museu-picasso",
    name: "Museu Picasso",
    shortName: "Picasso",
    description:
      "La colección más completa de la etapa formativa de Picasso, en cinco palacios medievales del Born.",
    image:
      "https://images.unsplash.com/photo-1563804951831-7d48a2e68d0e?w=900&h=600&fit=crop",
    address: "Carrer Montcada, 15-23, 08003 Barcelona",
    neighborhood: "Sant Pere, Santa Caterina i la Ribera",
    website: "https://www.museupicasso.bcn.cat",
    venueFilter: "museu picasso",
    featured: true,
    accent: "#2C3E50",
  },
  {
    slug: "meam",
    name: "MEAM — Museu Europeu d'Art Modern",
    shortName: "MEAM",
    description:
      "El museo de referencia del arte figurativo contemporáneo europeo, en el palacio Gomis del Born.",
    image:
      "https://images.unsplash.com/photo-1574182245530-967d9b3831af?w=900&h=600&fit=crop",
    address: "Carrer de la Barra de Ferro, 5, 08003 Barcelona",
    neighborhood: "Sant Pere, Santa Caterina i la Ribera",
    website: "https://www.meam.es",
    venueFilter: "meam",
    featured: true,
    accent: "#6C3483",
  },
  {
    slug: "moco-museum",
    name: "Moco Museum Barcelona",
    shortName: "Moco",
    description:
      "Museo de arte moderno y contemporáneo con obras de Banksy, KAWS, Haring y más.",
    image:
      "https://images.unsplash.com/photo-1696446702183-cbd13d78e1e7?w=900&h=600&fit=crop",
    address: "Carrer de Montcada, 25, 08003 Barcelona",
    neighborhood: "Sant Pere, Santa Caterina i la Ribera",
    website: "https://mocomuseum.com/barcelona",
    venueFilter: "moco museum",
    featured: true,
    accent: "#E74C3C",
  },
  {
    slug: "macba",
    name: "MACBA — Museu d'Art Contemporani de Barcelona",
    shortName: "MACBA",
    description:
      "El museo de referencia del arte contemporáneo en Barcelona, situado en el corazón del Raval.",
    image:
      "https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=900&h=600&fit=crop",
    address: "Plaça dels Àngels, 1, 08001 Barcelona",
    neighborhood: "El Raval",
    website: "https://www.macba.cat",
    venueFilter: "macba",
    featured: true,
    accent: "#1ABC9C",
  },
  {
    slug: "cccb",
    name: "CCCB — Centre de Cultura Contemporània de Barcelona",
    shortName: "CCCB",
    description:
      "Espacio de creación, investigación y debate sobre cultura contemporánea en el Raval.",
    image:
      "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=900&h=600&fit=crop",
    address: "Carrer de Montalegre, 5, 08001 Barcelona",
    neighborhood: "El Raval",
    website: "https://www.cccb.org",
    venueFilter: "cccb",
    featured: true,
    accent: "#2980B9",
  },
  {
    slug: "caixaforum",
    name: "CaixaForum Barcelona",
    shortName: "CaixaForum",
    description:
      "Centro cultural en la antigua fábrica Casaramona de Puig i Cadafalch. Grandes exposiciones internacionales.",
    image:
      "https://images.unsplash.com/photo-1579282240050-352db0a14c21?w=900&h=600&fit=crop",
    address: "Av. de Francesc Ferrer i Guàrdia, 6-8, 08038 Barcelona",
    neighborhood: "Sants-Montjuïc",
    website: "https://caixaforum.org/es/barcelona",
    venueFilter: "caixaforum",
    featured: true,
    accent: "#D4A843",
  },
];

export function getSpaceBySlug(slug: string): Space | undefined {
  return SPACES.find((s) => s.slug === slug);
}

export function getFeaturedSpaces(): Space[] {
  return SPACES.filter((s) => s.featured);
}
