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
}

export type Category =
  | "exposición"
  | "museo"
  | "galería"
  | "taller"
  | "performance"
  | "fotografía"
  | "street art";
