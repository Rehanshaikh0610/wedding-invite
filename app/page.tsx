'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Calendar, Clock, ChevronDown, CheckCircle } from 'lucide-react';

type ScratchCardProps = {
  children: React.ReactNode;
};

const ScratchCard: React.FC<ScratchCardProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const lastRevealCheck = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width === 0 || height === 0) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#C4B79A';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '600 16px Montserrat, sans-serif';
      ctx.fillStyle = '#2C3E2D';
      ctx.textAlign = 'center';
      ctx.fillText('Scratch to reveal', width / 2, height / 2 + 5);
    };

    draw();

    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, []);

  const checkReveal = () => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    const sampleStep = 32;
    let sampleCount = 0;

    for (let i = 3; i < image.data.length; i += sampleStep) {
      sampleCount += 1;
      if (image.data[i] === 0) transparent += 1;
    }

    if (sampleCount > 0 && transparent / sampleCount > 0.45) {
      setIsRevealed(true);
    }
  };

  const scratchAt = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const radius = Math.max(24, canvas.clientWidth / 12);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    const now = performance.now();
    if (now - lastRevealCheck.current > 250) {
      lastRevealCheck.current = now;
      checkReveal();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => setIsDrawing(false);

  const handlePointerLeave = () => setIsDrawing(false);

  return (
    <div className="relative inline-block w-full max-w-[360px] sm:max-w-[420px] rounded-2xl border border-[#c5b8a4] bg-[#f5ebe0] shadow-[0_18px_45px_rgba(0,0,0,0.12)] overflow-hidden" style={{ aspectRatio: '16 / 5' }}>
      <div className="absolute inset-0 rounded-2xl bg-[#bda78f]" />
      <div className="absolute inset-0 flex items-center justify-center select-none rounded-2xl border border-white/20 bg-[#f7efe7]/80 px-3">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        width={320}
        height={110}
        style={{ width: '100%', height: '100%', touchAction: 'none', backgroundColor: '#D4C4B7' }}
        className={`absolute inset-0 z-10 rounded-xl cursor-crosshair transition-opacity duration-700 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={() => setIsRevealed(true)}
        title="Scratch here!"
      />
    </div>
  );
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attending: 'Joyfully Accept',
    guests: '1',
    message: ''
  });

  const weddingDate = new Date('July 18, 2026 18:00:00').getTime();

  // Scroll & Timer Logic
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const smoothScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- MONGODB SUBMISSION LOGIC ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', attending: 'Joyfully Accept', guests: '1', message: '' });
        // Hide success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EBE1] text-[#222222] font-sans antialiased overflow-x-hidden">

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@200;300;400;500;600&display=swap');
        
        .font-script { font-family: 'Alex Brush', cursive; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Montserrat', sans-serif; }
        
        .hero-bg {
          background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80');
          background-attachment: scroll;
          background-position: center;
          background-size: cover;
        }

        @media (min-width: 768px) {
          .hero-bg {
            background-attachment: fixed;
          }
        }
        
        .pattern-bg {
          background-color: #F4EBE1;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='#8b7355' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .fade-in-up {
          animation: fadeInUp 1.2s ease-out forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#F4EBE1]/95 backdrop-blur-md shadow-sm py-3 md:py-4' : 'bg-transparent py-5 md:py-6'}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="text-xl md:text-2xl font-serif tracking-widest text-[#B8977E] cursor-pointer" onClick={() => smoothScroll('home')}>
            B <span className="font-script lowercase text-2xl md:text-3xl mx-1 text-[#8B7355]">&</span> A
          </div>
          <div className="hidden md:flex space-x-8 text-sm tracking-widest uppercase font-semibold">
            {['Story', 'Details', 'Relations', 'RSVP'].map((item) => (
              <button
                key={item}
                onClick={() => smoothScroll(item.toLowerCase())}
                className={`transition-colors duration-300 ${isScrolled ? 'text-gray-700 hover:text-[#8B7355]' : 'text-white/90 hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <section id="home" className="relative min-h-[88vh] hero-bg flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F4EBE1]/90 z-0"></div>
        <div className="relative z-10 px-4 py-8 mt-16 fade-in-up text-white flex flex-col items-center max-w-4xl w-full">
          <p className="font-sans tracking-[0.3em] uppercase text-xs sm:text-sm md:text-base mb-4 md:mb-6 text-[#E8DCC4]">We are getting married</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white drop-shadow-lg mb-8 md:mb-10 leading-tight">
            <span className="font-serif block">Bushra</span>
            <span className="block font-script text-[#E8DCC4] text-4xl sm:text-5xl md:text-7xl -my-2 md:-my-6">&</span>
            <span className="font-serif block">Aamir</span>
          </h1>

          <div className="mb-4 transition-transform hover:scale-105 duration-300 w-full max-w-[320px] sm:max-w-[340px]">
            <div className="mt-8 flex flex-col items-center">
              <ScratchCard>
                <div className="text-center px-2 py-1">
                  <p className="font-serif italic text-2xl sm:text-3xl md:text-3xl text-[#2C3E2D] drop-shadow-md tracking-wide">July 18th, 2026</p>
                  <p className="font-sans tracking-[0.2em] text-[10px] sm:text-[11px] text-[#2C3E2D] mt-1 sm:mt-2 uppercase">Mumbai, India</p>
                </div>
              </ScratchCard>
              <p className="mt-3 text-[12px] sm:text-[13px] uppercase tracking-[0.4em] text-[#3E352D] opacity-90">Scratch it to reveal the date</p>
            </div>
          </div>

          <div className="mt-8 md:mt-12 animate-bounce cursor-pointer opacity-80 hover:opacity-100 transition-opacity" onClick={() => smoothScroll('story')}>
            <ChevronDown size={36} className="mx-auto text-[#E8DCC4]" />
          </div>
        </div>
      </section>

      <section id="story" className="py-16 md:py-24 px-4 md:px-6 pattern-bg text-center">
        <div className="max-w-3xl mx-auto">
          <Heart className="mx-auto text-[#B8977E] mb-6 md:mb-8" size={32} strokeWidth={1.5} />
          <h2 className="font-serif text-3xl md:text-5xl text-[#2C3E2D] mb-6 md:mb-8">Together with our families</h2>
          <p className="font-sans font-light text-gray-700 leading-relaxed text-base md:text-lg mb-12 md:mb-16">
            We joyfully invite you to share in our happiness as we unite in marriage.
            Your presence, love, and prayers will make our special day complete.
          </p>

          <div className="flex flex-wrap justify-center gap-3 md:gap-8 max-w-2xl mx-auto">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="flex flex-col items-center min-w-[85px]">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-[#8B7355] flex items-center justify-center mb-2 md:mb-3 bg-[#FDFBF7] shadow-sm">
                  <span className="font-serif text-2xl md:text-4xl text-[#2C3E2D]">{value}</span>
                </div>
                <span className="font-sans text-[10px] md:text-xs tracking-widest uppercase text-[#4A3B32] font-semibold">{unit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="details" className="py-16 md:py-24 bg-[#EFE8DF] px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-script text-4xl md:text-5xl text-[#8B7355] mb-2">The Details</h2>
            <h3 className="font-serif text-2xl md:text-3xl text-[#2C3E2D]">Wedding Event</h3>
          </div>

          <div className="flex justify-center max-w-4xl mx-auto">
            <div className="w-full md:w-2/3 bg-[#F4EBE1] p-8 md:p-10 rounded-t-[80px] md:rounded-t-full border border-[#C8B8A6] text-center shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-2 duration-300">
              <h4 className="font-serif text-2xl md:text-3xl text-[#2C3E2D] mb-6 md:mb-8 border-b border-[#C8B8A6] pb-4 inline-block px-4">The Nikaah</h4>
              <div className="space-y-6 md:space-y-8 text-gray-800 font-light text-base md:text-lg">
                <div className="flex flex-col items-center">
                  <Calendar className="text-[#8B7355] mb-2 md:mb-3" size={28} strokeWidth={1.5} />
                  <p className="font-medium">Saturday, July 18, 2026</p>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="text-[#8B7355] mb-2 md:mb-3" size={28} strokeWidth={1.5} />
                  <p className="font-medium">6:00 PM Onwards</p>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="text-[#8B7355] mb-2 md:mb-3" size={28} strokeWidth={1.5} />
                  <p className="font-semibold text-[#2C3E2D] text-lg md:text-xl mb-1">Ayesha Banquet</p>
                  <p className="text-sm md:text-base px-2 md:px-4">Mayfair Industrial Area, Safed Pul,<br />Saki Naka, Mumbai, Maharashtra 400072</p>
                </div>
              </div>
              <button
                onClick={() => window.open('https://maps.app.goo.gl/YypC9Vp1cVrstza99', '_blank')}
                className="mt-8 md:mt-10 px-6 md:px-8 py-3 border-2 border-[#8B7355] text-[#8B7355] font-semibold rounded-full text-xs md:text-sm tracking-widest uppercase hover:bg-[#8B7355] hover:text-white transition-all duration-300 shadow-sm"
              >
                View Map
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="relations" className="py-24 md:py-32 pattern-bg px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#B8977E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#2C3E2D] rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Heart className="mx-auto text-[#8B7355] mb-6 md:mb-8 fill-[#8B7355]/20" size={48} strokeWidth={1} />
          <div className="space-y-6 md:space-y-8">
            <h2 className="font-script text-4xl md:text-5xl text-[#8B7355] mb-2 md:mb-4"></h2>
            <div className="space-y-6 md:space-y-8">
              <p className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#2C3E2D] leading-tight px-4">
                Mr Abubakar Shaikh and Mrs Aisha Shaikh request the honour of your presence at the marriage of their daughter Bushra Shaikh
              </p>
              <h2 className="font-script text-4xl md:text-5xl text-[#8B7355] mb-2 md:mb-4">With</h2>
              <p className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#2C3E2D] leading-tight px-4">
                Aamir Muzzammil the son of Mr Muhammed Mussammil T C A and Mrs Saliha K P.
              </p>
            </div>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#8B7355] to-transparent mx-auto my-8 md:my-10"></div>
            <p className="font-sans font-medium text-gray-700 leading-relaxed text-base md:text-lg max-w-2xl mx-auto px-4">
              Two families join together in love and celebration, and we look forward to sharing this day with you.
            </p>
          </div>
        </div>
      </section>

      <section id="rsvp" className="py-16 md:py-24 bg-[#EFE8DF] px-4 md:px-6">
        <div className="max-w-3xl mx-auto bg-[#E6D9CA] p-6 md:p-16 border-2 border-[#C8B8A6] shadow-2xl relative rounded-sm">
          <div className="absolute top-3 left-3 w-6 h-6 md:w-8 md:h-8 border-t-2 border-l-2 border-[#8B7355]"></div>
          <div className="absolute top-3 right-3 w-6 h-6 md:w-8 md:h-8 border-t-2 border-r-2 border-[#8B7355]"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 md:w-8 md:h-8 border-b-2 border-l-2 border-[#8B7355]"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 md:w-8 md:h-8 border-b-2 border-r-2 border-[#8B7355]"></div>

          {submitSuccess ? (
            <div className="text-center py-12 animate-fade-in">
              <CheckCircle size={64} className="mx-auto text-[#2C3E2D] mb-6" />
              <h2 className="font-serif text-4xl text-[#2C3E2D] mb-4">Thank You!</h2>
              <p className="font-sans text-gray-700">Your RSVP has been successfully sent to Bushra & Aamir.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 md:mb-12">
                <h2 className="font-script text-4xl md:text-6xl text-[#8B7355] mb-2 md:mb-4">Be our Guest</h2>
                <h3 className="font-serif text-2xl md:text-3xl text-[#2C3E2D] font-medium">Kindly RSVP by July 10th</h3>
              </div>

              <form className="space-y-6 md:space-y-8 font-sans" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  <div>
                    <label className="block text-xs md:text-sm uppercase tracking-widest text-[#3E2723] font-bold mb-2">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border-b-2 border-[#BCAAA4] bg-transparent py-3 text-[#2C3E2D] font-medium placeholder-[#795548] focus:outline-none focus:border-[#8B7355] transition-colors" placeholder="Enter your name" required />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm uppercase tracking-widest text-[#3E2723] font-bold mb-2">Email Address (Optional)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border-b-2 border-[#BCAAA4] bg-transparent py-3 text-[#2C3E2D] font-medium placeholder-[#795548] focus:outline-none focus:border-[#8B7355] transition-colors" placeholder="Enter your email" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm uppercase tracking-widest text-[#3E2723] font-bold mb-3 md:mb-4">Will you attend?</label>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <label className="flex items-center gap-3 cursor-pointer text-[#2C3E2D] font-medium">
                      <input type="radio" name="attending" value="Joyfully Accept" checked={formData.attending === 'Joyfully Accept'} onChange={handleInputChange} className="w-5 h-5 accent-[#8B7355]" />
                      <span>Joyfully Accept</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-[#2C3E2D] font-medium">
                      <input type="radio" name="attending" value="Regretfully Decline" checked={formData.attending === 'Regretfully Decline'} onChange={handleInputChange} className="w-5 h-5 accent-[#8B7355]" />
                      <span>Regretfully Decline</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm uppercase tracking-widest text-[#3E2723] font-bold mb-2">Number of Guests</label>
                  <select name="guests" value={formData.guests} onChange={handleInputChange} disabled={formData.attending === 'Regretfully Decline'} className="w-full border-b-2 border-[#BCAAA4] bg-transparent py-3 text-[#2C3E2D] font-medium focus:outline-none focus:border-[#8B7355] transition-colors appearance-none cursor-pointer disabled:opacity-50">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm uppercase tracking-widest text-[#3E2723] font-bold mb-2">Message for the Couple (Optional)</label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} rows={3} className="w-full border-b-2 border-[#BCAAA4] bg-transparent py-3 text-[#2C3E2D] font-medium placeholder-[#795548] focus:outline-none focus:border-[#8B7355] transition-colors resize-none" placeholder="Send your love..."></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-[#2C3E2D] text-white py-4 md:py-5 font-serif text-xl md:text-2xl tracking-widest hover:bg-[#1A251B] transition-colors duration-300 mt-8 md:mt-10 shadow-lg disabled:opacity-70 flex justify-center items-center">
                  {isSubmitting ? 'SENDING...' : 'SEND RSVP'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <footer className="bg-[#2C3E2D] text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl mb-4 tracking-wide">Bushra & Aamir</h2>
          <p className="font-sans font-semibold text-xs md:text-sm tracking-[0.2em] text-[#E8DCC4] mb-8">JULY 18, 2026</p>
          <div className="flex justify-center items-center gap-2 text-gray-300 font-light text-xs">
            <span>Made with</span>
            <Heart size={14} className="text-[#8B7355] fill-[#8B7355]" />
            <span>for the beautiful couple by Rehan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}