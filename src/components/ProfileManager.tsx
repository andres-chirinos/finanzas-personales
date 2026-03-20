import React, { useState } from 'react';
import { db, type Profile } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { User, Plus, Check, Trash2, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import Settings from './Settings';

interface Props {
  currentProfileId: string;
  onSwitch: (id: string) => void;
}

const ProfileManager: React.FC<Props> = ({ currentProfileId, onSwitch }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState('Bs');
  const [view, setView] = useState<'profiles' | 'settings'>('profiles');

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
    if (profiles?.length === 1) return; // Prevent deleting the last profile
    if (confirm('¿Estás seguro de eliminar este perfil? Se borrarán todos sus datos.')) {
      await db.profiles.delete(id);
      await db.invoices.where('profileId').equals(id).delete();
      if (currentProfileId === id) {
        const next = profiles?.find(p => p.id !== id);
        if (next) onSwitch(next.id);
      }
    }
  };

  if (view === 'settings') {
    return (
      <div className="animate-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px' }}>
          <button onClick={() => setView('profiles')} style={{ background: 'none', border: 'none', color: 'white' }}>
            <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Configuración</h2>
        </div>
        <Settings />
      </div>
    );
  }

  return (
    <div className="animate-up" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Mi Perfil</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {profiles?.map(profile => (
          <div 
            key={profile.id} 
            className={`glass-card ${profile.id === currentProfileId ? 'active' : ''}`}
            onClick={() => onSwitch(profile.id)}
            style={{ 
              padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: profile.id === currentProfileId ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="icon-box" style={{ background: profile.id === currentProfileId ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}>
                <User size={24} />
              </div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '16px' }}>{profile.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Moneda: {profile.currency}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {profile.id === currentProfileId ? <Check size={20} color="var(--primary)" /> : null}
              {profiles.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(profile.id); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)' }}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}

        {!isCreating ? (
          <button 
            onClick={() => setIsCreating(true)}
            style={{
              width: '100%', padding: '16px', borderRadius: '16px', border: '1px dashed var(--glass-border)',
              background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Plus size={20} />
            Nuevo Perfil
          </button>
        ) : (
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Nombre del perfil" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                value={newCurrency} 
                onChange={(e) => setNewCurrency(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              >
                <option value="Bs">Bs (Boliviano)</option>
                <option value="USD">$ (Dólar)</option>
                <option value="EUR">€ (Euro)</option>
              </select>
              <button 
                onClick={handleCreate}
                style={{ flex: 1, background: 'var(--primary)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700' }}
              >Crear</button>
            </div>
            <button 
              onClick={() => setIsCreating(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px' }}
            >Cancelar</button>
          </div>
        )}

        <hr style={{ border: 'none', height: '1px', background: 'var(--glass-border)', margin: '10px 0' }} />

        <button 
          onClick={() => setView('settings')}
          className="glass-card"
          style={{ width: '100%', padding: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
        >
          <div className="icon-box" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <SettingsIcon size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '600' }}>Configuración General</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Idioma, Temas y Telemetría</p>
          </div>
          <ChevronRight size={20} style={{ opacity: 0.3 }} />
        </button>
      </div>
    </div>
  );
};

export default ProfileManager;
