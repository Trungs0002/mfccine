import React, { useState } from 'react';

const CheckoutPage = ({ event, bookingDetails, setView, setUserEmail, setCompletedBookingId }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MoMo');
  const [loading, setLoading] = useState(false);

  const selectedSeats = bookingDetails?.selectedSeats || [];
  const subtotal = bookingDetails?.subtotal || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      alert('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    // Prepare payload
    const payload = {
      eventId: event._id,
      fullName,
      email: email.toLowerCase().trim(),
      phone,
      studentId: isStudent ? studentId : '',
      selectedSeats,
      subtotal,
      paymentMethod
    };

    fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || 'Booking failed.'); });
        }
        return res.json();
      })
      .then(booking => {
        // Successful booking!
        setCompletedBookingId(booking._id);
        setUserEmail(email.toLowerCase().trim()); // Update email context for direct dashboard lookup!
        
        // Premium artificial checkout experience delay
        setTimeout(() => {
          setLoading(false);
          setView('ticket');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
      })
      .catch(err => {
        alert(err.message || 'An error occurred while placing reservation.');
        setLoading(false);
      });
  };

  if (!event || selectedSeats.length === 0) return null;

  return (
    <div className="w-full flex-grow flex flex-col pt-[100px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
      {/* 1. BACK LINK */}
      <div className="mb-8 select-none">
        <button 
          onClick={() => {
            setView('seating');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[18px]">keyboard_backspace</span>
          Back to Seating Map
        </button>
      </div>

      <h1 className="font-headline-lg-mobile text-on-surface uppercase mb-2">SECURE EDITORIAL ACCESS</h1>
      <p className="font-body-md text-on-surface-variant text-[14px] mb-12">
        Complete your credential registration and checkout parameters.
      </p>

      {/* 2. CHOSEN SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Form Details */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 glass-panel p-8 rounded-xl space-y-6">
          <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-6 select-none">
            CREDENTIAL REGISTRATION
          </h3>

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider required">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Email & Phone side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex.johnson@ftu.edu"
                className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +84 901 234 567"
                className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Student Toggle Checkbox */}
          <div className="bg-surface-container-low/30 border border-outline-variant/15 p-4 rounded-lg flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="studentCheck"
                checked={isStudent}
                onChange={(e) => setIsStudent(e.target.checked)}
                className="w-5 h-5 rounded border-outline-variant/30 text-primary focus:ring-primary bg-background/50 cursor-pointer"
              />
              <label htmlFor="studentCheck" className="font-body-md text-[14px] text-on-surface cursor-pointer select-none">
                I am an FTU Student / Member
              </label>
            </div>
            {isStudent && (
              <div className="flex flex-col gap-2 mt-2">
                <label className="font-label-sm text-[10px] text-primary uppercase tracking-wider animate-fadeIn">FTU Student ID</label>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. FTU-2024-8849"
                  className="bg-surface-container/50 border border-primary/30 rounded-lg p-3 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors animate-fadeIn"
                  required={isStudent}
                />
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 select-none">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">PAYMENT METRICS</label>
            <div className="grid grid-cols-3 gap-4">
              {['MoMo', 'VNPay', 'Bank Transfer'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-5 rounded-lg border text-center font-label-sm text-[13px] uppercase tracking-wider transition-all duration-300 ${
                    paymentMethod === method
                      ? 'border-primary bg-primary-container/20 text-primary shadow-[0_0_12px_rgba(221,186,238,0.15)] font-bold'
                      : 'border-outline-variant/20 bg-surface-container/20 text-on-surface-variant hover:border-white hover:text-on-surface'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-primary text-on-primary py-6 rounded font-label-sm text-[15px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex justify-center items-center gap-3 shadow-[0_10px_30px_rgba(221,186,238,0.2)]"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                Securing Bank Ledger...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px] fill-icon">shield</span>
                Confirm & Pay ${subtotal}
              </>
            )}
          </button>
        </form>

        {/* Right Column: Reservation Sidebar Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-8 rounded-xl">
            {/* Quick Event Summary */}
            <div className="flex gap-4 items-start border-b border-outline-variant/15 pb-6 mb-6 select-none">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-20 h-28 object-cover rounded mix-blend-luminosity bg-surface-container"
              />
              <div>
                <span className="font-label-sm text-[9px] text-primary uppercase tracking-[0.2em]">{event.location}</span>
                <h4 className="font-title-md text-[18px] text-on-surface mb-2 mt-1 leading-tight">{event.title}</h4>
                <p className="font-body-md text-[13px] text-on-surface-variant">{event.venueName}</p>
              </div>
            </div>

            {/* List of seats */}
            <div className="space-y-4 mb-6">
              <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">RESERVED POSITIONING</p>
              {selectedSeats.map((seat, index) => (
                <div key={index} className="flex justify-between items-center text-[14px]">
                  <span className="font-body-lg text-on-surface font-semibold">Seat {seat.seatId.split('-').slice(2).join(' ')}</span>
                  <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">{seat.type} (${seat.price})</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-outline-variant/15 pt-6 space-y-4">
              <div className="flex justify-between text-[14px] text-on-surface-variant">
                <span>Pass Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-[14px] text-on-surface-variant">
                <span>VAT (0%)</span>
                <span>$0</span>
              </div>
              {isStudent && (
                <div className="flex justify-between text-[14px] text-secondary font-bold">
                  <span>Student Discount (5%)</span>
                  <span>-${Math.round(subtotal * 0.05)}</span>
                </div>
              )}
              <div className="border-t border-outline-variant/10 pt-4 flex justify-between items-end">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface">TOTAL PASS CHARGE</span>
                <span className="font-display-xl text-[28px] text-primary leading-none">
                  ${isStudent ? Math.round(subtotal * 0.95) : subtotal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
