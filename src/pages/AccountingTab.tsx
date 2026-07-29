// ============================================================================
//  Comptabilité & Trésorerie — onglet Admin
//  Vision automatique : CA, coût marchandises, marge, bénéfice, TVA, impôt
//  par mois / par an / par produit, en FCFA. Adapté à la fiscalité ivoirienne.
//  Les provisions fiscales sont des ESTIMATIONS paramétrables (écran Réglages),
//  à faire valider par un expert-comptable avant déclaration à la DGI.
// ============================================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calculator, Download, RefreshCw, Plus, Trash2, Settings2, AlertTriangle } from 'lucide-react';

interface Props { apiUrl: string; token: string | null; }

interface Summary {
  orders_count: number;
  margin_pct: number;
  impot_label: string;
  tva_applicable: boolean;
  domestic_revenue_xof: number;
  export_revenue_xof: number;
  xof: {
    revenue: number; ca_ht: number; cash_in: number; cogs: number; payment_fees: number;
    gross_profit: number; net_before_tax: number; tva_collected: number; impot: number; net_after_tax: number;
  };
}
interface PeriodRow {
  label: string; orders: number; revenue_xof: number; cogs_xof: number;
  gross_profit_xof: number; tva_collected_xof: number; impot_xof: number; net_after_tax_xof: number;
}
interface ProductRow {
  product_id: string | null; name: string; qty: number;
  revenue_xof: number; cogs_xof: number; profit_xof: number; margin_pct: number;
}
interface Movement {
  id: string; direction: 'in' | 'out'; category: string;
  amount_xof: number; label: string | null; occurred_at: string;
}
interface Treasury {
  balance_xof: number; total_in_xof: number; total_out_xof: number; movements: Movement[];
}
type Settings = Record<string, string | number | boolean>;

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0));
const fcfa = (n: number) => `${fmt(n)} FCFA`;

const CAT_LABELS: Record<string, string> = {
  sale: 'Vente', supplier: 'Paiement fournisseur', payment_fee: 'Frais de paiement',
  tax: 'Impôt / TVA payé', capital: 'Apport de capital', refund: 'Remboursement',
  withdrawal: 'Retrait', other: 'Autre',
};

