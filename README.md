```react
import React, { useState } from 'react';
import {
  Utensils, Calendar, Clock, MapPin, Truck, CheckCircle2, Star, Sparkles,
  ChevronRight, ShoppingBag, ShieldCheck, Leaf, ChefHat, ArrowRight,
  Plus, Minus, X, MessageCircle, Sliders, Check, Phone, Users, RefreshCw,
  Edit3, DollarSign, Settings, Eye, LayoutDashboard, Save, RotateCcw, AlertCircle, Trash2
} from 'lucide-react';

// --- INITIAL DEFAULT DATA ---
const INITIAL_MENU = {
  Lunes: {
    Desayuno: { title: 'Bowl de Avena Nocturna con Matcha', desc: 'Avena integral activada, leche de almendra casera y frutos rojos.', cals: 390, prot: 16, carbs: 54, fat: 10, badge: 'Clean' },
    Comida: { title: 'Salmón Salvaje en Costra de Hierbas', desc: 'Filete horneado con puré de espárragos y camote rostizado.', cals: 580, prot: 44, carbs: 42, fat: 22, badge: 'Alto en Proteína' },
    Snack: { title: 'Energy Bites de Cacao & Dátiles', desc: 'Trufas artesanales sin azúcar refinada con nuez de la India.', cals: 150, prot: 5, carbs: 18, fat: 6, badge: 'Keto' }
  },
  Martes: {
    Desayuno: { title: 'Chilaquiles Horneados en Salsa Verde', desc: 'Totopos horneados, salsa de tomate de Sinaloa y queso de cabra.', cals: 440, prot: 32, carbs: 40, fat: 14, badge: 'Balance' },
    Comida: { title: 'Bowl Proteico de Arroz Silvestre & Pollo', desc: 'Pechuga en cítricos, aguacate fresco, edamames y tzatziki.', cals: 530, prot: 48, carbs: 45, fat: 16, badge: 'Alto en Proteína' },
    Snack: { title: 'Pudín de Chía con Mango Regional', desc: 'Leche de coco pura, mango fresco maduro y almendras.', cals: 160, prot: 4, carbs: 22, fat: 7, badge: 'Vegano' }
  },
  Miércoles: {
    Desayuno: { title: 'Omelette de Claras con Espárragos & Feta', desc: 'Con pan de masa madre artesanal y jitomate bola rostizado.', cals: 360, prot: 28, carbs: 24, fat: 12, badge: 'Low Carb' },
    Comida: { title: 'Medallones de Filete en Chipotle Light', desc: 'Corte magro con verduras al vapor y puré de camote rústico.', cals: 610, prot: 50, carbs: 36, fat: 22, badge: 'Alto en Proteína' },
    Snack: { title: 'Hummus Orgánico & Bastones Veggies', desc: 'Pepino, zanahoria y apio con hummus casero de garbanzo.', cals: 140, prot: 6, carbs: 16, fat: 5, badge: 'Vegano' }
  },
  Jueves: {
    Desayuno: { title: 'Pancakes de Avena & Proteína con Plátano', desc: 'Servidos con miel de agave pura, frambuesas y nuez pecana.', cals: 420, prot: 24, carbs: 56, fat: 10, badge: 'Balance' },
    Comida: { title: 'Wrap Integral de Pavo Rostizado & Pesto', desc: 'Tortilla de espinaca, arúgula, jitomate cherry y aguacate.', cals: 490, prot: 40, carbs: 42, fat: 18, badge: 'Clean' },
    Snack: { title: 'Smoothie Verde Detox Pomelo', desc: 'Espinaca orgánica, piña, jengibre, pepino y agua de coco.', cals: 120, prot: 3, carbs: 24, fat: 1, badge: 'Detox' }
  },
  Viernes: {
    Desayuno: { title: 'Toast de Masa Madre con Aguacate & Huevo Pochado', desc: 'Sazonado con sal del Pacífico, hojuelas de chile y semillas.', cals: 410, prot: 20, carbs: 32, fat: 20, badge: 'Balance' },
    Comida: { title: 'Poke Bowl de Atún Aleta Azul de Mazatlán', desc: 'Atún fresco de pesca local, arroz integral, pepino y ponzu.', cals: 550, prot: 45, carbs: 52, fat: 14, badge: 'Alto en Proteína' },
    Snack: { title: 'Muffin de Arándanos & Harina de Almendra', desc: 'Horneado artesanal sin gluten endulzado con monkfruit.', cals: 170, prot: 6, carbs: 18, fat: 8, badge: 'Sin Azúcar' }
  }
};

const INITIAL_PRICING = {
  baseDailyPrice: 195,
  weeklyDiscountPct: 14,
  monthlyDiscountPct: 23,
  desayunoMultiplier: 1.0,
  comidaMultiplier: 1.25,
  completoMultiplier: 2.1
};

const INITIAL_ADDONS = [
  { id: 'juice', name: 'Jugo Verde Cold-Pressed (500ml)', price: 45, icon: '🥤', desc: 'Espinaca, piña, apio, jengibre y pepino.' },
  { id: 'pudding', name: 'Pudín de Chía & Mango', price: 38, icon: '🥭', desc: 'Antioxidantes y superalimentos frescos.' },
  { id: 'bites', name: 'Trufas Cacao & Dátil (3 pzas)', price: 35, icon: '🍫', desc: 'Sin azúcar refinada ni conservadores.' },
  { id: 'shake', name: 'Shake Proteína Avena & Almendra', price: 50, icon: '🥛', desc: '25g de proteína magra post-workout.' }
];

const INITIAL_ZONES = [
  { id: '1', name: 'Zona Dorada', arrivalSlot: '7:30 AM - 8:30 AM', fee: 0, active: true },
  { id: '2', name: 'Marina Mazatlán', arrivalSlot: '7:45 AM - 8:45 AM', fee: 0, active: true },
  { id: '3', name: 'Cerritos / Sabalo', arrivalSlot: '8:00 AM - 9:00 AM', fee: 0, active: true },
  { id: '4', name: 'Centro Histórico / Olas Altas', arrivalSlot: '8:15 AM - 9:15 AM', fee: 0, active: true },
  { id: '5', name: 'Real del Valle / Prados', arrivalSlot: '7:30 AM - 8:30 AM', fee: 0, active: true },
  { id: '6', name: 'Malecón / Palos Prietos', arrivalSlot: '8:10 AM - 9:10 AM', fee: 0, active: true }
];

const INITIAL_SUBSCRIBERS = [
  { id: 'SUB-101', name: 'Dra. Mariana Coppel', phone: '6691234567', zone: 'Marina Mazatlán', plan: 'Semanal (5 días)', mealType: 'Plan Completo', diet: 'Balance', status: 'Activo', totalPaid: 1764 },
  { id: 'SUB-102', name: 'Ing. Roberto Berdegué', phone: '6699876543', zone: 'Zona Dorada', plan: 'Mensual (20 días)', mealType: 'Comida Gourmet', diet: 'Alto en Proteína', status: 'Activo', totalPaid: 3220 },
  { id: 'SUB-103', name: 'Sofía Osuna', phone: '6694567890', zone: 'Centro Histórico', plan: 'Semanal (5 días)', mealType: 'Desayuno Power', diet: 'Keto / Low Carb', status: 'Pausado', totalPaid: 840 }
];

export default function App() {
  // --- VIEW MODE TOGGLE ---
  const [viewMode, setViewMode] = useState('client'); // 'client' or 'admin'

  // --- DYNAMIC GLOBAL STATES (Shared between Client and Admin) ---
  const [weeklyMenu, setWeeklyMenu] = useState(INITIAL_MENU);
  const [pricing, setPricing] = useState(INITIAL_PRICING);
  const [addons, setAddons] = useState(INITIAL_ADDONS);
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [subscribers, setSubscribers] = useState(INITIAL_SUBSCRIBERS);
  const [adminNotification, setAdminNotification] = useState('');

  // --- CLIENT CONFIGURATOR STATES ---
  const [selectedDuration, setSelectedDuration] = useState('semanal'); // 'dia', 'semanal', 'mensual'
  const [selectedMealType, setSelectedMealType] = useState('completo'); // 'desayuno', 'comida', 'completo'
  const [selectedDiet, setSelectedDiet] = useState('Balance Pomelo');
  const [selectedDays, setSelectedDays] = useState(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
  const [selectedZone, setSelectedZone] = useState('Zona Dorada');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [activeMenuDay, setActiveMenuDay] = useState('Lunes');

  // Client checkout modal & customer details
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', notes: '' });

  // --- ADMIN EDITING STATES ---
  const [adminTab, setAdminTab] = useState('menu'); // 'menu', 'pricing', 'zones', 'subscribers'
  const [editingDay, setEditingDay] = useState('Lunes');
  const [editingMealType, setEditingMealType] = useState('Desayuno');

  // --- HELPER NOTIFICATION ---
  const triggerNotification = (msg) => {
    setAdminNotification(msg);
    setTimeout(() => setAdminNotification(''), 3500);
  };

  // Reset to Defaults
  const resetToDefaults = () => {
    if (window.confirm('¿Deseas restaurar el menú, precios y zonas a los valores predeterminados?')) {
      setWeeklyMenu(INITIAL_MENU);
      setPricing(INITIAL_PRICING);
      setAddons(INITIAL_ADDONS);
      setZones(INITIAL_ZONES);
      triggerNotification('Valores predeterminados restaurados con éxito.');
    }
  };

  // --- DYNAMIC PRICING CALCULATIONS ---
  const getDaysCount = () => {
    if (selectedDuration === 'dia') return 1;
    if (selectedDuration === 'semanal') return selectedDays.length;
    if (selectedDuration === 'mensual') return selectedDays.length * 4;
    return 5;
  };

  const getMealMultiplier = () => {
    if (selectedMealType === 'desayuno') return pricing.desayunoMultiplier;
    if (selectedMealType === 'comida') return pricing.comidaMultiplier;
    return pricing.completoMultiplier;
  };

  const calculateTotal = () => {
    const daysCount = getDaysCount();
    let dailyBase = pricing.baseDailyPrice * getMealMultiplier();

    // Discount by duration
    if (selectedDuration === 'semanal') {
      dailyBase = dailyBase * (1 - pricing.weeklyDiscountPct / 100);
    } else if (selectedDuration === 'mensual') {
      dailyBase = dailyBase * (1 - pricing.monthlyDiscountPct / 100);
    }

    const mealsSubtotal = Math.round(dailyBase * daysCount);

    // Addons cost
    const addonsDailyCost = selectedAddons.reduce((acc, id) => {
      const item = addons.find(a => a.id === id);
      return acc + (item ? item.price : 0);
    }, 0);
    const addonsTotal = addonsDailyCost * daysCount;

    // Zone fee
    const zoneObj = zones.find(z => z.name === selectedZone);
    const zoneFeeTotal = (zoneObj ? zoneObj.fee : 0) * daysCount;

    return {
      dailyPrice: Math.round(dailyBase),
      daysCount,
      mealsSubtotal,
      addonsTotal,
      zoneFeeTotal,
      grandTotal: mealsSubtotal + addonsTotal + zoneFeeTotal
    };
  };

  const totals = calculateTotal();

  // WhatsApp Message Generator
  const handleSendWhatsAppOrder = (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert('Por favor llena los campos requeridos (*)');
      return;
    }

    const selectedAddonNames = selectedAddons.map(id => addons.find(a => a.id === id)?.name).filter(Boolean);

    const message = `*¡NUEVA SUSCRIPCIÓN - POMELO BRUNCH HOUSE!* 🍊\n` +
      `Hola Chef Iván, quiero confirmar mi plan de comida saludable:\n\n` +
      `📌 *Duración:* ${selectedDuration === 'dia' ? '1 Día de Prueba' : selectedDuration === 'semanal' ? '1 Semana (L-V)' : '1 Mes (20 Días L-V)'}\n` +
      `🥗 *Modalidad:* ${selectedMealType === 'desayuno' ? 'Desayuno Power' : selectedMealType === 'comida' ? 'Comida Gourmet' : 'Plan Completo (Desayuno + Comida + Snack)'}\n` +
      `🌱 *Régimen:* ${selectedDiet}\n` +
      `🗓️ *Días de Reparto:* ${selectedDays.join(', ')}\n` +
      `📍 *Zona de Mazatlán:* ${selectedZone}\n` +
      (selectedAddonNames.length > 0 ? `➕ *Add-ons:* ${selectedAddonNames.join(', ')}\n` : '') +
      `\n💰 *TOTAL CALCULADO:* $${totals.grandTotal} MXN\n\n` +
      `👤 *Cliente:* ${customer.name}\n` +
      `📞 *Teléfono:* ${customer.phone}\n` +
      `🏠 *Dirección:* ${customer.address}\n` +
      (customer.notes ? `📝 *Notas/Alergias:* ${customer.notes}\n` : '') +
      `\n¿Me apoyan con los datos para la transferencia? ¡Gracias!`;

    window.open(`https://wa.me/526691234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-orange-200 selection:text-orange-950">
      
      {/* --- TOP ADMIN / CLIENT SWITCHER BAR --- */}
      <div className="bg-stone-900 text-white py-2.5 px-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wider uppercase text-stone-300">
              {viewMode === 'client' ? 'Modo Vista Previa de Cliente' : 'Modo Gestor del Chef (Administrador)'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-stone-800 p-1 rounded-full border border-stone-700">
            <button
              onClick={() => setViewMode('client')}
              className={`flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold transition-all ${
                viewMode === 'client'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista Cliente</span>
            </button>

            <button
              onClick={() => setViewMode('admin')}
              className={`flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold transition-all ${
                viewMode === 'admin'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Panel del Chef</span>
            </button>
          </div>

        </div>
      </div>

      {/* --- NOTIFICATION BANNER --- */}
      {adminNotification && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center sticky top-11 z-40 shadow-sm flex items-center justify-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{adminNotification}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 1: CLIENT VISTA (Public Page)                      */}
      {/* ========================================================= */}
      {viewMode === 'client' && (
        <div>
          
          {/* NAVBAR */}
          <nav className="bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 sticky top-11 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <a href="#" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  🍊
                </div>
                <div>
                  <span className="text-xl font-extrabold text-stone-900 font-serif leading-none block">Pomelo</span>
                  <span className="text-[10px] tracking-widest text-orange-600 uppercase font-bold">Brunch House • Mazatlán</span>
                </div>
              </a>

              <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-700">
                <a href="#planes" className="hover:text-orange-600 transition-colors">Planes</a>
                <a href="#menu" className="hover:text-orange-600 transition-colors">Menú Semanal</a>
                <a href="#zonas" className="hover:text-orange-600 transition-colors">Zonas de Entrega</a>
                <a href="#chef" className="hover:text-orange-600 transition-colors">Chef Iván</a>
              </div>

              <a
                href="#planes"
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>Armar Mi Plan</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </a>
            </div>
          </nav>

          {/* HERO SECTION */}
          <section className="py-12 md:py-20 bg-gradient-to-b from-[#FAF8F5] via-orange-50/40 to-[#FAF8F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
              
              <div className="inline-flex items-center gap-2 bg-amber-100/90 border border-amber-200 text-amber-900 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                <ChefHat className="w-4 h-4 text-orange-600" />
                <span>Comida Real y Saludable por el Chef Iván Medina</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
                Tu Comida Saludable en Mazatlán, <span className="text-orange-600 underline decoration-amber-400">Sin Cocinar</span>
              </h1>

              <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
                Platillos frescos de autor entregados diariamente de <strong className="text-stone-900">Lunes a Viernes</strong> en la puerta de tu casa u oficina en Mazatlán.
              </p>

              {/* Quick Perks */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-xs font-medium text-stone-700">
                <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ingredientes Frescos</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center gap-2">
                  <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Entrega Matutina L-V</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center gap-2 col-span-2 sm:col-span-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sin Plazos Forzosos</span>
                </div>
              </div>

            </div>
          </section>

          {/* DYNAMIC PLAN CONFIGURATOR */}
          <section id="planes" className="py-16 bg-white border-y border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase text-orange-600 tracking-widest block mb-2">Paso a Paso</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
                  Configura Tu Suscripción
                </h2>
                <p className="text-stone-600 text-sm mt-2">
                  Elige la frecuencia, modalidad de alimentos y zona de entrega en Mazatlán.
                </p>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* CONFIGURATOR CONTROLS (7 Cols) */}
                <div className="lg:col-span-7 space-y-8 bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
                  
                  {/* 1. FREQUENCY */}
                  <div>
                    <label className="text-xs font-bold text-orange-700 uppercase tracking-wider block mb-2">1. Frecuencia del Plan</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dia', label: '1 Día de Prueba', sub: 'Sin descuento' },
                        { id: 'semanal', label: 'Semanal (L-V)', sub: `${pricing.weeklyDiscountPct}% OFF` },
                        { id: 'mensual', label: 'Mensual (20 Días L-V)', sub: `${pricing.monthlyDiscountPct}% OFF` }
                      ].map((dur) => (
                        <button
                          key={dur.id}
                          onClick={() => setSelectedDuration(dur.id)}
                          className={`p-3.5 rounded-2xl border text-center transition-all ${
                            selectedDuration === dur.id
                              ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-md'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <p className="text-xs sm:text-sm font-bold">{dur.label}</p>
                          <p className={`text-[10px] mt-0.5 ${selectedDuration === dur.id ? 'text-amber-400' : 'text-stone-500'}`}>
                            {dur.sub}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. MEAL TYPES */}
                  <div>
                    <label className="text-xs font-bold text-orange-700 uppercase tracking-wider block mb-2">2. Modalidad de Alimentos</label>
                    <div className="space-y-2.5">
                      {[
                        { id: 'desayuno', name: 'Desayuno Power', desc: 'Desayunos completos, bowls de avena, chilaquiles u omelettes.', icon: '🍳' },
                        { id: 'comida', name: 'Comida Gourmet', desc: 'Proteína de alta calidad, carbohidrato complejo y vegetales de temporada.', icon: '🥗' },
                        { id: 'completo', name: 'Plan Completo (Desayuno + Comida + Snack)', desc: 'Nutrición total del día. Cero preocupaciones de cocina.', icon: '🌟' }
                      ].map((meal) => (
                        <div
                          key={meal.id}
                          onClick={() => setSelectedMealType(meal.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                            selectedMealType === meal.id
                              ? 'bg-orange-50/80 border-orange-500 ring-1 ring-orange-500'
                              : 'bg-white border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <span className="text-2xl p-2 bg-stone-100 rounded-xl">{meal.icon}</span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900">{meal.name}</h4>
                            <p className="text-[11px] text-stone-500">{meal.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. DIETARY PROFILE */}
                  <div>
                    <label className="text-xs font-bold text-orange-700 uppercase tracking-wider block mb-2">3. Régimen Nutricional Preferido</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Balance Pomelo', 'Alto en Proteína', 'Keto / Low Carb', 'Vegetariano'].map((diet) => (
                        <button
                          key={diet}
                          onClick={() => setSelectedDiet(diet)}
                          className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                            selectedDiet === diet
                              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          {diet}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. MAZATLAN DELIVERY ZONE */}
                  <div>
                    <label className="text-xs font-bold text-orange-700 uppercase tracking-wider block mb-2">4. Zona de Entrega en Mazatlán</label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full p-3 bg-white rounded-2xl border border-stone-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {zones.filter(z => z.active).map((z) => (
                        <option key={z.id} value={z.name}>
                          {z.name} ({z.arrivalSlot}) - {z.fee === 0 ? 'Envío Gratis' : `+$${z.fee} MXN`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. ADDONS */}
                  <div>
                    <label className="text-xs font-bold text-orange-700 uppercase tracking-wider block mb-2">5. Add-ons Diarios (Opcional)</label>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {addons.map((add) => {
                        const isSelected = selectedAddons.includes(add.id);
                        return (
                          <div
                            key={add.id}
                            onClick={() => {
                              if (isSelected) setSelectedAddons(selectedAddons.filter(i => i !== add.id));
                              else setSelectedAddons([...selectedAddons, add.id]);
                            }}
                            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                              isSelected
                                ? 'bg-orange-50 border-orange-500 font-bold'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{add.icon}</span>
                              <span className="text-stone-800">{add.name}</span>
                            </span>
                            <span className="text-orange-700 font-bold">+${add.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* DYNAMIC SUMMARY & CHECKOUT BUTTON (5 Cols) */}
                <div className="lg:col-span-5 sticky top-28">
                  <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 space-y-6">
                    
                    <div className="border-b border-stone-800 pb-4 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Resumen del Plan</span>
                        <h3 className="text-2xl font-bold font-serif text-white">Tu Suscripción</h3>
                      </div>
                      <span className="text-3xl">🍊</span>
                    </div>

                    <div className="space-y-3 text-xs text-stone-300">
                      <div className="flex justify-between">
                        <span>Duración:</span>
                        <strong className="text-white">{selectedDuration === 'dia' ? '1 Día' : selectedDuration === 'semanal' ? '1 Semana' : '1 Mes'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Modalidad:</span>
                        <strong className="text-white capitalize">{selectedMealType}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Régimen:</span>
                        <strong className="text-white">{selectedDiet}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Zona Mazatlán:</span>
                        <strong className="text-white">{selectedZone}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Entregas incluidas:</span>
                        <strong className="text-white">{totals.daysCount} días</strong>
                      </div>
                    </div>

                    <div className="border-t border-stone-800 pt-4 space-y-2">
                      <div className="flex justify-between text-xs text-stone-400">
                        <span>Costo diario promedio:</span>
                        <span>${totals.dailyPrice} MXN /día</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2">
                        <span className="text-xs text-stone-400">Total Estimado:</span>
                        <span className="text-3xl font-extrabold text-amber-400 font-serif">${totals.grandTotal} <span className="text-xs text-stone-400 font-normal">MXN</span></span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-stone-950 font-extrabold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Pedir por WhatsApp</span>
                    </button>

                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* DYNAMIC WEEKLY MENU PREVIEW (Powered by Admin State) */}
          <section id="menu" className="py-16 bg-[#FAF8F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-600 block mb-1">Rotación Fresca Semanal</span>
                  <h2 className="text-3xl font-extrabold text-stone-900 font-serif">Menú de la Semana</h2>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 mt-2 md:mt-0">
                  *Actualizado en tiempo real por la cocina del Chef Iván Medina.
                </p>
              </div>

              {/* Day Selector Tabs */}
              <div className="flex gap-2 pb-4 overflow-x-auto mb-6">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveMenuDay(day)}
                    className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
                      activeMenuDay === day
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Day Dishes Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {['Desayuno', 'Comida', 'Snack'].map((type) => {
                  const dish = weeklyMenu[activeMenuDay]?.[type];
                  if (!dish) return null;

                  return (
                    <div key={type} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                            {type}
                          </span>
                          {dish.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                              {dish.badge}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-stone-900 font-serif">{dish.title}</h3>
                        <p className="text-xs text-stone-600 mt-2 leading-relaxed">{dish.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
                        <span>{dish.cals} kcal</span>
                        <div className="flex gap-2 text-[10px] bg-stone-50 p-1.5 rounded-lg border border-stone-200">
                          <span>P: <strong>{dish.prot}g</strong></span>
                          <span>C: <strong>{dish.carbs}g</strong></span>
                          <span>G: <strong>{dish.fat}g</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>

          {/* CHEF SPOTLIGHT */}
          <section id="chef" className="py-16 bg-white border-t border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-4xl shrink-0 border-2 border-orange-200">
                👨‍🍳
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-orange-600 tracking-wider">Garantía de Sazón</span>
                <h3 className="text-2xl font-bold font-serif text-stone-900 mt-1">Chef Iván Medina</h3>
                <p className="text-stone-600 text-sm mt-2 max-w-2xl leading-relaxed">
                  "Utilizamos insumos locales de Mazatlán y pesca del día. Cada menú está balanceado profesionalmente para que disfrutes comer rico y saludable todos los días sin aburrirte."
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="bg-stone-950 text-stone-400 py-8 text-center text-xs border-t border-stone-800">
            © {new Date().getFullYear()} Pomelo Brunch House Mazatlán. Todos los derechos reservados.
          </footer>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: PANEL DEL CHEF (ADMIN MANAGEMENT DASHBOARD)      */}
      {/* ========================================================= */}
      {viewMode === 'admin' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Admin Header */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <ChefHat className="w-4 h-4" />
                <span>Panel de Administración</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-1">
                Gestor de Operaciones y Menú
              </h1>
              <p className="text-stone-400 text-xs mt-1">
                Los cambios realizados aquí se actualizan inmediatamente en la vista pública de los clientes.
              </p>
            </div>

            <button
              onClick={resetToDefaults}
              className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-stone-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
              <span>Restaurar Predefinidos</span>
            </button>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-stone-200 pb-2">
            {[
              { id: 'menu', label: 'Gestor de Menú Semanal', icon: Utensils },
              { id: 'pricing', label: 'Precios y Descuentos', icon: DollarSign },
              { id: 'zones', label: 'Zonas de Mazatlán', icon: MapPin },
              { id: 'subscribers', label: 'Suscriptores Activos', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
                    adminTab === tab.id
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: GESTOR DE MENÚ SEMANAL */}
          {adminTab === 'menu' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">Editar Platillos del Menú</h3>
                  <p className="text-xs text-stone-500">Selecciona el día y platillo para modificar nombres, macros e ingredientes.</p>
                </div>

                <div className="flex gap-2">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setEditingDay(d)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                        editingDay === d ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dish Selector Tabs */}
              <div className="flex gap-2">
                {['Desayuno', 'Comida', 'Snack'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setEditingMealType(m)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      editingMealType === m
                        ? 'border-orange-500 bg-orange-50 text-orange-950'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Form to Edit Dish */}
              {weeklyMenu[editingDay]?.[editingMealType] && (
                <div className="grid sm:grid-cols-2 gap-4 bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200 text-xs">
                  
                  <div className="sm:col-span-2">
                    <label className="font-bold text-stone-700 block mb-1">Nombre del Platillo</label>
                    <input
                      type="text"
                      value={weeklyMenu[editingDay][editingMealType].title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWeeklyMenu(prev => ({
                          ...prev,
                          [editingDay]: {
                            ...prev[editingDay],
                            [editingMealType]: { ...prev[editingDay][editingMealType], title: val }
                          }
                        }));
                      }}
                      className="w-full p-2.5 bg-white rounded-xl border border-stone-300 font-semibold text-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-stone-700 block mb-1">Descripción / Ingredientes</label>
                    <textarea
                      rows={2}
                      value={weeklyMenu[editingDay][editingMealType].desc}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWeeklyMenu(prev => ({
                          ...prev,
                          [editingDay]: {
                            ...prev[editingDay],
                            [editingMealType]: { ...prev[editingDay][editingMealType], desc: val }
                          }
                        }));
                      }}
                      className="w-full p-2.5 bg-white rounded-xl border border-stone-300 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Etiqueta Dietética</label>
                    <input
                      type="text"
                      value={weeklyMenu[editingDay][editingMealType].badge || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWeeklyMenu(prev => ({
                          ...prev,
                          [editingDay]: {
                            ...prev[editingDay],
                            [editingMealType]: { ...prev[editingDay][editingMealType], badge: val }
                          }
                        }));
                      }}
                      placeholder="Ej. Keto, Alto en Proteína, Clean"
                      className="w-full p-2.5 bg-white rounded-xl border border-stone-300 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Calorías Totales (kcal)</label>
                    <input
                      type="number"
                      value={weeklyMenu[editingDay][editingMealType].cals}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setWeeklyMenu(prev => ({
                          ...prev,
                          [editingDay]: {
                            ...prev[editingDay],
                            [editingMealType]: { ...prev[editingDay][editingMealType], cals: val }
                          }
                        }));
                      }}
                      className="w-full p-2.5 bg-white rounded-xl border border-stone-300 text-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:col-span-2 pt-2 border-t border-stone-200">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Proteína (g)</label>
                      <input
                        type="number"
                        value={weeklyMenu[editingDay][editingMealType].prot}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setWeeklyMenu(prev => ({
                            ...prev,
                            [editingDay]: {
                              ...prev[editingDay],
                              [editingMealType]: { ...prev[editingDay][editingMealType], prot: val }
                            }
                          }));
                        }}
                        className="w-full p-2 bg-white rounded-xl border border-stone-300 text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Carbohidratos (g)</label>
                      <input
                        type="number"
                        value={weeklyMenu[editingDay][editingMealType].carbs}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setWeeklyMenu(prev => ({
                            ...prev,
                            [editingDay]: {
                              ...prev[editingDay],
                              [editingMealType]: { ...prev[editingDay][editingMealType], carbs: val }
                            }
                          }));
                        }}
                        className="w-full p-2 bg-white rounded-xl border border-stone-300 text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Grasa (g)</label>
                      <input
                        type="number"
                        value={weeklyMenu[editingDay][editingMealType].fat}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setWeeklyMenu(prev => ({
                            ...prev,
                            [editingDay]: {
                              ...prev[editingDay],
                              [editingMealType]: { ...prev[editingDay][editingMealType], fat: val }
                            }
                          }));
                        }}
                        className="w-full p-2 bg-white rounded-xl border border-stone-300 text-stone-900"
                      />
                    </div>
                  </div>

                </div>
              )}

              <button
                onClick={() => triggerNotification('¡Platillo actualizado en la Vista Cliente!')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios en Menú</span>
              </button>

            </div>
          )}

          {/* TAB 2: PRECIOS Y DESCUENTOS */}
          {adminTab === 'pricing' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-stone-900 font-serif">Configuración de Tarifas y Ofertas</h3>

              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200">
                  <label className="font-bold text-stone-700 block mb-1">Precio Base por Día ($ MXN)</label>
                  <input
                    type="number"
                    value={pricing.baseDailyPrice}
                    onChange={(e) => setPricing({ ...pricing, baseDailyPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-300 font-bold text-stone-900"
                  />
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200">
                  <label className="font-bold text-stone-700 block mb-1">Descuento Plan Semanal (%)</label>
                  <input
                    type="number"
                    value={pricing.weeklyDiscountPct}
                    onChange={(e) => setPricing({ ...pricing, weeklyDiscountPct: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-300 font-bold text-stone-900"
                  />
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200">
                  <label className="font-bold text-stone-700 block mb-1">Descuento Plan Mensual (%)</label>
                  <input
                    type="number"
                    value={pricing.monthlyDiscountPct}
                    onChange={(e) => setPricing({ ...pricing, monthlyDiscountPct: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-300 font-bold text-stone-900"
                  />
                </div>
              </div>

              {/* Addons Manager */}
              <div className="pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">Editar Precios de Add-ons</h4>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {addons.map((add, idx) => (
                    <div key={add.id} className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                      <span className="font-medium text-stone-800">{add.name}</span>
                      <div className="flex items-center gap-1">
                        <span>$</span>
                        <input
                          type="number"
                          value={add.price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...addons];
                            updated[idx].price = val;
                            setAddons(updated);
                          }}
                          className="w-16 p-1 bg-white border border-stone-300 rounded text-center font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => triggerNotification('¡Tarifas y descuentos actualizados!')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Nuevos Precios</span>
              </button>
            </div>
          )}

          {/* TAB 3: ZONAS DE MAZATLÁN */}
          {adminTab === 'zones' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-stone-900 font-serif">Zonas de Entrega en Mazatlán</h3>

              <div className="space-y-3 text-xs">
                {zones.map((zone, idx) => (
                  <div key={zone.id} className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200 grid sm:grid-cols-12 gap-3 items-center">
                    
                    <div className="sm:col-span-4">
                      <label className="font-bold text-stone-700 block text-[10px]">Nombre de la Colonia / Zona</label>
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...zones];
                          updated[idx].name = val;
                          setZones(updated);
                        }}
                        className="w-full p-2 bg-white rounded-lg border border-stone-300 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="font-bold text-stone-700 block text-[10px]">Horario de Reparto</label>
                      <input
                        type="text"
                        value={zone.arrivalSlot}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...zones];
                          updated[idx].arrivalSlot = val;
                          setZones(updated);
                        }}
                        className="w-full p-2 bg-white rounded-lg border border-stone-300"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-stone-700 block text-[10px]">Costo Envío ($)</label>
                      <input
                        type="number"
                        value={zone.fee}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...zones];
                          updated[idx].fee = val;
                          setZones(updated);
                        }}
                        className="w-full p-2 bg-white rounded-lg border border-stone-300 font-bold text-center"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...zones];
                          updated[idx].active = !updated[idx].active;
                          setZones(updated);
                        }}
                        className={`px-3 py-2 rounded-lg font-bold text-[10px] ${
                          zone.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {zone.active ? 'Activa' : 'Inactiva'}
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              <button
                onClick={() => triggerNotification('¡Zonas de entrega guardadas!')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Zonas</span>
              </button>
            </div>
          )}

          {/* TAB 4: BANDEJA DE SUSCRIPTORES */}
          {adminTab === 'subscribers' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-stone-900 font-serif">Lista de Suscriptores Activos</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-bold">
                      <th className="py-3 px-3">ID / Cliente</th>
                      <th className="py-3 px-3">Zona</th>
                      <th className="py-3 px-3">Plan</th>
                      <th className="py-3 px-3">Estatus</th>
                      <th className="py-3 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {subscribers.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3">
                          <p className="font-bold text-stone-900">{sub.name}</p>
                          <p className="text-[10px] text-stone-500">{sub.phone} • {sub.diet}</p>
                        </td>
                        <td className="py-3 px-3 font-medium">{sub.zone}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold">{sub.plan}</span>
                          <span className="block text-[10px] text-stone-500">{sub.mealType}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            sub.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              const updated = [...subscribers];
                              updated[idx].status = updated[idx].status === 'Activo' ? 'Pausado' : 'Activo';
                              setSubscribers(updated);
                              triggerNotification(`Estatus de ${sub.name} actualizado.`);
                            }}
                            className="text-[10px] font-bold text-stone-600 underline hover:text-stone-900"
                          >
                            Cambiar Estatus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

      {/* --- CLIENT CHECKOUT MODAL --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase">Confirmar Pedido</span>
                <h3 className="text-lg font-bold font-serif text-stone-900">Datos para WhatsApp</h3>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendWhatsAppOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ana Lucía Valdez"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Teléfono WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="669 000 0000"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Dirección Exacta en Mazatlán *</label>
                <input
                  type="text"
                  required
                  placeholder="Calle, Número y Colonia"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Alergias o Comentarios para la Cocina</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Sin cebolla, dejar con el guardia..."
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Pedido (${totals.grandTotal} MXN)</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
```
