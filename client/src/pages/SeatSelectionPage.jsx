import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SeatSelectionPage = ({ event, setBookingDetails }) => {
  const navigate = useNavigate();
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = React.useRef(null);

  const vipPrice = event?.pricingTiers?.vip?.price || 450;
  const goldPrice = event?.pricingTiers?.gold?.price || 250;
  const silverPrice = event?.pricingTiers?.silver?.price || 150;
  const standardPrice = event?.pricingTiers?.standard?.price || 100;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const padding = window.innerWidth < 768 ? 24 : 48;
        const parentWidth = containerRef.current.clientWidth - padding;
        const newScale = Math.min(1, parentWidth / 820);
        setScale(newScale);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [loading]);

  useEffect(() => {
    if (!event) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/bookings/event/${event._id}/occupied-seats`)
      .then(res => res.json())
      .then(data => {
        setOccupiedSeats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching occupied seats:', err);
        setOccupiedSeats([]);
        setLoading(false);
      });
  }, [event]);

  const generateSeats = () => {
    const list = [];
    const spacing = 28;

    // LEFT INNER
    for (let col = 1; col <= 2; col++) {
      const x = 238 + (col - 1) * spacing;
      for (let i = 1; i <= 20; i++) {
        list.push({ id: `L-Gold-Col${col}-${i}`, label: `Left Gold C${col} R${i}`, num: i, type: 'Gold', price: goldPrice, color: '#ffb800', x, y: 180 + (i - 1) * spacing });
      }
    }
    for (let col = 1; col <= 2; col++) {
      const x = 294 + (col - 1) * spacing;
      for (let i = 1; i <= 20; i++) {
        list.push({ id: `L-VIP-Col${col}-${i}`, label: `Left VIP C${col} R${i}`, num: i, type: 'VIP', price: vipPrice, color: '#ff2a8d', x, y: 180 + (i - 1) * spacing });
      }
    }

    // RIGHT INNER
    for (let col = 1; col <= 2; col++) {
      const x = 473 + (col - 1) * spacing;
      for (let i = 1; i <= 20; i++) {
        list.push({ id: `R-VIP-Col${col}-${i}`, label: `Right VIP C${col} R${i}`, num: i, type: 'VIP', price: vipPrice, color: '#ff2a8d', x, y: 180 + (i - 1) * spacing });
      }
    }
    for (let col = 1; col <= 2; col++) {
      const x = 529 + (col - 1) * spacing;
      for (let i = 1; i <= 20; i++) {
        list.push({ id: `R-Gold-Col${col}-${i}`, label: `Right Gold C${col} R${i}`, num: i, type: 'Gold', price: goldPrice, color: '#ffb800', x, y: 180 + (i - 1) * spacing });
      }
    }

    // MIDDLE U (Silver)
    for (let col = 1; col <= 3; col++) {
      const x = 126 + (col - 1) * spacing;
      for (let i = 1; i <= 25; i++) {
        list.push({ id: `L-Silver-Col${col}-${i}`, label: `Left Silver C${col} R${i}`, num: i, type: 'Silver', price: silverPrice, color: '#00f0ff', x, y: 150 + (i - 1) * spacing });
      }
    }
    for (let col = 1; col <= 3; col++) {
      const x = 613 + (col - 1) * spacing;
      for (let i = 1; i <= 25; i++) {
        list.push({ id: `R-Silver-Col${col}-${i}`, label: `Right Silver C${col} R${i}`, num: i, type: 'Silver', price: silverPrice, color: '#00f0ff', x, y: 150 + (i - 1) * spacing });
      }
    }
    for (let r = 1; r <= 3; r++) {
      const y = 766 + (r - 1) * spacing;
      for (let i = 0; i < 15; i++) {
        const x = Math.round(210 + i * (375 / 14));
        list.push({ id: `B-Silver-Row${r}-${i + 1}`, label: `Bottom Silver R${r} S${i + 1}`, num: i + 1, type: 'Silver', price: silverPrice, color: '#00f0ff', x, y });
      }
    }

    // OUTER U (Standard)
    for (let col = 1; col <= 2; col++) {
      const x = 42 + (col - 1) * spacing;
      for (let i = 1; i <= 27; i++) {
        list.push({ id: `L-Std-Col${col}-${i}`, label: `Left Std C${col} R${i}`, num: i, type: 'Standard', price: standardPrice, color: '#d946ef', x, y: 150 + (i - 1) * spacing });
      }
    }
    for (let col = 1; col <= 2; col++) {
      const x = 725 + (col - 1) * spacing;
      for (let i = 1; i <= 27; i++) {
        list.push({ id: `R-Std-Col${col}-${i}`, label: `Right Std C${col} R${i}`, num: i, type: 'Standard', price: standardPrice, color: '#d946ef', x, y: 150 + (i - 1) * spacing });
      }
    }
    for (let r = 1; r <= 2; r++) {
      const y = 850 + (r - 1) * spacing;
      for (let i = 0; i < 23; i++) {
        const x = Math.round(98 + i * (599 / 22));
        list.push({ id: `B-Std-Row${r}-${i + 1}`, label: `Bottom Std R${r} S${i + 1}`, num: i + 1, type: 'Standard', price: standardPrice, color: '#d946ef', x, y });
      }
    }
    return list;
  };

  const seats = generateSeats();

  const handleSeatClick = (seat) => {
    if (occupiedSeats.includes(seat.id)) return;
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    else {
      if (selectedSeats.length >= 6) { alert('Limit 6 seats.'); return; }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    setBookingDetails({
      selectedSeats: selectedSeats.map(s => ({ seatId: s.id, type: s.type, price: s.price })),
      subtotal: selectedSeats.reduce((sum, s) => sum + s.price, 0)
    });
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!event) return null;

  return (
    <div className="w-full flex-grow flex flex-col pt-[100px] pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 select-none">
        <div>
          <button onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2 font-label-sm text-[13px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest mb-4">
            <span className="material-symbols-outlined text-[18px]">keyboard_backspace</span> Return to Showcase
          </button>
          <h1 className="font-headline-lg-mobile text-on-surface uppercase leading-none font-bold tracking-tight">RUNWAY SEATING</h1>
          <p className="font-body-md text-on-surface-variant text-[14px] mt-1">Exact coordinates mapped to the spotlighting.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] font-label-sm uppercase tracking-wider bg-surface-container/20 border border-outline-variant/15 px-6 py-3 rounded-lg shadow-xl">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ff2a8d]"></span><span>VIP (${vipPrice})</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ffb800]"></span><span>Gold (${goldPrice})</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#00f0ff]"></span><span>Silver (${silverPrice})</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#d946ef]"></span><span>Standard (${standardPrice})</span></div>
          <div className="flex items-center gap-2 border-l border-outline-variant/30 pl-4"><span className="w-3 h-3 rounded bg-[#322d37] opacity-60"></span><span>Occupied</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div ref={containerRef} className="xl:col-span-8 w-full glass-panel p-4 md:p-6 rounded-2xl flex flex-col items-center justify-start overflow-hidden relative select-none">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-40 gap-4 w-full"><span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span><p className="font-label-sm text-on-surface-variant uppercase tracking-widest">Recalibrating...</p></div>
          ) : (
            <div style={{ width: '820px', height: `${980 * scale}px`, position: 'relative', overflow: 'hidden' }} className="flex justify-center items-start transition-all duration-300">
              <div style={{ width: '820px', height: '980px', transform: `scale(${scale})`, transformOrigin: 'top center', position: 'absolute', left: 0, top: 0 }} className="relative">
                <div className="absolute top-[20px] left-[50%] -translate-x-[50%] w-[480px] h-[80px] bg-[#29252c] border border-outline-variant/20 rounded shadow-xl flex items-center justify-center z-20">
                  <span className="font-display-xl text-[16px] text-primary tracking-[0.6em] font-extrabold uppercase">STAGE</span>
                </div>
                <div className="absolute top-[114px] left-[50%] -translate-x-[50%] w-[104px] h-[610px] bg-[#1d1a1f] border border-outline-variant/15 rounded flex flex-col justify-between items-center py-10 z-10">
                  <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-primary/10 via-primary/50 to-primary/10"></div>
                  <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">model_training</span>
                  <span className="font-display-xl text-[10px] text-primary tracking-[0.4em] uppercase rotate-90 my-20 whitespace-nowrap opacity-80">SPOTLIGHT</span>
                  <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">model_training</span>
                </div>
                {seats.map(seat => {
                  const isOccupied = occupiedSeats.includes(seat.id);
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  return (
                    <button key={seat.id} onClick={() => handleSeatClick(seat)} disabled={isOccupied} style={{ position: 'absolute', left: `${seat.x}px`, top: `${seat.y}px`, width: '25px', height: '25px', backgroundColor: isOccupied ? '#322d37' : isSelected ? '#ffffff' : seat.color }}
                      className={`rounded flex items-center justify-center text-[8.5px] font-black transition-all z-20 ${isOccupied ? 'opacity-25 cursor-not-allowed' : isSelected ? 'text-black shadow-xl scale-110' : 'text-black hover:scale-115'}`}>
                      {isOccupied ? '×' : seat.num}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-2xl flex flex-col shadow-xl">      
            <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-6">RESERVATIONS</h3>
            {selectedSeats.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-16 text-center opacity-50"><span className="material-symbols-outlined text-4xl mb-4">event_seat</span><p className="font-body-md text-[14px]">Click on the visual color grids to secure seats.</p></div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {selectedSeats.map(seat => (
                    <div key={seat.id} className="flex justify-between items-center bg-surface-container/30 border border-outline-variant/10 p-3.5 rounded-xl">
                      <div><p className="font-bold text-on-surface text-[13px]">{seat.label}</p><span className="text-[10px] font-label-sm uppercase tracking-widest opacity-60">{seat.type} Tier</span></div>
                      <div className="flex items-center gap-3"><span className="font-bold text-primary">${seat.price}</span><button onClick={() => handleSeatClick(seat)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined text-[18px]">close</span></button></div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-outline-variant/15 flex justify-between items-end">
                  <span className="font-label-sm uppercase tracking-widest text-on-surface-variant text-[11px]">Subtotal</span>
                  <span className="font-display-xl text-[28px] text-primary font-bold leading-none">${selectedSeats.reduce((sum, s) => sum + s.price, 0)}</span>
                </div>
                <button onClick={handleProceed} className="w-full mt-2 bg-primary text-on-primary py-6 rounded font-label-sm text-[15px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl">Proceed to Checkout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
