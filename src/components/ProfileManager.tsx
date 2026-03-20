import React, { useState } from 'react';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { User, Plus, Trash2, ChevronRight, Settings as SettingsIcon, X, Check } from 'lucide-react';
import Settings from './Settings';

interface Props {
  currentProfileId: string;
  onSwitch: (id: string) => void;
  onClose: () => void;
}

const ProfileManager: React.FC<Props> = ({ currentProfileId, onSwitch, onClose }) => {
  const [view, setView] = useState<'profiles' | 'settings'>('profiles');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState('Bs');

  const profiles = useLiveQuery(() => db.profiles.toArray());

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const id = crypto.randomUUID();
    await db.profiles.add({
      id,
      name: newName,
      currency: newCurrency,
      createdAt: new Date()
    });
    setNewName('');
    setIsCreating(false);
    onSwitch(id);
  };

  const handleDelete = async (id: string) => {
    if (profiles?.length === 1) return;
    if (confirm('¿Eliminar este perfil y todos sus datos?')) {
      await db.transaction('rw', [db.profiles, db.invoices], async () => {
        await db.invoices.where('profileId').equals(id).delete();
        await db.profiles.delete(id);
        if (currentProfileId === id) {
          const remaining = await db.profiles.toArray();
          onSwitch(remaining[0].id);
        }
      });
    }
  };

  if (view === 'settings') {
    return (
      <div 
        className="profile-overlay animate-down" 
        style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          zIndex: 1500, background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <button onClick={() => setView('profiles')} style={{ background: 'none', border: 'none', color: 'white', padding: '10px' }}>
            <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Configuración</h2>
        </div>
        <div style={{ paddingBottom: '40px' }}>
          <Settings />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="profile-overlay animate-down" 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1500, 
        background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', paddingBottom: '30px'
      }}
    >
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Perfiles</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', padding: '10px' }}>
          <X size={24} />
        </button>
      </div>
      
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
          {profiles?.map(profile => (
            <div 
              key={profile.id} 
              className={`glass-card ${profile.id === currentProfileId ? 'active' : ''}`}
              onClick={() => onSwitch(profile.id)}
              style={{ 
                minWidth: '140px', padding: '16px', cursor: 'pointer', textAlign: 'center',
                border: profile.id === currentProfileId ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                background: profile.id === currentProfileId ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
                position: 'relative'
              }}
            >
              <div className="icon-box" style={{ background: profile.id === currentProfileId ? 'var(--primary)' : 'rgba(255,255,255,0.1)', margin: '0 auto 12px' }}>
                <User size={20} />
              </div>
              <p style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{profile.currency}</p>
              
              {profile.id === currentProfileId && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--primary)' }}>
                  <Check size={14} />
                </div>
              )}
            </div>
          ))}

          <button 
            onClick={() => setIsCreating(true)}
            style={{
              minWidth: '140px', padding: '16px', borderRadius: '16px', border: '1px dashed var(--glass-border)',
              background: 'transparent', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Plus size={20} />
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Nuevo</span>
          </button>
        </div>

        {isCreating && (
          <div className="glass-card animate-up" style={{ padding: '20px', border: '1px solid var(--primary)' }}>
            <input 
              type="text" 
              placeholder="Nombre del perfil" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                value={newCurrency} 
                onChange={(e) => setNewCurrency(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              >
                <option value="Bs">Bs</option>
                <option value="USD">$</option>
                <option value="EUR">€</option>
              </select>
              <button 
                onClick={handleCreate}
                style={{ flex: 1, background: 'var(--primary)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700' }}
              >Crear</button>
            </div>
            <button 
              onClick={() => setIsCreating(false)}
              style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px' }}
            >Cancelar</button>
          </div>
        )}

        <button 
          onClick={() => setView('settings')}
          style={{ 
            width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', 
            border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' 
          }}
        >
          <SettingsIcon size={18} />
          <span style={{ fontWeight: '600' }}>Configuración General</span>
        </button>

        {profiles && profiles.length > 1 && (
           <button 
             onClick={() => handleDelete(currentProfileId)}
             style={{ 
               background: 'none', border: 'none', color: 'var(--danger)', 
               fontSize: '13px', opacity: 0.6, marginTop: '10px',
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
             }}
           >
             <Trash2 size={14} />
             Eliminar perfil actual
           </button>
        )}
      </div>
    </div>
  );
};

export default ProfileManager;
