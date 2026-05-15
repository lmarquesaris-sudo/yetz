export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: {
    text: string;
    painters: string[]; // painter IDs that get a point
  }[];
}

export interface PainterProfile {
  id: string;
  name: string;
  fullName: string;
  years: string;
  image: string;
  movement: string;
  quote: string;
  description: string;
  traits: string[];
  color: string; // accent color for the result
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Lo primero que te atrapa de un cuadro es...",
    options: [
      {
        text: "La luz y los colores vibrantes",
        painters: ["sorolla", "monet", "renoir"],
      },
      {
        text: "La emoción que transmite",
        painters: ["vangogh", "frida", "munch"],
      },
      {
        text: "Las formas y la composición",
        painters: ["picasso", "miro", "mondrian"],
      },
      {
        text: "La historia que cuenta",
        painters: ["dali", "klimt", "vermeer"],
      },
    ],
  },
  {
    id: 2,
    question: "Un sábado perfecto para ti sería...",
    options: [
      {
        text: "Pasear junto al mar al atardecer",
        painters: ["sorolla", "monet", "vermeer"],
      },
      {
        text: "Perderte por callejuelas de una ciudad desconocida",
        painters: ["picasso", "vangogh", "munch"],
      },
      {
        text: "Visitar una exposición y luego ir a un café con amigos",
        painters: ["renoir", "klimt", "frida"],
      },
      {
        text: "Quedarte en tu mundo, imaginando cosas imposibles",
        painters: ["dali", "miro", "mondrian"],
      },
    ],
  },
  {
    id: 3,
    question: "Elige la paleta que más te representa",
    options: [
      {
        text: "Blancos, azules y dorados de la costa",
        painters: ["sorolla", "monet", "vermeer"],
      },
      {
        text: "Rojos intensos, amarillos y tierras",
        painters: ["vangogh", "frida", "klimt"],
      },
      {
        text: "Negros, azules eléctricos y formas puras",
        painters: ["picasso", "mondrian", "munch"],
      },
      {
        text: "Todos los colores del arcoíris, sin límites",
        painters: ["miro", "dali", "renoir"],
      },
    ],
  },
  {
    id: 4,
    question: "Ante un problema difícil, tú...",
    options: [
      {
        text: "Lo observas desde todos los ángulos hasta descomponerlo",
        painters: ["picasso", "mondrian", "vermeer"],
      },
      {
        text: "Te dejas llevar por la intuición y el corazón",
        painters: ["vangogh", "miro", "frida"],
      },
      {
        text: "Buscas inspiración en lo cotidiano, en la naturaleza",
        painters: ["sorolla", "monet", "renoir"],
      },
      {
        text: "Lo transformas en algo surrealista e inesperado",
        painters: ["dali", "munch", "klimt"],
      },
    ],
  },
  {
    id: 5,
    question: "El paisaje que te habla al alma es...",
    options: [
      {
        text: "El Mediterráneo, arena blanca y brisa marina",
        painters: ["sorolla", "renoir", "monet"],
      },
      {
        text: "Un campo de trigo bajo un cielo estrellado",
        painters: ["vangogh", "munch", "miro"],
      },
      {
        text: "Una ciudad con rincones llenos de historia",
        painters: ["picasso", "vermeer", "klimt"],
      },
      {
        text: "Un paisaje de ensueño que no existe en la realidad",
        painters: ["dali", "frida", "mondrian"],
      },
    ],
  },
  {
    id: 6,
    question: "Si tu vida fuera un cuadro, sería...",
    options: [
      {
        text: "Luminoso, lleno de momentos de felicidad cotidiana",
        painters: ["sorolla", "renoir", "vermeer"],
      },
      {
        text: "Intenso, apasionado y a veces tormentoso",
        painters: ["vangogh", "frida", "munch"],
      },
      {
        text: "Abstracto, rompedor y adelantado a su tiempo",
        painters: ["picasso", "miro", "mondrian"],
      },
      {
        text: "Misterioso, con símbolos ocultos y belleza oscura",
        painters: ["dali", "klimt", "munch"],
      },
    ],
  },
  {
    id: 7,
    question: "Lo que más valoras en el arte es...",
    options: [
      {
        text: "Capturar la belleza del instante",
        painters: ["sorolla", "monet", "vermeer"],
      },
      {
        text: "Expresar lo que las palabras no pueden",
        painters: ["vangogh", "frida", "munch"],
      },
      {
        text: "Reinventar la forma de ver el mundo",
        painters: ["picasso", "mondrian", "miro"],
      },
      {
        text: "Crear mundos que desafían la lógica",
        painters: ["dali", "klimt", "renoir"],
      },
    ],
  },
];

