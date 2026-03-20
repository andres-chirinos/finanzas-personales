import React, { useState } from 'react';
import { db } from '../lib/db';
import { X, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
}

const AddTransactionModal: React.FC<Props> = ({ isOpen, onClose, categories }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Comida');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;

    await db.invoices.add({
      amount: type === 'income' ? numAmount : -numAmount,
      description,
      category,
      date: new Date(),
      isAnonymized: false
    });

    onClose();
    setAmount('');
    setDescription('');
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', zIndex: 1000
    }}>
      <div className="glass-card animate-up" style={{
        width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        padding: '30px 24px', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Nueva Transacción</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
            <button 
              type="button"
              onClick={() => setType('expense')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: type === 'expense' ? 'var(--danger)' : 'transparent',
                color: 'white', fontWeight: '600'
              }}
            >Gasto</button>
            <button 
              type="button"
              onClick={() => setType('income')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: type === 'income' ? 'var(--success)' : 'transparent',
                color: 'white', fontWeight: '600'
              }}
            >Ingreso</button>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Monto</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              style={{
                width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '24px', fontWeight: '700'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Descripción</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿En qué gastaste?"
              required
              style={{
                width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)', color: 'white'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Categoría</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)', color: 'white'
              }}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name} style={{ background: '#0f172a' }}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            style={{
              width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
              background: 'var(--primary)', color: 'white', fontSize: '16px', fontWeight: '700',
              marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 8px 16px var(--primary-glow)'
            }}
          >
            <Save size={20} />
            Guardar Transacción
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
