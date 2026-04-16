import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import { productsApi } from '../lib/api';
import { useCart } from '../hooks/useCart';

// ✅ CHANGEMENT : export default → export function
export function Shop() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productsApi.list();
        setProducts(data.products);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = (p) => {
    addItem({ id: p.id, name: p.name, price: parseFloat(p.price), image: p.image, quantity: 1 });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
          Nos produits
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {products.map(p => (
            <div key={p.id} style={{ 
              border: '1px solid #eee', 
              borderRadius: '8px', 
              overflow: 'hidden',
              background: 'white',
              cursor: 'pointer'
            }} onClick={() => navigate(`/product/${p.id}`)}>
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '15px' }}>
                <h3 style={{ fontSize: '14px', color: '#333', marginBottom: '8px', height: '40px', overflow: 'hidden' }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4747', marginBottom: '10px' }}>
                  {parseFloat(p.price).toFixed(2)} €
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAdd(p); }}
                  style={{ 
                    width: '100%', 
                    background: '#ff4747', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}