export const PAINTERS: PainterProfile[] = [
  {
    id: "sorolla",
    name: "Sorolla",
    fullName: "Joaquín Sorolla y Bastida",
    years: "1863 – 1923",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
    movement: "Impresionismo luminista",
    quote: "La luz es el alma de la pintura.",
    description:
      "Como Sorolla, eres una persona luminosa que encuentra belleza en lo cotidiano. Tienes una conexión especial con la naturaleza y el mar. Tu energía es contagiosa y sabes capturar la esencia de cada momento. Valoras la familia, la luz y los placeres sencillos de la vida.",
    traits: ["Luminoso", "Mediterráneo", "Vitalista", "Sensible"],
    color: "#c8a96e",
  },
  {
    id: "picasso",
    name: "Picasso",
    fullName: "Pablo Ruiz Picasso",
    years: "1881 – 1973",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
    movement: "Cubismo",
    quote: "Yo no busco, encuentro.",
    description:
      "Como Picasso, eres una mente inquieta que nunca se conforma con una sola perspectiva. Rompes las reglas no por rebeldía, sino porque ves más allá de lo establecido. Eres prolífico, audaz y transformas todo lo que tocas. Tu creatividad no tiene límites.",
    traits: ["Rompedor", "Genial", "Prolífico", "Audaz"],
    color: "#2563eb",
  },
  {
    id: "vangogh",
    name: "Van Gogh",
    fullName: "Vincent van Gogh",
    years: "1853 – 1890",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop",
    movement: "Postimpresionismo",
    quote: "Si oyes una voz dentro de ti diciendo 'no puedes pintar', entonces pinta y esa voz será silenciada.",
    description:
      "Como Van Gogh, sientes todo con una intensidad extraordinaria. Tu mundo interior es tan rico que a veces desborda. Eres profundamente empático, apasionado y auténtico. Donde otros ven un campo de trigo, tú ves el movimiento del cosmos entero.",
    traits: ["Intenso", "Apasionado", "Auténtico", "Emotivo"],
    color: "#eab308",
  },
  {
    id: "dali",
    name: "Dalí",
    fullName: "Salvador Dalí i Domènech",
    years: "1904 – 1989",
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&h=600&fit=crop",
    movement: "Surrealismo",
    quote: "La única diferencia entre un loco y yo, es que yo no estoy loco.",
    description:
      "Como Dalí, tu mente es un universo paralelo donde todo es posible. Combinas una técnica impecable con una imaginación desbordante. Eres excéntrico pero calculador, provocador pero meticuloso. Tu genialidad reside en hacer visible lo invisible.",
    traits: ["Visionario", "Excéntrico", "Meticuloso", "Provocador"],
    color: "#dc2626",
  },
  {
    id: "miro",
    name: "Miró",
    fullName: "Joan Miró i Ferrà",
    years: "1893 – 1983",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=600&fit=crop",
    movement: "Surrealismo abstracto",
    quote: "Intento aplicar colores como palabras que forman poemas, como notas que forman la música.",
    description:
      "Como Miró, tienes una mirada infantil que es en realidad profundamente sabia. Simplificas la complejidad hasta encontrar la esencia pura. Eres libre, juguetón y catalán hasta la médula. Tu arte nace de la tierra pero aspira a las estrellas.",
    traits: ["Libre", "Poético", "Esencial", "Juguetón"],
    color: "#16a34a",
  },
  {
    id: "frida",
    name: "Frida",
    fullName: "Frida Kahlo de Rivera",
    years: "1907 – 1954",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop",
    movement: "Surrealismo / Arte mexicano",
    quote: "Pies, para qué los quiero si tengo alas para volar.",
    description:
      "Como Frida, transformas el dolor en arte y la vulnerabilidad en fortaleza. Eres radicalmente honesto con tus emociones y no te escondes detrás de ninguna máscara. Tu autenticidad es tu mayor poder. Cada cicatriz cuenta una historia de resiliencia.",
    traits: ["Resiliente", "Auténtica", "Valiente", "Visceral"],
    color: "#be185d",
  },
  {
    id: "monet",
    name: "Monet",
    fullName: "Claude Monet",
    years: "1840 – 1926",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop",
    movement: "Impresionismo",
    quote: "Quiero pintar como canta un pájaro.",
    description:
      "Como Monet, eres un observador paciente que encuentra lo extraordinario en lo efímero. La luz cambiante, el reflejo del agua, la bruma de la mañana — tú ves poesía donde otros solo ven paisaje. Eres perseverante, sensible y profundamente conectado con la naturaleza.",
    traits: ["Contemplativo", "Paciente", "Sensible", "Natural"],
    color: "#7c3aed",
  },
  {
    id: "klimt",
    name: "Klimt",
    fullName: "Gustav Klimt",
    years: "1862 – 1918",
    image: "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=600&h=600&fit=crop",
    movement: "Modernismo / Art Nouveau",
    quote: "El arte es una línea alrededor de tus pensamientos.",
    description:
      "Como Klimt, eres una persona que busca la belleza absoluta y no tiene miedo de la sensualidad. Combinas la decoración exquisita con una profundidad emocional que deja sin aliento. Eres misterioso, refinado y siempre aspiras a lo sublime.",
    traits: ["Refinado", "Sensual", "Misterioso", "Sublime"],
    color: "#b45309",
  },
  {
    id: "mondrian",
    name: "Mondrian",
    fullName: "Piet Mondrian",
    years: "1872 – 1944",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=600&fit=crop",
    movement: "Neoplasticismo / De Stijl",
    quote: "El arte puro se conecta directamente con la esencia de la vida.",
    description:
      "Como Mondrian, buscas el orden esencial detrás del caos aparente. Reduces la realidad a sus elementos fundamentales — líneas, planos, colores primarios — y encuentras en esa pureza una armonía universal. Eres minimalista, lógico y visionario.",
    traits: ["Esencial", "Lógico", "Visionario", "Puro"],
    color: "#111111",
  },
  {
    id: "renoir",
    name: "Renoir",
    fullName: "Pierre-Auguste Renoir",
    years: "1841 – 1919",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop",
    movement: "Impresionismo",
    quote: "La pintura debe ser alegre y bonita, ¡sí, bonita!",
    description:
      "Como Renoir, celebras la vida en toda su dulzura. Ves belleza en las reuniones de amigos, en la luz del domingo, en la piel bañada por el sol. Eres sociable, optimista y crees firmemente que el arte debe producir alegría. Tu calidez es irresistible.",
    traits: ["Alegre", "Sociable", "Cálido", "Optimista"],
    color: "#ea580c",
  },
  {
    id: "vermeer",
    name: "Vermeer",
    fullName: "Johannes Vermeer",
    years: "1632 – 1675",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=600&fit=crop",
    movement: "Barroco holandés",
    quote: "La perfección está en los detalles.",
    description:
      "Como Vermeer, encuentras la eternidad en los momentos más íntimos y cotidianos. Una mujer leyendo una carta, la luz que entra por una ventana — para ti, lo ordinario es extraordinario. Eres meticuloso, observador y posees una serenidad que calma a quienes te rodean.",
    traits: ["Sereno", "Observador", "Íntimo", "Perfeccionista"],
    color: "#0891b2",
  },
  {
    id: "munch",
    name: "Munch",
    fullName: "Edvard Munch",
    years: "1863 – 1944",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=600&fit=crop",
    movement: "Expresionismo",
    quote: "Sin miedo ni enfermedad, mi vida sería como un barco sin timón.",
    description:
      "Como Munch, canalizas la angustia existencial en arte que resuena universalmente. No huyes de las emociones difíciles — las abrazas y las transformas. Eres profundo, introspectivo y posees una honestidad brutal que conmueve. Tu sensibilidad es tu superpoder.",
    traits: ["Profundo", "Introspectivo", "Honesto", "Expresivo"],
    color: "#4338ca",
  },
];

export function calculateResult(answers: number[]): PainterProfile {
  const scores: Record<string, number> = {};

  answers.forEach((answerIndex, questionIndex) => {
    const question = QUESTIONS[questionIndex];
    if (!question) return;
    const option = question.options[answerIndex];
    if (!option) return;
    option.painters.forEach((painterId) => {
      scores[painterId] = (scores[painterId] || 0) + 1;
    });
  });

  // Find painter with highest score
  let maxScore = 0;
  let winnerId = "sorolla"; // default

  Object.entries(scores).forEach(([painterId, score]) => {
    if (score > maxScore) {
      maxScore = score;
      winnerId = painterId;
    }
  });

  return PAINTERS.find((p) => p.id === winnerId) || PAINTERS[0];
}
