import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sustituye el número de ejemplo por el WhatsApp real del chef Iván.
// Formato internacional, sin +, espacios ni guiones.
const CHEF_WHATSAPP = '526690000000';

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const PLANS = {
  semanal: {
    name: 'Weekly Ritual',
    label: 'Semanal',
    price: 1350,
    meals: 5,
    duration: '1 semana'
  },
  mensual: {
    name: 'Monthly Ritual',
    label: 'Mensual',
    price: 5000,
    meals: 20,
    duration: '1 mes'
  }
};

const ZONES = [
  'Centro Histórico / Olas Altas',
  'Malecón / Zona Dorada',
  'Marina / Cerritos'
];

const DIETS = [
  'Balanceado',
  'Keto',
  'High Protein',
  'Vegetariano'
];

const WEEK_DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes'
];

const STATUSES = [
  { value: 'solicitud', label: 'Nueva solicitud' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_preparacion', label: 'En preparación' },
  { value: 'lista', label: 'Lista para entrega' },
  { value: 'entregada', label: 'Entregada' },
  { value: 'cancelada', label: 'Cancelada' }
];

const STATUS_LABELS = Object.fromEntries(
  STATUSES.map((status) => [status.value, status.label])
);

const money = (value) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return '—';

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function initials(value) {
  return String(value || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || '')
    .join('')
    .toUpperCase();
}


function makeWhatsAppMessage(order) {
  const items = order.selected_items || [];

  const mealLines = items.length
    ? items.map((item) =>
        `• ${item.day_of_week}: ${item.meal_name} — ${money(item.unit_price_mxn)}`
      )
    : [
        `• Plan anterior: ${PLANS[order.plan]?.name || order.plan || 'Sin detalle'}`,
        `• Precio registrado: ${money(order.price_mxn)}`
      ];

  return [
    '🍊 *POMELO BRUNCH HOUSE*',
    '_Nuevo pedido para Chef Iván_',
    '',
    '━━━━━━━━━━━━━━━━━━',
    '*DATOS DEL CLIENTE*',
    `• Nombre: ${order.customer_name}`,
    `• WhatsApp: ${order.phone}`,
    `• Folio: ${order.id || 'Pendiente'}`,
    '',
    '*PLATILLOS POR DÍA*',
    ...mealLines,
    '',
    `• Cantidad de comidas: ${items.length || 'Plan anterior'}`,
    `• TOTAL: ${money(order.price_mxn)} MXN`,
    '',
    '*PREFERENCIAS*',
    `• Dieta: ${order.diet || 'No especificada'}`,
    `• Alergias / notas: ${order.dietary_notes || 'No especificadas'}`,
    '',
    '*ENTREGA*',
    `• Zona: ${order.delivery_zone}`,
    `• Dirección: ${order.address}`,
    `• Referencias: ${order.delivery_reference || 'Sin referencias'}`,
    '',
    'Confirmar disponibilidad, horario y pago.',
    'Solicitud pendiente de confirmación.'
  ].join('\n');
}

function openChefWhatsApp(message) {
  const phone = normalizePhone(CHEF_WHATSAPP);

  if (!phone || phone === '526690000000') {
    window.alert(
      'Configura CHEF_WHATSAPP en src/App.jsx con el número real del chef Iván.'
    );
    return;
  }

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener,noreferrer'
  );
}

/* =========================================================
   CALCULADORA NUTRICIONAL
   ========================================================= */

