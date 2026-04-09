export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  isNew?: boolean;
}

export const categories = [
  { id: '1', name: 'Parfums', image: 'https://images.unsplash.com/photo-1544467328-345179a4573b?auto=format&fit=crop&q=80' },
  { id: '2', name: 'Huiles', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80' },
  { id: '3', name: 'Ensembles', image: 'https://images.unsplash.com/photo-1512446813985-4a0eb139016c?auto=format&fit=crop&q=80' },
  { id: '4', name: 'Accessoires', image: 'https://images.unsplash.com/photo-1590156221122-c2947475700b?auto=format&fit=crop&q=80' }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Ã‰lixir de Nuit',
    price: 89,
    category: 'Parfums',
    description: 'Une fragrance envoÃ»tante aux notes de musc et de vanille noire.',
    image: 'https://images.unsplash.com/photo-1544467328-345179a4573b?auto=format&fit=crop&q=80',
    isNew: true
  },
  {
    id: '2',
    name: 'Huile de Soie',
    price: 45,
    category: 'Huiles',
    description: 'Hydratation intense et parfum dÃ©licat pour une peau satinÃ©e.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80',
    isNew: true
  }
];
export const testimonials = [
  {
    id: '1',
    content: 'Une expérience sensorielle unique. Les huiles sont d’une qualité rare et l’emballage est d’un raffinement extrême.',
    author: 'Sophie M.',
    role: 'Cliente Privilège'
  },
  {
    id: '2',
    content: 'L’élixir de nuit est devenu mon indispensable. Fragrance subtile et envoûtante. Je recommande vivement.',
    author: 'Marc A.',
    role: 'Collectionneur'
  },
  {
    id: '3',
    content: 'Service client impeccable et livraison d’une discrétion absolue. Le luxe se niche vraiment dans les détails.',
    author: 'Elena R.',
    role: 'Cliente Fidèle'
  }
];
