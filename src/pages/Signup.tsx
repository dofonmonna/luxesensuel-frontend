import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Phone, MapPin, Globe, ArrowRight, Eye, EyeOff } from "lucide-react";

const PAYS = [
  "Côte d'Ivoire","Sénégal","Mali","Burkina Faso","Guinée","Togo","Bénin","Niger","Cameroun",
  "Congo","Gabon","Madagascar","Mauritanie","France","Belgique","Suisse","Canada","Autre"
];

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phone: "", address: "", city: "", country: "Côte d'Ivoire",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = cred.user;
      await updateProfile(user, { displayName: `${form.firstName} ${form.lastName}` });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        country: form.country,
        role: "client",
        createdAt: new Date().toISOString(),
      });
      toast.success("Bienvenue dans l'univers LuxeSensuel ✦");
      setTimeout(() => navigate("/profile"), 500);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") toast.error("Cet email est déjà utilisé.");
      else if (err.code === "auth/weak-password") toast.error("Mot de passe trop faible (6 caractères min).");
      else toast.error("Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px 14px 46px",
    background: "#241A0E", border: "1px solid rgba(201,168,76,0.25)",
    color: "#F0E8D8", fontFamily: '"Montserrat", sans-serif',
    fontSize: "13px", outline: "none", transition: "border-color 0.3s",
    borderRadius: 0,
  };

  const lbl: React.CSSProperties = {
    display: "block", fontSize: "8px", letterSpacing: "3px",
    textTransform: "uppercase", color: "#C9A84C", marginBottom: "8px", opacity: 0.8,
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top, #2E2212 0%, #0A0A0A 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: '"Montserrat", sans-serif' }}>
      <div style={{ width: "100%", maxWidth: "900px" }}>

        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Link to="/" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "28px", fontWeight: 300, letterSpacing: "6px", color: "#C9A84C", textDecoration: "none", display: "block", marginBottom: "8px" }}>
            LUXE<em style={{ fontStyle: "italic", color: "#E8C97A" }}>Sensuel</em>
          </Link>
          <div style={{ width: "40px", height: "1px", background: "#C9A84C", margin: "12px auto", opacity: 0.4 }} />
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "42px", fontWeight: 300, color: "#FAF6EE", marginBottom: "8px" }}>
            Rejoindre
          </h1>
          <p style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#8A8070" }}>
            L'expérience LuxeSensuel commence ici
          </p>
        </div>

        {/* Formulaire */}
        <div style={{ background: "#1A1208", border: "1px solid rgba(201,168,76,0.2)", padding: "48px" }}>
          <form onSubmit={handleSubmit}>

            {/* Titre section */}
            <p style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#C9A84C", marginBottom: "24px", opacity: 0.8 }}>
              ✦ Informations personnelles
            </p>

            {/* Prénom + Nom */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={lbl}>Prénom</label>
                <div style={{ position: "relative" }}>
                  <User size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#C9A84C", opacity: 0.6 }} />
                  <input required type="text" placeholder="Votre prénom" value={form.firstName} onChange={set("firstName")} style={inp}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")} />
                </div>
              </div>
              <div>
                <label style={lbl}>Nom</label>
                <div style={{ position: "relative" }}>
                  <User size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#C9A84C", opacity: 0.6 }} />
                  <input required type="text" placeholder="Votre nom" value={form.lastName} onChange={set("lastName")} style={inp}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")} />
                </div>
              </div>
            </div>

            {/* Email + Téléphone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={lbl}>Adresse email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#C9A84C", opacity: 0.6 }} />
                  <input required type="email" placeholder="votre@email.com" value={form.email} onChange={set("email")} style={inp}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")} />
                </div>
              </div>
              <div>
                <label style={lbl}>Téléphone</label>
                <div style={{ position: "relative" }}>
                  <Phone size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#C9A84C", opacity: 0.6 }} />
                  <input type="tel" placeholder="+225 XX XX XX XX XX" value={form.phone} onChange={set("phone")} style={inp}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")} />
                </div>
              </div>
            </div>

            {/* Séparateur */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "28px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(201,168,76,0.15)" }} />
              <p style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#C9A84C", opacity: 0.8 }}>✦ Adresse de livraison</p>
              <div style={{ flex: 1, height: "1px", background: "rgba(201,168,76,0.15)" }} />
            </div>

            {/* Adresse */}
            <div style={{ marginBottom: "16px" }}>
              <label style={lbl}>Adresse complète</label>
              <div style={{ position: "relative" }}>
                <MapPin size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#C9A84C", opacity: 0.6 }} />
                <input type="text" placeholder="Rue, quartier, numéro..." value={form.address} onChange={set("address")} style={inp}
                  onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")} />
              </div>
            </div>

            {/* Ville + Pays */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              <div>
                <label style={lbl}>Ville</label>
                <div style={{ position: "relative" }}>
                  <MapPin size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#C9A84C", opacity: 0.6 }} />
                  <input type="text" placeholder="Votre ville" value={form.city} onChange={set("city")} style={inp}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")} />
                </div>
              </div>
              <div>
                <label style={lbl}>Pays</label>
                <div style={{ position: "relative" }}>
                  <Globe size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#C9A84C", opacity: 0.6, zIndex: 1 }} />
                  <select value={form.country} onChange={set("country")} style={{ ...inp, paddingLeft: "46px", cursor: "pointer", appearance: "none" }}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")}>
                    {PAYS.map(p => <option key={p} value={p} style={{ background: "#1A1208" }}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Séparateur */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "0 0 28px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(201,168,76,0.15)" }} />
              <p style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#C9A84C", opacity: 0.8 }}>✦ Sécurité du compte</p>
              <div style={{ flex: 1, height: "1px", background: "rgba(201,168,76,0.15)" }} />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: "32px" }}>
              <label style={lbl}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#C9A84C", opacity: 0.6 }} />
                <input required type={showPass ? "text" : "password"} placeholder="Minimum 6 caractères" value={form.password} onChange={set("password")} style={{ ...inp, paddingRight: "48px" }}
                  onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8A8070", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "16px", background: loading ? "#8A8070" : "#C9A84C",
              border: "1px solid #C9A84C", color: "#0A0A0A", fontFamily: '"Montserrat", sans-serif',
              fontSize: "10px", fontWeight: 600, letterSpacing: "4px", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "12px", transition: "all 0.3s",
            }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <><span>Créer mon compte</span><ArrowRight size={14} /></>
              )}
            </button>

            {/* Lien connexion */}
            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "#8A8070" }}>
              Déjà membre ?{" "}
              <Link to="/login" style={{ color: "#C9A84C", textDecoration: "none" }}>Se connecter</Link>
            </p>

          </form>
        </div>

        {/* Contact */}
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "10px", letterSpacing: "2px", color: "#6A5A48" }}>
          Besoin d'aide ?{" "}
          <a href="mailto:luxesensuel11@gmail.com" style={{ color: "#C9A84C", textDecoration: "none" }}>
            luxesensuel11@gmail.com
          </a>
        </p>

      </div>
    </div>
  );
}