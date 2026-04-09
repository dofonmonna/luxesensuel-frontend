import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, X, ChevronDown, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const CATEGORIES = [
  { label: "Lingerie", to: "/shop?category=lingerie" },
  { label: "Soins Corporels", to: "/shop?category=soins" },
  { label: "Parfums", to: "/shop?category=parfums" },
  { label: "Cosmétiques", to: "/shop?category=cosmetiques" },
  { label: "Bijoux", to: "/shop?category=bijoux" },
  { label: "Bien-être", to: "/shop?category=bienetre" },
  { label: "Adulte", to: "/shop?category=adulte" },
];

export default function Header() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100 }}>

      {/* ─── Barre supérieure ─────────────────────────────── */}
      <div style={{
        background: "#0A0A0A",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        padding: "8px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "10px",
        letterSpacing: "2px",
        color: "#8A8070",
      }}>
        <span>✦ LIVRAISON DISCRÈTE · PAIEMENT SÉCURISÉ · RETOURS FACILES ✦</span>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/login" style={{ color: "#8A8070", textDecoration: "none", fontSize: "9px", letterSpacing: "1px" }}>Connexion</Link>
          <span style={{ color: "rgba(201,168,76,0.3)" }}>|</span>
          <Link to="/signup" style={{ color: "#C9A84C", textDecoration: "none", fontSize: "9px", letterSpacing: "1px" }}>Créer un compte</Link>
        </div>
      </div>

      {/* ─── Header principal ─────────────────────────────── */}
      <div style={{
        background: "rgba(26,18,8,0.98)",
        borderBottom: "1px solid rgba(201,168,76,0.2)",
        backdropFilter: "blur(20px)",
        padding: "16px 40px",
        display: "flex",
        alignItems: "center",
        gap: "32px",
      }}>

        {/* Logo */}
        <Link to="/" style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: "22px",
          fontWeight: 300,
          letterSpacing: "5px",
          color: "#C9A84C",
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          LUXE<em style={{ fontStyle: "italic", color: "#E8C97A" }}>Sensuel</em>
        </Link>

        {/* Barre de recherche */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          background: "#241A0E",
          border: "1px solid rgba(201,168,76,0.25)",
          padding: "0",
          maxWidth: "600px",
          transition: "border-color 0.3s",
        }}>
          <select style={{
            background: "rgba(201,168,76,0.1)",
            border: "none",
            borderRight: "1px solid rgba(201,168,76,0.2)",
            color: "#C9A84C",
            fontSize: "10px",
            letterSpacing: "1px",
            padding: "12px 12px",
            outline: "none",
            cursor: "pointer",
            fontFamily: '"Montserrat", sans-serif',
          }}>
            <option value="">Tout</option>
            {CATEGORIES.map(c => (
              <option key={c.label} value={c.label}>{c.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#F0E8D8",
              fontSize: "13px",
              padding: "12px 16px",
              outline: "none",
              fontFamily: '"Montserrat", sans-serif',
            }}
          />
          <Link to={`/shop?search=${search}`} style={{
            background: "#C9A84C",
            border: "none",
            padding: "12px 20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}>
            <Search size={16} color="#0A0A0A" />
          </Link>
        </div>

        {/* Actions droite */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>

          {/* Favoris */}
          <Link to="/profile" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            color: "#8A8070",
            textDecoration: "none",
            transition: "color 0.3s",
            fontSize: "9px",
            letterSpacing: "1px",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
          onMouseLeave={e => (e.currentTarget.style.color = "#8A8070")}>
            <Heart size={20} />
            <span>Favoris</span>
          </Link>

          {/* Compte */}
          <Link to="/profile" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            color: "#8A8070",
            textDecoration: "none",
            transition: "color 0.3s",
            fontSize: "9px",
            letterSpacing: "1px",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
          onMouseLeave={e => (e.currentTarget.style.color = "#8A8070")}>
            <User size={20} />
            <span>Mon Compte</span>
          </Link>

          {/* Panier */}
          <Link to="/cart" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            color: "#C9A84C",
            textDecoration: "none",
            position: "relative",
            fontSize: "9px",
            letterSpacing: "1px",
            fontWeight: 500,
          }}>
            <div style={{ position: "relative" }}>
              <ShoppingBag size={24} />
              {count > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "#C9A84C",
                  color: "#0A0A0A",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "9px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {count}
                </span>
              )}
            </div>
            <span>Panier</span>
          </Link>
        </div>
      </div>

      {/* ─── Barre de navigation catégories ──────────────── */}
      <nav style={{
        background: "#241A0E",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        gap: "0",
        overflowX: "auto",
      }}>
        <Link to="/shop" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 20px",
          background: "#C9A84C",
          color: "#0A0A0A",
          textDecoration: "none",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "2px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          <Menu size={14} />
          Toutes les catégories
        </Link>

        {CATEGORIES.map(cat => (
          <Link key={cat.label} to={cat.to} style={{
            padding: "14px 20px",
            color: "#B8A88A",
            textDecoration: "none",
            fontSize: "10px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            flexShrink: 0,
            borderLeft: "1px solid rgba(201,168,76,0.08)",
            transition: "color 0.3s, background 0.3s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "#C9A84C";
            (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.05)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "#B8A88A";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}>
            {cat.label}
          </Link>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: "0", flexShrink: 0 }}>
          <Link to="/shop?sort=new" style={{
            padding: "14px 16px",
            color: "#E8C97A",
            textDecoration: "none",
            fontSize: "9px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            borderLeft: "1px solid rgba(201,168,76,0.08)",
          }}>✦ Nouveautés</Link>
          <Link to="/shop?sort=promo" style={{
            padding: "14px 16px",
            color: "#E8C97A",
            textDecoration: "none",
            fontSize: "9px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            borderLeft: "1px solid rgba(201,168,76,0.08)",
          }}>🔥 Promotions</Link>
        </div>
      </nav>

    </header>
  );
}