'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AppointmentForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    procedure: '',
    dreamResult: '',
    referencePhoto: null as File | null,
    hairHistory: [] as string[],
    hairHistoryOther: '',
    currentPhoto: null as File | null,
    preferredDates: '',
    clientPhone: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReferencePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        referencePhoto: e.target.files![0],
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        currentPhoto: e.target.files[0],
      });
    }
  };

  const handleHairHistoryToggle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      hairHistory: prev.hairHistory.includes(value)
        ? prev.hairHistory.filter((item) => item !== value)
        : [...prev.hairHistory, value],
    }));
  };

  const isStepValid = () => {
    const currentField = steps[step].field as keyof typeof formData;

    if (currentField === 'dreamResult') {
      return formData.dreamResult.trim().length > 0 || formData.referencePhoto !== null;
    }

    if (currentField === 'hairHistory') {
      return formData.hairHistory.length > 0 || formData.hairHistoryOther.trim().length > 0;
    }

    if (currentField === 'clientPhone') {
      return /^[+0-9\s\-()]{7,20}$/.test(formData.clientPhone.trim());
    }

    return Boolean((formData[currentField] as string)?.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('fullName', formData.fullName);
      fd.append('procedure', formData.procedure);
      fd.append('dreamResult', formData.dreamResult);
      fd.append('hairHistory', JSON.stringify(formData.hairHistory));
      fd.append('hairHistoryOther', formData.hairHistoryOther);
      fd.append('preferredDates', formData.preferredDates);
      fd.append('clientPhone', formData.clientPhone.trim());
      if (formData.referencePhoto) fd.append('referencePhoto', formData.referencePhoto);
      if (formData.currentPhoto) fd.append('currentPhoto', formData.currentPhoto);

      const res = await fetch('/api/appointments', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Error al enviar');
      setAppointmentId(json.id);
      setSuccess(true);
      setFormData({
        fullName: '',
        procedure: '',
        dreamResult: '',
        referencePhoto: null,
        hairHistory: [],
        hairHistoryOther: '',
        currentPhoto: null,
        preferredDates: '',
        clientPhone: '',
      });
      setStep(0);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No pudimos registrar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const steps = [
    {
      title: 'Nombre completo',
      field: 'fullName',
      type: 'text',
      placeholder: 'Escribe tu nombre y apellido',
    },
    {
      title: 'Procedimiento que deseas',
      field: 'procedure',
      type: 'textarea',
      placeholder: 'Ejemplo: Balayage, correccion de color, corte, tratamiento, etc.',
    },
    {
      title: 'Resultado que sueñas',
      field: 'dreamResult',
      type: 'textarea',
      placeholder: 'Describe tu resultado ideal o comparte tu foto de referencia',
    },
    {
      title: 'Historial de tu cabello',
      field: 'hairHistory',
      type: 'multi',
      placeholder: '',
    },
    {
      title: '¿Cuándo te gustaría venir?',
      field: 'preferredDates',
      type: 'textarea',
      placeholder: 'Ejemplo: Lunes o martes por la mañana, después de las 4pm, fines de semana...',
    },
    {
      title: 'Tu número de teléfono',
      field: 'clientPhone',
      type: 'tel',
      placeholder: 'Ej: +57 300 123 4567',
    },
  ];

  const hairHistoryOptions = [
    'Keratinas',
    'Decoloraciones',
    'Tintes',
    'Alisados',
    'Botox capilar',
    'Mechas o balayage',
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6"
        >
          <p className="text-center" style={{ color: '#4E7A59', fontFamily: 'var(--font-poppins)' }}>
            Tu cita de valoración ha sido registrada con éxito. <br />
            Nuestro equipo se comunicará contigo muy pronto.
          </p>
          <p className="text-center text-sm mt-3" style={{ color: '#5C3D35', fontFamily: 'var(--font-poppins)' }}>
            Cuando tu solicitud sea aceptada, inicia sesión con tu número de teléfono en <a href="/auth/login" className="underline">tu portal de cliente</a>.
          </p>
          {appointmentId && (
            <div className="mt-4 text-center">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>Tu número de seguimiento</p>
              <a
                href={`/appointment/status/${appointmentId}`}
                className="inline-block px-4 py-2 rounded-lg text-sm font-mono break-all underline"
                style={{ color: '#5C3D35' }}
              >
                {appointmentId}
              </a>
              <p className="text-xs mt-1" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>Guarda este código para consultar el estado de tu cita</p>
            </div>
          )}
        </motion.div>
      )}

      {submitError && (
        <div className="mb-4 rounded-lg border px-4 py-3" style={{ borderColor: '#F5C6C6', background: '#FAE8E8', color: '#A84444', fontFamily: 'var(--font-poppins)' }}>
          {submitError}
        </div>
      )}

      <motion.form onSubmit={handleSubmit} variants={containerVariants} initial="hidden" animate="visible">
        {step < steps.length ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-light italic mb-4" style={{ color: '#5C3D35', fontFamily: 'var(--font-playfair)' }}>
                {steps[step].title}
              </h2>
              <p className="text-xs sm:text-sm mb-4 uppercase tracking-[0.14em] sm:tracking-[0.2em]" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>
                Paso {step + 1} de {steps.length + 1}
              </p>
            </div>

            {steps[step].type === 'multi' ? (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: '#7A6058', fontFamily: 'var(--font-poppins)' }}>
                  Selecciona todo lo que te has realizado en los ultimos 4 años.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {hairHistoryOptions.map((option) => {
                    const checked = formData.hairHistory.includes(option);

                    return (
                      <label
                        key={option}
                        className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition min-h-[48px]"
                        style={{
                          borderColor: checked ? '#9D7B6F' : '#C4A882',
                          background: checked ? 'rgba(196,168,130,0.18)' : 'rgba(255,255,255,0.72)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleHairHistoryToggle(option)}
                          className="w-4 h-4"
                          style={{ accentColor: '#9D7B6F' }}
                        />
                        <span style={{ color: '#5C3D35', fontFamily: 'var(--font-poppins)' }}>{option}</span>
                      </label>
                    );
                  })}
                </div>

                <div>
                  <label
                    className="block text-sm mb-2"
                    style={{ color: '#7A6058', fontFamily: 'var(--font-poppins)' }}
                  >
                    Otros procedimientos
                  </label>
                  <textarea
                    name="hairHistoryOther"
                    value={formData.hairHistoryOther}
                    onChange={handleChange}
                    placeholder="Escribe aqui cualquier otro procedimiento que te hayas realizado"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none transition resize-none h-28"
                    style={{ borderColor: '#C4A882', color: '#5C3D35', fontFamily: 'var(--font-poppins)' }}
                  />
                </div>
              </div>
            ) : steps[step].type === 'textarea' ? (
              <div className="space-y-4">
                <textarea
                  name={steps[step].field}
                  value={(formData[steps[step].field as keyof typeof formData] as string) || ''}
                  onChange={handleChange}
                  placeholder={steps[step].placeholder}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none transition resize-none h-40"
                  style={{ borderColor: '#C4A882', color: '#5C3D35', fontFamily: 'var(--font-poppins)' }}
                />

                {steps[step].field === 'dreamResult' && (
                  <div className="border-2 border-dashed rounded-lg p-5 text-center transition" style={{ borderColor: '#C4A882', background: 'rgba(251,246,240,0.7)' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReferencePhotoChange}
                      className="hidden"
                      id="reference-photo-input"
                    />
                    <label htmlFor="reference-photo-input" className="cursor-pointer block">
                      <p className="text-sm tracking-[0.2em] uppercase mb-2" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>
                        Foto de referencia (opcional)
                      </p>
                      <p className="font-light" style={{ color: '#6B4E44', fontFamily: 'var(--font-poppins)' }}>
                        {formData.referencePhoto ? formData.referencePhoto.name : 'Haz clic para subir una foto de inspiracion'}
                      </p>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type={steps[step].type}
                  name={steps[step].field}
                  value={(formData[steps[step].field as keyof typeof formData] as string) || ''}
                  onChange={handleChange}
                  placeholder={steps[step].placeholder}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none transition"
                  style={{ borderColor: '#C4A882', color: '#5C3D35', fontFamily: 'var(--font-poppins)' }}
                />
                {steps[step].field === 'clientPhone' && (
                  <p className="text-xs" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>
                    Con este número podrás iniciar sesión en tu cuenta cuando tu cita sea aceptada.
                  </p>
                )}
              </div>
            )}

            <div className="mobile-safe-sticky flex flex-wrap gap-3 justify-between pt-2 sm:pt-4">
              {/* Botón Anterior */}
              {step > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    style={{fontFamily: "'Poppins', sans-serif"}}
                    className="group relative w-full sm:w-auto px-5 sm:px-8 py-2.5 text-sm sm:text-base font-light tracking-[0.12em] sm:tracking-widest overflow-hidden rounded-lg"
                    
                    
                    
                  >
                    <motion.div 
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #F2ECE5, #E8DDD1)' }}
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute inset-0 border rounded-lg"
                      style={{ borderColor: '#C4A882' }}
                      initial={{ opacity: 0.3 }}
                      whileHover={{ opacity: 0.8 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10" style={{ color: '#6B4E44' }}>Anterior</span>
                  </button>
                </motion.div>
              )}
              <div />
              {/* Botón Siguiente */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (isStepValid()) {
                      setStep(step + 1);
                    }
                  }}
                  style={{fontFamily: "'Poppins', sans-serif"}}
                  className="group relative w-full sm:w-auto min-h-[48px] px-5 sm:px-8 py-2.5 text-sm sm:text-base font-medium tracking-[0.12em] sm:tracking-widest text-white overflow-hidden rounded-lg"
                >
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #7A5C52, #9D7B6F, #C4A882)' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-lg shadow-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0))' }}
                    whileHover={{ boxShadow: '0 0 24px rgba(122,92,82,0.35)' }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Siguiente
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-light italic mb-4" style={{ color: '#5C3D35', fontFamily: 'var(--font-playfair)' }}>
                Foto actual de tu cabello
              </h2>
              <p className="text-xs sm:text-sm mb-4 uppercase tracking-[0.14em] sm:tracking-[0.2em]" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>
                Paso {steps.length + 1} de {steps.length + 1} — Foto actual
              </p>
              <p className="text-sm mb-4" style={{ color: '#7A6058', fontFamily: 'var(--font-poppins)' }}>
                Idealmente tomada frente a una ventana con luz natural.
              </p>
            </div>

            <div className="border-2 border-dashed rounded-lg p-5 sm:p-8 text-center transition cursor-pointer" style={{ borderColor: '#C4A882', background: 'rgba(251,246,240,0.7)' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-input"
              />
              <label htmlFor="photo-input" className="cursor-pointer">
                <p className="text-sm tracking-[0.2em] uppercase mb-2" style={{ color: '#9D7B6F', fontFamily: 'var(--font-poppins)' }}>
                  Archivo de imagen
                </p>
                <p className="font-light" style={{ color: '#6B4E44', fontFamily: 'var(--font-poppins)' }}>
                  {formData.currentPhoto ? formData.currentPhoto.name : 'Haz clic para subir tu foto'}
                </p>
              </label>
            </div>

            <div className="mobile-safe-sticky flex flex-wrap gap-3 justify-between pt-2 sm:pt-4">
              {/* Botón Anterior */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  style={{fontFamily: "'Poppins', sans-serif"}}
                  className="group relative w-full sm:w-auto px-5 sm:px-8 py-2.5 text-sm sm:text-base font-light tracking-[0.12em] sm:tracking-widest overflow-hidden rounded-lg"
                >
                  <motion.div 
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #F2ECE5, #E8DDD1)' }}
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute inset-0 border rounded-lg"
                    style={{ borderColor: '#C4A882' }}
                    initial={{ opacity: 0.3 }}
                    whileHover={{ opacity: 0.8 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10" style={{ color: '#6B4E44' }}>Anterior</span>
                </button>
              </motion.div>

              {/* Botón Completar Valoración - Premium */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{fontFamily: "'Poppins', sans-serif"}}
                  className="group relative w-full sm:w-auto min-h-[48px] px-6 sm:px-10 py-2.5 text-sm sm:text-base font-medium tracking-[0.12em] sm:tracking-widest overflow-hidden rounded-full disabled:opacity-50"
                >
                  {/* Efecto de brillo animado */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #7A5C52, #9D7B6F, #C4A882)', backgroundSize: '200% 200%' }}
                    animate={{ backgroundPosition: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Sombra interna */}
                  <motion.div
                    className="absolute inset-0 rounded-full shadow-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0))' }}
                    whileHover={{ boxShadow: '0 0 30px rgba(122,92,82,0.45)' }}
                  />

                  {/* Borde dorado */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-white/20"
                    whileHover={{ borderColor: 'rgba(255,255,255,0.4)' }}
                  />
                  
                  {/* Contenedor de texto */}
                  <div className="relative z-10 text-white drop-shadow-md">
                    {loading ? 'Enviando...' : 'Confirmar valoracion'}
                  </div>

                  {/* Efecto de destello */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.form>
    </div>
  );
}
