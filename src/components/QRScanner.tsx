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
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render((decodedText: string) => {
      // Bolivian Invoice Parser (SIRT/Digital)
      // Format: NIT|NroFactura|NroAutorizacion|Fecha|MontoTotal|MontoICE|CodigoControl|NITCliente...
      const parts = decodedText.split('|');
      
      if (parts.length >= 5) {
        const amount = parseFloat(parts[4]);
        const dateStr = parts[3]; // format dd/mm/yyyy
        const [day, month, year] = dateStr.split('/');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const description = `Factura ${parts[1]} - NIT ${parts[0]}`;

        scanner.clear();
        onScan({ amount, description, date });
      } else {
        // Simple amount fallback if it's just a number
        const num = parseFloat(decodedText);
        if (!isNaN(num)) {
          scanner.clear();
          onScan({ amount: num, description: 'Escaneado', date: new Date() });
        }
      }
    }, (err) => {
      // err is common while seeking
    });

    return () => {
      scanner.clear().catch(e => console.error("Scanner clean error", e));
    };
  }, []);

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column', zIndex: 2000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
        <h2 style={{ color: 'white' }}>Escanear Factura</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white' }}>
          <X size={24} />
        </button>
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div id="reader" style={{ width: '100%', maxWidth: '400px', padding: '10px' }}></div>
      </div>

      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
        <Camera size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
        <p>Apunta a la factura de Bolivia (QR SIRT)</p>
      </div>
    </div>
  );
};

export default QRScanner;
