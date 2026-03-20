import React from 'react';
import { Calendar } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

const CustomDatePicker: React.FC<Props> = ({ value, onChange, label }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <Calendar size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
        <input 
          type="date" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%', padding: '14px 44px 14px 16px', borderRadius: '14px',
            border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)',
            color: 'white', fontSize: '14px', appearance: 'none', WebkitAppearance: 'none'
          }}
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;