export function AccountingTab({ apiUrl, token }: Props) {
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }),
    [token]
  );

  // Période sélectionnée
  const now = new Date();
  const presets = useMemo(() => {
    const y = now.getFullYear();
    const m = now.getMonth();
    return {
      month: {
        label: 'Mois en cours',
        from: new Date(Date.UTC(y, m, 1)).toISOString(),
        to: new Date(Date.UTC(y, m + 1, 1)).toISOString(),
      },
      year: {
        label: 'Année en cours',
        from: new Date(Date.UTC(y, 0, 1)).toISOString(),
        to: new Date(Date.UTC(y + 1, 0, 1)).toISOString(),
      },
      all: { label: 'Tout', from: new Date(Date.UTC(2020, 0, 1)).toISOString(), to: new Date(Date.UTC(y + 1, 0, 1)).toISOString() },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [rangeKey, setRangeKey] = useState<'month' | 'year' | 'all'>('year');
  const range = presets[rangeKey];

  const [summary, setSummary] = useState<Summary | null>(null);
  const [periods, setPeriods] = useState<PeriodRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const yearRange = presets.year;
      const [s, p, pr, tr] = await Promise.all([
        fetch(`${apiUrl}/accounting/summary?from=${range.from}&to=${range.to}`, { headers }).then(r => r.json()),
        fetch(`${apiUrl}/accounting/periods?granularity=month&from=${yearRange.from}&to=${yearRange.to}`, { headers }).then(r => r.json()),
        fetch(`${apiUrl}/accounting/products?from=${range.from}&to=${range.to}`, { headers }).then(r => r.json()),
        fetch(`${apiUrl}/accounting/treasury`, { headers }).then(r => r.json()),
      ]);
      setSummary(s);
      setPeriods(p.rows || []);
      setProducts(pr.products || []);
      setTreasury(tr);
    } catch {
      setMsg('Erreur de chargement de la comptabilité');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, headers, token, range.from, range.to, presets.year]);

  useEffect(() => { load(); }, [load]);

  const loadSettings = useCallback(async () => {
    try {
      const r = await fetch(`${apiUrl}/accounting/settings`, { headers }).then(r => r.json());
      setSettings(r.settings);
    } catch { setMsg('Erreur chargement réglages'); }
  }, [apiUrl, headers]);

  const openSettings = () => { setShowSettings(true); if (!settings) loadSettings(); };

  const saveSettings = async () => {
    if (!settings) return;
    try {
      const r = await fetch(`${apiUrl}/accounting/settings`, {
        method: 'PUT', headers, body: JSON.stringify(settings),
      }).then(r => r.json());
      setSettings(r.settings);
      setShowSettings(false);
      setMsg('Réglages enregistrés — recalcul en cours');
      load();
    } catch { setMsg('Erreur enregistrement réglages'); }
  };

  // Formulaire mouvement de trésorerie
  const [mv, setMv] = useState({ direction: 'out', category: 'supplier', amount_xof: '', label: '' });
  const addMovement = async () => {
    const amount = parseFloat(mv.amount_xof);
    if (!amount || amount <= 0) { setMsg('Montant invalide'); return; }
    try {
      await fetch(`${apiUrl}/accounting/treasury`, {
        method: 'POST', headers,
        body: JSON.stringify({ ...mv, amount_xof: amount }),
      });
      setMv({ direction: 'out', category: 'supplier', amount_xof: '', label: '' });
      const tr = await fetch(`${apiUrl}/accounting/treasury`, { headers }).then(r => r.json());
      setTreasury(tr);
    } catch { setMsg('Erreur ajout mouvement'); }
  };
  const delMovement = async (id: string) => {
    try {
      await fetch(`${apiUrl}/accounting/treasury/${id}`, { method: 'DELETE', headers });
      const tr = await fetch(`${apiUrl}/accounting/treasury`, { headers }).then(r => r.json());
      setTreasury(tr);
    } catch { setMsg('Erreur suppression'); }
  };

  const exportCsv = () => {
    // Ouvre l'URL avec le token en query n'est pas possible (auth Bearer) → fetch + blob
    fetch(`${apiUrl}/accounting/export.csv?from=${range.from}&to=${range.to}`, { headers })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'comptabilite-luxedrop.csv';
        a.click(); URL.revokeObjectURL(url);
      })
      .catch(() => setMsg('Erreur export CSV'));
  };

  const card = (title: string, value: string, color: string, sub?: string) => (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0', flex: '1 1 200px', minWidth: 200 }}>
      <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</p>
      <p style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700, color }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{sub}</p>}
    </div>
  );

  const s = summary?.xof;

  return (
    <div style={{ padding: 8 }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calculator size={24} color="#9333ea" />
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#1e293b' }}>Comptabilité &amp; Trésorerie</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['month', 'year', 'all'] as const).map(k => (
            <button key={k} onClick={() => setRangeKey(k)} style={{
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
              border: '1px solid ' + (rangeKey === k ? '#9333ea' : '#e2e8f0'),
              background: rangeKey === k ? '#faf5ff' : 'white', color: rangeKey === k ? '#9333ea' : '#64748b',
            }}>{presets[k].label}</button>
          ))}
          <button onClick={load} style={btn('#6366f1')}><RefreshCw size={15} /> Actualiser</button>
          <button onClick={exportCsv} style={btn('#0ea5e9')}><Download size={15} /> Export CSV</button>
          <button onClick={openSettings} style={btn('#64748b')}><Settings2 size={15} /> Réglages fiscaux</button>
        </div>
      </div>

      {msg && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {msg} <button onClick={() => setMsg(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#92400e' }}>✕</button>
        </div>
      )}

      {/* Avertissement fiscal */}
      <div style={{ display: 'flex', gap: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px 14px', borderRadius: 10, marginBottom: 20, fontSize: 13 }}>
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Chiffres calculés automatiquement à partir des commandes payées. Les provisions de <b>TVA</b> et d'<b>impôt</b> sont des
          estimations basées sur tes <b>Réglages fiscaux</b> ({summary?.impot_label || '—'}) — à faire <b>valider par un expert-comptable</b> avant
          toute déclaration à la DGI. Ne couvre pas la patente, la CNPS ni les acomptes provisionnels.
        </span>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Chargement…</p>}

      {/* KPI */}
      {s && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
          {card("Chiffre d'affaires HT", fcfa(s.ca_ht), '#0f172a', `${summary!.orders_count} commande(s)`)}
          {card('Encaissé (TTC)', fcfa(s.cash_in), '#1d4ed8', summary!.tva_applicable ? 'TVA comprise' : 'pas de TVA')}
          {card('Coût marchandises', fcfa(s.cogs), '#b45309')}
          {card('Marge brute', fcfa(s.gross_profit), '#0d9488', `${summary!.margin_pct}% du CA`)}
          {card('Frais de paiement', fcfa(s.payment_fees), '#7c3aed')}
          {card('Bénéfice net estimé', fcfa(s.net_after_tax), s.net_after_tax >= 0 ? '#16a34a' : '#dc2626', 'après impôt')}
          {card('TVA à reverser', summary!.tva_applicable ? fcfa(s.tva_collected) : 'Non assujetti', '#ea580c')}
          {card('Impôt provisionné', fcfa(s.impot), '#be123c', summary!.impot_label)}
          {card('Dont export (exonéré)', fcfa(summary!.export_revenue_xof), '#475569', `National : ${fcfa(summary!.domestic_revenue_xof)}`)}
        </div>
      )}

      {/* Évolution mensuelle (année en cours) */}
      <Section title="Évolution mensuelle (année en cours)">
        <Table
          head={['Mois', 'Cmd', 'CA', 'Coût march.', 'Marge brute', 'TVA', 'Impôt', 'Bénéfice net']}
          rows={periods.map(p => [
            p.label, String(p.orders), fcfa(p.revenue_xof), fcfa(p.cogs_xof), fcfa(p.gross_profit_xof),
            fcfa(p.tva_collected_xof), fcfa(p.impot_xof), fcfa(p.net_after_tax_xof),
          ])}
          empty="Aucune vente enregistrée cette année."
        />
      </Section>

      {/* Par produit */}
      <Section title="Rentabilité par produit (période sélectionnée)">
        <Table
          head={['Produit', 'Qté', 'CA', 'Coût march.', 'Bénéfice', 'Marge %']}
          rows={products.map(p => [
            p.name, String(p.qty), fcfa(p.revenue_xof), fcfa(p.cogs_xof), fcfa(p.profit_xof), `${p.margin_pct}%`,
          ])}
          empty="Aucune vente sur la période."
        />
      </Section>

      {/* Trésorerie */}
      <Section title="Trésorerie (mouvements manuels)">
        {treasury && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
            {card('Solde de trésorerie', fcfa(treasury.balance_xof), treasury.balance_xof >= 0 ? '#16a34a' : '#dc2626')}
            {card('Total entrées', fcfa(treasury.total_in_xof), '#0d9488')}
            {card('Total sorties', fcfa(treasury.total_out_xof), '#b45309')}
          </div>
        )}
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 12px' }}>
          Saisis ici tes vrais flux de caisse : apport de capital, paiements fournisseurs, impôts payés, retraits…
          Le CA ci-dessus est calculé depuis les commandes ; cette section suit l'argent réellement encaissé/décaissé.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16, background: '#f8fafc', padding: 12, borderRadius: 10 }}>
          <select value={mv.direction} onChange={e => setMv({ ...mv, direction: e.target.value })} style={inp}>
            <option value="out">Sortie</option>
            <option value="in">Entrée</option>
          </select>
          <select value={mv.category} onChange={e => setMv({ ...mv, category: e.target.value })} style={inp}>
            {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input placeholder="Montant FCFA" value={mv.amount_xof} inputMode="numeric"
            onChange={e => setMv({ ...mv, amount_xof: e.target.value.replace(/[^\d.]/g, '') })} style={{ ...inp, width: 130 }} />
          <input placeholder="Libellé (optionnel)" value={mv.label}
            onChange={e => setMv({ ...mv, label: e.target.value })} style={{ ...inp, flex: 1, minWidth: 160 }} />
          <button onClick={addMovement} style={btn('#16a34a')}><Plus size={15} /> Ajouter</button>
        </div>
        <Table
          head={['Date', 'Sens', 'Catégorie', 'Libellé', 'Montant', '']}
          rows={(treasury?.movements || []).map(m => [
            new Date(m.occurred_at).toLocaleDateString('fr-FR'),
            m.direction === 'in' ? '↑ Entrée' : '↓ Sortie',
            CAT_LABELS[m.category] || m.category,
            m.label || '—',
            fcfa(m.amount_xof),
            <button key={m.id} onClick={() => delMovement(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={15} /></button>,
          ])}
          empty="Aucun mouvement de trésorerie enregistré."
        />
      </Section>

      {/* Panneau Réglages fiscaux */}
      {showSettings && settings && (
        <div style={overlay} onClick={() => setShowSettings(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Réglages fiscaux</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
              Configuration Côte d'Ivoire. À ajuster avec ton expert-comptable une fois DWAD GROUP SARLU immatriculée.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {sField('Nom de la société', 'company_name', settings, setSettings, 'text')}
              {sField('Capital (FCFA)', 'capital_xof', settings, setSettings, 'number')}
              {sSelect('Régime fiscal', 'regime', settings, setSettings, [
                ['ENTREPRENANT', 'Entreprenant (CA ≤ 50M)'],
                ['RME', 'Microentreprise / IME (50–200M)'],
                ['RSI', 'Réel simplifié (200–500M)'],
                ['RNI', 'Réel normal (> 500M)'],
              ])}
              {sBool('Adhérent CGA (IME réduit)', 'cga_member', settings, setSettings)}
              {sBool('Assujetti à la TVA', 'tva_applicable', settings, setSettings)}
              {sField('Taux TVA (ex. 0.18)', 'tva_rate', settings, setSettings, 'number')}
              {sSelect('Traitement de la TVA', 'tva_mode', settings, setSettings, [
                ['ajoutee', 'Ajoutée au prix (le client la paie en plus)'],
                ['incluse', 'Incluse dans le prix (TTC, prélevée dessus)'],
              ])}
              {sBool('Export exonéré de TVA', 'export_vat_exempt', settings, setSettings)}
              {sField('Taux IME (ex. 0.06)', 'ime_rate', settings, setSettings, 'number')}
              {sField('Taux IME CGA (ex. 0.04)', 'ime_rate_cga', settings, setSettings, 'number')}
              {sField('Taux IS (ex. 0.25)', 'is_rate', settings, setSettings, 'number')}
              {sField('Frais paiement (ex. 0.05)', 'payment_fee_rate', settings, setSettings, 'number')}
              {sField('Taux USD → FCFA', 'fx_rate_usd_xof', settings, setSettings, 'number')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowSettings(false)} style={{ ...btn('#e2e8f0'), color: '#334155' }}>Annuler</button>
              <button onClick={saveSettings} style={btn('#9333ea')}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sous-composants & helpers ──────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>{title}</h3>
      {children}
    </div>
  );
}

function Table({ head, rows, empty }: { head: string[]; rows: (React.ReactNode)[][]; empty: string }) {
  if (!rows.length) return <p style={{ color: '#94a3b8', fontSize: 14 }}>{empty}</p>;
  return (
    <div style={{ overflowX: 'auto', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>{head.map((h, i) => (
            <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '10px 14px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>{r.map((c, ci) => (
              <td key={ci} style={{ textAlign: ci === 0 ? 'left' : 'right', padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', whiteSpace: ci === 0 ? 'normal' : 'nowrap' }}>{c}</td>
            ))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const btn = (bg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: bg,
  color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
});
const inp: React.CSSProperties = {
  padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: 'white',
};
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};
const modal: React.CSSProperties = {
  background: 'white', borderRadius: 16, padding: 24, width: 'min(640px, 100%)',
  maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

function sLabel(text: string) {
  return <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4, display: 'block' }}>{text}</span>;
}
function sField(label: string, key: string, s: Settings, set: (v: Settings) => void, type: string) {
  return (
    <label>{sLabel(label)}
      <input type={type} value={String(s[key] ?? '')} style={{ ...inp, width: '100%' }}
        onChange={e => set({ ...s, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />
    </label>
  );
}
function sBool(label: string, key: string, s: Settings, set: (v: Settings) => void) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'end', paddingBottom: 8 }}>
      <input type="checkbox" checked={!!s[key]} onChange={e => set({ ...s, [key]: e.target.checked })} />
      <span style={{ fontSize: 13, color: '#334155' }}>{label}</span>
    </label>
  );
}
function sSelect(label: string, key: string, s: Settings, set: (v: Settings) => void, opts: [string, string][]) {
  return (
    <label>{sLabel(label)}
      <select value={String(s[key] ?? '')} style={{ ...inp, width: '100%' }}
        onChange={e => set({ ...s, [key]: e.target.value })}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
