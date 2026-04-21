'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const products = [
  {
    name: 'Brunette',
    images: ['/brunette.jpg'],
    tag: 'Técnica Exclusiva',
    description:
      'El Brunette es una técnica de coloración personalizada que trabaja sobre las tonalidades naturales del cabello oscuro, potenciando los reflejos cafés, caramelo y dorados que se revelan bajo la luz. A diferencia del balayage tradicional, el Brunette respeta el espíritu del cabello moreno: no busca aclararlo radicalmente, sino despertarlo. El resultado es un melting de tonos cálidos y profundos que luce completamente natural, de bajo mantenimiento y con una transición de raíz casi imperceptible, ideal para quienes quieren luminosidad sin renunciar a su esencia.',
  },
  {
    name: 'Rubia',
    images: ['/rubia.jpg', '/rubia1.jpg', '/rubia2.jpg', '/rubia3.jpg', '/rubia4.jpg'],
    tag: 'Técnica Exclusiva',
    description:
      'La técnica Rubia es un proceso de aclaración artesanal diseñado para transformar el cabello con una luminosidad dorada, acerada o platinada según la estructura y el deseo de cada clienta. Trabajando con mechas a mano alzada, babylights o full color, se logra un rubio que va desde el más natural y californiano hasta el más impactante y editorial. Cada proceso es único e irrepetible: se analiza el punto de partida del cabello, su historia química y el resultado soñado para construir un rubio a medida, saludable, brillante y de larga duración.',
  },
  {
    name: 'Extracción de Pigmentos Oscuros',
    images: ['/extraccion-pigmentos-oscuros.jpg'],
    tag: 'Corrección de Color',
    description:
      'La extracción de pigmentos oscuros es una técnica de corrección de color que retira gradualmente los residuos de tintes profundos acumulados en la fibra capilar. Se utiliza cuando se desea pasar de tonos oscuros a bases más claras sin comprometer la salud del cabello. El proceso se realiza por etapas, con diagnóstico previo, protección de la estructura y matización final para neutralizar reflejos no deseados. El objetivo no es solo aclarar: es recuperar un lienzo limpio, uniforme y brillante para construir un nuevo color con precisión profesional.',
  },
];

function ImageCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={images[current]}
            alt=""
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </AnimatePresence>
      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '20px' : '7px',
                height: '7px',
                background: i === current ? '#FBF6F0' : 'rgba(251,246,240,0.45)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsSection() {
  return (
    <section
      className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #EDD9C8 0%, #FBF6F0 100%)' }}
    >
      {/* Fondo decorativo */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C4A88222 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #C4A882)' }} />
            <span
              className="text-xs tracking-[0.4em] uppercase"
              style={{ color: '#9D7B6F', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
            >
              Nuestros Servicios
            </span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #C4A882)' }} />
          </div>
          <h2
            style={{ fontFamily: "'Playfair Display', serif", backgroundImage: 'linear-gradient(135deg, #5C3D35 0%, #9D7B6F 60%, #C4A882 100%)' }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-transparent bg-clip-text"
          >
            Técnicas de Color
          </h2>
        </motion.div>

        {/* Colección premium */}
        <div className="md:grid md:grid-cols-3 md:gap-8 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3 md:overflow-visible md:pb-0 -mx-4 sm:-mx-6 md:mx-0 px-4 sm:px-6 md:px-0">
          {products.map((product, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className="min-w-[82vw] sm:min-w-[62vw] md:min-w-0 snap-center rounded-[24px] sm:rounded-[30px] overflow-hidden border shadow-xl"
              style={{
                background: 'linear-gradient(180deg, rgba(251,246,240,0.94) 0%, rgba(244,232,220,0.92) 100%)',
                borderColor: 'rgba(196,168,130,0.5)',
                boxShadow: '0 18px 45px rgba(122,92,82,0.14)',
              }}
            >
              {/* Imagen / Carrusel */}
              <div className="relative h-[320px] sm:h-[380px] md:h-[430px]">
                <ImageCarousel images={product.images} />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(60,38,32,0.56) 0%, rgba(60,38,32,0.05) 55%)' }}
                />
                <div className="absolute top-5 left-5 z-10">
                  <span
                    className="px-4 py-1.5 rounded-full text-[0.62rem] tracking-[0.24em] uppercase"
                    style={{
                      background: 'rgba(251,246,240,0.88)',
                      color: '#7A5C52',
                      fontFamily: "'Poppins', sans-serif",
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {product.tag}
                  </span>
                </div>
                <div className="absolute bottom-5 right-5 z-10">
                  <span
                    className="text-xs tracking-[0.3em]"
                    style={{ color: '#F4E8DC', fontFamily: "'Poppins', sans-serif" }}
                  >
                    0{i + 1}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 sm:p-7 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px" style={{ background: '#C4A882' }} />
                  <span
                    className="text-[0.65rem] tracking-[0.33em] uppercase"
                    style={{ color: '#9D7B6F', fontFamily: "'Poppins', sans-serif" }}
                  >
                    Signature Color
                  </span>
                </div>

                <h3
                  style={{ fontFamily: "'Playfair Display', serif", color: '#5C3D35' }}
                  className="text-3xl sm:text-4xl md:text-[2.5rem] font-medium leading-[1.04] mb-3 sm:mb-4"
                >
                  {product.name}
                </h3>

                <p
                  style={{ fontFamily: "'Poppins', sans-serif", color: '#7A6058', lineHeight: '1.8' }}
                  className="text-[0.95rem] font-light mb-7"
                >
                  {product.description}
                </p>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="self-start">
                  <a href="/appointment">
                    <button
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      className="relative px-8 py-3 text-xs font-medium tracking-[0.23em] uppercase text-white rounded-full overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'linear-gradient(135deg, #7A5C52, #9D7B6F, #C4A882)' }}
                      />
                      <motion.div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                        <motion.div
                          className="absolute top-0 left-0 w-10 h-full skew-x-12"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                          animate={{ x: ['-120%', '320%'] }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                        />
                      </motion.div>
                      <span className="relative z-10">Agendar esta técnica</span>
                    </button>
                  </a>
                </motion.div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
