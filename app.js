/* ============================================================
   OBSERVATORIO HÍDRICO RD · Dashboard Público
   ============================================================
   URL de LECTURA — puedes usar la tuya o la /exec.
   Para esta app solo se necesita GET, así que la URL que me
   diste funciona perfectamente.
   ============================================================ */

const API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnQ-zUzUz8ahCSNVoH8cTbEWjhQjKA-ECr7Q6ENxpaGNP4_Zbnv0bIAuFqNmXLK3C7x07lEwLKWDICmADn2sFmim6l2yw72xP-J5nZ_XKGY9sqnBulJhf6jqpjiMZ8iZYU8wc5u6cxLbdh8GZSdIsWSBdW8mRiJuNMTW2_ptLwzPFBa-BiivRXbRVUNZy2byuk7id6Gi-f4QIcwIi9c2T3DfCPiO0qq3crMucMUXuJ_8N4GVrNU60q1pabxQL3F6MO95TdSmr6HCfIoAEEsxNinlQsg1Gw&lib=MqzpnpKQXI6-7R1puCMPz8jkmKwee5e9k';

/* ------------------------------------------------------------
   1. COORDENADAS DE LAS 46 ESTACIONES (aprox.)
   Las estaciones sin coordenada exacta usan una aproximación
   provincial. Puedes ajustarlas con las coordenadas oficiales
   del INDRHI.
------------------------------------------------------------ */
const STATIONS = {
  'Anamuya':                 { lat: 18.750, lng: -68.750 },
  'Angostura':               { lat: 18.883, lng: -70.317 },
  'Arroyo Caña':             { lat: 19.083, lng: -70.633 },
  'Barahona':                { lat: 18.209, lng: -71.100 },
  'Boca de Mao':             { lat: 19.633, lng: -71.033 },
  'Constanza':               { lat: 18.909, lng: -70.744 },
  'Cotuí':                   { lat: 19.050, lng: -70.150 },
  'El Chorro':               { lat: 18.700, lng: -69.950 },
  'El Higüero':              { lat: 18.583, lng: -69.950 },
  'El Peñón':                { lat: 18.283, lng: -71.183 },
  'El Recodo':               { lat: 19.467, lng: -70.683 },
  'El Sisal':                { lat: 18.967, lng: -70.017 },
  'Engombe':                 { lat: 18.483, lng: -69.983 },
  'Estación Tavera':         { lat: 19.283, lng: -70.700 },
  'Guazumal':                { lat: 19.467, lng: -70.700 },
  'Gurabo Afuera':           { lat: 19.450, lng: -70.683 },
  'Hatillo-Azua':            { lat: 18.955, lng: -70.153 },
  'Jánico':                  { lat: 19.333, lng: -70.783 },
  'Jarabacoa':               { lat: 19.117, lng: -70.633 },
  'Jinamagao':               { lat: 19.050, lng: -70.500 },
  'Juma-Bonao':              { lat: 18.950, lng: -70.400 },
  'La Isabela':              { lat: 19.883, lng: -71.083 },
  'La Vega':                 { lat: 19.222, lng: -70.529 },
  'Las Lagunas':             { lat: 18.800, lng: -70.550 },
  'Los Arroyos':             { lat: 18.400, lng: -70.883 },
  'Los Cagueyes':            { lat: 19.100, lng: -70.800 },
  'Los Hidalgos':            { lat: 19.700, lng: -71.050 },
  'Los Jengibres':           { lat: 19.317, lng: -70.533 },
  'Maguá-Monción':           { lat: 19.417, lng: -71.183 },
  'Majagual':                { lat: 19.033, lng: -69.783 },
  'Matayaya':                { lat: 18.850, lng: -71.583 },
  'Medina':                  { lat: 18.650, lng: -70.017 },
  'Naranjo de China':        { lat: 19.150, lng: -70.583 },
  'Ofic. De Esperanza':      { lat: 19.583, lng: -70.983 },
  'Ofic. Pedernales':        { lat: 18.033, lng: -71.750 },
  'Olivares':                { lat: 18.833, lng: -71.183 },
  'Paso al Medio':           { lat: 19.483, lng: -71.317 },
  'Peña Ranchadero':         { lat: 19.000, lng: -70.900 },
  'Piedra Blanca':           { lat: 18.850, lng: -70.317 },
  'Puerto Escondido':        { lat: 19.467, lng: -70.783 },
  'Quirigua':                { lat: 18.750, lng: -70.750 },
  'Sabana Mula':             { lat: 18.950, lng: -70.050 },
  'San Juan de la Maguana':  { lat: 18.806, lng: -71.229 },
  'Santa Ana':               { lat: 19.100, lng: -71.450 },
  'Vallejuelo':              { lat: 18.650, lng: -71.333 },
  'Villarpando':             { lat: 18.650, lng: -71.033 }
};

