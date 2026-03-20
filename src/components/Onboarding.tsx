import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  QrCode, 
  BarChart3, 
  ChevronRight, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { db } from '../lib/db';

const slides = [
  {
    title: "Bienvenido a tu Billetera Personal",
    description: "La forma más elegante y sencilla de tomar el control total de tus finanzas diarias.",
    icon: <Wallet size={48} className="text-primary" />,
    color: "var(--primary)"
  },
  {
    title: "Escaneo Inteligente",
    description: "¿Tienes una factura? Solo escanea el código QR y nosotros nos encargamos del resto. Sin complicaciones.",
    icon: <QrCode size={48} style={{ color: '#10b981' }} />,
    color: "#10b981"
  },
  {
    title: "Análisis Premium",
    description: "Visualiza tus hábitos de gasto con gráficos detallados y optimiza tu ahorro mes a mes.",
    icon: <BarChart3 size={48} style={{ color: '#f59e0b' }} />,
    color: "#f59e0b"
  }
];

interface Props {
  onComplete: () => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      // Mark as completed in DB
      const settings = await db.settings.toCollection().first();
      if (settings) {
        await db.settings.update(settings.id!, { hasCompletedOnboarding: true });
      }
      onComplete();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'var(--bg-color)',
      zIndex: 5000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        background: `radial-gradient(circle, ${slides[currentSlide].color}20 0%, transparent 70%)`,
        filter: 'blur(40px)',
        zIndex: -1,
        transition: 'background 0.5s ease'
      }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '400px' }}
        >
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '30px', 
            background: 'rgba(255,255,255,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            {slides[currentSlide].icon}
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
            {slides[currentSlide].title}
          </h1>
          
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px' }}>
            {slides[currentSlide].description}
          </p>
        </motion.div>
      </AnimatePresence>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '40px' }}>
          {slides.map((_, i) => (
            <div 
              key={i} 
              style={{ 
                width: i === currentSlide ? '24px' : '8px', 
                height: '8px', 
                borderRadius: '4px', 
                background: i === currentSlide ? slides[currentSlide].color : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }} 
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="submit-btn"
          style={{ 
            background: currentSlide === slides.length - 1 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
            border: currentSlide === slides.length - 1 ? 'none' : '1px solid var(--glass-border)',
            boxShadow: currentSlide === slides.length - 1 ? '0 8px 30px var(--primary-glow)' : 'none'
          }}
        >
          {currentSlide === slides.length - 1 ? (
            <>¡Empezar ahora! <Sparkles size={20} /></>
          ) : (
            <>Siguiente <ChevronRight size={20} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
