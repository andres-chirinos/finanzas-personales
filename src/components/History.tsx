import React, { useState } from 'react';
import { db, type Invoice } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Utensils, Car, Tv, Activity, MoreHorizontal, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Props {
  profileId: string;
  currency: string;
}

const History: React.FC<Props> = ({ profileId, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const invoices = useLiveQuery(
    () => db.invoices
      .where('profileId').equals(profileId)
      .reverse()
      .sortBy('date'),
    [profileId]
  );

  const filteredInvoices = invoices?.filter(inv => 
    inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Comida': return <Utensils size={18} />;
      case 'Transporte': return <Car size={18} />;
      case 'Vivienda': return <MoreHorizontal size={18} />;
      case 'Entretenimiento': return <Tv size={18} />;
      case 'Salud': return <Activity size={18} />;
      default: return <MoreHorizontal size={18} />;
    }
  };

  return (
    <div className="animate-up" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Historial</h2>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar transacciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '14px 14px 14px 44px', borderRadius: '14px', border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredInvoices?.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
            <p>No se encontraron transacciones.</p>
          </div>
        ) : (
          filteredInvoices?.map(invoice => (
            <div key={invoice.id} className="glass-card transaction-item" style={{ padding: '16px' }}>
              <div className="transaction-info">
                <div className="icon-box" style={{ width: '40px', height: '40px' }}>
                  {getCategoryIcon(invoice.category)}
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '15px' }}>{invoice.description}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                    {invoice.date.toLocaleDateString()} • {invoice.category}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'end' }}>
                <p style={{ 
                  fontWeight: '700', 
                  fontSize: '16px',
                  color: invoice.amount > 0 ? 'var(--success)' : 'var(--text-primary)' 
                }}>
                  {invoice.amount > 0 ? '+' : ''}{currency} {Math.abs(invoice.amount).toLocaleString()}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  {invoice.amount > 0 ? <ArrowUpRight size={12} color="var(--success)" /> : <ArrowDownLeft size={12} color="var(--danger)" />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
