/* ==========================================================================
   FLYSOLO - INTERACTIVE PROTOTYPE APPLICATION LOGIC (JS)
   ========================================================================== */

// --- STATE STORE ---
const state = {
  currentRole: 'pasajero', // 'pasajero' | 'piloto' | 'admin'
  currentFaction: 'REBEL',  // 'REBEL' | 'IMPERIAL' | 'NEUTRAL'
  userCredits: 12500,
  isDutyActive: true,
  isCovertDecrypted: true,
  
  // Active flight state simulation
  activeTrip: {
    id: 54354,
    origen: 'Coruscant',
    destino: 'Tatooine',
    piloto: 'Han Solo',
    nave: 'Halcón Milenario',
    precio: 4000,
    progreso: 65,
    etaSegundos: 406,
    estado: 'EN_PROGRESO'
  },

  // Catalog of Planets with 3D Coordinates
  planets: [
    { id: 1, nombre: 'Tatooine', x: 10, y: 20, z: 5, desc: 'Planeta desértico del Borde Exterior, hogar de los Skywalker.', img: '🏜️' },
    { id: 2, nombre: 'Coruscant', x: 100, y: 150, z: 80, desc: 'Planeta ecumenópolis, centro político de la Galaxia.', img: '🏙️' },
    { id: 3, nombre: 'Naboo', x: 45, y: 60, z: 30, desc: 'Mundo pacífico de ríos, prados y ciudades flotantes.', img: '🌊' },
    { id: 4, nombre: 'Endor', x: 200, y: 210, z: 180, desc: 'Luna boscosa habitada por los ewoks.', img: '🌲' },
    { id: 5, nombre: 'Malachor', x: 512, y: 123, z: 995, desc: 'Planeta rocoso estéril con fuerte conexión al Lado Oscuro.', img: '🌑' },
    { id: 6, nombre: 'Mustafar', x: 340, y: 410, z: 290, desc: 'Mundo volcánico menor en el sistema Mustafar.', img: '🌋' },
    { id: 7, nombre: 'Mandalore', x: 180, y: 290, z: 140, desc: 'Pueblo natal de los guerreros Mandalorianos.', img: '🛡️' }
  ],

  // Fleet Pool propiedad de FlySolo Corp
  fleet: [
    { id: 101, nombre: 'Halcón Milenario', tipo: 'Carguero Ligero Corelliano', patente: 'HMHSCWB123456', capacidad: 10000, estado: 'Ocupada', piloto: 'Han Solo', tags: ['Rápida', 'Sigilosa'] },
    { id: 102, nombre: 'X-Wing Red 5', tipo: 'Caza Estelar T-65', patente: 'GCWONYT654321', capacidad: 500, estado: 'Libre', piloto: null, tags: ['Rápida', 'Segura'] },
    { id: 103, nombre: 'TIE Interceptor', tipo: 'Caza Imperial', patente: 'IMPSTD882109', capacidad: 300, estado: 'Libre', piloto: null, tags: ['Rápida', 'Furtiva'] },
    { id: 104, nombre: 'Y-Wing Bombardero', tipo: 'Caza de Asalto BTL', patente: 'BTLB4920147', capacidad: 1500, estado: 'Libre', piloto: null, tags: ['Segura'] },
    { id: 105, nombre: 'A-Wing Interceptor', tipo: 'Caza Sigiloso RZ-1', patente: 'RZ1INT304856', capacidad: 400, estado: 'Libre', piloto: null, tags: ['Rápida', 'Furtiva'] },
    { id: 106, nombre: 'Imperial Star Destroyer', tipo: 'Acorazado Pesado', patente: 'ISDII990412', capacidad: 50000, estado: 'Ocupada', piloto: 'Darth Vader', tags: ['Segura'] }
  ],

  // DDJJ Applications for Pilot License
  ddjjInbox: [
    { id: 266, usuarioId: 5413, nombre: 'Han Solo', email: 'chewie&i@bountyhunter.com', licencia: '5413GFFF', puntaje: 98, preferencia: 'Carguero Ligero', fotoUrl: 'licencia_hansolo.jpg' },
    { id: 267, usuarioId: 8821, nombre: 'Hera Syndulla', email: 'kanan&i@rebels.com', licencia: '2902ESZC', puntaje: 100, preferencia: 'Caza Estelar', fotoUrl: 'licencia_hera.jpg' },
    { id: 268, usuarioId: 9912, nombre: 'Cassian Andor', email: 'rogueone@rebels.com', licencia: '9912ROGW', puntaje: 95, preferencia: 'Caza Sigiloso', fotoUrl: 'licencia_cassian.jpg' }
  ],

  // Trips List (Requested & Available)
  trips: [
    { id: 54354, origen: 'Coruscant', destino: 'Tatooine', pasajero: 'Cassian Andor', piloto: 'Han Solo', nave: 'Halcón Milenario', carga: 1000, precio: 4000, fecha: '2026-08-24', estado: 'EN_PROGRESO', encubierto: true, faccionReq: 'REBEL' },
    { id: 53598, origen: 'Malachor', destino: 'Mustafar', pasajero: 'Leia Organa', piloto: null, nave: null, carga: 0, precio: 3000, fecha: '2026-08-24', estado: 'PENDIENTE', encubierto: false, faccionReq: null },
    { id: 52104, origen: 'Naboo', destino: 'Endor', pasajero: 'Lando Calrissian', piloto: 'Poe Dameron', nave: 'X-Wing Red 5', carga: 450, precio: 2800, fecha: '2026-08-23', estado: 'FINALIZADO', encubierto: false, faccionReq: null },
    { id: 51099, origen: 'Tatooine', destino: 'Coruscant', pasajero: 'Boba Fett', piloto: null, nave: null, carga: 200, precio: 5200, fecha: '2026-08-22', estado: 'CANCELADO', encubierto: true, faccionReq: 'IMPERIAL' }
  ]
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  render();
});