function NutritionCalculator() {
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState('mujer');
  const [activity, setActivity] = useState(1.375);

  const activityOptions = [
    { value: 1.2, label: 'Sedentario', detail: 'Poco ejercicio' },
    { value: 1.375, label: 'Ligero', detail: '1–3 días/semana' },
    { value: 1.55, label: 'Moderado', detail: '3–5 días/semana' },
    { value: 1.725, label: 'Alto', detail: '6–7 días/semana' },
    { value: 1.9, label: 'Muy alto', detail: 'Actividad intensa' }
  ];

  const bmi = weight / Math.pow(height / 100, 2);

  // Ecuación de Mifflin–St Jeor.
  // Es una estimación para adultos, no una prescripción médica.
  const bmr =
    10 * weight +
    6.25 * height -
    5 * age +
    (gender === 'hombre' ? 5 : -161);

  const tdee = Math.round(bmr * activity);

  let bmiCategory = 'Obesidad';
  let bmiDescription = 'Conviene interpretar el resultado con un profesional.';

  if (bmi < 18.5) {
    bmiCategory = 'Bajo peso';
    bmiDescription = 'El IMC está por debajo del rango convencional para adultos.';
  } else if (bmi < 25) {
    bmiCategory = 'Rango convencional';
    bmiDescription = 'El resultado está dentro del rango convencional para adultos.';
  } else if (bmi < 30) {
    bmiCategory = 'Sobrepeso';
    bmiDescription = 'El IMC está por encima del rango convencional.';
  }

  return (
    <section className="nutrition-section" id="calculadora">
      <div className="section-heading">
        <div className="eyebrow">Know your numbers</div>
        <h2>Tu bienestar, a tu ritmo.</h2>
        <p>
          Ajusta tus datos y descubre una estimación de tu índice de masa
          corporal y tu gasto energético diario.
        </p>
      </div>

      <div className="nutrition-layout">
        <div className="nutrition-controls">
          <div className="nutrition-intro">
            <span className="small-kicker">YOUR DAILY PROFILE</span>
            <h3>Let's get personal.</h3>
            <p>Pequeños hábitos, mejores decisiones.</p>
          </div>

          <Slider
            label="Peso"
            value={weight}
            min={35}
            max={180}
            step={1}
            unit="kg"
            onChange={setWeight}
          />

          <Slider
            label="Estatura"
            value={height}
            min={130}
            max={220}
            step={1}
            unit="cm"
            onChange={setHeight}
          />

          <Slider
            label="Edad"
            value={age}
            min={18}
            max={90}
            step={1}
            unit="años"
            onChange={setAge}
          />

          <div className="field">
            <label htmlFor="gender">Sexo utilizado en la ecuación</label>
            <select
              id="gender"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="activity">Nivel de actividad</label>
            <select
              id="activity"
              value={activity}
              onChange={(event) => setActivity(Number(event.target.value))}
            >
              {activityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.detail}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="nutrition-results">
          <div className="result-top">
            <div>
              <span className="small-kicker">YOUR BODY METRICS</span>
              <h3>Tu resumen.</h3>
            </div>
            <div className="result-symbol">✳</div>
          </div>

          <div className="metric-card">
            <span className="metric-label">Índice de masa corporal</span>
            <div className="metric-number">
              {bmi.toFixed(1)}
              <span> IMC</span>
            </div>
            <div className="metric-category">{bmiCategory}</div>

            <div className="bmi-track">
              <div
                className="bmi-marker"
                style={{
                  left: `${Math.max(2, Math.min(98, ((bmi - 15) / 25) * 100))}%`
                }}
              />
            </div>

            <div className="bmi-scale">
              <span>15</span>
              <span>25</span>
              <span>40</span>
            </div>

            <p className="metric-description">{bmiDescription}</p>
          </div>

          <div className="metric-card calorie-card">
            <span className="metric-label">Gasto energético diario estimado</span>
            <div className="metric-number">
              {tdee.toLocaleString('es-MX')}
              <span> kcal/día</span>
            </div>
            <p className="metric-description">
              Estimación de las calorías necesarias para mantener el peso
              actual según la ecuación y el nivel de actividad seleccionados.
            </p>
          </div>

          <div className="nutrition-footnote">
            <strong>Una nota importante.</strong>
            <p>
              Estas cifras son aproximaciones para adultos y no constituyen
              un diagnóstico ni una dieta personalizada. El IMC no distingue
              masa muscular de grasa, y las necesidades reales pueden variar.
              Si necesitas un objetivo nutricional específico, consulta a un
              profesional de la salud.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div className="slider-field">
      <div className="slider-label">
        <label>{label}</label>
        <strong>
          {value} <span>{unit}</span>
        </strong>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />

      <div className="slider-limits">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/* =========================================================
   APLICACIÓN
   ========================================================= */

export default function App() {
   
const [menuItems, setMenuItems] = useState([]);
const [selectedMeals, setSelectedMeals] = useState({});
const [menuLoading, setMenuLoading] = useState(false);
const [menuError, setMenuError] = useState('');
const [menuNotice, setMenuNotice] = useState('');

const [menuDraft, setMenuDraft] = useState({
  id: '',
  name: '',
  description: '',
  price_mxn: '',
  available_days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  active: true
});

const selectedMealRows = WEEK_DAYS
  .filter((day) => selectedMeals[day])
  .map((day) => {
    const item = menuItems.find(
      (menuItem) => menuItem.id === selectedMeals[day] && menuItem.active
    );

    return item ? { day_of_week: day, menu_item_id: item.id, item } : null;
  })
  .filter(Boolean);

const orderTotal = selectedMealRows.reduce(
  (sum, row) => sum + Number(row.item.price_mxn || 0),
  0
);

const loadMenu = useCallback(async () => {
  if (!supabase) return;

  setMenuLoading(true);
  setMenuError('');

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al cargar menú:', error);
    setMenuError('No se pudo cargar el menú. Intenta actualizar la página.');
  } else {
    setMenuItems(data || []);
  }

  setMenuLoading(false);
}, []);

useEffect(() => {
  loadMenu();
}, [loadMenu]);
   
function resetMenuDraft() {
  setMenuDraft({
    id: '',
    name: '',
    description: '',
    price_mxn: '',
    available_days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    active: true
  });
}

async function saveMenuItem(event) {
  event.preventDefault();
  setMenuError('');
  setMenuNotice('');

  if (!session || !supabase) {
    setMenuError('Inicia sesión para modificar el menú.');
    return;
  }

  const name = menuDraft.name.trim();
  const price = Number(menuDraft.price_mxn);

  if (!name || !Number.isFinite(price) || price < 0) {
    setMenuError('Escribe un nombre y un precio válido.');
    return;
  }

  if (menuDraft.available_days.length === 0) {
    setMenuError('Selecciona al menos un día de disponibilidad.');
    return;
  }

  const payload = {
    name,
    description: menuDraft.description.trim() || null,
    price_mxn: price,
    available_days: menuDraft.available_days,
    active: Boolean(menuDraft.active),
    updated_at: new Date().toISOString()
  };

  const query = menuDraft.id
    ? supabase.from('menu_items').update(payload).eq('id', menuDraft.id)
    : supabase.from('menu_items').insert(payload);

  const { error } = await query;

  if (error) {
    console.error('Error al guardar platillo:', error);
    setMenuError('No se pudo guardar el platillo. Revisa los datos e inténtalo de nuevo.');
    return;
  }

  resetMenuDraft();
  await loadMenu();
  setMenuNotice('Menú actualizado correctamente.');
}

function editMenuItem(item) {
  setMenuDraft({
    id: item.id,
    name: item.name,
    description: item.description || '',
    price_mxn: String(item.price_mxn),
    available_days: item.available_days || [],
    active: item.active
  });

  document.getElementById('menu-management')?.scrollIntoView({
    behavior: 'smooth'
  });
}

async function toggleMenuItem(item) {
  if (!session || !supabase) return;

  const { error } = await supabase
    .from('menu_items')
    .update({
      active: !item.active,
      updated_at: new Date().toISOString()
    })
    .eq('id', item.id);

  if (error) {
    setMenuError('No se pudo cambiar la disponibilidad del platillo.');
    return;
  }

  setMenuNotice(
    item.active ? 'Platillo desactivado.' : 'Platillo activado.'
  );
  await loadMenu();
}

  const [view, setView] = useState('cliente');
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [plan, setPlan] = useState('semanal');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    zone: '',
    diet: '',
    status: ''
  });

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    diet: 'Balanceado',
    delivery_zone: ZONES[0],
    address: '',
    delivery_reference: '',
    dietary_notes: ''
  });

  const configured = Boolean(supabase);

  /* -------------------------------------------------------
     SESIÓN DEL CHEF
     ------------------------------------------------------- */

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        setAuthError('No se pudo verificar la sesión.');
      }

      setSession(data?.session ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* -------------------------------------------------------
     CONSULTA DE PEDIDOS Y ACTUALIZACIONES EN TIEMPO REAL
     ------------------------------------------------------- */

  const loadOrders = useCallback(async () => {
    if (!supabase || !session) return;

    setOrdersLoading(true);
    setOrdersError('');

    try {
      const { data, error } = await supabase
          .from('subscriptions')
            .select('*, subscription_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar pedidos:', error);
        setOrdersError('No se pudieron cargar las suscripciones.');
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error(error);
      setOrdersError('Ocurrió un error al consultar los pedidos.');
    } finally {
      setOrdersLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!supabase || !session) {
      setOrders([]);
      return;
    }

    loadOrders();

    const channel = supabase
      .channel('pomelo-subscriptions-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, loadOrders]);
  /* -------------------------------------------------------
     MÉTRICAS DE OPERACIÓN
     ------------------------------------------------------- */

  const activeOrders = useMemo(
    () => orders.filter((order) => order.active && order.status !== 'cancelada'),
    [orders]
  );

  const stats = useMemo(() => {
    const revenue = activeOrders.reduce(
  (sum, order) => sum + Number(order.price_mxn || 0),
  0
);

const meals = activeOrders.reduce(
  (sum, order) =>
    sum +
    (order.subscription_items?.length ||
      PLANS[order.plan]?.meals ||
      0),
  0
);

    return {
      active: activeOrders.length,
      total: orders.length,
      revenue,
      meals
    };
  }, [activeOrders, orders]);

  const zoneCounts = useMemo(
    () =>
      ZONES.map((zone) => ({
        zone,
        count: activeOrders.filter((order) => order.delivery_zone === zone).length
      })),
    [activeOrders]
  );

  const dietCounts = useMemo(
    () =>
      DIETS.map((diet) => ({
        diet,
        count: activeOrders.filter((order) => order.diet === diet).length
      })),
    [activeOrders]
  );

  const filteredOrders = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return orders.filter((order) => {
      const searchable = [
        order.customer_name,
        order.phone,
        order.address,
        order.id
      ].join(' ').toLowerCase();

      if (query && !searchable.includes(query)) return false;
      if (filters.zone && order.delivery_zone !== filters.zone) return false;
      if (filters.diet && order.diet !== filters.diet) return false;
      if (filters.status && order.status !== filters.status) return false;

      return true;
    });
  }, [orders, filters]);

  /* -------------------------------------------------------
     FORMULARIO PÚBLICO
     ------------------------------------------------------- */

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }


async function submitSubscription(event) {
  event.preventDefault();
  setFormError('');
  setFormSuccess('');

  if (!supabase) {
    setFormError('La conexión con Supabase no está configurada.');
    return;
  }

  const phoneDigits = normalizePhone(form.phone);

  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    setFormError('Introduce un número de WhatsApp válido.');
    return;
  }

  if (!form.customer_name.trim() || !form.address.trim()) {
    setFormError('Completa tu nombre y tu dirección.');
    return;
  }

  if (selectedMealRows.length === 0) {
    setFormError('Selecciona al menos un día y un platillo.');
    return;
  }

  const payload = {
    customer_name: form.customer_name.trim(),
    phone: form.phone.trim(),
    diet: form.diet,
    delivery_zone: form.delivery_zone,
    address: form.address.trim(),
    delivery_reference: form.delivery_reference.trim() || null,
    dietary_notes: form.dietary_notes.trim() || null
  };

  // Abrir durante el clic para reducir bloqueos del navegador.
  const whatsappWindow = window.open('about:blank', '_blank');

  setSubmitting(true);

  try {
    const { data: orderId, error } = await supabase.rpc(
      'create_custom_order',
      {
        p_order: payload,
        p_items: selectedMealRows.map((row) => ({
          day_of_week: row.day_of_week,
          menu_item_id: row.menu_item_id
        }))
      }
    );

    if (error) {
      console.error('Error al crear pedido:', error);

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }

      setFormError(
        error.message?.includes('no está disponible')
          ? 'Uno de los platillos ya no está disponible. Actualiza el menú.'
          : 'No se pudo registrar tu pedido. Revisa los datos e inténtalo de nuevo.'
      );
      return;
    }

    const savedOrder = {
      ...payload,
      id: orderId,
      plan: 'personalizado',
      price_mxn: orderTotal,
      selected_items: selectedMealRows.map((row) => ({
        day_of_week: row.day_of_week,
        meal_name: row.item.name,
        unit_price_mxn: Number(row.item.price_mxn)
      }))
    };

    setFormSuccess(
      `Pedido registrado. Folio: ${String(orderId).slice(0, 8).toUpperCase()}.`
    );

    const message = makeWhatsAppMessage(savedOrder);
    const chefPhone = normalizePhone(CHEF_WHATSAPP);

    if (chefPhone && chefPhone !== '526690000000') {
      const whatsappUrl =
        `https://wa.me/${chefPhone}?text=${encodeURIComponent(message)}`;

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }
    } else {
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }

      setFormSuccess(
        'Pedido registrado. Configura el número real de Chef Iván para activar WhatsApp.'
      );
    }

    setForm({
      customer_name: '',
      phone: '',
      diet: 'Balanceado',
      delivery_zone: ZONES[0],
      address: '',
      delivery_reference: '',
      dietary_notes: ''
    });

    setSelectedMeals({});
  } catch (error) {
    console.error('Error al registrar el pedido:', error);

    if (whatsappWindow && !whatsappWindow.closed) {
      whatsappWindow.close();
    }

    setFormError('Ocurrió un error inesperado al registrar el pedido.');
  } finally {
    setSubmitting(false);
  }
}
  /* -------------------------------------------------------
     AUTENTICACIÓN
     ------------------------------------------------------- */

  async function signIn(event) {
    event.preventDefault();

    setAuthError('');

    if (!supabase) {
      setAuthError('Configura las variables de Supabase primero.');
      return;
    }

    setAuthLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setAuthError('No se pudo iniciar sesión. Revisa tus credenciales.');
    } else {
      setPassword('');
      setView('admin');
    }

    setAuthLoading(false);
  }

  async function signOut() {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError('No se pudo cerrar la sesión.');
      return;
    }

    setSession(null);
    setOrders([]);
    setView('cliente');
  }

  /* -------------------------------------------------------
     ACTUALIZAR ESTADO DE PRODUCCIÓN
     ------------------------------------------------------- */

  async function updateStatus(order, newStatus) {
    if (!supabase || !session) return;

    setUpdatingId(order.id);
    setOrdersError('');

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('id', order.id);

    if (error) {
      setOrdersError('No se pudo actualizar el estado del pedido.');
    } else {
      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id
            ? { ...item, status: newStatus }
            : item
        )
      );
    }

    setUpdatingId(null);
  }

  async function toggleActive(order) {
    if (!supabase || !session) return;

    setUpdatingId(order.id);
    setOrdersError('');

    const { error } = await supabase
      .from('subscriptions')
      .update({ active: !order.active })
      .eq('id', order.id);

    if (error) {
      setOrdersError('No se pudo cambiar el estado de la suscripción.');
    } else {
      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id
            ? { ...item, active: !order.active }
            : item
        )
      );
    }

    setUpdatingId(null);
  }

  /* -------------------------------------------------------
     EXPORTACIÓN CSV
     ------------------------------------------------------- */

  function exportCSV() {
    if (!session || orders.length === 0) return;

    const headers = [
      'Folio',
      'Fecha',
      'Cliente',
      'WhatsApp',
      'Plan',
      'Precio MXN',
      'Dieta',
      'Zona',
      'Dirección',
      'Referencias',
      'Notas',
      'Estado',
      'Activo'
    ];

    const rows = orders.map((order) => [
      order.id,
      order.created_at,
      order.customer_name,
      order.phone,
      order.plan,
      order.price_mxn,
      order.diet,
      order.delivery_zone,
      order.address,
      order.delivery_reference || '',
      order.dietary_notes || '',
      order.status,
      order.active ? 'Sí' : 'No'
    ]);

    function cell(value) {
      let text = String(value ?? '');

      // Evitar fórmulas inyectadas en hojas de cálculo.
      if (/^[\s]*[=+\-@\t\r]/.test(text)) {
        text = `'${text}`;
      }

      return `"${text.replace(/"/g, '""')}"`;
    }

    const csv = '\uFEFF' + [headers, ...rows]
      .map((row) => row.map(cell).join(','))
      .join('\r\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    );

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pomelo-suscripciones-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    anchor.click();
    URL.revokeObjectURL(url);
  }

  /* -------------------------------------------------------
     NAVEGACIÓN Y VISTAS
     ------------------------------------------------------- */

  function navigate(nextView) {
    if (nextView === 'admin' && !session) {
      setView('login');
      return;
    }

    if (nextView === 'admin' && session) {
      setView('admin');
      return;
    }

    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!authReady) {
    return (
      <>
        <Styles />
        <div className="loading-screen">
          <span className="brand-mark">p.</span>
          <p>Preparing something good...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Styles />

      <div className="top-strip">
        GOOD FOOD, GOOD MOOD <span>✳</span> MAZATLÁN, SINALOA
      </div>

      <header className="nav">
        <button
          className="brand brand-button"
          onClick={() => navigate('cliente')}
          aria-label="Pomelo Brunch House inicio"
        >
          <span className="brand-mark">p.</span>
          <span>
            <span className="brand-name">Pomelo Brunch House</span>
            <span className="brand-sub">Everyday nourishment</span>
          </span>
        </button>

        <nav className="nav-right">
          <button
            className={`nav-btn ${view === 'cliente' ? 'nav-selected' : ''}`}
            onClick={() => navigate('cliente')}
          >
            Suscripciones
          </button>

          <button
            className="nav-btn nav-primary"
            onClick={() => navigate('admin')}
          >
            Chef's desk ↗
          </button>
        </nav>
      </header>

      {!configured && (
        <div className="config-alert">
          Supabase aún no está configurado. Añade las variables de entorno
          y reinicia Vite para activar el registro de suscripciones.
        </div>
      )}

      {view === 'cliente' && (
        <main className="container">
          
<section className="hero hero-luxury">
  <div className="hero-copy">
    <div className="eyebrow">POMELO BRUNCH HOUSE · MAZATLÁN</div>

    <h1>
      Comer bien,
      <br />
      <em>sin complicarlo.</em>
    </h1>

    <p>
      Comida hecha con intención. Ingredientes frescos y un menú
      que se adapta a tu semana.
    </p>

    <button
      className="hero-cta"
      onClick={() =>
        document.getElementById('suscripcion')?.scrollIntoView({
          behavior: 'smooth'
        })
      }
    >
      Crear mi menú <span>↗</span>
    </button>

    <div className="hero-meta">
      COCINA FRESCA · A TU RITMO
    </div>
  </div>

  <div className="hero-photo">
    <img
      src="/images/pomelo-hero.jpg"
      alt="Platillo fresco preparado por Pomelo Brunch House"
      fetchPriority="high"
    />
    <div className="hero-photo-caption">
      <span>01 / DAILY NOURISHMENT</span>
      <span>Hecho para tu día a día.</span>
    </div>
  </div>
</section>

          <NutritionCalculator />

          <section className="subscription-section" id="suscripcion">
            <div className="section-heading">
              <div className="eyebrow">Your week, sorted</div>
              <h2>Una mejor forma de comer.</h2>
              <p>
                Suscríbete de lunes a viernes y deja que nosotros nos
                encarguemos de lo rico. Tú solo disfruta.
              </p>
            </div>

<form onSubmit={submitSubscription}>
<div className="form-section-title">02 — Elige tus comidas</div>

<p className="field-hint">
  Selecciona los días que quieras. Cada día seleccionado requiere un platillo.
</p>

{menuLoading && <p>Cargando menú...</p>}

{menuError && (
  <div className="alert alert-error" role="alert">
    {menuError}
  </div>
)}

<div className="meal-day-grid">
  {WEEK_DAYS.map((day) => {
    const selected = Boolean(selectedMeals[day]);
    const availableItems = menuItems.filter(
      (item) =>
        item.active &&
        (item.available_days || []).includes(day)
    );

    return (
      <article className={`meal-day-card ${selected ? 'selected' : ''}`} key={day}>
        <label className="meal-day-toggle">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => {
              setSelectedMeals((previous) => {
                const next = { ...previous };

                if (event.target.checked) {
                  next[day] = '';
                } else {
                  delete next[day];
                }

                return next;
              });
            }}
          />
          <strong>{day}</strong>
        </label>

        {selected && (
          <div className="field">
            <label htmlFor={`meal-${day}`}>Platillo para {day}</label>

            <select
              id={`meal-${day}`}
              value={selectedMeals[day] || ''}
              onChange={(event) =>
                setSelectedMeals((previous) => ({
                  ...previous,
                  [day]: event.target.value
                }))
              }
              required
            >
              <option value="">Selecciona un platillo</option>
              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {money(item.price_mxn)}
                </option>
              ))}
            </select>

            {availableItems.length === 0 && (
              <span className="field-hint">
                No hay platillos disponibles para este día.
              </span>
            )}
          </div>
        )}

        {!selected && (
          <p className="field-hint">Selecciona para agregar una comida.</p>
        )}
      </article>
    );
  })}
</div>

<div className="form-section-title">03 — Your kind of food</div>

                <div className="form-grid">
                  <Field label="Preferencia alimenticia *" full>
                    <select
                      name="diet"
                      value={form.diet}
                      onChange={updateForm}
                    >
                      {DIETS.map((diet) => (
                        <option key={diet} value={diet}>{diet}</option>
                      ))}
                    </select>

                    <span className="field-hint">
                      El chef confirmará la disponibilidad del menú seleccionado.
                    </span>
                  </Field>

                  <Field label="Alergias, restricciones o preferencias" full>
                    <textarea
                      name="dietary_notes"
                      value={form.dietary_notes}
                      onChange={updateForm}
                      maxLength={700}
                      placeholder="Ej. sin nueces, alergia al camarón..."
                    />
                  </Field>
                </div>

                <div className="form-section-title">03 — Delivery details</div>

                <div className="form-grid">
                  <Field label="Zona de entrega *" full>
                    <select
                      name="delivery_zone"
                      value={form.delivery_zone}
                      onChange={updateForm}
                    >
                      {ZONES.map((zone) => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Dirección completa *" full>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={updateForm}
                      minLength={5}
                      maxLength={500}
                      autoComplete="street-address"
                      placeholder="Calle, número, colonia, edificio o departamento..."
                      required
                    />
                  </Field>

                  <Field label="Referencias de entrega" full>
                    <input
                      name="delivery_reference"
                      value={form.delivery_reference}
                      onChange={updateForm}
                      maxLength={300}
                      placeholder="Color de la casa, acceso, recepción..."
                    />
                  </Field>
                </div>


<div className="summary">
  <div className="summary-row">
    <span>Días seleccionados</span>
    <strong>{selectedMealRows.length}</strong>
  </div>

  {selectedMealRows.map((row) => (
    <div className="summary-row" key={row.day_of_week}>
      <span>{row.day_of_week} · {row.item.name}</span>
      <strong>{money(row.item.price_mxn)}</strong>
    </div>
  ))}

  <div className="summary-row summary-total">
    <span>Total del pedido</span>
    <strong>{money(orderTotal)} MXN</strong>
  </div>
</div>


                <label className="consent">
                  <input type="checkbox" required />
                  <span>
                    Autorizo el uso de mis datos para gestionar esta solicitud
                    de suscripción y coordinar la entrega. Entiendo que la
                    solicitud está sujeta a confirmación del chef.
                  </span>
                </label>

                {formError && (
                  <div className="alert alert-error" role="alert">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="alert alert-success" role="status">
                    {formSuccess}
                  </div>
                )}

                <button
                  className="submit-btn"
                  type="submit"
                  disabled={submitting || !configured}
                >
                  {submitting
                    ? 'Registrando solicitud...'
                    : 'Solicitar mi suscripción ↗'}
                </button>

                <p className="privacy-note">
                  La solicitud se registra en Supabase. WhatsApp se abrirá
                  para preparar el mensaje al chef; deberás enviarlo desde
                  esa aplicación.
                </p>
              </form>
            </div>
          </section>

          <section className="info-band">
            <InfoItem icon="🥑" title="Real ingredients">
              Comida pensada para acompañar tu día a día.
            </InfoItem>

            <InfoItem icon="☀️" title="Monday to Friday">
              Una rutina más práctica durante tu semana.
            </InfoItem>

            <InfoItem icon="🍊" title="Made with intention">
              Una experiencia personal, fresca y deliciosa.
            </InfoItem>
          </section>
        </main>
      )}

      {view === 'login' && (
        <main className="container">
          <div className="login-shell">
            <div className="brand-mark login-mark">p.</div>
            <div className="admin-kicker">Pomelo / Internal</div>
            <h2>Chef's desk.</h2>
            <p>
              Inicia sesión para consultar pedidos y coordinar la producción.
            </p>

            <form onSubmit={signIn}>
              <Field label="Correo electrónico">
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>

              <Field label="Contraseña">
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>

              {authError && (
                <div className="alert alert-error" role="alert">
                  {authError}
                </div>
              )}

              <button
                className="submit-btn"
                disabled={authLoading || !configured}
              >
                {authLoading ? 'Verificando...' : 'Entrar al panel ↗'}
              </button>
            </form>

            <div className="admin-note">
              El acceso se gestiona mediante Supabase Auth. Las cuentas del
              personal deben crearse y autorizarse desde el panel de Supabase.
            </div>
          </div>
        </main>
      )}

      {view === 'admin' && session && (
        <main className="admin-wrap">
          <div className="admin-top">
            <div>
              <div className="admin-kicker">Pomelo / Operations</div>
              <h1>Kitchen & delivery.</h1>
              <p>
                Control de suscripciones, preparación y entregas.<br />
                Punto de salida: espaldas de Ley del Mar, Mazatlán.
              </p>
            </div>

            <div className="admin-actions">
              <button className="action-btn" onClick={loadOrders}>
                ↻ Actualizar
              </button>

              <button
                className="action-btn"
                onClick={exportCSV}
                disabled={orders.length === 0}
              >
                ↓ Exportar CSV
              </button>

              <button className="action-btn action-primary" onClick={signOut}>
                Cerrar sesión
              </button>
            </div>
          </div>

          {ordersError && (
            <div className="alert alert-error" role="alert">
              {ordersError}
            </div>
          )}

          <div className="stats">
            <Stat
              label="Suscripciones activas"
              value={stats.active}
              foot="Clientes con servicio activo"
              highlight
            />

            <Stat
              label="Solicitudes registradas"
              value={stats.total}
              foot="Todos los estados"
            />

            <Stat
              label="Valor nominal de planes"
              value={money(stats.revenue)}
              foot="No representa pagos confirmados"
            />

            <Stat
              label="Comidas estimadas"
              value={stats.meals}
              foot="Según duración de los planes"
            />
          </div>

<section className="admin-panel orders-panel" id="menu-management">
  <div className="panel-heading">
    <h3>Menu management.</h3>
    <small>Crear y editar platillos</small>
  </div>

  {menuError && (
    <div className="alert alert-error" role="alert">{menuError}</div>
  )}
  {menuNotice && (
    <div className="alert alert-success" role="status">{menuNotice}</div>
  )}

  <form onSubmit={saveMenuItem}>
    <div className="form-grid">
      <Field label="Nombre del platillo *">
        <input
          value={menuDraft.name}
          onChange={(e) =>
            setMenuDraft({ ...menuDraft, name: e.target.value })
          }
          maxLength={120}
          required
        />
      </Field>

      <Field label="Precio (MXN) *">
        <input
          type="number"
          min="0"
          step="0.01"
          value={menuDraft.price_mxn}
          onChange={(e) =>
            setMenuDraft({ ...menuDraft, price_mxn: e.target.value })
          }
          required
        />
      </Field>

      <Field label="Descripción" full>
        <textarea
          value={menuDraft.description}
          onChange={(e) =>
            setMenuDraft({ ...menuDraft, description: e.target.value })
          }
          maxLength={500}
          placeholder="Ingredientes o descripción breve"
        />
      </Field>
    </div>

    <p><strong>Días disponibles</strong></p>
    <div className="menu-day-options">
      {WEEK_DAYS.map((day) => (
        <label key={day}>
          <input
            type="checkbox"
            checked={menuDraft.available_days.includes(day)}
            onChange={(e) => {
              const days = e.target.checked
                ? [...menuDraft.available_days, day]
                : menuDraft.available_days.filter((d) => d !== day);

              setMenuDraft({ ...menuDraft, available_days: days });
            }}
          />
          {day}
        </label>
      ))}
    </div>

    <label className="consent">
      <input
        type="checkbox"
        checked={menuDraft.active}
        onChange={(e) =>
          setMenuDraft({ ...menuDraft, active: e.target.checked })
        }
      />
      <span>Platillo visible para los clientes</span>
    </label>

    <div className="admin-actions">
      <button className="action-btn action-primary" type="submit">
        {menuDraft.id ? 'Guardar cambios' : 'Agregar platillo'}
      </button>

      {menuDraft.id && (
        <button
          className="action-btn"
          type="button"
          onClick={resetMenuDraft}
        >
          Cancelar edición
        </button>
      )}
    </div>
  </form>

  <div className="menu-admin-list">
    {menuItems.map((item) => (
      <article className="menu-admin-item" key={item.id}>
        <div>
          <strong>{item.name}</strong>
          <p>{item.description || 'Sin descripción'}</p>
          <small>
            {money(item.price_mxn)} · {(item.available_days || []).join(', ')}
          </small>
          <p>{item.active ? 'Visible' : 'Desactivado'}</p>
        </div>

        <div className="admin-actions">
          <button
            type="button"
            className="mini-btn"
            onClick={() => editMenuItem(item)}
          >
            Editar
          </button>
          <button
            type="button"
            className="mini-btn"
            onClick={() => toggleMenuItem(item)}
          >
            {item.active ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </article>
    ))}
  </div>
</section>
          <div className="admin-grid">
            <section className="admin-panel">
              <div className="panel-heading">
                <h3>Delivery map.</h3>
                <small>Por zona</small>
              </div>

              {zoneCounts.map(({ zone, count }) => (
                <div className="zone-row" key={zone}>
                  <div className="zone-label">
                    <span>{zone}</span>
                    <strong>{count}</strong>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${count
                          ? (count / Math.max(1, ...zoneCounts.map((item) => item.count))) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="dispatch-note">
                <strong>↗ Punto de partida</strong>
                <p>
                  Espaldas de Ley del Mar, Mazatlán. Agrupa las entregas por
                  zona y confirma horarios y direcciones antes de salir.
                </p>
              </div>
            </section>

            <section className="admin-panel">
              <div className="panel-heading">
                <h3>Dietary overview.</h3>
                <small>Clientes activos</small>
              </div>

              <div className="diet-list">
                {dietCounts.map(({ diet, count }, index) => (
                  <div className="diet-row" key={diet}>
                    <span className={`diet-dot diet-dot-${index}`} />
                    <span>{diet}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>

              <div className="dispatch-note">
                <strong>Nota para cocina</strong>
                <p>
                  Verifica alergias, ingredientes y posibles contaminaciones
                  cruzadas. Las preferencias registradas no sustituyen la
                  confirmación individual con el cliente.
                </p>
              </div>
            </section>
          </div>

          <section className="admin-panel orders-panel">
            <div className="orders-head">
              <div className="panel-heading">
                <div>
                  <h3>Subscription book.</h3>
                  <small>
                    {filteredOrders.length} solicitudes
                    {ordersLoading ? ' · Actualizando...' : ''}
                  </small>
                </div>
              </div>

              <div className="filters">
                <input
                  type="search"
                  placeholder="Buscar cliente..."
                  value={filters.search}
                  onChange={(event) =>
                    setFilters({ ...filters, search: event.target.value })
                  }
                  aria-label="Buscar cliente"
                />

                <select
                  value={filters.zone}
                  onChange={(event) =>
                    setFilters({ ...filters, zone: event.target.value })
                  }
                  aria-label="Filtrar por zona"
                >
                  <option value="">Todas las zonas</option>
                  {ZONES.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>

                <select
                  value={filters.diet}
                  onChange={(event) =>
                    setFilters({ ...filters, diet: event.target.value })
                  }
                  aria-label="Filtrar por dieta"
                >
                  <option value="">Todas las dietas</option>
                  {DIETS.map((diet) => (
                    <option key={diet} value={diet}>{diet}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters({ ...filters, status: event.target.value })
                  }
                  aria-label="Filtrar por estado"
                >
                  <option value="">Todos los estados</option>
                  {STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {ordersLoading && orders.length === 0 ? (
              <div className="empty-state">
                <h3>Cargando suscripciones...</h3>
                <p>Conectando con la base de datos.</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍊</div>
                <h3>No hay pedidos por aquí.</h3>
                <p>
                  No hay solicitudes que coincidan con los filtros
                  seleccionados.
                </p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-card-head">
                      <div className="order-person">
                        <div className="avatar">
                          {initials(order.customer_name)}
                        </div>

                        <div>
                          <h4>{order.customer_name}</h4>
                          <p>
                            {order.id.slice(0, 8).toUpperCase()}
                            {' · '}
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>

                      <span className={`status status-${order.status}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>

                    <div className="order-details">
                      <Detail label="WhatsApp" value={order.phone} />
                      <Detail label="Zona de entrega" value={order.delivery_zone} />

                      <Detail label="Dirección" value={order.address} />

                      <Detail
                        label="Referencias"
                        value={order.delivery_reference || 'Sin referencias'}
                      />

                      <Detail
                        label="Dieta"
                        value={order.diet}
                      />

                      <Detail
                        label="Alergias / notas"
                        value={order.dietary_notes || 'No especificadas'}
                      />
                    </div>
                     
{order.subscription_items?.length > 0 && (
  <div className="order-meals">
    <strong>Platillos del pedido</strong>

    {order.subscription_items
      .slice()
      .sort(
        (a, b) =>
          WEEK_DAYS.indexOf(a.day_of_week) -
          WEEK_DAYS.indexOf(b.day_of_week)
      )
      .map((item) => (
        <div className="summary-row" key={item.id}>
          <span>{item.day_of_week} · {item.meal_name}</span>
          <strong>{money(item.unit_price_mxn)}</strong>
        </div>
      ))}
  </div>
)}


                    <div className="order-tags">
                      <span className="order-tag diet">{order.diet}</span>
                      <span className="order-tag">
                        {PLANS[order.plan]?.name || order.plan}
                      </span>
                      <span className="order-tag">
                        {order.active ? 'Suscripción activa' : 'Suscripción inactiva'}
                      </span>
                    </div>

                    <div className="order-footer">
                      <strong className="order-price">
                        {money(order.price_mxn)}
                      </strong>

                      <div className="order-actions">
                        <button
                          className="mini-btn mini-whatsapp"
                          onClick={() => openChefWhatsApp(makeWhatsAppMessage(order))}
                        >
                          WhatsApp ↗
                        </button>

                        <select
                          className="status-select"
                          aria-label={`Estado de ${order.customer_name}`}
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(event) =>
                            updateStatus(order, event.target.value)
                          }
                        >
                          {STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>

                        <button
                          className="mini-btn"
                          disabled={updatingId === order.id}
                          onClick={() => toggleActive(order)}
                        >
                          {order.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="admin-note bottom-note">
            <strong>Operación:</strong> el estado del pedido no confirma un pago.
            El valor nominal de los planes no es ingreso cobrado. La estimación
            de comidas supone 5 días por plan semanal y 20 por plan mensual;
            ajusta la producción según las fechas reales de inicio y fin.
          </div>
        </main>
      )}

      <footer className="footer">
        <strong>Pomelo Brunch House</strong>
        <p>Eat well. Feel everything. · Mazatlán, Sinaloa.</p>
        <button className="footer-admin" onClick={() => navigate('admin')}>
          Acceso interno
        </button>
      </footer>
    </>
  );
}

/* =========================================================
   COMPONENTES DE PRESENTACIÓN
   ========================================================= */

function Field({ label, full = false, children }) {
  return (
    <div className={`field ${full ? 'full' : ''}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function InfoItem({ icon, title, children }) {
  return (
    <div className="info-item">
      <div className="info-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  );
}

function Stat({ label, value, foot, highlight = false }) {
  return (
    <div className={`stat-card ${highlight ? 'highlight' : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-number">{value}</div>
      <div className="stat-foot">{foot}</div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="detail-label">{label}</span>
      <div className="detail-value">{value || '—'}</div>
    </div>
  );
}

/* =========================================================
   ESTILOS
   ========================================================= */

function Styles() {
  return (
    <style>{`
      :root {
        --bone: #FAF7F2;
        --paper: #FFFFFF;
        --terracotta: #E05A47;
        --terracotta-dark: #BD4637;
        --forest: #2E5B44;
        --forest-light: #E8EEE8;
        --ink: #292C25;
        --muted: #85847B;
        --line: #E9E3D9;
        --yellow: #F0D68B;
        --shadow: 0 12px 38px rgba(50,42,31,.055);
      }

      * { box-sizing: border-box; }

      html { scroll-behavior: smooth; }

      body {
        margin: 0;
        background: var(--bone);
        color: var(--ink);
        font-family: 'DM Sans', sans-serif;
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
      }

      button, input, select, textarea { font: inherit; }
      button { cursor: pointer; }
      button:disabled { opacity: .55; cursor: not-allowed; }

      button:focus-visible, input:focus-visible,
      select:focus-visible, textarea:focus-visible {
        outline: 2px solid var(--forest);
        outline-offset: 3px;
      }

      .top-strip {
        background: var(--forest);
        color: white;
        text-align: center;
        padding: 10px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 2px;
      }

      .top-strip span { color: var(--yellow); }

      .nav {
        max-width: 1250px;
        padding: 23px 28px;
        margin: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
      }

      .brand-button {
        border: 0;
        padding: 0;
        background: none;
        color: inherit;
        text-align: left;
      }

      .brand-mark {
        width: 44px;
        height: 44px;
        background: var(--terracotta);
        color: white;
        display: grid;
        place-items: center;
        border-radius: 50%;
        font-family: 'Playfair Display', serif;
        font-size: 27px;
        font-style: italic;
        transform: rotate(-8deg);
        flex-shrink: 0;
      }

      .brand-name {
        display: block;
        font-family: 'Playfair Display', serif;
        font-size: 20px;
        line-height: 1.1;
        font-weight: 600;
      }

      .brand-sub {
        display: block;
        font-size: 9px;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--muted);
        margin-top: 5px;
      }

      .nav-right, .admin-actions {
        display: flex;
        gap: 9px;
        align-items: center;
        flex-wrap: wrap;
      }

      .nav-btn, .action-btn {
        border: 1px solid var(--line);
        border-radius: 30px;
        background: transparent;
        color: var(--ink);
        padding: 11px 16px;
        font-size: 10px;
        font-weight: 600;
      }

      .nav-btn:hover, .nav-selected { border-color: var(--forest); }

      .nav-primary, .action-primary {
        background: var(--forest);
        color: white;
        border-color: var(--forest);
      }

      .container {
        max-width: 1130px;
        padding: 0 25px;
        margin: auto;
      }

      .config-alert {
        max-width: 1080px;
        margin: 0 auto 20px;
        padding: 13px 18px;
        border-radius: 10px;
        background: #FBF0D9;
        color: #795C2D;
        font-size: 11px;
        line-height: 1.7;
      }

      .hero {
        position: relative;
        overflow: hidden;
        min-height: 395px;
        border-radius: 24px;
        background: var(--forest);
        color: white;
        display: grid;
        grid-template-columns: 1.2fr .8fr;
        margin-bottom: 72px;
      }

      .hero-copy {
        padding: 56px 0 45px 55px;
        position: relative;
        z-index: 2;
      }

      .eyebrow {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 600;
      }

      .eyebrow::before {
        content: '';
        width: 22px;
        height: 1px;
        background: currentColor;
      }

      .hero h1 {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(43px, 5.4vw, 68px);
        line-height: 1.06;
        font-weight: 500;
        letter-spacing: -2px;
        margin: 25px 0 20px;
      }

      .hero h1 em { color: var(--yellow); font-weight: 500; }

      .hero-copy > p {
        color: rgba(255,255,255,.77);
        max-width: 370px;
        line-height: 1.8;
        font-size: 13px;
      }

      .hero-cta {
        display: inline-flex;
        align-items: center;
        gap: 17px;
        margin-top: 15px;
        padding: 15px 20px;
        border: 0;
        border-radius: 30px;
        background: var(--terracotta);
        color: white;
        font-weight: 600;
        font-size: 11px;
      }

      .hero-meta {
        margin-top: 27px;
        font-size: 8px;
        letter-spacing: 1.7px;
        color: rgba(255,255,255,.6);
      }

      .hero-meta span { color: var(--yellow); margin-right: 7px; }

      .hero-art {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        min-height: 330px;
      }

      .art-circle {
        width: 265px;
        height: 265px;
        border-radius: 50%;
        background: #E8B88A;
        display: grid;
        place-items: center;
        box-shadow: 0 0 0 18px rgba(255,255,255,.05);
      }

      .art-plate {
        width: 215px;
        height: 215px;
        background: #F9F3E8;
        border-radius: 50%;
        box-shadow: 0 7px 20px rgba(0,0,0,.12);
        display: grid;
        place-items: center;
      }

      .food-art {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        background:
          radial-gradient(ellipse at 32% 29%, #5C8A4B 0 12%, transparent 13%),
          radial-gradient(ellipse at 57% 25%, #79A85B 0 13%, transparent 14%),
          radial-gradient(ellipse at 72% 45%, #487B40 0 13%, transparent 14%),
          radial-gradient(ellipse at 37% 60%, #8BAD63 0 14%, transparent 15%),
          radial-gradient(ellipse at 64% 72%, #618C4C 0 14%, transparent 15%),
          radial-gradient(ellipse at 27% 78%, #3D693B 0 12%, transparent 13%),
          radial-gradient(ellipse at 51% 48%, #D6A45D 0 12%, transparent 13%),
          #D5D4A2;
        display: grid;
        place-items: center;
      }

      .food-art span { color: #F8E6B0; font-size: 30px; }

      .art-note {
        position: absolute;
        bottom: 23px;
        right: 13px;
        background: var(--bone);
        color: var(--forest);
        padding: 12px;
        border-radius: 50%;
        width: 88px;
        height: 88px;
        display: grid;
        place-items: center;
        text-align: center;
        font-family: 'Playfair Display', serif;
        font-size: 13px;
        line-height: 1.2;
        transform: rotate(9deg);
      }

      .section-heading { text-align: center; margin: 0 auto 35px; }
      .section-heading .eyebrow { justify-content: center; color: var(--terracotta); }

      .section-heading h2 {
        font-family: 'Playfair Display', serif;
        font-size: clamp(31px, 4vw, 43px);
        font-weight: 500;
        letter-spacing: -1px;
        margin: 17px 0 12px;
      }

      .section-heading > p {
        color: var(--muted);
        font-size: 12px;
        line-height: 1.8;
        max-width: 470px;
        margin: auto;
      }

      /* CALCULADORA */

      .nutrition-section { margin-bottom: 85px; }

      .nutrition-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        max-width: 960px;
        margin: auto;
      }

      .nutrition-controls, .nutrition-results {
        padding: 30px;
        border: 1px solid var(--line);
        border-radius: 19px;
        background: rgba(255,255,255,.6);
      }

      .nutrition-intro h3, .result-top h3 {
        font-family: 'Playfair Display', serif;
        font-size: 26px;
        font-weight: 500;
        margin: 10px 0 7px;
      }

      .nutrition-intro p {
        color: var(--muted);
        font-size: 11px;
        margin: 0 0 27px;
      }

      .small-kicker {
        color: var(--terracotta);
        font-size: 9px;
        letter-spacing: 1.8px;
        font-weight: 700;
      }

      .slider-field { margin: 23px 0; }

      .slider-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        font-size: 11px;
        margin-bottom: 13px;
      }

      .slider-label strong { font-size: 15px; }
      .slider-label strong span { color: var(--muted); font-size: 10px; font-weight: 400; }

      input[type="range"] {
        width: 100%;
        accent-color: var(--forest);
        cursor: pointer;
      }

      .slider-limits {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: var(--muted);
        margin-top: 6px;
      }

      .field { min-width: 0; }
      .field.full { grid-column: 1 / -1; }

      .field > label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 9px;
      }

      .field input, .field select, .field textarea {
        width: 100%;
        min-height: 46px;
        border: 1px solid var(--line);
        border-radius: 9px;
        background: #FDFCF9;
        color: var(--ink);
        padding: 12px 13px;
        font-size: 11px;
      }

      .field textarea { min-height: 85px; resize: vertical; }

      .field input:focus, .field select:focus, .field textarea:focus {
        border-color: var(--forest);
        outline: none;
      }

      .metric-card {
        background: white;
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 22px;
        margin-top: 18px;
      }

      .result-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .result-top h3 { margin-bottom: 0; }
      .result-symbol { color: var(--terracotta); font-size: 26px; }

      .metric-label { font-size: 10px; color: var(--muted); }

      .metric-number {
        font-family: 'Playfair Display', serif;
        font-size: 37px;
        margin: 12px 0 5px;
        letter-spacing: -1px;
      }

      .metric-number span {
        font-family: 'DM Sans', sans-serif;
        font-size: 11px;
        letter-spacing: 0;
      }

      .metric-category {
        color: var(--forest);
        font-size: 11px;
        font-weight: 700;
      }

      .bmi-track {
        height: 7px;
        background: linear-gradient(to right, #9BB8A0, #D8C77C, #E5A17F, #C97569);
        border-radius: 10px;
        position: relative;
        margin-top: 22px;
      }

      .bmi-marker {
        position: absolute;
        width: 13px;
        height: 13px;
        border: 3px solid white;
        border-radius: 50%;
        background: var(--ink);
        top: -3px;
        transform: translateX(-50%);
        box-shadow: 0 0 0 1px var(--ink);
      }

      .bmi-scale {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: var(--muted);
        margin-top: 8px;
      }

      .metric-description {
        color: var(--muted);
        font-size: 10px;
        line-height: 1.8;
        margin: 15px 0 0;
      }

      .calorie-card { background: var(--forest); color: white; }
      .calorie-card .metric-label { color: rgba(255,255,255,.7); }
      .calorie-card .metric-number { color: var(--yellow); }
      .calorie-card .metric-description { color: rgba(255,255,255,.72); }

      .nutrition-footnote {
        margin-top: 18px;
        font-size: 10px;
        color: var(--muted);
        line-height: 1.8;
      }

      .nutrition-footnote strong { color: var(--forest); }
      .nutrition-footnote p { margin: 5px 0 0; }

      /* PLANES Y FORMULARIO */

      .subscription-section { margin-bottom: 60px; }

      .plans {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        max-width: 790px;
        margin: 0 auto 55px;
      }

      .plan-card {
        border: 1px solid var(--line);
        background: rgba(255,255,255,.58);
        border-radius: 20px;
        padding: 27px;
        transition: .2s;
      }

      .plan-card.selected {
        border: 2px solid var(--forest);
        background: white;
        padding: 26px;
        box-shadow: var(--shadow);
      }

      .plan-tag {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.6px;
        text-transform: uppercase;
        color: var(--forest);
        margin-bottom: 19px;
      }

      .plan-card h3 {
        font-family: 'Playfair Display', serif;
        font-size: 25px;
        font-weight: 500;
        margin: 0 0 8px;
      }

      .plan-price {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -1.2px;
      }

      .plan-price small { font-size: 12px; letter-spacing: 0; }

      .plan-period {
        font-size: 10px;
        color: var(--muted);
        margin: 8px 0 21px;
      }

      .plan-features {
        padding: 17px 0 0;
        list-style: none;
        border-top: 1px solid var(--line);
        margin: 0;
      }

      .plan-features li {
        font-size: 11px;
        margin: 11px 0;
        color: #5F6259;
      }

      .plan-features li::before {
        content: '✓';
        color: var(--forest);
        font-weight: 700;
        margin-right: 9px;
      }

      .select-plan {
        width: 100%;
        border-radius: 30px;
        border: 1px solid var(--forest);
        background: transparent;
        color: var(--forest);
        padding: 13px;
        margin-top: 17px;
        font-size: 11px;
        font-weight: 700;
      }

      .plan-card.selected .select-plan {
        background: var(--forest);
        color: white;
      }

      .form-shell {
        max-width: 790px;
        margin: 0 auto 75px;
        background: white;
        border: 1px solid var(--line);
        border-radius: 22px;
        padding: clamp(22px, 5vw, 42px);
        box-shadow: var(--shadow);
      }

      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        padding-bottom: 25px;
        border-bottom: 1px solid var(--line);
        margin-bottom: 27px;
      }

      .form-header h3 {
        font-family: 'Playfair Display', serif;
        font-weight: 500;
        font-size: 27px;
        margin: 0 0 8px;
      }

      .form-header p {
        font-size: 11px;
        color: var(--muted);
        margin: 0;
        line-height: 1.7;
      }

      .step-label {
        font-size: 9px;
        letter-spacing: 1.4px;
        color: var(--terracotta);
        font-weight: 700;
        white-space: nowrap;
      }

      .form-section-title {
        font-size: 10px;
        letter-spacing: 1.6px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--forest);
        margin: 28px 0 17px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }

      .field-hint {
        display: block;
        font-size: 9px;
        color: var(--muted);
        line-height: 1.7;
        margin-top: 7px;
      }

      .summary {
        background: var(--forest-light);
        padding: 19px;
        border-radius: 13px;
        margin-top: 28px;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 11px;
        margin: 8px 0;
      }

      .summary-total {
        border-top: 1px solid #D0DBD0;
        padding-top: 13px;
        margin-top: 13px;
        font-weight: 700;
        font-size: 15px;
      }

      .summary-total strong { color: var(--forest); }

      .consent {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        font-size: 10px;
        line-height: 1.8;
        color: var(--muted);
        margin-top: 20px;
      }

      .consent input {
        margin-top: 3px;
        accent-color: var(--forest);
        flex-shrink: 0;
      }

      .submit-btn {
        width: 100%;
        padding: 16px 20px;
        background: var(--terracotta);
        color: white;
        border: 0;
        border-radius: 10px;
        margin-top: 22px;
        font-size: 12px;
        font-weight: 700;
        transition: .2s;
      }

      .submit-btn:hover { background: var(--terracotta-dark); }

      .submit-btn:disabled { cursor: wait; }

      .privacy-note {
        text-align: center;
        font-size: 10px;
        color: var(--muted);
        margin-top: 14px;
        line-height: 1.7;
      }

      .alert {
        border-radius: 9px;
        padding: 13px 15px;
        font-size: 11px;
        line-height: 1.7;
        margin-top: 17px;
        overflow-wrap: anywhere;
      }

      .alert-error { background: #F9E9E5; color: #A53D32; }
      .alert-success { background: var(--forest-light); color: var(--forest); }

      .info-band {
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        padding: 30px 0;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 55px;
      }

      .info-item { text-align: center; }
      .info-icon { font-size: 23px; margin-bottom: 12px; }
      .info-item h4 { margin: 0 0 8px; font-size: 12px; }
      .info-item p { margin: 0; font-size: 10px; color: var(--muted); line-height: 1.8; }

      .footer {
        padding: 28px 20px 35px;
        text-align: center;
        color: var(--muted);
        font-size: 10px;
        line-height: 2;
      }

      .footer > strong {
        font-family: 'Playfair Display', serif;
        font-size: 19px;
        color: var(--forest);
        font-weight: 500;
      }

      .footer p { margin: 3px 0; }

      .footer-admin {
        border: none;
        background: none;
        color: #A9A49A;
        text-decoration: underline;
        font-size: 10px;
      }

      /* LOGIN */

      .login-shell {
        max-width: 420px;
        margin: 55px auto 100px;
        background: white;
        border: 1px solid var(--line);
        padding: 35px;
        border-radius: 20px;
        box-shadow: var(--shadow);
      }

      .login-mark { margin-bottom: 25px; }

      .admin-kicker {
        color: var(--terracotta);
        text-transform: uppercase;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .login-shell h2 {
        font-family: 'Playfair Display', serif;
        font-size: 30px;
        font-weight: 500;
        margin: 9px 0;
      }

      .login-shell > p {
        color: var(--muted);
        font-size: 11px;
        line-height: 1.8;
        margin-bottom: 25px;
      }

      .login-shell .field { margin: 18px 0; }

      .admin-note {
        font-size: 10px;
        line-height: 1.8;
        color: #8D7052;
        background: #FBF5E9;
        padding: 14px;
        border-radius: 9px;
        margin-top: 20px;
      }

      /* PANEL DEL CHEF */

      .admin-wrap {
        max-width: 1250px;
        margin: 0 auto;
        padding: 20px 25px 70px;
      }

      .admin-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        margin: 20px 0 30px;
      }

      .admin-top h1 {
        font-family: 'Playfair Display', serif;
        font-size: clamp(32px, 4vw, 43px);
        font-weight: 500;
        margin: 9px 0;
      }

      .admin-top p {
        color: var(--muted);
        font-size: 12px;
        line-height: 1.8;
        margin: 0;
      }

      .action-btn {
        border-radius: 9px;
        background: white;
        padding: 11px 14px;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-bottom: 25px;
      }

      .stat-card {
        background: white;
        border: 1px solid var(--line);
        padding: 21px;
        border-radius: 15px;
        min-width: 0;
      }

      .stat-label { font-size: 10px; color: var(--muted); margin-bottom: 14px; }

      .stat-number {
        font-family: 'Playfair Display', serif;
        font-size: 30px;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }

      .stat-foot { font-size: 9px; color: var(--muted); margin-top: 10px; }

      .stat-card.highlight { background: var(--forest); color: white; }
      .stat-card.highlight .stat-label,
      .stat-card.highlight .stat-foot { color: rgba(255,255,255,.7); }

      .admin-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        margin-bottom: 25px;
      }

      .admin-panel {
        background: white;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 24px;
        min-width: 0;
      }

      .panel-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 21px;
      }

      .panel-heading h3 {
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        font-weight: 500;
        margin: 0;
      }

      .panel-heading small { color: var(--muted); font-size: 10px; }

      .zone-row { margin: 20px 0; }

      .zone-label {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 10px;
        margin-bottom: 9px;
      }

      .zone-label span { overflow-wrap: anywhere; }

      .bar-track {
        height: 7px;
        background: #F0EDE6;
        border-radius: 10px;
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        border-radius: 10px;
        background: var(--forest);
        transition: width .3s;
      }

      .dispatch-note {
        background: #FBF5E9;
        border-radius: 10px;
        padding: 15px;
        margin-top: 21px;
        font-size: 10px;
        color: #786749;
        line-height: 1.8;
      }

      .dispatch-note p { margin: 5px 0 0; }

      .diet-list { display: grid; gap: 15px; }

      .diet-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 11px;
      }

      .diet-row strong { margin-left: auto; }

      .diet-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--forest); }
      .diet-dot-1 { background: var(--terracotta); }
      .diet-dot-2 { background: #C6A75C; }
      .diet-dot-3 { background: #8797B6; }

      .orders-panel { padding: 0; overflow: hidden; }

      .orders-head {
        padding: 24px;
        border-bottom: 1px solid var(--line);
      }

      .orders-head .panel-heading { margin-bottom: 19px; }

      .filters {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        gap: 10px;
      }

      .filters input, .filters select, .status-select {
        min-width: 0;
        width: 100%;
        padding: 10px 11px;
        background: #FDFCF9;
        border: 1px solid var(--line);
        border-radius: 8px;
        font-size: 10px;
        color: var(--ink);
      }

      .orders-list { display: grid; }

      .order-card {
        padding: 22px 24px;
        border-bottom: 1px solid var(--line);
      }

      .order-card:last-child { border-bottom: none; }

      .order-card-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
      }

      .order-person { display: flex; gap: 12px; align-items: center; min-width: 0; }

      .avatar {
        width: 43px;
        height: 43px;
        background: var(--forest-light);
        color: var(--forest);
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-family: 'Playfair Display', serif;
        font-size: 18px;
        flex-shrink: 0;
      }

      .order-person h4 { font-size: 13px; margin: 0 0 5px; overflow-wrap: anywhere; }
      .order-person p { font-size: 9px; color: var(--muted); margin: 0; overflow-wrap: anywhere; }

      .status {
        font-size: 9px;
        border-radius: 30px;
        padding: 7px 10px;
        font-weight: 700;
        background: var(--forest-light);
        color: var(--forest);
        white-space: nowrap;
      }

      .status-cancelada { background: #F3E8E4; color: #A65B4D; }
      .status-en_preparacion { background: #F8EBD6; color: #84632B; }
      .status-lista { background: #E5EAF6; color: #4B5F8A; }
      .status-entregada { background: #E9E5F1; color: #66558D; }

      .order-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin: 15px 0;
      }

      .detail-label {
        display: block;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: .7px;
        color: var(--muted);
        margin-bottom: 6px;
      }

      .detail-value {
        font-size: 11px;
        line-height: 1.7;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }

      .order-tags { display: flex; flex-wrap: wrap; gap: 7px; margin: 13px 0; }

      .order-tag {
        padding: 6px 9px;
        background: #F5F2EC;
        color: #68665D;
        border-radius: 5px;
        font-size: 9px;
      }

      .order-tag.diet { background: var(--forest-light); color: var(--forest); }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding-top: 14px;
        border-top: 1px solid #F0ECE5;
        margin-top: 14px;
      }

      .order-price { font-size: 14px; color: var(--forest); }

      .order-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        gap: 7px;
      }

      .mini-btn {
        border: 1px solid var(--line);
        background: white;
        border-radius: 7px;
        padding: 8px 10px;
        font-size: 9px;
        font-weight: 600;
      }

      .mini-whatsapp { background: var(--forest); color: white; border-color: var(--forest); }

      .status-select { width: auto; max-width: 165px; }

      .empty-state {
        text-align: center;
        padding: 55px 20px;
        color: var(--muted);
      }

      .empty-icon { font-size: 35px; margin-bottom: 15px; }

      .empty-state h3 {
        font-family: 'Playfair Display', serif;
        color: var(--ink);
        font-size: 23px;
        font-weight: 500;
      }

      .empty-state p { font-size: 11px; line-height: 1.8; }

      .bottom-note { margin-top: 25px; }

      .loading-screen {
        min-height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 18px;
        color: var(--muted);
        font-size: 11px;
      }

      @media (max-width: 800px) {
        .nav { padding: 18px 16px; }
        .brand-name { font-size: 17px; }
        .brand-mark { width: 38px; height: 38px; }
        .nav-btn { padding: 10px 11px; font-size: 9px; }
        .container { padding: 0 15px; }
        .hero { grid-template-columns: 1fr; margin-bottom: 52px; }
        .hero-copy { padding: 39px 26px 10px; }
        .hero h1 { font-size: 51px; }
        .hero-art { min-height: 265px; }
        .art-circle { width: 220px; height: 220px; }
        .art-plate { width: 180px; height: 180px; }
        .food-art { width: 153px; height: 153px; }
        .art-note { bottom: 13px; right: 12%; width: 77px; height: 77px; font-size: 11px; }
        .nutrition-layout { grid-template-columns: 1fr; }
        .plans { gap: 11px; }
        .plan-card { padding: 18px; }
        .plan-card.selected { padding: 17px; }
        .plan-card h3 { font-size: 21px; }
        .plan-price { font-size: 25px; }
        .admin-wrap { padding: 15px 14px 50px; }
        .admin-top { flex-direction: column; }
        .stats { grid-template-columns: 1fr 1fr; gap: 10px; }
        .stat-card { padding: 16px; }
        .stat-number { font-size: 25px; }
        .admin-grid { grid-template-columns: 1fr; }
        .filters { grid-template-columns: 1fr 1fr; }
        .orders-head { padding: 17px; }
        .order-card { padding: 18px 16px; }
        .order-footer { align-items: flex-start; flex-direction: column; }
        .order-actions { justify-content: flex-start; }
      }

      @media (max-width: 500px) {
        .nav { gap: 8px; }
        .nav-right { gap: 5px; }
        .brand { gap: 8px; }
        .brand-name { font-size: 15px; }
        .brand-sub { font-size: 8px; letter-spacing: 1px; }
        .brand-mark { width: 34px; height: 34px; font-size: 22px; }
        .nav-btn { padding: 9px; }
        .plans { grid-template-columns: 1fr; }
        .plan-price { font-size: 31px; }
        .form-grid { grid-template-columns: 1fr; gap: 16px; }
        .field.full { grid-column: auto; }
        .form-header { flex-direction: column; }
        .step-label { white-space: normal; }
        .info-band { gap: 12px; }
        .info-item p { font-size: 9px; }
        .nutrition-controls, .nutrition-results { padding: 20px; }
        .order-details { grid-template-columns: 1fr; }
        .order-card-head { align-items: flex-start; }
        .status { white-space: normal; text-align: center; }
        .status-select { max-width: 100%; }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          scroll-behavior: auto !important;
          transition-duration: .01ms !important;
          animation-duration: .01ms !important;
        }
      }
      
.meal-day-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.meal-day-card {
  border: 1px solid var(--line);
  border-radius: 13px;
  padding: 16px;
  background: #FDFCF9;
}

.meal-day-card.selected {
  border-color: var(--forest);
  background: white;
}

.meal-day-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.meal-day-toggle input,
.menu-day-options input {
  accent-color: var(--forest);
}

.meal-day-card .field {
  margin-top: 18px;
}

.menu-day-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0;
}

.menu-day-options label {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
}

.menu-admin-list {
  margin-top: 28px;
}

.menu-admin-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 0;
  border-top: 1px solid var(--line);
}

.menu-admin-item p {
  margin: 7px 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.6;
}

.order-meals {
  margin-top: 18px;
  padding: 16px;
  border-radius: 12px;
  background: var(--forest-light);
}

.order-meals > strong {
  display: block;
  margin-bottom: 12px;
}

@media (max-width: 600px) {
  .meal-day-grid {
    grid-template-columns: 1fr;
  }

  .menu-admin-item {
    flex-direction: column;
  }
}


/* POMELO — QUIET LUXURY: CORRECCIÓN */

:root {
  --pomelo-bg: #F5F2EB;
  --pomelo-paper: #FFFEFB;
  --pomelo-ink: #252720;
  --pomelo-olive: #555B43;
  --pomelo-sand: #DCD3C5;
  --pomelo-muted: #77766D;
  --pomelo-line: #DEDAD1;
}

html {
  scroll-behavior: smooth;
  background: var(--pomelo-bg);
}

body {
  background: var(--pomelo-bg) !important;
  color: var(--pomelo-ink) !important;
  font-family: "DM Sans", sans-serif !important;
}

.top-strip {
  background: var(--pomelo-ink) !important;
  color: var(--pomelo-bg) !important;
  font-size: 9px;
  letter-spacing: 0.15em;
}

.nav {
  background: var(--pomelo-bg) !important;
  border-bottom: 1px solid var(--pomelo-line);
  box-shadow: none !important;
}

.brand-name {
  font-family: "Cormorant Garamond", Georgia, serif !important;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.brand-mark {
  background: var(--pomelo-ink) !important;
  color: var(--pomelo-bg) !important;
}

.brand-sub {
  color: var(--pomelo-muted) !important;
}

/* IMPORTANTE: sobrescribe el hero original completo */
.hero.hero-luxury {
  display: grid !important;
  grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
  align-items: center;
  gap: clamp(32px, 5vw, 76px);

  width: 100%;
  min-height: auto !important;
  margin: 0 0 90px !important;
  padding: 64px 0 76px !important;

  background: transparent !important;
  color: var(--pomelo-ink) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: visible !important;
}

.hero-luxury .hero-copy {
  max-width: 540px;
  min-width: 0;
  padding: 0 !important;
  color: var(--pomelo-ink) !important;
}

.hero-luxury .eyebrow {
  color: var(--pomelo-olive) !important;
  font-size: 9px;
  letter-spacing: 0.16em;
  line-height: 1.7;
  margin-bottom: 28px;
}

.hero-luxury .hero-copy h1 {
  color: var(--pomelo-ink) !important;
  font-family: "Cormorant Garamond", Georgia, serif !important;
  font-size: clamp(56px, 6.2vw, 88px) !important;
  font-weight: 400 !important;
  letter-spacing: -0.045em;
  line-height: 0.98 !important;
  margin: 0 0 26px;
}

.hero-luxury .hero-copy h1 em {
  color: var(--pomelo-olive) !important;
  font-weight: 400;
}

.hero-luxury .hero-copy > p {
  max-width: 390px;
  color: var(--pomelo-muted) !important;
  font-size: 14px;
  line-height: 1.9;
}

.hero-luxury .hero-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  min-height: 50px;
  margin-top: 22px;
  padding: 14px 22px;

  background: var(--pomelo-olive) !important;
  color: white !important;
  border: 1px solid var(--pomelo-olive) !important;
  border-radius: 2px !important;
  font-size: 11px;
  font-weight: 500;
}

.hero-luxury .hero-cta:hover {
  background: var(--pomelo-ink) !important;
  border-color: var(--pomelo-ink) !important;
}

.hero-luxury .hero-meta {
  margin-top: 38px;
  color: var(--pomelo-muted) !important;
  font-size: 9px;
  letter-spacing: 0.12em;
  line-height: 1.8;
}

/* Fotografía real */
.hero-luxury .hero-photo {
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 0;
  aspect-ratio: 4 / 4.5;
  max-height: 650px;
  overflow: hidden;
  background: var(--pomelo-sand);
  border-radius: 0;
}

.hero-luxury .hero-photo img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: cover;
  object-position: center;
}

.hero-luxury .hero-photo-caption {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  padding: 32px 18px 17px;
  color: white !important;
  background: linear-gradient(transparent, rgba(20, 20, 16, 0.65));
  font-size: 10px;
}

.hero-luxury .hero-photo-caption span:first-child {
  font-size: 8px;
  letter-spacing: 0.1em;
}

.section-heading h2,
.nutrition-intro h3,
.result-top h3 {
  font-family: "Cormorant Garamond", Georgia, serif !important;
  font-weight: 500 !important;
}

.field input,
.field select,
.field textarea {
  background: var(--pomelo-paper) !important;
  border: 1px solid var(--pomelo-line) !important;
  border-radius: 2px !important;
}

.submit-btn {
  background: var(--pomelo-olive) !important;
  border-radius: 2px !important;
}

@media (max-width: 760px) {
  .container {
    width: 100%;
    max-width: 100%;
    padding-left: 18px !important;
    padding-right: 18px !important;
  }

  .nav {
    padding: 14px 16px !important;
    gap: 10px;
  }

  .brand-name {
    font-size: 18px;
  }

  .nav-right {
    gap: 5px;
  }

  .nav-btn {
    padding: 9px 8px;
    font-size: 9px;
  }

  .hero.hero-luxury {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 30px;
    margin-bottom: 55px !important;
    padding: 48px 0 20px !important;
  }

  .hero-luxury .hero-copy h1 {
    font-size: clamp(49px, 12.5vw, 68px) !important;
  }

  .hero-luxury .hero-copy > p {
    max-width: 340px;
    font-size: 13px;
  }

  .hero-luxury .hero-meta {
    margin-top: 25px;
  }

  .hero-luxury .hero-photo {
    aspect-ratio: 4 / 3.5;
    max-height: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

    </style>
  );
}
