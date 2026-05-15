export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  tag: string;
  source?: string;
}

export const newsItems: NewsItem[] = [
  {
    id: "macba-nueva-temporada",
    title: "El MACBA presenta su programa de verano 2026 con tres nuevas exposiciones",
    excerpt:
      "El Museu d'Art Contemporani de Barcelona ha anunciado su programación estival con tres muestras que exploran el arte digital, la performance y la pintura contemporánea catalana.",
    imageUrl:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&h=600&fit=crop",
    date: "2026-05-12",
    tag: "Inauguración",
  },
  {
    id: "caixaforum-gratis-mayo",
    title: "CaixaForum abre sus puertas gratis todos los domingos de mayo",
    excerpt:
      "La Fundación La Caixa amplía su programa de acceso gratuito durante todo el mes de mayo, incluyendo las exposiciones temporales.",
    imageUrl:
      "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=900&h=600&fit=crop",
    date: "2026-05-10",
    tag: "Gratis",
  },
  {
    id: "miro-restauracion",
    title: "La Fundació Miró completa la restauración de 12 obras inéditas",
    excerpt:
      "Tras dos años de trabajo, el equipo de conservación ha recuperado doce piezas que se expondrán por primera vez al público este otoño.",
    imageUrl:
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=900&h=600&fit=crop",
    date: "2026-05-08",
    tag: "Patrimonio",
  },
  {
    id: "nit-museus-2026",
    title: "Nit dels Museus 2026: horarios, museos participantes y novedades",
    excerpt:
      "La gran noche del arte en Barcelona vuelve el 16 de mayo con más de 80 espacios abiertos de forma gratuita hasta la madrugada.",
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&h=600&fit=crop",
    date: "2026-05-06",
    tag: "Evento",
  },
  {
    id: "picasso-record-visitantes",
    title: "El Museu Picasso bate récord de visitantes en el primer trimestre",
    excerpt:
      "Con más de 420.000 visitas entre enero y marzo, el museo del Born registra su mejor arranque de año desde su fundación.",
    imageUrl:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&h=600&fit=crop",
    date: "2026-05-03",
    tag: "Datos",
  },
  {
    id: "galeria-born-inauguracion",
    title: "Abre una nueva galería de arte emergente en el Born",
    excerpt:
      "Espai Llum, un nuevo espacio dedicado a artistas menores de 30 años, inaugura en la calle Montcada con una colectiva de seis pintores catalanes.",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=600&fit=crop",
    date: "2026-04-30",
    tag: "Inauguración",
  },
  {
    id: "mnac-arte-romanico",
    title: "El MNAC renueva su colección permanente de arte románico",
    excerpt:
      "Nueva museografía, iluminación actualizada y piezas nunca antes expuestas para la joya de la corona del Museu Nacional.",
    imageUrl:
      "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=900&h=600&fit=crop",
    date: "2026-04-27",
    tag: "Renovación",
  },
  {
    id: "subvenciones-arte-2026",
    title: "El Ajuntament aumenta un 15% las subvenciones a galerías independientes",
    excerpt:
      "El nuevo plan de apoyo al tejido artístico local incluye ayudas directas para alquiler y producción de exposiciones en espacios de menos de 200m².",
    imageUrl:
      "https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=900&h=600&fit=crop",
    date: "2026-04-24",
    tag: "Sector",
  },
];
