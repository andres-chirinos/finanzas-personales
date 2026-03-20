import React from 'react';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Shield, ShieldCheck, Database, Info } from 'lucide-react';

const Settings: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.toArray());
  const currentSettings = settings?.[0];

  const toggleContribution = async () => {
    if (currentSettings?.id) {
      await db.settings.update(currentSettings.id, {
        contributeAnonymously: !currentSettings.contributeAnonymously
      });
    }
  };

  return (
    <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Configuración</h2>
      
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
              <Shield size={20} />
            </div>
            <div>
              <p style={{ fontWeight: '600' }}>Privacidad y Datos</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Controla tu información</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontWeight: '600', fontSize: '15px' }}>Contribuir Anónimamente</p>
            <div 
              onClick={toggleContribution}
              style={{
                width: '50px', height: '28px', borderRadius: '14px',
                background: currentSettings?.contributeAnonymously ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease'
              }}
            >
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%', background: 'white',
                position: 'absolute', top: '2px', left: currentSettings?.contributeAnonymously ? '24px' : '2px',
                transition: 'left 0.3s ease'
              }}></div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Al activar esto, tus facturas se compartirán de forma 100% anónima para ayudar a contrastar precios y tendencias de mercado. Jamás se enviará información personal.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--success)', fontSize: '13px', fontWeight: '500' }}>
          <ShieldCheck size={16} />
          <span>Tus datos locales están encriptados en el dispositivo.</span>
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="icon-box" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Database size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600' }}>Base de Datos</p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>IndexedDB (Local-First)</p>
        </div>
        <button style={{ 
          background: 'none', border: '1px solid var(--glass-border)', color: 'white', 
          padding: '8px 16px', borderRadius: '10px', fontSize: '12px' 
        }}>Exportar JSON</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px', opacity: 0.7 }}>
        <Info size={16} style={{ marginTop: '2px' }} />
        <p style={{ fontSize: '12px' }}>
          Esta aplicación es independiente y funciona sin internet. El despliegue en GitHub Pages sirve como PWA (Progresive Web App).
        </p>
      </div>
    </div>
  );
};

export default Settings;
