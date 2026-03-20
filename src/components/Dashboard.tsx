import React, { useMemo } from 'react';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

interface Props {
  profileId: string;
  currency: string;
}

const Dashboard: React.FC<Props> = ({ profileId, currency }) => {
  const invoices = useLiveQuery(
    () => db.invoices.where('profileId').equals(profileId).toArray(),
    [profileId]
  );

  const stats = useMemo(() => {
    if (!invoices) return { total: 0, income: 0, expenses: 0 };
    
    let total = 0;
    let income = 0;
    let expenses = 0;
    
    invoices.forEach(inv => {
      total += inv.amount;
      if (inv.amount > 0) income += inv.amount;
      else expenses += Math.abs(inv.amount);
    });
    
    return { total, income, expenses };
  }, [invoices]);

  return (
    <div className="animate-up" style={{ padding: '20px' }}>
      <div className="balance-card glass-card" style={{ padding: '30px', marginBottom: '24px', background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', color: 'white' }}>
        <p style={{ opacity: 0.8, fontSize: '14px', marginBottom: '8px' }}>Balance Total</p>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>
          {currency} {stats.total.toLocaleString()}
        </h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', opacity: 0.9 }}>
          <Wallet size={14} /> 
          En tu cuenta principal
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginBottom: '8px' }}>
            <ArrowUpRight size={18} />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Ingresos</span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '700' }}>{currency} {stats.income.toLocaleString()}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginBottom: '8px' }}>
            <ArrowDownLeft size={18} />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Gastos</span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '700' }}>{currency} {stats.expenses.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Resumen Mensual</h3>
        <div className="glass-card" style={{ padding: '24px' }}>
           <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
             Este mes has registrado <strong>{invoices?.length || 0}</strong> transacciones. 
             {stats.expenses > stats.income ? ' Tus gastos superaron tus ingresos. Considera ajustar tu presupuesto.' : ' ¡Buen trabajo! Tus ahorros están creciendo.'}
           </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
