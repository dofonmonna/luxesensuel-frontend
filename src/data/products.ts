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
  { id: '3', name: 'Ensembles', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80' },
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
    id: ‘1’,
    content: "Commande reçue en 4 jours, emballage neutre et très soigné. Le produit est exactement comme sur les photos, qualité premium. Je reviens déjà pour une deuxième commande !",
    author: ‘Amina K.’,
    role: ‘Abidjan, Côte d\’Ivoire’
  },
  {
    id: ‘2’,
    content: "J’étais hésitante au début mais le service client m’a rassurée. Livraison discrète, produit de qualité exceptionnelle. Mon mari a adoré le cadeau surprise. Je recommande à 100%.",
    author: ‘Fatou D.’,
    role: ‘Dakar, Sénégal’
  },
  {
    id: ‘3’,
    content: "Site sécurisé, paiement Mobile Money sans souci, livraison rapide. Le colis ne laisse rien deviner du contenu. Parfait pour les achats intimes. Merci LUXEDropshoping !",
    author: ‘Kofi A.’,
    role: ‘Accra, Ghana’
  }
];
