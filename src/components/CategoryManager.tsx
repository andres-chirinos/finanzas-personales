import React, { useState } from 'react';
import { db, type Category } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Utensils, 
  Car, 
  Tv, 
  Activity, 
  MoreHorizontal, 
  ShoppingBag, 
  Heart, 
  Coffee,
  Briefcase,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  History,
  TrendingUp
} from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'Utensils', icon: Utensils },
  { name: 'Car', icon: Car },
  { name: 'Tv', icon: Tv },
  { name: 'Activity', icon: Activity },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Heart', icon: Heart },
  { name: 'Coffee', icon: Coffee },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'MoreHorizontal', icon: MoreHorizontal }
];

const COLOR_OPTIONS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'
];

interface Props {
  onViewHistory: (categoryName: string) => void;
}

const CategoryManager: React.FC<Props> = ({ onViewHistory }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('MoreHorizontal');
  const [color, setColor] = useState('#64748b');

  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray());

  const handleSave = async () => {
    if (!name.trim()) return;
    
    if (editingId) {
      await db.categories.update(editingId, { name, icon, color });
    } else {
      const count = await db.categories.count();
      await db.categories.add({ 
        name, icon, color, 
        order: count + 1, 
        isHidden: false 
      });
    }
    
    resetForm();
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id!);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta categoría?')) {
      await db.categories.delete(id);
    }
  };

  const toggleVisibility = async (cat: Category) => {
    await db.categories.update(cat.id!, { isHidden: !cat.isHidden });
  };

  const moveOrder = async (cat: Category, direction: 'up' | 'down') => {
    if (!categories) return;
    const index = categories.findIndex(c => c.id === cat.id);
    const otherIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (otherIndex < 0 || otherIndex >= categories.length) return;
    
    const otherCat = categories[otherIndex];
    await db.transaction('rw', db.categories, async () => {
      await db.categories.update(cat.id!, { order: otherCat.order });
      await db.categories.update(otherCat.id!, { order: cat.order });
    });
  };

  const sortByMostUsed = async () => {
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
    
    const recentInvoices = await db.invoices
      .where('date')
      .above(thirtyOneDaysAgo)
      .toArray();
    
    const counts: Record<string, number> = {};
    recentInvoices.forEach(inv => {
      counts[inv.category] = (counts[inv.category] || 0) + 1;
    });
    
    if (!categories) return;
    
    const sortedCats = [...categories].sort((a, b) => {
      const countA = counts[a.name] || 0;
      const countB = counts[b.name] || 0;
      return countB - countA;
    });
    
    await db.transaction('rw', db.categories, async () => {
      for (let i = 0; i < sortedCats.length; i++) {
        await db.categories.update(sortedCats[i].id!, { order: i + 1 });
      }
    });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setIcon('MoreHorizontal');
    setColor('#64748b');
  };

  const getIconComponent = (iconName: string) => {
    const found = ICON_OPTIONS.find(i => i.name === iconName);
    const IconComp = found ? found.icon : MoreHorizontal;
    return <IconComp size={20} />;
  };

  return (
    <div className="animate-up" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Categorías</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={sortByMostUsed}
            className="glass-card"
            style={{ 
              padding: '8px', borderRadius: '12px', border: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)'
            }}
          >
            <TrendingUp size={16} /> Más usadas
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            style={{ 
              background: 'var(--primary)', color: 'white', border: 'none', 
              padding: '8px 16px', borderRadius: '12px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Plus size={18} /> Nueva
          </button>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px', marginLeft: '4px' }}>
        Las categorías ocultas no aparecerán al registrar nuevas transacciones.
      </p>

      {isAdding && (
        <div className="glass-card animate-up" style={{ padding: '20px', marginBottom: '24px', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{editingId ? 'Editar' : 'Nueva'} Categoría</h3>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Nombre de la categoría" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ICON_OPTIONS.map(opt => (
                <button 
                  key={opt.name}
                  onClick={() => setIcon(opt.name)}
                  style={{
                    padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                    background: icon === opt.name ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: 'white'
                  }}
                >
                  <opt.icon size={20} />
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map(c => (
                <button 
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', border: color === c ? '2px solid white' : 'none',
                    background: c
                  }}
                />
              ))}
            </div>

            <button 
              onClick={handleSave}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '700' }}
            >
              {editingId ? 'Actualizar' : 'Crear Categoría'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categories?.map((cat, idx) => (
          <div key={cat.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: cat.isHidden ? 0.5 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="icon-box" style={{ background: 'rgba(255,255,255,0.05)', color: cat.color }}>
                {getIconComponent(cat.icon)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600' }}>{cat.name}</span>
                {cat.isHidden && <span style={{ fontSize: '10px', color: 'var(--danger)' }}>Oculta</span>}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button onClick={() => moveOrder(cat, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', color: 'white', opacity: idx === 0 ? 0.1 : 0.4 }}>
                  <ChevronUp size={16} />
                </button>
                <button onClick={() => moveOrder(cat, 'down')} disabled={idx === categories.length - 1} style={{ background: 'none', border: 'none', color: 'white', opacity: idx === categories.length - 1 ? 0.1 : 0.4 }}>
                  <ChevronDown size={16} />
                </button>
              </div>
              
              <button onClick={() => onViewHistory(cat.name)} style={{ background: 'none', border: 'none', color: 'var(--primary)', opacity: 0.8 }}>
                <History size={18} />
              </button>

              <button onClick={() => toggleVisibility(cat)} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.4 }}>
                {cat.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              
              <button onClick={() => handleEdit(cat)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)' }}>
                <Edit2 size={18} />
              </button>
              
              <button onClick={() => handleDelete(cat.id!)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