// --- STATE MODIFIERS ---
function setFaction(faction) {
  state.currentFaction = faction;
  document.documentElement.setAttribute('data-faction', faction);
  
  document.querySelectorAll('[data-faction-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-faction-btn') === faction);
  });
  
  render();
}

function setRole(role) {
  state.currentRole = role;
  
  document.querySelectorAll('[data-role-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-role-btn') === role);
  });
  
  render();
}

function toggleDuty() {
  state.isDutyActive = !state.isDutyActive;
  render();
}

function toggleCovertEye() {
  state.isCovertDecrypted = !state.isCovertDecrypted;
  render();
}

// --- EUCLIDEAN 3D DISTANCE & TARIFF CALCULATOR ---
function calculateDistance3D(origenId, destinoId) {
  const o = state.planets.find(p => p.id === Number(origenId)) || state.planets[0];
  const d = state.planets.find(p => p.id === Number(destinoId)) || state.planets[1];
  
  const distance = Math.sqrt(
    Math.pow(d.x - o.x, 2) + 
    Math.pow(d.y - o.y, 2) + 
    Math.pow(d.z - o.z, 2)
  );
  
  return {
    distancia: Math.round(distance * 120), // Escalado a pársecs
    origen: o,
    destino: d
  };
}

function calculatePrice(distanceParsecs, isScheduled, isCovert, cargoKg) {
  let baseFare = distanceParsecs * 0.15;
  if (baseFare < 1000) baseFare = 1000;
  
  let modifiers = 0;
  if (isCovert) modifiers += baseFare * 0.25; // +25% misión encubierta
  if (cargoKg > 0) modifiers += (cargoKg / 100) * 50; // Recargo por carga
  
  let total = baseFare + modifiers;
  let discount = 0;
  
  if (isScheduled) {
    discount = total * 0.15; // 15% descuento por viaje agendado
    total -= discount;
  }
  
  return {
    baseFare: Math.round(baseFare),
    modifiers: Math.round(modifiers),
    discount: Math.round(discount),
    total: Math.round(total)
  };
}

// --- RENDER ENGINE ---
function render() {
  const root = document.getElementById('app-root');
  const walletContainer = document.getElementById('wallet-widget-container');
  
  // Show wallet widget only for Pasajero
  if (state.currentRole === 'pasajero') {
    walletContainer.style.display = 'flex';
    document.getElementById('user-credits').innerText = `${state.userCredits.toLocaleString()} Cr`;
  } else {
    walletContainer.style.display = 'none';
  }

  // Render role view
  if (state.currentRole === 'pasajero') {
    root.innerHTML = renderPasajeroView();
    bindPasajeroEvents();
  } else if (state.currentRole === 'piloto') {
    root.innerHTML = renderPilotoView();
  } else if (state.currentRole === 'admin') {
    root.innerHTML = renderAdminView();
  }

  // Re-initialize Lucide Icons
  if (window.lucide) window.lucide.createIcons();
}

