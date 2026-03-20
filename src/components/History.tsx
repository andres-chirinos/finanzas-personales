import React, { useState } from 'react';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Utensils, Car, Tv, Activity, MoreHorizontal, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import CustomDatePicker from './ui/CustomDatePicker';

interface Props {
  profileId: string;
  currency: string;
  initialCategory?: string;
}

const History: React.FC<Props> = ({ profileId, currency, initialCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');

  React.useEffect(() => {
    if (initialCategory !== undefined) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);
  
  const categories = useLiveQuery(() => db.categories.toArray());

  const invoices = useLiveQuery(
    async () => {
      let query = db.invoices.where('profileId').equals(profileId);
      const results = await query.reverse().sortBy('date');
      
      return results.filter(inv => {
        const matchesSearch = inv.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             inv.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? inv.category === selectedCategory : true;
        
        const invDate = new Date(inv.date).getTime();
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).getTime() + 86400000 : Infinity; // +1 day to include end date
        
        const matchesDate = invDate >= start && invDate <= end;
        
        return matchesSearch && matchesCategory && matchesDate;
      });
    },
    [profileId, searchTerm, selectedCategory, startDate, endDate]
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
          <CustomDatePicker 
            label="Desde"
            value={startDate}
            onChange={setStartDate}
          />
          <CustomDatePicker 
            label="Hasta"
            value={endDate}
            onChange={setEndDate}
          />
        </div>
        
        <div style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', marginLeft: '4px' }}>Categoría</p>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px'
            }}
          >
            <option value="">Todas las categorías</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {invoices?.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
            <p>No se encontraron transacciones.</p>
          </div>
        ) : (
          invoices?.map(invoice => (
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
