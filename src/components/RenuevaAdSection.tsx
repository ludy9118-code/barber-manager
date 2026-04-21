'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const renuevaImages = ['/renueva-cover.jpg', '/renueva-1.jpg', '/renueva-2.jpg'];

export default function RenuevaAdSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % renuevaImages.length);
    }, 3400);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative py-12 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #F5EADF 0%, #EED9C6 100%)' }}
    >
      <motion.div
        className="absolute -top-20 right-0 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(196,168,130,0.4) 0%, transparent 72%)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="rounded-[1.5rem] sm:rounded-[2rem] border p-3 sm:p-4 md:p-6 lg:p-8"
          style={{
            borderColor: 'rgba(196,168,130,0.45)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.74) 0%, rgba(251,246,240,0.68) 100%)',
            boxShadow: '0 22px 45px rgba(92,61,53,0.12)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-7 lg:gap-10 items-center">
            <div className="relative rounded-[1.2rem] sm:rounded-[1.6rem] overflow-hidden min-h-[260px] sm:min-h-[380px] md:min-h-[520px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.85, ease: 'easeInOut' }}
                >
                  <Image
                    src={renuevaImages[current]}
                    alt="Renueva Color Studio"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                </motion.div>
              </AnimatePresence>

              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(60,38,32,0.5) 0%, rgba(60,38,32,0.08) 56%)' }}
              />

              <div className="absolute top-6 left-6 z-10">
                <span
                  className="px-4 py-1.5 rounded-full text-[0.65rem] tracking-[0.24em] uppercase"
                  style={{
                    background: 'rgba(251,246,240,0.9)',
                    color: '#7A5C52',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Anuncio Especial
                </span>
              </div>

              <div className="absolute bottom-6 left-6 z-10 flex gap-2">
                {renuevaImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="rounded-full transition-all duration-300 border"
                    style={{
                      width: i === current ? '28px' : '8px',
                      height: '8px',
                      background: i === current ? '#FFF8EF' : 'rgba(251,246,240,0.35)',
                      borderColor: i === current ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)',
                      boxShadow: i === current ? '0 0 14px rgba(255,255,255,0.55)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="px-1 sm:px-2 md:px-3 lg:px-4 pt-2 sm:pt-0">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-px" style={{ background: 'linear-gradient(to right, transparent, #B0897A)' }} />
                <span
                  className="px-3 py-1 rounded-full text-[0.62rem] tracking-[0.22em] uppercase"
                  style={{
                    color: '#7A5C52',
                    background: 'rgba(196,168,130,0.18)',
                    border: '1px solid rgba(196,168,130,0.45)',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Coleccion Renueva
                </span>
                <div className="w-10 h-px" style={{ background: 'linear-gradient(to left, transparent, #B0897A)' }} />
              </div>

              <h3
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] font-medium mb-4 sm:mb-6"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#5C3D35',
                  textShadow: '0 1px 0 rgba(255,255,255,0.95), 0 0 18px rgba(255,255,255,0.7), 0 10px 24px rgba(122,92,82,0.2)',
                }}
              >
                <span>Renueva tu imagen</span>
              </h3>

              <p
                className="text-sm sm:text-base md:text-[1.02rem] leading-7 sm:leading-8 mb-5 sm:mb-7"
                style={{ color: '#755E55', fontFamily: "'Poppins', sans-serif" }}
              >
                Una propuesta de transformacion premium con diseno de color personalizado, brillo multidimensional y acabado impecable.
                Renueva revela una version mas luminosa, elegante y sofisticada de ti.
              </p>

              <div className="space-y-3 mb-8">
                {['Diagnostico capilar profesional', 'Color a medida segun tu tono de piel', 'Resultado armonioso y de lujo'].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C4A882' }} />
                    <p
                      className="text-[0.74rem] tracking-[0.22em] uppercase"
                      style={{ color: '#8A6F65', fontFamily: "'Poppins', sans-serif" }}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link href="/appointment">
                  <button
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    className="relative px-9 py-3.5 text-xs font-medium tracking-[0.23em] uppercase text-white rounded-full overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #7A5C52, #9D7B6F, #C4A882)' }}
                    />
                    <motion.div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                      <motion.div
                        className="absolute top-0 left-0 w-10 h-full skew-x-12"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent)' }}
                        animate={{ x: ['-120%', '320%'] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                      />
                    </motion.div>
                    <span className="relative z-10">Agendar transformacion</span>
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
