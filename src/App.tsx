import React, { useEffect, useState } from 'react';
import { db, seedDatabase } from './lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import AddTransactionModal from './components/AddTransactionModal';
import Settings from './components/Settings';
import { 
  Plus, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Settings as SettingsIcon,
  Home,
  User,
  Utensils,
  Car,
  Tv,
  Activity,
  MoreHorizontal
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Queries
  const invoices = useLiveQuery(() => db.invoices.orderBy('date').reverse().limit(10).toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  
  useEffect(() => {
    seedDatabase();
  }, []);

  const totalBalance = invoices?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const income = invoices?.filter(i => i.amount > 0).reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const expenses = invoices?.filter(i => i.amount < 0).reduce((acc, curr) => acc + curr.amount, 0) || 0;

  const getCategoryIcon = (name: string) => {
    const cat = categories?.find(c => c.name === name);
    switch (cat?.icon) {
      case 'Utensils': return <Utensils size={20} color={cat.color} />;
      case 'Car': return <Car size={20} color={cat.color} />;
      case 'Tv': return <Tv size={20} color={cat.color} />;
      case 'Activity': return <Activity size={20} color={cat.color} />;
      default: return <MoreHorizontal size={20} color={cat?.color || '#fff'} />;
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="icon-box" style={{ background: 'var(--primary)', color: 'white' }}>
            <Wallet size={24} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>Billetera</h1>
        </div>
        <div className="icon-box glass-card" style={{ width: '40px', height: '40px', padding: 0 }}>
          <User size={20} />
        </div>
      </header>

      {activeTab === 'home' && (
        <>
          <div className="balance-card animate-up" style={{ animationDelay: '0.1s' }}>
            <p className="balance-label">Balance Total</p>
            <p className="balance-amount">${totalBalance.toLocaleString()}</p>
            
            <div className="stats-grid" style={{ marginTop: '24px' }}>
              <div className="stat-item">
                <span className="balance-label">Ingresos</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight size={16} color="var(--success)" />
                  <span className="stat-value income">${income.toLocaleString()}</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="balance-label">Gastos</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowDownLeft size={16} color="var(--danger)" />
                  <span className="stat-value expense">${Math.abs(expenses).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-header animate-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: '0.2s' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Transacciones Recientes</h2>
            <span style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Ver todo</span>
          </div>

          <div className="transaction-list animate-up" style={{ animationDelay: '0.3s' }}>
            {!invoices || invoices.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                <p>No hay transacciones aún.</p>
                <p style={{ fontSize: '12px' }}>¡Agrega tu primera factura!</p>
              </div>
            ) : (
              invoices.map(invoice => (
                <div key={invoice.id} className="glass-card transaction-item">
                  <div className="transaction-info">
                    <div className="icon-box">
                      {getCategoryIcon(invoice.category)}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '15px' }}>{invoice.description}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {invoice.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p style={{ 
                    fontWeight: '700', 
                    color: invoice.amount > 0 ? 'var(--success)' : 'var(--text-primary)' 
                  }}>
                    {invoice.amount > 0 ? '+' : ''}{invoice.amount.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'settings' && <Settings />}

      <nav className="nav-bar">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home size={24} />
        </div>
        <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <History size={24} />
        </div>
        <div className="nav-item" onClick={() => setIsModalOpen(true)}>
          <div className="fab">
            <Plus size={32} />
          </div>
        </div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          <Activity size={24} />
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <SettingsIcon size={24} />
        </div>
      </nav>
      
      <div style={{ height: '100px' }}></div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categories={categories || []} 
      />
    </div>
  );
};

export default App;