// ==========================================================================
// 1. PASAJERO VIEW RENDERER
// ==========================================================================
function renderPasajeroView() {
  const activeTrip = state.activeTrip;

  return `
    <!-- Active Trip Banner (if ongoing) -->
    ${activeTrip && activeTrip.estado === 'EN_PROGRESO' ? `
      <div class="glass-card accent-border" style="background: rgba(0, 229, 255, 0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="badge badge-enprogreso">🚀 VIAJE EN CURSO</span>
            <h2 style="margin-top: 6px;">${activeTrip.origen} ➔ ${activeTrip.destino}</h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
              Piloto: <strong>${activeTrip.piloto}</strong> | Nave: <strong>${activeTrip.nave}</strong>
            </p>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--primary-accent);">
              ⏱️ ${Math.floor(activeTrip.etaSegundos / 60)}m ${activeTrip.etaSegundos % 60}s
            </div>
            <button class="btn btn-danger" style="margin-top: 8px; padding: 4px 10px; font-size: 0.75rem;" onclick="openEmergencyCancelModal()">
              Reportar Incidencia
            </button>
          </div>
        </div>
        
        <!-- Flight Track HUD Progress Bar -->
        <div class="flight-track">
          <div class="flight-progress-bar" style="width: ${activeTrip.progreso}%;"></div>
          <div class="flight-ship-icon" style="left: ${activeTrip.progreso}%;">🚀</div>
        </div>
      </div>
    ` : ''}

    <!-- 3D Trip Booker Widget -->
    <div class="glass-card">
      <h2 style="margin-bottom: 0.5rem;">🌌 ¿A dónde quieres viajar hoy en la Galaxia?</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Calcula la distancia 3D euclidiana y cotiza tu viaje espacial al instante.</p>

      <div class="grid-2">
        <div>
          <div class="form-group">
            <label class="form-label">Planeta de Origen</label>
            <select id="book-origen" class="form-select">
              ${state.planets.map(p => `<option value="${p.id}">${p.img} ${p.nombre} (x:${p.x}, y:${p.y}, z:${p.z})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Planeta de Destino</label>
            <select id="book-destino" class="form-select">
              ${state.planets.map((p, idx) => `<option value="${p.id}" ${idx === 1 ? 'selected' : ''}>${p.img} ${p.nombre} (x:${p.x}, y:${p.y}, z:${p.z})</option>`).join('')}
            </select>
          </div>

          <div style="display: flex; gap: 1.5rem; margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="checkbox" id="book-encubierto"> 🔒 Misión Encubierta
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="checkbox" id="book-agendado" checked> 📅 Viaje Agendado (-15%)
            </label>
          </div>

          <div class="form-group">
            <label class="form-label">Carga / Equipaje Declarado (Kg)</label>
            <input type="number" id="book-carga" class="form-input" value="450" placeholder="Ej: 450 kg">
          </div>
        </div>

        <!-- Live Calculation Result Card -->
        <div class="glass-card" style="background: rgba(0, 0, 0, 0.4); border-color: var(--border-glow); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h4 style="color: var(--primary-accent); margin-bottom: 1rem;">📐 COTIZACIÓN ESPACIAL 3D</h4>
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">
              <p>Distancia 3D: <strong id="calc-distancia" style="color: #fff;">21,104 pársecs</strong></p>
              <p>Tarifa Base: <span id="calc-base">$3,165 Cr</span></p>
              <p>Recargos Carga/Misión: <span id="calc-recargos">+$1,538 Cr</span></p>
              <p>Descuento Agendado (-15%): <span id="calc-descuento" style="color: var(--status-finalizado);">-$705 Cr</span></p>
            </div>
            <hr style="border-color: var(--border-subtle); margin: 1rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700;">PRECIO FINAL:</span>
              <span id="calc-total" style="font-family: var(--font-heading); font-size: 1.8rem; color: var(--primary-accent);">$4,000 Cr</span>
            </div>
          </div>

          <button class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;" onclick="requestTrip()">
            🚀 SOLICITAR VIAJE ESPACIAL
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Section: History & Galactic News -->
    <div class="grid-2">
      <!-- Recent Trips -->
      <div class="glass-card">
        <h3>📜 Mis Viajes Recientes</h3>
        <table class="data-table">
          <thead>
            <tr><th>Ruta</th><th>Precio</th><th>Estado</th><th>Acción</th></tr>
          </thead>
          <tbody>
            ${state.trips.map(t => `
              <tr>
                <td><strong>${t.origen} ➔ ${t.destino}</strong><br><small style="color: var(--text-muted);">${t.fecha}</small></td>
                <td>$${t.precio} Cr</td>
                <td><span class="badge badge-${t.estado.toLowerCase()}">${t.estado}</span></td>
                <td>
                  ${t.estado === 'FINALIZADO' ? `<button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="openReviewModal(${t.id})">⭐ Calificar</button>` : '-'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Galactic News & Pilot DDJJ CTA -->
      <div>
        <div class="glass-card" style="background: rgba(255, 145, 0, 0.05); border-color: rgba(255, 145, 0, 0.3);">
          <h4 style="color: var(--secondary-accent); margin-bottom: 0.75rem;">🌌 NOTICIAS DE TATOOINE</h4>
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">⚡ <strong>Alerta Climática:</strong> Fuertes ráfagas de viento y próximas tormentas de arena en el Sector Norte.</p>
          <p style="font-size: 0.9rem;">🏎️ <strong>Deportes:</strong> Anakin Skywalker se corona campeón de la Boonta Eve PodRace.</p>
        </div>

        <div class="glass-card" style="text-align: center; border-color: var(--primary-accent);">
          <h4>👨‍✈️ ¿Tienes Licencia de Vuelo Galáctico?</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0 1rem 0;">Conviértete en Piloto de FlySolo Corp, pilotea naves de la flota y gana créditos.</p>
          <button class="btn btn-primary" onclick="openDDJJModal()">📋 Completar Solicitud (DDJJ)</button>
        </div>
      </div>
    </div>
  `;
}

function bindPasajeroEvents() {
  const orig = document.getElementById('book-origen');
  const dest = document.getElementById('book-destino');
  const agend = document.getElementById('book-agendado');
  const encub = document.getElementById('book-encubierto');
  const carga = document.getElementById('book-carga');

  function updateCalc() {
    if (!orig || !dest) return;
    const { distancia } = calculateDistance3D(orig.value, dest.value);
    const { baseFare, modifiers, discount, total } = calculatePrice(distancia, agend.checked, encub.checked, Number(carga.value || 0));
    
    document.getElementById('calc-distancia').innerText = `${distancia.toLocaleString()} pársecs`;
    document.getElementById('calc-base').innerText = `$${baseFare.toLocaleString()} Cr`;
    document.getElementById('calc-recargos').innerText = `+$${modifiers.toLocaleString()} Cr`;
    document.getElementById('calc-descuento').innerText = `-$${discount.toLocaleString()} Cr`;
    document.getElementById('calc-total').innerText = `$${total.toLocaleString()} Cr`;
  }

  [orig, dest, agend, encub, carga].forEach(el => el && el.addEventListener('change', updateCalc));
  if (carga) carga.addEventListener('input', updateCalc);
}

function requestTrip() {
  alert('🚀 ¡Solicitud enviada! Buscando piloto disponible en tiempo real...');
}

// ==========================================================================
// 2. PILOTO VIEW RENDERER (COCKPIT)
// ==========================================================================
function renderPilotoView() {
  const availableTrips = state.trips.filter(t => t.estado === 'PENDIENTE');

  return `
    <!-- Pilot Cockpit KPI Header -->
    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2>🛰️ Cockpit Operativo de Piloto</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Bienvenido, <strong>Han Solo</strong> | Nave Asignada: <strong>Halcón Milenario</strong></p>
      </div>
      
      <div style="display: flex; gap: 1rem; align-items: center;">
        <button class="btn ${state.isDutyActive ? 'btn-primary' : 'btn-secondary'}" onclick="toggleDuty()">
          ${state.isDutyActive ? '🟢 EN SERVICIO' : '⚪ FUERA DE SERVICIO'}
        </button>
      </div>
    </div>

    <!-- KPIs Bar -->
    <div class="grid-4" style="margin-bottom: 1.5rem;">
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Reputación</div>
          <div class="kpi-value">⭐ 4.9 <span style="font-size: 0.9rem; color: var(--text-muted);">(98)</span></div>
        </div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Ganancias Totales</div>
          <div class="kpi-value">48,200 Cr</div>
        </div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Distancia Recorrida</div>
          <div class="kpi-value">142,500 Par.</div>
        </div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Viajes Completados</div>
          <div class="kpi-value">142</div>
        </div>
      </div>
    </div>

    <!-- Live Available Rides Board -->
    <div class="glass-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h3>📡 TABLERO DE VIAJES DISPONIBLES (Conexión Real-Time)</h3>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">Escuchando solicitudes en vivo del sector galáctico.</p>
        </div>

        <!-- Covert Mission Eye Toggle -->
        <button class="btn-eye ${state.isCovertDecrypted ? 'active' : ''}" onclick="toggleCovertEye()">
          ${state.isCovertDecrypted ? '👁️ Encubiertos: DESENCRIPTADO (Facción REBEL)' : '👁️‍🗨️ Encubiertos: ENCRIPTADO'}
        </button>
      </div>

      <table class="data-table">
        <thead>
          <tr><th>ID Viaje</th><th>Origen ➔ Destino</th><th>Pasajero</th><th>Carga</th><th>Tipo</th><th>Precio</th><th>Acción</th></tr>
        </thead>
        <tbody>
          ${availableTrips.map(t => {
            const isEncrypted = t.encubierto && !state.isCovertDecrypted;
            return `
              <tr>
                <td><strong>#${t.id}</strong></td>
                <td>${isEncrypted ? '•••••••• ➔ ••••••••' : `${t.origen} ➔ ${t.destino}`}</td>
                <td>${isEncrypted ? '••••••••' : t.pasajero}</td>
                <td>${t.carga > 0 ? `${t.carga} kg` : 'Sin Carga'}</td>
                <td>${t.encubierto ? '<span style="color: var(--primary-accent);">🔒 Misión Encubierta</span>' : 'Normal'}</td>
                <td style="font-family: var(--font-heading); color: var(--primary-accent);">$${t.precio} Cr</td>
                <td>
                  <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="openAcceptTripModal(${t.id})">
                    Aceptar Viaje
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================================================
// 3. ADMIN VIEW RENDERER (CONTROL CENTER)
// ==========================================================================
function renderAdminView() {
  return `
    <!-- Top Executive KPIs -->
    <div class="grid-4" style="margin-bottom: 1.5rem;">
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Usuarios Activos</div>
          <div class="kpi-value">1,420</div>
        </div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Flota Pool FlySolo</div>
          <div class="kpi-value">8 Libres / 4 Ocu.</div>
        </div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Viajes Completados Hoy</div>
          <div class="kpi-value">342</div>
        </div>
      </div>
      <div class="kpi-card" style="border-color: #ef4444;">
        <div>
          <div class="kpi-title" style="color: #ef4444;">Solicitudes DDJJ Pendientes</div>
          <div class="kpi-value" style="color: #ef4444;">${state.ddjjInbox.length} PENDIENTES</div>
        </div>
      </div>
    </div>

    <!-- DDJJ Pending Applications Inbox -->
    <div class="glass-card accent-border" style="border-left-color: #ffc400;">
      <h3 style="color: #ffc400; margin-bottom: 0.5rem;">📥 Bandeja de Solicitudes de DDJJ para Pilotos</h3>
      <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem;">
        Revisa las declaraciones juradas enviadas por pasajeros y asígnales una nave libre del pool de FlySolo Corp.
      </p>

      <table class="data-table">
        <thead>
          <tr><th>Solicitante</th><th>Licencia Nº</th><th>Puntaje</th><th>Preferencia Nave</th><th>Acción</th></tr>
        </thead>
        <tbody>
          ${state.ddjjInbox.map(d => `
            <tr>
              <td><strong>${d.nombre}</strong><br><small style="color: var(--text-muted);">${d.email}</small></td>
              <td><code>${d.licencia}</code></td>
              <td><span style="color: var(--status-finalizado); font-weight: 700;">${d.puntaje} / 100</span></td>
              <td>${d.preferencia}</td>
              <td>
                <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem; background: #ffc400; color: #000;" onclick="openSingleLevelApproveModal(${d.id})">
                  Revisar y Aprobar
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Fleet & Planets Grid -->
    <div class="grid-2">
      <!-- Fleet Pool Management -->
      <div class="glass-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3>🛸 Flota de Naves (Pool FlySolo Corp)</h3>
          <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openAddShipModal()">+ Agregar Nave</button>
        </div>

        <div class="grid-2">
          ${state.fleet.map(s => `
            <div class="kpi-card" style="flex-direction: column; align-items: flex-start;">
              <div style="display: flex; justify-content: space-between; width: 100%;">
                <strong>${s.nombre}</strong>
                <span class="badge ${s.estado === 'Libre' ? 'badge-finalizado' : 'badge-pendiente'}">${s.estado}</span>
              </div>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 4px 0;">${s.tipo}</p>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Patente: ${s.patente} | Cap: ${s.capacidad} kg</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Planets 3D Catalog -->
      <div class="glass-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3>🪐 Catálogo de Planetas 3D</h3>
          <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openAddPlanetModal()">+ Agregar Planeta</button>
        </div>

        <div class="grid-2">
          ${state.planets.map(p => `
            <div class="kpi-card" style="flex-direction: column; align-items: flex-start;">
              <div style="display: flex; justify-content: space-between; width: 100%;">
                <strong>${p.img} ${p.nombre}</strong>
                <code style="font-size: 0.75rem; color: var(--primary-accent);">(${p.x}, ${p.y}, ${p.z})</code>
              </div>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">${p.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 4. MODALS ENGINE (SINGLE LEVEL STRICT)
// ==========================================================================
function openModal(title, htmlContent) {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div>
          ${htmlContent}
        </div>
      </div>
    </div>
  `;
}

function closeModal(e) {
  document.getElementById('modal-container').innerHTML = '';
}

// Single Level Approval Modal for Admin (NO Nested Modals!)
function openSingleLevelApproveModal(ddjjId) {
  const app = state.ddjjInbox.find(d => d.id === ddjjId);
  const freeShips = state.fleet.filter(s => s.estado === 'Libre');

  openModal('Aprobar Solicitud de Piloto & Asignar Nave', `
    <div style="font-size: 0.95rem; margin-bottom: 1.5rem;">
      <p>Solicitante: <strong>${app.nombre}</strong> (${app.email})</p>
      <p>Número de Licencia: <code>${app.licencia}</code> | Puntaje: <strong style="color: var(--status-finalizado);">${app.puntaje}/100</strong></p>
      <p>Preferencia de Nave: <em>${app.preferencia}</em></p>
    </div>

    <div class="form-group" style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
      <label class="form-label" style="color: #ffc400;">🛸 Seleccionar Nave Disponible del Pool (FlySolo Corp):</label>
      <select id="modal-assign-ship" class="form-select">
        ${freeShips.map(s => `<option value="${s.id}">${s.nombre} (${s.tipo}) - Cap: ${s.capacidad} kg</option>`).join('')}
      </select>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" style="background: #ffc400; color: #000;" onclick="confirmApprovePilot(${app.id})">
        ✅ Aprobar y Otorgar Licencia
      </button>
    </div>
  `);
}

function confirmApprovePilot(id) {
  state.ddjjInbox = state.ddjjInbox.filter(d => d.id !== id);
  closeModal();
  alert('🎉 ¡Solicitud aprobada con éxito! El usuario ahora tiene el rol de Piloto.');
  render();
}

function openAcceptTripModal(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  openModal(`Confirmar Aceptación de Viaje #${trip.id}`, `
    <p>Origen: <strong>${trip.origen}</strong> ➔ Destino: <strong>${trip.destino}</strong></p>
    <p>Pasajero: <strong>${trip.pasajero}</strong> | Carga: <strong>${trip.carga} kg</strong></p>
    <p style="font-family: var(--font-heading); color: var(--primary-accent); font-size: 1.4rem; margin: 1rem 0;">Tarifa: $${trip.precio} Cr</p>
    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
      <button class="btn btn-secondary" onclick="closeModal()">Rechazar</button>
      <button class="btn btn-primary" onclick="confirmAcceptTrip(${trip.id})">🚀 Confirmar Despegue</button>
    </div>
  `);
}

function confirmAcceptTrip(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (trip) trip.estado = 'EN_PROGRESO';
  closeModal();
  alert('🚀 ¡Viaje aceptado! Iniciando motores en curso...');
  render();
}

function openEmergencyCancelModal() {
  openModal('⚠️ Reportar Incidencia / Cancelar Viaje', `
    <p style="margin-bottom: 1rem;">Indica el motivo de la cancelación de emergencia durante el trayecto:</p>
    <select class="form-select" style="margin-bottom: 1rem;">
      <option>Ataque o bloqueo comercial imprevisto</option>
      <option>Falla técnica en el hiperimpulsor de la nave</option>
      <option>Discrepancia de carga del pasajero</option>
    </select>
    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
      <button class="btn btn-secondary" onclick="closeModal()">Continuar Viaje</button>
      <button class="btn btn-danger" onclick="confirmCancelTrip()">Cancelar Viaje</button>
    </div>
  `);
}

function confirmCancelTrip() {
  state.activeTrip.estado = 'CANCELADO';
  closeModal();
  alert('❌ Viaje cancelado por incidencia. Notificando a la central...');
  render();
}

function openReviewModal(tripId) {
  openModal('⭐ Calificar Servicio del Piloto', `
    <p style="margin-bottom: 1rem;">¿Cómo fue tu experiencia de viaje con el piloto?</p>
    <div style="font-size: 1.8rem; margin-bottom: 1rem; color: #ffc400; cursor: pointer;">
      ★ ★ ★ ★ ★
    </div>
    <textarea class="form-textarea" placeholder="Escribe tu comentario sobre el servicio..." rows="3"></textarea>
    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="closeModal(); alert('¡Gracias por tu valoración!');">Enviar Reseña</button>
    </div>
  `);
}

function openDDJJModal() {
  openModal('📋 Solicitud de Declaración Jurada (DDJJ) para Piloto', `
    <div class="form-group">
      <label class="form-label">Número de Licencia Galáctica</label>
      <input type="text" class="form-input" placeholder="Ej: 5413GFFF">
    </div>
    <div class="form-group">
      <label class="form-label">Puntaje de Licencia</label>
      <input type="number" class="form-input" value="95" max="100">
    </div>
    <div class="form-group">
      <label class="form-label">Preferencia de Nave</label>
      <select class="form-select">
        <option>Carguero Ligero</option>
        <option>Caza Estelar</option>
        <option>Caza Sigiloso / Furtivo</option>
      </select>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="closeModal(); alert('¡Solicitud enviada al Administrador para revisión!');">Enviar DDJJ</button>
    </div>
  `);
}

function openAddShipModal() {
  openModal('+ Agregar Nueva Nave a la Flota', `
    <div class="form-group">
      <label class="form-label">Nombre de la Nave</label>
      <input type="text" class="form-input" placeholder="Ej: Millennium Falcon">
    </div>
    <div class="form-group">
      <label class="form-label">Tipo de Nave</label>
      <input type="text" class="form-input" placeholder="Ej: Carguero Ligero Corelliano">
    </div>
    <div class="form-group">
      <label class="form-label">Patente</label>
      <input type="text" class="form-input" placeholder="Ej: HMHSCWB123456">
    </div>
    <div class="form-group">
      <label class="form-label">Capacidad de Carga (kg)</label>
      <input type="number" class="form-input" value="5000">
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="closeModal(); alert('¡Nave agregada al pool de FlySolo Corp!');">Guardar Nave</button>
    </div>
  `);
}

function openAddPlanetModal() {
  openModal('+ Agregar Nuevo Planeta 3D', `
    <div class="form-group">
      <label class="form-label">Nombre del Planeta</label>
      <input type="text" class="form-input" placeholder="Ej: Hoth">
    </div>
    <div class="grid-3">
      <div class="form-group">
        <label class="form-label">Coord X</label>
        <input type="number" class="form-input" value="120">
      </div>
      <div class="form-group">
        <label class="form-label">Coord Y</label>
        <input type="number" class="form-input" value="450">
      </div>
      <div class="form-group">
        <label class="form-label">Coord Z</label>
        <input type="number" class="form-input" value="310">
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="closeModal(); alert('¡Planeta registrado en el catálogo 3D!');">Guardar Planeta</button>
    </div>
  `);
}
