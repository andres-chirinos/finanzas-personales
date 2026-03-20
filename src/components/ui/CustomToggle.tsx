import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  isOn: boolean;
  onToggle: () => void;
  label?: string;
}

const CustomToggle: React.FC<Props> = ({ isOn, onToggle, label }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onToggle}>
      {label && <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>}
      <div style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: isOn ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        padding: '2px', position: 'relative', transition: 'background 0.3s ease'
      }}>
        <motion.div 
          animate={{ x: isOn ? 20 : 0 }}
          style={{
            width: '20px', height: '200%', maxHeight: '20px', borderRadius: '50%',
            background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      </div>
    </div>
  );
};

export default CustomToggle;
