'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      // TODO: Implementar registro con API
      setSuccess('¡Registro exitoso! Redirecting...');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (err) {
      setError('Error en el registro. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="w-full max-w-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-light text-gray-700 mb-2">
            Nombre completo
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition"
            placeholder="Tu nombre"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-light text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none transition" style={{borderColor: '#C4A882'}}
            placeholder="tu@email.com"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-light text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition"
            placeholder="+57 300 000 0000"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-light text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition"
            placeholder="••••••••"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-light text-gray-700 mb-2">
            Confirmar contraseña
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition"
            placeholder="••••••••"
          />
        </motion.div>

        {error && (
          <motion.p variants={itemVariants} className="text-red-500 text-sm">
            {error}
          </motion.p>
        )}

        {success && (
          <motion.p variants={itemVariants} className="text-green-500 text-sm">
            {success}
          </motion.p>
        )}

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading}
          className="w-full py-2 text-white font-light rounded-lg hover:shadow-lg transition disabled:opacity-50" style={{background: 'linear-gradient(135deg, #B8846E, #9D7B6F)'}}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </motion.button>

        <motion.p variants={itemVariants} className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="hover:opacity-70 transition" style={{color: '#9D7B6F'}}>
            Inicia sesión
          </Link>
        </motion.p>
      </form>
    </motion.div>
  );
}