/* ------------------------------------------------------------
   2. COORDENADAS DE LAS 10 PRESAS REALES
------------------------------------------------------------ */
const DAMS = [
  { name: 'Tavera',        lat: 19.283, lng: -70.700, capacity: 170, defaultLevel: 320, defaultPct: 76 },
  { name: 'Bao',           lat: 19.183, lng: -70.983, capacity: 270, defaultLevel: 360, defaultPct: 79 },
  { name: 'Monción',       lat: 19.417, lng: -71.183, capacity: 300, defaultLevel: 355, defaultPct: 85 },
  { name: 'Rincón',        lat: 19.150, lng: -70.383, capacity: 100, defaultLevel: 270, defaultPct: 72 },
  { name: 'Hatillo',       lat: 18.955, lng: -70.153, capacity: 380, defaultLevel: 280, defaultPct: 82 },
  { name: 'Jigüey',        lat: 18.850, lng: -70.483, capacity: 120, defaultLevel: 540, defaultPct: 68 },
  { name: 'Valdesia',      lat: 18.543, lng: -70.277, capacity: 137, defaultLevel: 148, defaultPct: 74 },
  { name: 'Sabana Yegua',  lat: 18.567, lng: -71.017, capacity: 670, defaultLevel: 425, defaultPct: 88 },
  { name: 'Sabaneta',      lat: 19.017, lng: -71.317, capacity: 200, defaultLevel: 640, defaultPct: 62 },
  { name: 'Montegrande',   lat: 18.600, lng: -71.700, capacity: 250, defaultLevel: 480, defaultPct: 70 }
];

/* ------------------------------------------------------------
   3. ESTADO GLOBAL
------------------------------------------------------------ */
const state = {
  view: 'lluvias',          // 'lluvias' | 'presas'
  rains: [],                // { station, mm, lat, lng, fecha }
  dams: DAMS.map(d => ({ ...d, level: d.defaultLevel, pct: d.defaultPct })),
  lastUpdate: new Date()
};

/* ------------------------------------------------------------
   4. MAPA LEAFLET
------------------------------------------------------------ */
const map = L.map('map', {
  center: [18.7357, -70.1627],
  zoom: 8,
  zoomControl: false,
  attributionControl: false
});

/* Tiles OSM con fallback a Esri */
const TILE_PROVIDERS = [
  {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxZoom: 19
  },
  {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    subdomains: '',
    maxZoom: 16
  }
];

let currentTileIndex = 0;
let activeTileLayer = null;

function loadTileProvider(index) {
  if (activeTileLayer) map.removeLayer(activeTileLayer);
  const cfg = TILE_PROVIDERS[index];
  activeTileLayer = L.tileLayer(cfg.url, {
    subdomains: cfg.subdomains,
    maxZoom: cfg.maxZoom,
    crossOrigin: 'anonymous'
  });
  activeTileLayer.on('tileerror', () => {
    if (currentTileIndex < TILE_PROVIDERS.length - 1) {
      currentTileIndex++;
      loadTileProvider(currentTileIndex);
    }
  });
  activeTileLayer.addTo(map);
}
loadTileProvider(0);

L.control.zoom({ position: 'bottomright' }).addTo(map);
L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

const rainLayer = L.layerGroup();
const damLayer  = L.layerGroup();

/* ------------------------------------------------------------
   5. RENDER DE CAPAS
------------------------------------------------------------ */
function rainColorClass(mm) {
  if (mm <= 0)  return 'rain-0';
  if (mm < 10)  return 'rain-low';
  if (mm < 30)  return 'rain-mid';
  return 'rain-high';
}

