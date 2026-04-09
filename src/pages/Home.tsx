import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Hero simple */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '80px 20px', 
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>LuxeSensuel</h1>
        <p style={{ fontSize: '20px', marginBottom: '30px' }}>Découvrez notre collection exclusive</p>
        <button 
          onClick={() => navigate('/shop')}
          style={{ 
            background: 'white', 
            color: '#764ba2', 
            padding: '15px 40px', 
            borderRadius: '30px',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Voir les produits
        </button>
      </div>

      {/* Section produits populaires */}
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Nos meilleures ventes
        </h2>
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/shop')}
            style={{ 
              background: '#ff4747', 
              color: 'white', 
              padding: '12px 30px', 
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Tous nos produits
          </button>
        </div>
      </div>
    </div>
  );
}