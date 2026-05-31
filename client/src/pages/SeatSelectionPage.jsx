import React, { useState, useEffect } from 'react';

const SeatSelectionPage = ({ event, setView, setBookingDetails }) => {
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = React.useRef(null);

  const vipPrice = event?.pricingTiers?.vip?.price || 450;
  const goldPrice = event?.pricingTiers?.gold?.price || 250;
  const silverPrice = event?.pricingTiers?.silver?.price || 150;
  const standardPrice = 100; // Standard outer tier pricing

  // Dynamic window resizing hook to calculate scale for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const padding = window.innerWidth < 768 ? 24 : 48; // smaller padding for mobile
        const parentWidth = containerRef.current.clientWidth - padding;
        const newScale = Math.min(1, parentWidth / 820);
        setScale(newScale);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Small delay to ensure clientWidth has been fully populated by the rendering engine
    const timer = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [loading]); // Recalculate when loading state transitions

  // Fetch occupied seats for this event
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
        // Fail-safe default occupied seats
        setOccupiedSeats(['L-VIP-Col1-5', 'L-Gold-Col2-12', 'R-VIP-Col1-8', 'L-Silver-Col1-23']);
        setLoading(false);
      });
  }, [event]);

  // Generate the absolute exact layout matching the user's uploaded schematic with perfect symmetry
  const generateSeats = () => {
    const list = [];
    const spacing = 28; // perfect uniform spacing vertically & horizontally

    // 1. LEFT INNER BLOCK (2 columns Gold + 2 columns VIP)
    // Gold: Columns 1 & 2 (Outer Left)
    for (let col = 1; col <= 2; col++) {
      const x = 238 + (col - 1) * spacing;
      for (let i = 1; i <= 20; i++) {
        list.push({
          id: `L-Gold-Col${col}-${i}`,
          label: `Left Gold C${col} Row ${i}`,
          num: i,
          type: 'Gold',
          price: goldPrice,
          color: '#ffb800', // Gleaming Amber Gold
          x: x,
          y: 180 + (i - 1) * spacing
        });
      }
    }
    // VIP: Columns 1 & 2 (Inner Left, next to Runway)
    for (let col = 1; col <= 2; col++) {
      const x = 294 + (col - 1) * spacing;
      for (let i = 1; i <= 20; i++) {
        list.push({
          id: `L-VIP-Col${col}-${i}`,
          label: `Left VIP C${col} Row ${i}`,
          num: i,
          type: 'VIP',
          price: vipPrice,
          color: '#ff2a8d', // Neon Pink
          x: x,
          y: 180 + (i - 1) * spacing
        });
      }
    }

    // 2. RIGHT INNER BLOCK (2 columns VIP + 2 columns Gold)
    // VIP: Columns 1 & 2 (Inner Right, next to Runway)
    // Positioned at perfect symmetrical mirror coordinates of Left VIP
    for (let col = 1; col <= 2; col++) {
      const x = 473 + (col - 1) * spacing;
      for (let i = 1; i <= 20; i++) {
        list.push({
          id: `R-VIP-Col${col}-${i}`,
          label: `Right VIP C${col} Row ${i}`,
          num: i,
          type: 'VIP',
          price: vipPrice,
          color: '#ff2a8d', // Neon Pink
          x: x,
          y: 180 + (i - 1) * spacing
        });
      }
    }
    // Gold: Columns 1 & 2 (Outer Right)
    // Positioned at perfect symmetrical mirror coordinates of Left Gold
    for (let col = 1; col <= 2; col++) {
      const x = 529 + (col - 1) * spacing;
      for (let i = 1; i <= 20; i++) {
        list.push({
          id: `R-Gold-Col${col}-${i}`,
          label: `Right Gold C${col} Row ${i}`,
          num: i,
          type: 'Gold',
          price: goldPrice,
          color: '#ffb800', // Gleaming Amber Gold
          x: x,
          y: 180 + (i - 1) * spacing
        });
      }
    }

    // 3. MIDDLE U-SHAPE WRAPPER (Silver Blue - 3 Columns sides, 3 Rows bottom)
    // Left vertical columns (3 columns of 25 seats to reach Y = 822)
    for (let col = 1; col <= 3; col++) {
      const x = 126 + (col - 1) * spacing;
      for (let i = 1; i <= 25; i++) {
        list.push({
          id: `L-Silver-Col${col}-${i}`,
          label: `Left Silver C${col} Row ${i}`,
          num: i,
          type: 'Silver',
          price: silverPrice,
          color: '#00f0ff', // Electric Cyan
          x: x,
          y: 150 + (i - 1) * spacing
        });
      }
    }
    // Right vertical columns (3 columns of 25 seats to reach Y = 822)
    // Positioned at perfect symmetrical mirror coordinates of Left Silver
    for (let col = 1; col <= 3; col++) {
      const x = 613 + (col - 1) * spacing;
      for (let i = 1; i <= 25; i++) {
        list.push({
          id: `R-Silver-Col${col}-${i}`,
          label: `Right Silver C${col} Row ${i}`,
          num: i,
          type: 'Silver',
          price: silverPrice,
          color: '#00f0ff', // Electric Cyan
          x: x,
          y: 150 + (i - 1) * spacing
        });
      }
    }
    // Bottom horizontal wrap rows (3 rows bridging Left Silver inner to Right Silver inner seamlessly)
    // Spans from X=210 to X=585 with exactly 15 seats, centered and spaced with mathematical interpolation!
    for (let r = 1; r <= 3; r++) {
      const y = 766 + (r - 1) * spacing;
      for (let i = 0; i < 15; i++) {
        const x = Math.round(210 + i * (375 / 14));
        list.push({
          id: `B-Silver-Row${r}-${i + 1}`,
          label: `Bottom Silver R${r} Seat ${i + 1}`,
          num: i + 1,
          type: 'Silver',
          price: silverPrice,
          color: '#00f0ff',
          x: x,
          y: y
        });
      }
    }

    // 4. OUTER U-SHAPE WRAPPER (Standard Orchid - 2 Columns sides, 2 Rows bottom)
    // Left vertical columns (2 columns of 27 seats to reach Y = 878)
    for (let col = 1; col <= 2; col++) {
      const x = 42 + (col - 1) * spacing;
      for (let i = 1; i <= 27; i++) {
        list.push({
          id: `L-Std-Col${col}-${i}`,
          label: `Left Standard C${col} Row ${i}`,
          num: i,
          type: 'Standard',
          price: standardPrice,
          color: '#d946ef', // Hot Orchid Purple
          x: x,
          y: 150 + (i - 1) * spacing
        });
      }
    }
    // Right vertical columns (2 columns of 27 seats to reach Y = 878)
    // Positioned at perfect symmetrical mirror coordinates of Left Standard
    for (let col = 1; col <= 2; col++) {
      const x = 725 + (col - 1) * spacing;
      for (let i = 1; i <= 27; i++) {
        list.push({
          id: `R-Std-Col${col}-${i}`,
          label: `Right Standard C${col} Row ${i}`,
          num: i,
          type: 'Standard',
          price: standardPrice,
          color: '#d946ef', // Hot Orchid
          x: x,
          y: 150 + (i - 1) * spacing
        });
      }
    }
    // Bottom horizontal wrap rows (2 rows at the very outer bottom bridging Left Standard inner to Right Standard inner)
    // Spans from X=98 to X=697 with exactly 23 seats, centered and spaced with mathematical interpolation!
    for (let r = 1; r <= 2; r++) {
      const y = 850 + (r - 1) * spacing;
      for (let i = 0; i < 23; i++) {
        const x = Math.round(98 + i * (599 / 22));
        list.push({
          id: `B-Std-Row${r}-${i + 1}`,
          label: `Bottom Standard R${r} Seat ${i + 1}`,
          num: i + 1,
          type: 'Standard',
          price: standardPrice,
          color: '#d946ef',
          x: x,
          y: y
        });
      }
    }

    return list;
  };

  const seats = generateSeats();

  const handleSeatClick = (seat) => {
    if (occupiedSeats.includes(seat.id)) return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        alert('Exclusive passes are capped at 6 seats per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const totalCost = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    setBookingDetails({
      selectedSeats: selectedSeats.map(s => ({
        seatId: s.id,
        type: s.type,
        price: s.price
      })),
      subtotal: totalCost
    });
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!event) return null;

  return (
    <div className="w-full flex-grow flex flex-col pt-[100px] pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
      
      {/* 1. EDITORIAL ROW HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 select-none">
        <div>
          <button 
            onClick={() => {
              setView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest mb-4"
          >
            <span className="material-symbols-outlined text-[18px]">keyboard_backspace</span>
            Return to Showcase
          </button>
          <h1 className="font-headline-lg-mobile text-on-surface uppercase leading-none font-bold tracking-tight">
            RUNWAY SEATING SCHEMATIC
          </h1>
          <p className="font-body-md text-on-surface-variant text-[14px] mt-1">
            Exactly mapped coordinates surrounding the T-shaped runway spotlighting.
          </p>
        </div>

        {/* Custom luxury color indicators */}
        <div className="flex flex-wrap gap-4 text-[11px] font-label-sm uppercase tracking-wider bg-surface-container/20 border border-outline-variant/15 px-6 py-3 rounded-lg shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff2a8d]"></span>
            <span>VIP (${vipPrice})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ffb800]"></span>
            <span>Gold (${goldPrice})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00f0ff]"></span>
            <span>Silver (${silverPrice})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#d946ef]"></span>
            <span>Standard (${standardPrice})</span>
          </div>
          <div className="flex items-center gap-2 border-l border-outline-variant/30 pl-4">
            <span className="w-3 h-3 rounded bg-[#322d37] border border-outline-variant/10 opacity-60"></span>
            <span>Occupied</span>
          </div>
        </div>
      </div>

      {/* 2. CORE DUAL SECTION LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Runway Canvas Grid */}
        <div 
          ref={containerRef}
          className="xl:col-span-8 w-full glass-panel p-4 md:p-6 rounded-2xl flex flex-col items-center justify-start overflow-hidden relative select-none shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
        >
          {loading ? (
            <div className="flex flex-col justify-center items-center py-40 gap-4 w-full">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
              <p className="font-label-sm text-on-surface-variant uppercase tracking-[0.2em]">Recalibrating Stage Coordinates...</p>
            </div>
          ) : (
            <div 
              style={{ 
                width: '820px', 
                height: `${980 * scale}px`,
                position: 'relative',
                overflow: 'hidden'
              }}
              className="flex justify-center items-start transition-all duration-300"
            >
              <div 
                style={{
                  width: '820px',
                  height: '980px',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  position: 'absolute',
                  left: 0,
                  top: 0
                }}
                className="relative"
              >
              
              {/* A. STAGE (Stage Display Overlay) */}
              <div className="absolute top-[20px] left-[50%] -translate-x-[50%] w-[480px] h-[80px] bg-[#29252c] border border-outline-variant/20 rounded shadow-[0_15px_30px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center z-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,186,238,0.15)_0%,transparent_80%)]"></div>
                
                {/* Stepped stage layout matching the image perfectly */}
                <div className="w-[340px] h-[15px] bg-[#1d1a1f] absolute -bottom-[15px] border-x border-b border-outline-variant/20 rounded-b flex items-center justify-center">
                  <div className="w-[200px] h-[1px] bg-primary/30"></div>
                </div>

                <span className="font-display-xl text-[16px] text-primary tracking-[0.6em] font-extrabold uppercase pl-4">
                  STAGE
                </span>
              </div>

              {/* B. CENTRAL T-RUNWAY PILLAR */}
              <div className="absolute top-[114px] left-[50%] -translate-x-[50%] w-[104px] h-[610px] bg-[#1d1a1f] border border-outline-variant/15 rounded flex flex-col justify-between items-center py-10 z-10">
                {/* Glowing neon runner highlights */}
                <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-primary/10 via-primary/50 to-primary/10 shadow-[0_0_15px_#ff7ebb]"></div>
                <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-primary/10 via-primary/50 to-primary/10 shadow-[0_0_15px_#ff7ebb]"></div>
                
                <span className="material-symbols-outlined text-primary text-[20px] font-light animate-pulse">model_training</span>
                <span className="font-display-xl text-[12px] text-primary tracking-[0.4em] uppercase rotate-90 my-20 whitespace-nowrap pl-4 select-none opacity-80">
                  RUNWAY SPOTLIGHT
                </span>
                <span className="material-symbols-outlined text-primary text-[20px] font-light animate-pulse">model_training</span>
              </div>

              {/* C. DYNAMIC SEATING PLACEMENT CANVAS */}
              {seats.map(seat => {
                const isOccupied = occupiedSeats.includes(seat.id);
                const isSelected = selectedSeats.some(s => s.id === seat.id);

                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={isOccupied}
                    style={{
                      position: 'absolute',
                      left: `${seat.x}px`,
                      top: `${seat.y}px`,
                      width: '25px',
                      height: '25px',
                      backgroundColor: isOccupied ? '#322d37' : isSelected ? '#ffffff' : seat.color,
                      borderColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'
                    }}
                    className={`rounded flex items-center justify-center text-[8.5px] font-black transition-all duration-300 z-20 ${
                      isOccupied 
                        ? 'opacity-25 cursor-not-allowed border border-outline-variant/20 text-on-surface-variant/30 font-light' 
                        : isSelected 
                          ? 'text-[#000000] shadow-[0_0_20px_#ffffff] scale-110 border-2' 
                          : 'text-[#000000] hover:scale-115 hover:border-white shadow-[0_4px_10px_rgba(0,0,0,0.4)] border'
                    }`}
                    title={`${seat.label} (${seat.type} - $${seat.price})`}
                  >
                    {isOccupied ? '×' : seat.num}
                  </button>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Editorial Checkout Summaries */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-2xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-6">
              RESERVATIONS
            </h3>

            {selectedSeats.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-16 text-center select-none opacity-50">
                <span className="material-symbols-outlined text-4xl text-outline mb-4">event_seat</span>
                <p className="font-body-md text-on-surface-variant text-[14px]">
                  Click on the visual color grids surrounding the T-Runway spotlight track to secure seats.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* List of chosen seats */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {selectedSeats.map(seat => (
                    <div key={seat.id} className="flex justify-between items-center bg-surface-container/30 border border-outline-variant/10 p-3.5 rounded-xl">
                      <div>
                        <p className="font-body-lg text-[14px] font-bold text-on-surface">{seat.label}</p>
                        <span className={`text-[10px] font-label-sm uppercase tracking-widest ${
                          seat.type === 'VIP' ? 'text-primary' : seat.type === 'Gold' ? 'text-secondary' : 'text-on-surface-variant'
                        }`}>
                          {seat.type} Tier Access
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-title-md text-[16px] text-primary">${seat.price}</span>
                        <button 
                          onClick={() => handleSeatClick(seat)}
                          className="text-on-surface-variant hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations details */}
                <div className="pt-6 border-t border-outline-variant/15 flex flex-col gap-4">
                  <div className="flex justify-between font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest">
                    <span>Reserved Capacity</span>
                    <span>{selectedSeats.length} / 6 Seats</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Access Subtotal</span>
                    <span className="font-display-xl text-[30px] text-primary leading-none font-bold">${totalCost}</span>
                  </div>
                </div>

                <button 
                  onClick={handleProceed}
                  className="w-full mt-6 bg-primary text-on-primary py-4.5 rounded font-label-sm text-label-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors select-none shadow-[0_10px_30px_rgba(221,186,238,0.25)] hover:scale-102 duration-300"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>

          {/* Luxury seat descriptions */}
          <div className="glass-panel p-6 rounded-xl select-none text-[13px] leading-relaxed text-on-surface-variant space-y-4">
            <h4 className="font-label-sm text-[11px] text-primary uppercase tracking-widest font-bold">SCHEMATIC ORIENTATION</h4>
            <p>
              The <strong>STAGE</strong> is centered at the top. The grand model walkway extends vertically downwards.
            </p>
            <ul className="space-y-1 pl-4 list-disc">
              <li>VIP seats (Pink) offer direct side-views of the catwalk models (2 parallel columns per side).</li>
              <li>Gold seats (Amber) are elevated secondary tier views (2 parallel columns per side).</li>
              <li>Silver (Blue) wraps around the runway in a massive 3-column U-shape, connecting fully at the corners.</li>
              <li>Standard (Lavender) encapsulates the outer layers in a 2-column U-shape, connecting fully at the corners.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeatSelectionPage;
