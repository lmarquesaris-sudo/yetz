export interface ArtRoute {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  stops: number;
  neighborhood: string;
  imageUrl: string;
  tags: string[];
  venues: {
    name: string;
    tip: string;
  }[];
}

export const artRoutes: ArtRoute[] = [
  {
    id: "modernista",
    title: "Ruta Modernista",
    subtitle: "De Gaudí a Domènech i Montaner",
    description:
      "Recorre las joyas arquitectónicas del modernismo catalán y sus conexiones con el arte visual. Desde los mosaicos de la Casa Batlló hasta las vidrieras del Palau de la Música.",
    duration: "3-4 horas",
    stops: 4,
    neighborhood: "Eixample",
    imageUrl:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&h=600&fit=crop",
    tags: ["Arquitectura", "Modernismo", "Paseo"],
    venues: [
      { name: "Casa Batlló", tip: "Visita por la mañana para evitar colas" },
      { name: "Fundació Antoni Tàpies", tip: "Exposiciones temporales rotativas" },
      { name: "Casa Amatller", tip: "Fachada imprescindible" },
      { name: "MNAC — Arte Modernista", tip: "Sala dedicada al modernismo catalán" },
    ],
  },
  {
    id: "gracia-tarde",
    title: "Gràcia en una tarde",
    subtitle: "Galerías y talleres del barrio bohemio",
    description:
      "El barrio más artístico de Barcelona concentra decenas de galerías independientes y talleres de artistas. Una ruta para perderse entre calles estrechas y descubrir arte emergente.",
    duration: "2-3 horas",
    stops: 4,
    neighborhood: "Gràcia",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=600&fit=crop",
    tags: ["Galerías", "Arte emergente", "Bohemio"],
    venues: [
      { name: "Galería Cosmo", tip: "Arte contemporáneo joven" },
      { name: "Espai Souvenir", tip: "Tienda-galería con artistas locales" },
      { name: "La Plataforma", tip: "Espacio multidisciplinar" },
      { name: "Plaça del Sol", tip: "Perfecto para acabar con una cerveza" },
    ],
  },
  {
    id: "museos-gratis",
    title: "Museos gratis el domingo",
    subtitle: "Aprovecha los domingos de puertas abiertas",
    description:
      "Muchos museos de Barcelona ofrecen entrada gratuita el primer domingo de cada mes y todos los domingos a partir de las 15h. Esta ruta maximiza tu recorrido cultural sin gastar un euro.",
    duration: "4-5 horas",
    stops: 4,
    neighborhood: "Varios",
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&h=600&fit=crop",
    tags: ["Gratis", "Museos", "Domingo"],
    venues: [
      { name: "MNAC", tip: "Gratis domingos desde las 15h" },
      { name: "Museu Picasso", tip: "Gratis primer domingo del mes" },
      { name: "MACBA", tip: "Gratis sábados de 16h a 20h" },
      { name: "CCCB", tip: "Gratis domingos de 15h a 20h" },
    ],
  },
  {
    id: "raval-contemporaneo",
    title: "El Raval contemporáneo",
    subtitle: "Street art, galerías y el MACBA",
    description:
      "Del MACBA a las galerías de la calle Doctor Dou, el Raval es el epicentro del arte contemporáneo en Barcelona. Murales, espacios alternativos y la energía más creativa de la ciudad.",
    duration: "2-3 horas",
    stops: 4,
    neighborhood: "El Raval",
    imageUrl:
      "https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=900&h=600&fit=crop",
    tags: ["Contemporáneo", "Street art", "Alternativo"],
    venues: [
      { name: "MACBA", tip: "Empieza aquí y explora la plaza" },
      { name: "CCCB", tip: "Exposiciones multimedia" },
      { name: "Galeries Doctor Dou", tip: "Concentración de galerías en una calle" },
      { name: "Arts Santa Mònica", tip: "Espacio público de arte, siempre gratuito" },
    ],
  },
  {
    id: "montjuic-arte",
    title: "Montjuïc artístico",
    subtitle: "MNAC, Miró y jardines escultóricos",
    description:
      "La montaña de Montjuïc concentra dos de los museos más importantes de la ciudad junto a jardines con esculturas al aire libre. Una jornada completa de arte con vistas panorámicas.",
    duration: "5-6 horas",
    stops: 4,
    neighborhood: "Montjuïc",
    imageUrl:
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=900&h=600&fit=crop",
    tags: ["Museos", "Escultura", "Naturaleza"],
    venues: [
      { name: "MNAC", tip: "Colección de románico única en el mundo" },
      { name: "Fundació Joan Miró", tip: "Imprescindible la terraza" },
      { name: "Jardí Botànic", tip: "Esculturas entre la vegetación mediterránea" },
      { name: "Poble Espanyol", tip: "Talleres de artesanos y galería de arte" },
    ],
  },
];
