import React, { useMemo } from 'react';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowUpRight, ArrowDownLeft, PieChart, TrendingUp, Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  profileId: string;
  currency: string;
}

const Stats: React.FC<Props> = ({ profileId, currency }) => {
  const invoices = useLiveQuery(
    () => db.invoices.where('profileId').equals(profileId).toArray(),
    [profileId]
  );
  
  const categories = useLiveQuery(() => db.categories.toArray());

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const analysis = useMemo(() => {
    if (!invoices) return null;

    const catBreakdown: Record<string, number> = {};
    const dailyTrend: Record<string, number> = {};
    const dayOfWeek: Record<number, number> = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let thisWeekExp = 0;
    let lastWeekExp = 0;

    // Initialize daily trend for last 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dailyTrend[d.toISOString().split('T')[0]] = 0;
    }

    invoices.forEach(inv => {
      const date = new Date(inv.date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (inv.amount > 0) {
        totalIncome += inv.amount;
      } else {
        const absAmount = Math.abs(inv.amount);
        totalExpenses += absAmount;
        catBreakdown[inv.category] = (catBreakdown[inv.category] || 0) + absAmount;
        
        if (dailyTrend[dateStr] !== undefined) {
          dailyTrend[dateStr] += absAmount;
        }

        dayOfWeek[date.getDay()] += absAmount;

        if (date >= sevenDaysAgo) {
          thisWeekExp += absAmount;
        } else if (date >= fourteenDaysAgo && date < sevenDaysAgo) {
          lastWeekExp += absAmount;
        }
      }
    });

    const trendData = Object.entries(dailyTrend)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const weekData = Object.entries(dayOfWeek).map(([day, amount]) => ({
      label: dayLabels[parseInt(day)],
      amount
    }));

    const maxTrend = Math.max(...trendData.map(d => d.amount), 1);
    const maxWeek = Math.max(...weekData.map(d => d.amount), 1);

    return {
      income: totalIncome,
      expenses: totalExpenses,
      catBreakdown,
      trendData,
      weekData,
      maxTrend,
      maxWeek,
      thisWeekExp,
      lastWeekExp,
      diffPercent: lastWeekExp === 0 ? 0 : ((thisWeekExp - lastWeekExp) / lastWeekExp) * 100
    };
  }, [invoices]);

  const catData = useMemo(() => {
    if (!analysis) return [];
    const total = analysis.expenses || 1;
    return Object.entries(analysis.catBreakdown)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: (amount / total) * 100,
        color: categories?.find(c => c.name === name)?.color || '#64748b'
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [analysis, categories]);

  if (!analysis) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando análisis...</div>;

  return (
    <div className="animate-up" style={{ padding: '20px', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Análisis de Comportamiento</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Patrones y tendencias de tus últimos 30 días</p>
      </header>

      {/* Primary Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginBottom: '8px' }}>
            <ArrowUpRight size={18} />
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Ingresos Totales</span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '700' }}>{currency} {analysis.income.toLocaleString()}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginBottom: '8px' }}>
            <ArrowDownLeft size={18} />
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Gastos Totales</span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '700' }}>{currency} {analysis.expenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Comparison Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Esta Semana vs Anterior</h3>
            <p style={{ fontSize: '24px', fontWeight: '800', color: analysis.diffPercent > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {analysis.diffPercent > 0 ? '+' : ''}{analysis.diffPercent.toFixed(1)}%
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Semana Actual</p>
            <p style={{ fontWeight: '700' }}>{currency} {analysis.thisWeekExp.toLocaleString()}</p>
          </div>
        </div>
        <div style={{ marginTop: '16px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${Math.min(100, (analysis.thisWeekExp / (analysis.lastWeekExp || 1)) * 50)}%`, 
            height: '100%', 
            background: analysis.diffPercent > 0 ? 'var(--danger)' : 'var(--success)' 
          }} />
        </div>
      </div>

      {/* Spending Trend Chart */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <TrendingUp size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Tendencia de Gasto (30d)</h3>
        </div>
        <div style={{ height: '140px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
          {analysis.trendData.map((d, i) => (
            <motion.div 
              key={d.date}
              initial={{ height: 0 }}
              animate={{ height: `${(d.amount / analysis.maxTrend) * 100}%` }}
              style={{ 
                flex: 1, 
                minWidth: '2px',
                background: 'var(--primary)', 
                borderRadius: '2px 2px 0 0',
                opacity: 0.3 + (i / 30) * 0.7
              }}
              title={`${d.date}: ${currency} ${d.amount}`}
            />
          ))}
        </div>
      </div>

      {/* Behavior by Day of Week */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Calendar size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Actividad por Día</h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', padding: '0 10px' }}>
          {analysis.weekData.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(d.amount / analysis.maxWeek) * 100}px` }}
                style={{ 
                  width: '24px', 
                  background: d.amount === analysis.maxWeek ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                  borderRadius: '6px',
                  boxShadow: d.amount === analysis.maxWeek ? '0 0 15px var(--primary)44' : 'none'
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: '600', color: d.amount === analysis.maxWeek ? 'white' : 'var(--text-secondary)' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <PieChart size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Desglose por Categoría</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {catData.map(item => (
            <div key={item.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600' }}>{item.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{currency} {item.amount.toLocaleString()}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  style={{ height: '100%', background: item.color, borderRadius: '3px' }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, transparent 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Zap size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Insights de Comportamiento</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {analysis.maxWeek === 0 ? 'Todavía no tenemos suficientes datos para analizar tu comportamiento.' : (
              <>
                Tus días de mayor gasto suelen ser los <strong>{analysis.weekData.find(d => d.amount === analysis.maxWeek)?.label === 'S' || analysis.weekData.find(d => d.amount === analysis.maxWeek)?.label === 'D' ? 'fines de semana' : 'días laborables'}</strong>.
                {analysis.diffPercent > 10 ? ' Has aumentado tus gastos considerablemente esta semana comparado con la anterior.' : 
                 analysis.diffPercent < -10 ? ' ¡Felicidades! Has reducido tus gastos notablemente esta semana.' : ' Tu nivel de gasto se mantiene estable.'}
              </>
            )}
          </p>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
            Tip: La categoría "{catData[0]?.name}" representa el {catData[0]?.percent.toFixed(0)}% de tus gastos.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
