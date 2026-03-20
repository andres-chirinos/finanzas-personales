import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface Props {
  onScan: (data: { amount: number, description: string, date: Date }) => void;
  onClose: () => void;
}

const QRScanner: React.FC<Props> = ({ onScan, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string) => {
      // Bolivian Invoice Parser (SIRT/Digital)
      const parts = decodedText.split('|');
      
      if (parts.length >= 5) {
        const amount = parseFloat(parts[4]);
        const dateStr = parts[3]; // format dd/mm/yyyy
        const [day, month, year] = dateStr.split('/');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const description = `Factura ${parts[1]} - NIT ${parts[0]}`;

        scanner.clear().then(() => {
          onScan({ amount, description, date });
        });
      } else {
        const num = parseFloat(decodedText);
        if (!isNaN(num)) {
          scanner.clear().then(() => {
            onScan({ amount: num, description: 'Escaneado', date: new Date() });
          });
        }
      }
    };

    scanner.render(onScanSuccess, (_err) => {});

    return () => {
      scanner.clear().catch(e => console.log("Scanner cleanup", e));
    };
  }, []);

  return (
    <div className="modal-overlay" style={{ background: 'rgba(12,14,20,0.98)', zIndex: 3000 }}>
      <div className="modal-content animate-up" style={{ background: 'transparent', boxShadow: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
          <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>Escanear Factura</h2>
          <button 
            onClick={onClose} 
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="glass-card" style={{ padding: '10px', overflow: 'hidden', background: 'black' }}>
          <div id="reader" style={{ width: '100%' }}></div>
        </div>

        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Camera size={48} style={{ marginBottom: '16px', opacity: 0.3, color: 'var(--primary)' }} />
          <p style={{ fontSize: '15px' }}>Coloca el código QR de la factura dentro del recuadro</p>
          <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>Compatible con facturas digitales de Bolivia</p>
        </div>
        
        {/* Style overrides for html5-qrcode */}
        <style dangerouslySetInnerHTML={{ __html: `
          #reader { border: none !important; }
          #reader__dashboard_section_csr button {
            background: var(--primary) !important;
            color: white !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            margin: 10px 0 !important;
            cursor: pointer !important;
          }
          #reader__status_span { color: white !important; }
          #reader video { border-radius: 8px !important; }
        `}} />
      </div>
    </div>
  );
};

export default QRScanner;
