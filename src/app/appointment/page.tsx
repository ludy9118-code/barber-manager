'use client';

import { motion } from 'framer-motion';
import AppointmentForm from '@/components/AppointmentForm';

export default function AppointmentPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 py-14 sm:py-20" style={{background: 'linear-gradient(135deg, #FBF6F0 0%, #F7EDE4 40%, #F0E4DA 100%)'}}>
      <motion.div
        className="max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            variants={itemVariants}
            className="mx-auto mb-6 relative w-[122px] h-[122px] sm:w-[152px] sm:h-[152px]"
          >
            <motion.div
              className="absolute inset-0 rounded-full p-[2px]"
              style={{
                background: 'conic-gradient(from 0deg, #C4A882, #9D7B6F, #5C3D35, #C4A882)',
                boxShadow: '0 10px 26px rgba(122,92,82,0.25)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            />
            <div
              className="relative z-10 w-full h-full rounded-full flex items-center justify-center p-3"
              style={{ background: 'linear-gradient(180deg, #FFFDFB 0%, #F4E8DC 100%)' }}
            >
              <div className="w-full h-full rounded-full overflow-hidden" style={{ border: '1px solid rgba(196,168,130,0.55)' }}>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <defs>
                    <radialGradient id="appointmentLogoBg" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" style={{stopColor:'#B8956E', stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:'#8B6F47', stopOpacity:1}} />
                    </radialGradient>
                  </defs>

                  <circle cx="100" cy="100" r="98" fill="url(#appointmentLogoBg)" stroke="#A68A6F" strokeWidth="1.5"/>
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#D4C5B9" strokeWidth="1" opacity="0.6"/>

                  <line x1="60" y1="45" x2="140" y2="45" stroke="#E8D5C4" strokeWidth="0.8" opacity="0.8"/>

                  <text x="100" y="82" style={{fontFamily: "'Playfair Display', serif", fontWeight: 500, letterSpacing: '4px'}} fontSize="32" textAnchor="middle" fill="#F5EFE7">
                    COLOR
                  </text>

                  <text x="100" y="110" style={{fontFamily: "'Playfair Display', serif", fontWeight: 500, letterSpacing: '4px'}} fontSize="28" textAnchor="middle" fill="#F5EFE7">
                    STUDIO
                  </text>

                  <circle cx="95" cy="125" r="1.5" fill="#E8D5C4"/>
                  <circle cx="100" cy="125" r="1.5" fill="#E8D5C4"/>
                  <circle cx="105" cy="125" r="1.5" fill="#E8D5C4"/>

                  <text x="100" y="148" style={{fontFamily: "'Poppins', sans-serif", fontWeight: 300, letterSpacing: '2px'}} fontSize="10" textAnchor="middle" fill="#D4C5B9">
                    G U S T A V O
                  </text>

                  <line x1="60" y1="155" x2="140" y2="155" stroke="#E8D5C4" strokeWidth="0.8" opacity="0.8"/>
                </svg>
              </div>
            </div>
          </motion.div>

          <p
            className="text-[0.62rem] sm:text-[0.68rem] tracking-[0.3em] sm:tracking-[0.42em] uppercase mb-4"
            style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}
          >
            Experiencia Personalizada
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-light italic mb-6 leading-tight" style={{fontFamily: "var(--font-playfair)"}}>
            <span className="text-transparent bg-clip-text" style={{backgroundImage: 'linear-gradient(135deg, #7A5C52, #9D7B6F, #C4A882)'}}>
              Bienvenida a Color Studio
            </span>
          </h1>

          <div className="max-w-2xl mx-auto space-y-4 leading-relaxed" style={{ color: '#7A6058' }}>
            <motion.p variants={itemVariants} className="text-base sm:text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
              Un espacio donde el color se transforma en arte y cada detalle esta pensado para realzar tu esencia.
            </motion.p>

            <motion.p variants={itemVariants} className="text-base sm:text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
              Sera un placer acompanarte en tu proxima evolucion de imagen.
            </motion.p>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div variants={itemVariants} className="rounded-2xl p-5 sm:p-8 mb-10 sm:mb-12 shadow-lg" style={{background: 'rgba(251, 246, 240, 0.85)', backdropFilter: 'blur(8px)'}}>
          <h2 className="text-xl sm:text-2xl font-light italic mb-6" style={{ color: '#5C3D35', fontFamily: 'var(--font-playfair)' }}>
            Para brindarte una asesoria completamente personalizada, completa el siguiente formulario.
          </h2>

          <ul className="space-y-3" style={{ color: '#6F5750' }}>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(196,168,130,0.25)', color: '#7A5C52' }}>01</span>
              <span className="font-light">Nombre completo</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(196,168,130,0.25)', color: '#7A5C52' }}>02</span>
              <span className="font-light">Procedimiento que deseas realizarte</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(196,168,130,0.25)', color: '#7A5C52' }}>03</span>
              <span className="font-light text-sm sm:text-base">Resultado que sueñas (foto de referencia o descripcion)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(196,168,130,0.25)', color: '#7A5C52' }}>04</span>
              <span className="font-light">Historial de tu cabello (ultimos 4 años)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(196,168,130,0.25)', color: '#7A5C52' }}>05</span>
              <span className="font-light">Disponibilidad preferida + correo y clave para tu acceso de clienta</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(196,168,130,0.25)', color: '#7A5C52' }}>06</span>
              <span className="font-light">Foto actual de tu cabello con luz natural</span>
            </li>
          </ul>
        </motion.div>

        {/* Form Section */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 sm:p-8 shadow-xl">
          <AppointmentForm />
        </motion.div>

        {/* Footer Message */}
        <motion.div variants={itemVariants} className="text-center mt-12" style={{ color: '#7A6058' }}>
          <p className="text-sm font-light tracking-wide">
            Cada proceso es unico, y nos encanta disenarlo especialmente para ti.
          </p>
          <p className="text-sm font-light mt-2 tracking-wide">
            Gracias por confiar en nuestro criterio profesional.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
