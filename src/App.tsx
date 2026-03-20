import React, { useState } from 'react';
import { db } from './lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import Dashboard from './components/Dashboard';
import AddTransactionModal from './components/AddTransactionModal';
import HistoryView from './components/History';
import ProfileManager from './components/ProfileManager';
import CategoryManager from './components/CategoryManager';
import Stats from './components/Stats';
import { 
  Plus, 
  Wallet, 
  History as LucideHistory,
  Settings as SettingsIcon,
  User,
  ChevronDown,
  BarChart3
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'stats' | 'settings'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string | undefined>(undefined);

  const currentProfile = useLiveQuery(() => db.settings.toArray().then(s => s[0]));
  
  const visibleCategories = useLiveQuery(() => 
    db.categories.filter(c => !c.isHidden).sortBy('order')
  );

  const currentProfileId = currentProfile?.currentProfileId || 'default';
  const currency = currentProfile?.currency || 'Bs';

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
          <div className="avatar">
            <User size={20} />
          </div>
          <div>
            <p style={{ fontSize: '12px', opacity: 0.6 }}>Hola,</p>
            <p style={{ fontWeight: '700' }}>Usuario <ChevronDown size={14} /></p>
          </div>
        </div>
        <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px' }}>
          Billetera Personal
        </div>
      </header>

      {isProfileOpen && (
        <ProfileManager 
          currentProfileId={currentProfileId}
          onSwitch={(id) => {
            db.settings.update(1, { currentProfileId: id });
            setIsProfileOpen(false);
          }}
          onClose={() => setIsProfileOpen(false)} 
        />
      )}

      <main className="main-content">
        {activeTab === 'home' && currentProfileId && (
          <Dashboard profileId={currentProfileId} currency={currency} />
        )}
        
        {activeTab === 'history' && currentProfileId && (
          <HistoryView profileId={currentProfileId} currency={currency} initialCategory={historyFilter} />
        )}

        {activeTab === 'stats' && currentProfileId && (
          <Stats profileId={currentProfileId} currency={currency} />
        )}

        {activeTab === 'settings' && currentProfileId && (
          <CategoryManager 
            onViewHistory={(catName) => {
              setHistoryFilter(catName);
              setActiveTab('history');
            }} 
          />
        )}
      </main>

      <nav className="nav-bar">
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Wallet size={24} />
          <span>Inicio</span>
        </div>
        <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <LucideHistory size={24} />
          <span>Historial</span>
        </div>
        <div className="nav-item" onClick={() => setIsModalOpen(true)}>
          <div className="fab">
            <Plus size={32} />
          </div>
        </div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          <BarChart3 size={24} />
          <span>Estadísticas</span>
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <SettingsIcon size={24} />
          <span>Categorías</span>
        </div>
      </nav>

      {currentProfileId && (
        <AddTransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          categories={visibleCategories || []}
          profileId={currentProfileId}
        />
      )}
    </div>
  );
};

export default App;