function renderRains() {
  rainLayer.clearLayers();

  state.rains.forEach(r => {
    const icon = L.divIcon({
      className: 'rain-div-icon',
      html: `<div class="rain-marker ${rainColorClass(r.mm)}">${r.mm.toFixed(0)}</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22]
    });

    L.marker([r.lat, r.lng], { icon })
      .bindPopup(`
        <div class="rain-popup-title">🌧️ ${r.station}</div>
        <div class="rain-popup-value">${r.mm.toFixed(1)}<small>mm</small></div>
      `, { closeButton: false })
      .addTo(rainLayer);
  });
}

function damPctClass(pct) {
  if (pct < 40) return 'pct-low';
  if (pct < 70) return 'pct-mid';
  return 'pct-high';
}

function renderDams() {
  damLayer.clearLayers();

  state.dams.forEach(d => {
    const icon = L.divIcon({
      className: 'dam-div-icon',
      html: `<div class="dam-marker ${damPctClass(d.pct)}"><span>💧</span></div>`,
      iconSize: [42, 52],
      iconAnchor: [21, 50],
      popupAnchor: [0, -46]
    });

    L.marker([d.lat, d.lng], { icon, riseOnHover: true, zIndexOffset: 500 })
      .bindPopup(`
        <div class="popup-title">🏞️ Presa de ${d.name}</div>
        <div class="popup-row"><span>Nivel de operación</span><span>${d.level.toFixed(2)} m</span></div>
        <div class="popup-row"><span>Porcentaje útil</span><span>${d.pct.toFixed(1)} %</span></div>
        <div class="popup-row"><span>Capacidad útil</span><span>${d.capacity} hm³</span></div>
      `, { closeButton: false, maxWidth: 260 })
      .addTo(damLayer);
  });
}

/* ------------------------------------------------------------
   6. LEYENDA DINÁMICA
------------------------------------------------------------ */
function renderLegend() {
  const el = document.getElementById('mapLegend');
  if (state.view === 'lluvias') {
    el.innerHTML = `
      <div class="legend-item"><span class="legend-swatch" style="background:#bbdefb"></span> 0 mm</div>
      <div class="legend-item"><span class="legend-swatch" style="background:#64b5f6"></span> 1-10 mm</div>
      <div class="legend-item"><span class="legend-swatch" style="background:#2196f3"></span> 10-30 mm</div>
      <div class="legend-item"><span class="legend-swatch" style="background:#0d47a1"></span> 30+ mm</div>
    `;
  } else {
    el.innerHTML = `
      <div class="legend-item"><span class="legend-swatch" style="background:#c62828"></span> &lt;40%</div>
      <div class="legend-item"><span class="legend-swatch" style="background:#ef6c00"></span> 40-70%</div>
      <div class="legend-item"><span class="legend-swatch" style="background:#2e7d32"></span> 70%+</div>
    `;
  }
}

/* ------------------------------------------------------------
   7. CONSUMO DE API
------------------------------------------------------------ */
async function fetchData() {
  setRefreshing(true);
  try {
    const res = await fetch(API_URL, { method: 'GET', cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    applyApiData(json);
    state.lastUpdate = new Date();
    showToast('Datos actualizados');
  } catch (err) {
    console.warn('API error:', err.message);
    showToast('Usando datos de demostración', true);
    // Fallback demo si la API falla
    state.rains = Object.entries(STATIONS).slice(0, 15).map(([station, coords]) => ({
      station, lat: coords.lat, lng: coords.lng,
      mm: Math.round(Math.random() * 45 * 10) / 10,
      fecha: new Date().toISOString()
    }));
  } finally {
    setRefreshing(false);
    renderAll();
  }
}

/* ------------------------------------------------------------
   8. MAPEO API → ESTADO
------------------------------------------------------------ */
function applyApiData(payload) {
  let lluvias = [];
  let presas  = [];

  if (Array.isArray(payload)) {
    payload.forEach(row => {
      if (row.Nombre_Presa) presas.push(row);
      else if (row.Estacion || row.Milimetros !== undefined) lluvias.push(row);
    });
  } else if (payload && typeof payload === 'object') {
    lluvias = payload.lluvias || payload.Lluvias || [];
    presas  = payload.presas  || payload.Presas  || [];
  }

  /* ---- PRESAS ---- */
  const damMap = new Map();
  presas.forEach(p => {
    const name = (p.Nombre_Presa || '').trim();
    if (!name) return;
    const key = normalize(name);
    const fecha = p.Fecha || '';
    const prev = damMap.get(key);
    if (!prev || new Date(fecha) >= new Date(prev.Fecha || 0)) {
      damMap.set(key, {
        Nivel_Operacion: Number(p.Nivel_Operacion) || 0,
        Porcentaje_Util: Number(p.Porcentaje_Util) || 0,
        Fecha: fecha
      });
    }
  });

  state.dams = DAMS.map(d => {
    const key = normalize(d.name);
    let match = damMap.get(key);
    if (!match) {
      for (const [k, v] of damMap) {
        if (k.includes(key) || key.includes(k)) { match = v; break; }
      }
    }
    return {
      ...d,
      level: match ? match.Nivel_Operacion : d.defaultLevel,
      pct: match ? clamp(match.Porcentaje_Util, 0, 100) : d.defaultPct
    };
  });

  /* ---- LLUVIAS ---- */
  const stationMap = new Map();
  lluvias.forEach(r => {
    const station = (r.Estacion || '').trim();
    if (!station) return;
    const key = normalize(station);
    const fecha = r.Fecha || '';
    const prev = stationMap.get(key);
    if (!prev || new Date(fecha) >= new Date(prev.Fecha || 0)) {
      stationMap.set(key, {
        station,
        mm: Number(r.Milimetros) || 0,
        fecha
      });
    }
  });

  // Construir array de estaciones con coordenadas
  state.rains = [];
  stationMap.forEach((v, k) => {
    // Buscar coordenadas en el catálogo
    let coords = null;
    for (const [name, c] of Object.entries(STATIONS)) {
      if (normalize(name) === k || normalize(name).includes(k) || k.includes(normalize(name))) {
        coords = c; break;
      }
    }
    if (!coords) return;
    state.rains.push({
      station: v.station,
      lat: coords.lat,
      lng: coords.lng,
      mm: v.mm,
      fecha: v.fecha
    });
  });
}

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

/* ------------------------------------------------------------
   9. DASHBOARD — LLUVIAS
------------------------------------------------------------ */
function renderDashboardRains() {
  if (!state.rains.length) {
    document.getElementById('avgRain').textContent = '0';
    document.getElementById('maxRain').textContent = '0 mm';
    document.getElementById('activeStations').textContent = '0';
    document.getElementById('regionsList').innerHTML = '<p style="color:#94a3b8;font-size:.8rem">Sin datos disponibles</p>';
    return;
  }

  const avg = state.rains.reduce((s, r) => s + r.mm, 0) / state.rains.length;
  const max = Math.max(...state.rains.map(r => r.mm));
  const maxBar = 100; // escala visual (100mm = 100%)

  document.getElementById('avgRain').textContent = avg.toFixed(1);
  document.getElementById('maxRain').textContent = max.toFixed(1) + ' mm';
  document.getElementById('activeStations').textContent = state.rains.length;
  document.getElementById('rainBarFill').style.width = Math.min((avg / maxBar) * 100, 100) + '%';

  // Ordenar de mayor a menor lluvia
  const sorted = state.rains.slice().sort((a, b) => b.mm - a.mm);
  document.getElementById('regionsList').innerHTML = sorted.map(r => {
    const cls = r.mm >= 30 ? 'high' : r.mm >= 10 ? 'mid' : r.mm > 0 ? 'mid' : 'low';
    const color = r.mm >= 30 ? 'style="color:#0d47a1"' : r.mm >= 10 ? 'style="color:#2196f3"' : 'style="color:#94a3b8"';
    return `
      <div class="dam-row">
        <div class="dam-row-info">
          <div class="dam-row-name">🌧️ ${r.station}</div>
          <div class="dam-row-meta">Registrado: ${formatDate(r.fecha)}</div>
        </div>
        <div class="dam-row-pct ${cls}" ${color}>${r.mm.toFixed(1)} mm</div>
      </div>
    `;
  }).join('');

  document.getElementById('updatedAt').textContent =
    'Actualizado ' + state.lastUpdate.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
}

/* ------------------------------------------------------------
   10. DASHBOARD — PRESAS
------------------------------------------------------------ */
function renderDashboardDams() {
  const totalCapacity = state.dams.reduce((s, d) => s + (d.capacity * d.pct / 100), 0);
  const installed = state.dams.reduce((s, d) => s + d.capacity, 0);
  const pct = installed ? (totalCapacity / installed) * 100 : 0;

  animateNumber('totalCapacity', totalCapacity);
  document.getElementById('capacityPct').textContent = pct.toFixed(1) + '%';
  document.getElementById('capacityBarFill').style.width = pct.toFixed(1) + '%';

  document.getElementById('damsList').innerHTML = state.dams
    .slice().sort((a, b) => b.pct - a.pct)
    .map(d => {
      const cls = d.pct >= 70 ? 'high' : d.pct >= 40 ? 'mid' : 'low';
      return `
        <div class="dam-row">
          <div class="dam-row-info">
            <div class="dam-row-name">🏞️ Presa de ${d.name}</div>
            <div class="dam-row-meta">Nivel: ${d.level.toFixed(2)} m · Cap: ${d.capacity} hm³</div>
          </div>
          <div class="dam-row-pct ${cls}">${d.pct.toFixed(0)}%</div>
        </div>
      `;
    }).join('');

  document.getElementById('updatedAt2').textContent =
    'Actualizado ' + state.lastUpdate.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
}

function animateNumber(elId, target, decimals = 0) {
  const el = document.getElementById(elId);
  const start = parseFloat(el.textContent.replace(/,/g, '')) || 0;
  const duration = 800;
  const t0 = performance.now();

  function step(now) {
    const t = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = start + (target - start) * eased;
    el.textContent = val.toLocaleString('es-DO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

/* ------------------------------------------------------------
   11. CAMBIO DE VISTA
------------------------------------------------------------ */
function switchView(view) {
  state.view = view;

  // Tabs
  document.querySelectorAll('.view-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.view === view);
  });

  // Paneles
  document.querySelectorAll('.panel-view').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-view-${view}`).classList.add('active');

  // Capas del mapa
  map.removeLayer(rainLayer);
  map.removeLayer(damLayer);
  if (view === 'lluvias') {
    map.addLayer(rainLayer);
    fitToLayer(rainLayer);
  } else {
    map.addLayer(damLayer);
    fitToLayer(damLayer);
  }

  renderLegend();
  setTimeout(() => map.invalidateSize(), 200);
}

function fitToLayer(layer) {
  const layers = layer.getLayers();
  if (!layers.length) return;
  const bounds = L.latLngBounds(layers.map(l => l.getLatLng()));
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
  }
}

/* ------------------------------------------------------------
   12. DESCARGA DE IMÁGENES (html2canvas)
------------------------------------------------------------ */
async function downloadImage(view) {
  const btnId = view === 'lluvias' ? 'downloadRainBtn' : 'downloadDamsBtn';
  const btn = document.getElementById(btnId);
  const label = btn.querySelector('span');
  const originalText = label.textContent;

  btn.disabled = true;
  label.textContent = 'Generando imagen…';

  try {
    // Esperar a que los tiles del mapa estén cargados
    await new Promise(r => setTimeout(r, 300));

    const target = document.getElementById('appCapture');
    const canvas = await html2canvas(target, {
      backgroundColor: '#01579b',
      scale: window.devicePixelRatio > 1 ? 2 : 1,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: target.offsetWidth,
      height: target.offsetHeight,
      windowWidth: target.offsetWidth,
      windowHeight: target.offsetHeight
    });

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      const tipo = view === 'lluvias' ? 'lluvias' : 'presas';
      a.href = url;
      a.download = `reporte-${tipo}-rd-${date}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      showToast('Imagen descargada correctamente ✅');
    }, 'image/png', 0.95);
  } catch (err) {
    console.error(err);
    showToast('Error al generar la imagen. Intenta de nuevo.', true);
  } finally {
    btn.disabled = false;
    label.textContent = originalText;
  }
}

/* ------------------------------------------------------------
   13. CONTROLES / EVENTOS
------------------------------------------------------------ */
document.querySelectorAll('.view-tab').forEach(tab => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

document.getElementById('refreshBtn').addEventListener('click', fetchData);
document.getElementById('downloadRainBtn').addEventListener('click', () => downloadImage('lluvias'));
document.getElementById('downloadDamsBtn').addEventListener('click', () => downloadImage('presas'));

document.getElementById('fitBoundsBtn').addEventListener('click', () => {
  const layer = state.view === 'lluvias' ? rainLayer : damLayer;
  fitToLayer(layer);
});

/* ------------------------------------------------------------
   14. UI HELPERS
------------------------------------------------------------ */
function setRefreshing(active) {
  document.getElementById('refreshBtn').classList.toggle('spinning', active);
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.toggle('error', isError);
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ------------------------------------------------------------
   15. BOOTSTRAP
------------------------------------------------------------ */
function renderAll() {
  renderRains();
  renderDams();
  renderDashboardRains();
  renderDashboardDams();

  // Aplicar la capa según la vista actual
  map.removeLayer(rainLayer);
  map.removeLayer(damLayer);
  if (state.view === 'lluvias') map.addLayer(rainLayer);
  else map.addLayer(damLayer);

  renderLegend();
}

async function init() {
  renderAll();
  await fetchData();
  switchView('lluvias'); // Encuadra el mapa tras la primera carga
  setInterval(fetchData, 5 * 60 * 1000); // Auto-refresh cada 5 min
}

document.addEventListener('DOMContentLoaded', init);
