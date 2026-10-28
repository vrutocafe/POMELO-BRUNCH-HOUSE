import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (Lee de las variables de entorno de Vercel/Netlify)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [view, setView] = useState('client'); // 'client' o 'admin'
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado del Formulario del Cliente
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    plan_duration: 'weekly',
    dietary_pref: 'Balanceado',
    delivery_zone: 'Centro Histórico / Olas Altas',
    delivery_address: '',
    delivery_time_slot: '07:30 AM - 08:30 AM'
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function fetchSubscriptions() {
    if (!supabaseUrl) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setSubscriptions(data);
    setLoading(false);
  }

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.client_phone || !formData.delivery_address) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    const basePrice = formData.plan_duration === 'weekly' ? 1350 : 5000;

    if (supabaseUrl) {
      const { error } = await supabase.from('subscriptions').insert([
        { 
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          plan_duration: formData.plan_duration,
          meal_types: ['desayuno', 'comida'],
          dietary_pref: formData.dietary_pref,
          delivery_zone: formData.delivery_zone,
          delivery_address: formData.delivery_address,
          delivery_time_slot: formData.delivery_time_slot,
          total_price: basePrice,
          status: 'activo'
        }
      ]);

      if (error) {
        alert('Error al registrar: ' + error.message);
        return;
      }
      fetchSubscriptions();
    }

    // Mensaje directo a WhatsApp del Chef
    const message = `*NUEVA SUSCRIPCIÓN - POMELO BRUNCH HOUSE*%0A%0A` +
      `👤 *Cliente:* ${formData.client_name}%0A` +
      `📞 *Teléfono:* ${formData.client_phone}%0A` +
      `📅 *Plan:* ${formData.plan_duration}%0A` +
      `🥗 *Dieta:* ${formData.dietary_pref}%0A` +
      `📍 *Zona:* ${formData.delivery_zone}%0A` +
      `🏠 *Dirección:* ${formData.delivery_address}%0A` +
      `⏰ *Horario:* ${formData.delivery_time_slot}%0A` +
      `💰 *Total:* $${basePrice} MXN`;
      
    window.open(`https://wa.me/526690000000?text=${message}`, '_blank');
    alert('¡Pedido generado con éxito! Redirigiendo a WhatsApp...');
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#FAF7F2', minHeight: '100vh', padding: '20px', color: '#2C3E2D' }}>
      
      {/* HEADER CON CAMBIO DE VISTA (DEMO) */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#fff', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#E05A47', margin: 0, fontSize: '22px' }}>🍊 Pomelo Brunch House</h1>
        <div>
          <button 
            onClick={() => setView('client')}
            style={{ padding: '8px 16px', marginRight: '10px', backgroundColor: view === 'client' ? '#E05A47' : '#eee', color: view === 'client' ? '#fff' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Vista Cliente
          </button>
          <button 
            onClick={() => setView('admin')}
            style={{ padding: '8px 16px', backgroundColor: view === 'admin' ? '#2E5B44' : '#eee', color: view === 'admin' ? '#fff' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Panel del Chef (Operación)
          </button>
        </div>
      </header>

      {/* VISTA CLIENTE */}
      {view === 'client' && (
        <main style={{ maxWidth: '700px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <h2 style={{ color: '#2E5B44', marginTop: 0 }}>Comida Real & Saludable a Domicilio</h2>
          <p style={{ color: '#666', lineHeight: '1.5' }}>Planes de suscripción de Lunes a Viernes preparados por el Chef Iván Medina en Mazatlán con ingredientes frescos y locales.</p>

          <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <label>
              <strong>Nombre Completo:</strong>
              <input 
                type="text" 
                required 
                placeholder="Ej. María Pérez"
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
                value={formData.client_name}
                onChange={e => setFormData({...formData, client_name: e.target.value})}
              />
            </label>

            <label>
              <strong>Teléfono (WhatsApp):</strong>
              <input 
                type="tel" 
                required 
                placeholder="669 000 0000"
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
                value={formData.client_phone}
                onChange={e => setFormData({...formData, client_phone: e.target.value})}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <label>
                <strong>Duración del Plan:</strong>
                <select 
                  style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
                  value={formData.plan_duration}
                  onChange={e => setFormData({...formData, plan_duration: e.target.value})}
                >
                  <option value="weekly">Semanal (5 días L-V) - $1,350 MXN</option>
                  <option value="monthly">Mensual (20 días L-V) - $5,000 MXN</option>
                </select>
              </label>

              <label>
                <strong>Preferencias / Dieta:</strong>
                <select 
                  style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
                  value={formData.dietary_pref}
                  onChange={e => setFormData({...formData, dietary_pref: e.target.value})}
                >
                  <option value="Balanceado">Balanceado (General)</option>
                  <option value="Keto">Keto / Low Carb</option>
                  <option value="High Protein">High Protein</option>
                  <option value="Vegetariano">Vegetariano</option>
                </select>
              </label>
            </div>

            <label>
              <strong>Zona de Entrega en Mazatlán:</strong>
              <select 
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
                value={formData.delivery_zone}
                onChange={e => setFormData({...formData, delivery_zone: e.target.value})}
              >
                <option value="Centro Histórico / Olas Altas">Centro Histórico / Olas Altas</option>
                <option value="Malecón / Zona Dorada">Malecón / Zona Dorada</option>
                <option value="Marina Mazatlán / Cerritos">Marina Mazatlán / Cerritos</option>
                <option value="Plazuela Machado / Centro">Plazuela Machado / Centro</option>
              </select>
            </label>

            <label>
              <strong>Dirección Completa (Calle, Núm, Colonia):</strong>
              <input 
                type="text" 
                required 
                placeholder="Ej. Av. del Mar #123, Col. Centro"
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
                value={formData.delivery_address}
                onChange={e => setFormData({...formData, delivery_address: e.target.value})}
              />
            </label>

            <label>
              <strong>Horario de Entrega (Lunes a Viernes):</strong>
              <select 
                style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
                value={formData.delivery_time_slot}
                onChange={e => setFormData({...formData, delivery_time_slot: e.target.value})}
              >
                <option value="07:30 AM - 08:30 AM">07:30 AM - 08:30 AM (Mañanero)</option>
                <option value="08:30 AM - 09:30 AM">08:30 AM - 09:30 AM (Estándar)</option>
              </select>
            </label>

            <button 
              type="submit" 
              style={{ marginTop: '10px', padding: '14px', backgroundColor: '#E05A47', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Confirmar Suscripción (L-V)
            </button>
          </form>
        </main>
      )}

      {/* VISTA PANEL DEL CHEF */}
      {view === 'admin' && (
        <main style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#2E5B44', margin: 0 }}>Panel de Operación del Chef (Producción L-V)</h2>
            <button 
              onClick={fetchSubscriptions}
              style={{ padding: '8px 12px', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              🔄 Actualizar
            </button>
          </div>
          <p style={{ color: '#666', marginBottom: '20px' }}>Control de clientes activos, dietas y rutas de entrega partiendo desde las espaldas de Ley del Mar.</p>

          {loading ? (
            <p>Cargando registros...</p>
          ) : subscriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#FAF7F2', borderRadius: '12px', color: '#666' }}>
              <p>No hay suscripciones registradas todavía o Supabase está pendiente de conectar.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {subscriptions.map((sub) => (
                <div key={sub.id} style={{ padding: '15px 20px', border: '1px solid #eee', borderRadius: '10px', background: '#FAF7F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#2E5B44' }}>{sub.client_name}</h3>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}>
                      📞 {sub.client_phone} | 📍 <strong>{sub.delivery_zone}</strong> ({sub.delivery_address})
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>
                      Plan: {sub.plan_duration.toUpperCase()} | Dieta: {sub.dietary_pref} | Horario: {sub.delivery_time_slot}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '5px 10px', background: '#2E5B44', color: '#fff', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {sub.status}
                    </span>
                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#E05A47' }}>${sub.total_price} MXN</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

    </div>
  );
}
