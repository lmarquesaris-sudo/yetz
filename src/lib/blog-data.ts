export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  readTime: string;
  date: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "guia-macba",
    title: "Guía completa del MACBA: todo lo que necesitas saber",
    excerpt:
      "Horarios, entradas, exposiciones actuales y consejos para aprovechar al máximo tu visita al Museu d'Art Contemporani de Barcelona.",
    imageUrl:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&h=600&fit=crop",
    category: "Guía",
    readTime: "5 min",
    date: "2026-05-10",
    content:
      "El MACBA es uno de los museos más emblemáticos de Barcelona. Situado en el corazón del Raval, su edificio diseñado por Richard Meier es ya de por sí una obra de arte. La colección permanente abarca desde los años 50 hasta la actualidad, con especial atención al arte catalán y español. Los domingos a partir de las 15h la entrada es gratuita. Te recomendamos empezar por la planta 3 e ir bajando.",
  },
  {
    id: "galerias-raval",
    title: "Top 5 galerías del Raval que no puedes perderte",
    excerpt:
      "Las galerías más interesantes del barrio más artístico de Barcelona, desde arte emergente hasta colecciones consolidadas.",
    imageUrl:
      "https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=900&h=600&fit=crop",
    category: "Selección",
    readTime: "4 min",
    date: "2026-05-07",
    content:
      "El Raval concentra la mayor densidad de galerías de arte contemporáneo de Barcelona. La calle Doctor Dou es el epicentro, pero hay joyas escondidas en cada esquina. Desde espacios minúsculos con propuestas arriesgadas hasta galerías consolidadas que representan artistas internacionales.",
  },
  {
    id: "arte-gratis-barcelona",
    title: "Cómo disfrutar del arte en Barcelona sin gastar nada",
    excerpt:
      "Todos los museos gratuitos, días de puertas abiertas y espacios de arte libre en la ciudad.",
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&h=600&fit=crop",
    category: "Consejos",
    readTime: "6 min",
    date: "2026-05-03",
    content:
      "Barcelona está llena de arte accesible para todos los bolsillos. Muchos museos ofrecen entrada gratuita el primer domingo del mes, otros tienen horarios de puertas abiertas entre semana. Además, el street art del Raval, Poblenou y el Born es un museo al aire libre permanente.",
  },
  {
    id: "exposiciones-verano-2026",
    title: "Las exposiciones imprescindibles del verano 2026",
    excerpt:
      "Nuestra selección de las muestras que no te puedes perder este verano en Barcelona.",
    imageUrl:
      "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=900&h=600&fit=crop",
    category: "Selección",
    readTime: "4 min",
    date: "2026-04-28",
    content:
      "El verano trae consigo algunas de las exposiciones más potentes del año. Los grandes museos de la ciudad preparan sus blockbusters y las galerías apuestan por inauguraciones que marquen la temporada.",
  },
  {
    id: "picasso-barcelona",
    title: "Tras los pasos de Picasso en Barcelona",
    excerpt:
      "Un recorrido por los lugares que marcaron la juventud del genio malagueño en la ciudad condal.",
    imageUrl:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&h=600&fit=crop",
    category: "Historia",
    readTime: "7 min",
    date: "2026-04-20",
    content:
      "Pablo Picasso llegó a Barcelona con 14 años y la ciudad lo marcó para siempre. Desde el taller familiar en la calle de la Mercè hasta Els Quatre Gats, pasando por la Escola de Belles Arts de la Llotja, Barcelona fue el escenario de su formación artística y su primera bohemia.",
  },
];
