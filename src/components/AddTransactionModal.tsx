import React, { useState } from 'react';
import { db, type Category } from '../lib/db';
import { X, Save, QrCode } from 'lucide-react';
import CustomDatePicker from './ui/CustomDatePicker';
import QRScanner from './QRScanner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  profileId: string;
}

const AddTransactionModal: React.FC<Props> = ({ isOpen, onClose, categories, profileId }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Comida');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showScanner, setShowScanner] = useState(false);

  if (!isOpen) return null;

  const handleScan = (data: { amount: number, description: string, date: Date }) => {
    setAmount(data.amount.toString());
    setDescription(data.description);
    setDate(data.date.toISOString().split('T')[0]);
    setType('expense');
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;

    await db.invoices.add({
      profileId,
      amount: type === 'income' ? numAmount : -numAmount,
      description,
      category,
      date: new Date(date),
      isAnonymized: false
    });

    onClose();
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card animate-up" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Registrar Transacción</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        {showScanner ? (
          <QRScanner 
            onScan={handleScan} 
            onClose={() => setShowScanner(false)} 
          />
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="type-selector">
              <button 
                type="button"
                className={type === 'expense' ? 'active expense' : ''} 
                onClick={() => setType('expense')}
              >Gasto</button>
              <button 
                type="button"
                className={type === 'income' ? 'active income' : ''} 
                onClick={() => setType('income')}
              >Ingreso</button>
            </div>

            <button 
              type="button"
              onClick={() => setShowScanner(true)}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px', border: '2px dashed var(--glass-border)',
                background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <QrCode size={20} /> Escanear Factura
            </button>

            <CustomDatePicker 
              label="Fecha"
              value={date}
              onChange={setDate}
            />

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Monto</label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="premium-input"
                style={{ fontSize: '24px', fontWeight: '700' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Descripción</label>
              <input 
                type="text" 
                placeholder="¿En qué gastaste?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="premium-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Categoría</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="premium-input"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '12px' }}>
              <Save size={20} /> Guardar Transacción
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddTransactionModal;
