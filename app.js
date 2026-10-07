/* ============================================================
   OBSERVATORIO HÍDRICO RD — Dashboard
   Consumo de API · Mapa Leaflet · Dashboard · Export PNG
   ============================================================ */

/* URL pública del Google Apps Script (la que me compartiste) */
const API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnQ-zUzUz8ahCSNVoH8cTbEWjhQjKA-ECr7Q6ENxpaGNP4_Zbnv0bIAuFqNmXLK3C7x07lEwLKWDICmADn2sFmim6l2yw72xP-J5nZ_XKGY9sqnBulJhf6jqpjiMZ8iZYU8wc5u6cxLbdh8GZSdIsWSBdW8mRiJuNMTW2_ptLwzPFBa-BiivRXbRVUNZy2byuk7id6Gi-f4QIcwIi9c2T3DfCPiO0qq3crMucMUXuJ_8N4GVrNU60q1pabxQL3F6MO95TdSmr6HCfIoAEEsxNinlQsg1Gw&lib=MqzpnpKQXI6-7R1puCMPz8jkmKwee5e9k';

/* ------------------------------------------------------------
   1. REGIONES DE LLUVIA (polígonos aproximados de RD)
------------------------------------------------------------ */
const RAIN_REGIONS = [
  { name: 'Cibao Norte', coords: [[19.65,-71.05],[19.65,-70.35],[19.20,-70.00],[18.90,-70.35],[19.00,-70.90],[19.30,-71.10]] },
  { name: 'Cibao Sur',   coords: [[19.20,-70.45],[19.25,-70.05],[18.75,-69.90],[18.60,-70.35],[18.90,-70.65]] },
  { name: 'Región Este', coords: [[19.00,-69.30],[19.05,-68.40],[18.35,-68.30],[18.15,-69.00],[18.55,-69.60]] },
  { name: 'Región Sur',  coords: [[18.60,-70.30],[18.75,-69.55],[18.20,-69.45],[17.95,-70.05],[18.30,-70.45]] },
  { name: 'Suroeste',    coords: [[19.05,-71.75],[19.15,-71.00],[18.55,-70.85],[17.95,-71.25],[17.85,-71.90],[18.55,-71.95]] }
];

/* ------------------------------------------------------------
   2. PRESAS REALES DE REPÚBLICA DOMINICANA
------------------------------------------------------------ */
const DAMS = [
  { name: 'Presa de Tavera',        lat: 19.283, lng: -70.700, capacity: 170, defaultLevel: 320, defaultPct: 76 },
  { name: 'Presa de Bao',           lat: 19.183, lng: -70.983, capacity: 270, defaultLevel: 360, defaultPct: 79 },
  { name: 'Presa de Monción',       lat: 19.417, lng: -71.183, capacity: 300, defaultLevel: 355, defaultPct: 85 },
  { name: 'Presa de Rincón',        lat: 19.150, lng: -70.383, capacity: 100, defaultLevel: 270, defaultPct: 72 },
  { name: 'Presa de Hatillo',       lat: 18.955, lng: -70.153, capacity: 380, defaultLevel: 280, defaultPct: 82 },
  { name: 'Presa de Jigüey',        lat: 18.850, lng: -70.483, capacity: 120, defaultLevel: 540, defaultPct: 68 },
  { name: 'Presa de Valdesia',      lat: 18.543, lng: -70.277, capacity: 137, defaultLevel: 148, defaultPct: 74 },
  { name: 'Presa de Sabana Yegua',  lat: 18.567, lng: -71.017, capacity: 670, defaultLevel: 425, defaultPct: 88 },
  { name: 'Presa de Sabaneta',      lat: 19.017, lng: -71.317, capacity: 200, defaultLevel: 640, defaultPct: 62 },
  { name: 'Presa de Montegrande',   lat: 18.600, lng: -71.700, capacity: 250, defaultLevel: 480, defaultPct: 70 }
];

/* ------------------------------------------------------------
   3. ESTADO
------------------------------------------------------------ */
const state = {
  rains: RAIN_REGIONS.map(r => ({ name: r.name, mm: 0, coords: r.coords })),
  dams: DAMS.map(d => ({ ...d, level: d.defaultLevel, pct: d.defaultPct })),
  lastUpdate: new Date(),
  _fitted: false,
  _damsBounds: null
};

/* ------------------------------------------------------------
   4. MAPA
------------------------------------------------------------ */
const map = L.map('map', {
  center: [18.7357, -70.1627],
  zoom: 8,
  zoomControl: false,
  attributionControl: false
});

/* Tiles con fallback */
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
    crossOrigin: true
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

const rainLayer = L.layerGroup().addTo(map);
const damLayer  = L.layerGroup().addTo(map);

/* ------------------------------------------------------------
   5. RENDER
------------------------------------------------------------ */
function rainColor(mm) {
  if (mm >= 40) return '#0d47a1';
  if (mm >= 25) return '#1976d2';
  if (mm >= 15) return '#42a5f5';
  if (mm >= 5)  return '#90caf9';
  return '#bbdefb';
}

function renderRains() {
  rainLayer.clearLayers();
  state.rains.forEach(r => {
    const poly = L.polygon(r.coords, {
      color: '#ffffff',
      weight: 2,
      fillColor: rainColor(r.mm),
      fillOpacity: 0.55,
      smoothFactor: 1.2
    });

    poly.bindPopup(`
      <div class="rain-popup-title">🌧️ ${r.name}</div>
      <div class="rain-popup-value">${r.mm.toFixed(1)}<small>mm</small></div>
    `, { closeButton: false, offset: [0, -4] });

    poly.on('mouseover', function () { this.setStyle({ fillOpacity: 0.78, weight: 3 }); });
    poly.on('mouseout',  function () { this.setStyle({ fillOpacity: 0.55, weight: 2 }); });

    poly.addTo(rainLayer);
  });
}

function damPctClass(pct) {
  if (pct < 40) return 'pct-low';
  if (pct < 70) return 'pct-mid';
  return 'pct-high';
}

function renderDams() {
  damLayer.clearLayers();
  const bounds = L.latLngBounds();

  state.dams.forEach(d => {
    const icon = L.divIcon({
      className: 'dam-div-icon',
      html: `<div class="dam-marker ${damPctClass(d.pct)}"><span>💧</span></div>`,
      iconSize: [42, 52],
      iconAnchor: [21, 50],
      popupAnchor: [0, -46]
    });

    const marker = L.marker([d.lat, d.lng], {
      icon,
      riseOnHover: true,
      zIndexOffset: 500
    });

    marker.bindPopup(`
      <div class="popup-title">🏞️ ${d.name}</div>
      <div class="popup-row"><span>Nivel de operación</span><span>${d.level.toFixed(2)} m</span></div>
      <div class="popup-row"><span>Porcentaje útil</span><span>${d.pct.toFixed(1)} %</span></div>
      <div class="popup-row"><span>Capacidad útil</span><span>${d.capacity} hm³</span></div>
    `, { closeButton: false, maxWidth: 260, offset: [0, 6] });

    marker.addTo(damLayer);
    bounds.extend([d.lat, d.lng]);
  });

  state._damsBounds = bounds;
}

/* ------------------------------------------------------------
   6. CONSUMO DE API
------------------------------------------------------------ */
async function fetchData() {
  setRefreshing(true);
  try {
    const res = await fetch(API_URL + '&tipo=todo', { method: 'GET', cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const json = await res.json();
    applyApiData(json);
    state.lastUpdate = new Date();
    showToast('Datos actualizados');
  } catch (err) {
    console.warn('API error, usando datos demo:', err.message);
    showToast('Usando datos de demostración', true);
  } finally {
    setRefreshing(false);
    renderAll();
  }
}

/* ------------------------------------------------------------
   7. MAPEO API → ESTADO
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

  // ---- Presas ----
  const damMap = new Map();
  presas.forEach(p => {
    const name = (p.Nombre_Presa || '').trim();
    if (!name) return;
    const key = normalize(name);
    const fecha = p.Fecha || '';
    const prev = damMap.get(key);
    if (!prev || new Date(fecha) >= new Date(prev.Fecha || 0)) {
      damMap.set(key, {
        Nombre_Presa: name,
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

  // ---- Lluvias ----
  const rainMap = new Map();
  lluvias.forEach(r => {
    const station = (r.Estacion || r.Cuenca || '').trim();
    if (!station) return;
    const key = normalize(station);
    const fecha = r.Fecha || '';
    const prev = rainMap.get(key);
    if (!prev || new Date(fecha) >= new Date(prev.Fecha || 0)) {
      rainMap.set(key, {
        station,
        mm: Number(r.Milimetros) || 0,
        Fecha: fecha
      });
    }
  });

  // Mapeo de estaciones → regiones
  const stationToRegion = {
    'las lagunas': 'Cibao Sur',
    'matayaya': 'Suroeste',
    'los arroyos': 'Región Sur',
    'constanza': 'Cibao Sur',
    'boca de mao': 'Cibao Norte',
    'gurabo afuera': 'Cibao Norte',
    'janico': 'Cibao Norte',
    'la vega': 'Cibao Sur'
  };

  const regionAccum = {};
  rainMap.forEach((v, k) => {
    const region = stationToRegion[k] || 'Otra';
    if (!regionAccum[region]) regionAccum[region] = [];
    regionAccum[region].push(v.mm);
  });

  state.rains = RAIN_REGIONS.map(region => {
    const key = normalize(region.name);
    const arr = regionAccum[key] || [];
    const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return { ...region, mm: avg };
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
   8. DASHBOARD
------------------------------------------------------------ */
function renderDashboard() {
  const totalCapacity = state.dams.reduce((sum, d) => sum + (d.capacity * d.pct / 100), 0);
  const installedCapacity = state.dams.reduce((sum, d) => sum + d.capacity, 0);
  const pct = installedCapacity ? (totalCapacity / installedCapacity) * 100 : 0;
  const avgRain = state.rains.length
    ? state.rains.reduce((s, r) => s + r.mm, 0) / state.rains.length
    : 0;

  animateNumber('totalCapacity', totalCapacity, 0);
  document.getElementById('capacityPct').textContent = pct.toFixed(1) + '%';
  document.getElementById('capacityBarFill').style.width = pct.toFixed(1) + '%';
  document.getElementById('avgRain').textContent = avgRain.toFixed(1);
  document.getElementById('damCount').textContent = state.dams.length;

  document.getElementById('updatedAt').textContent =
    'Actualizado ' + state.lastUpdate.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

  document.getElementById('damsList').innerHTML = state.dams
    .slice()
    .sort((a, b) => b.pct - a.pct)
    .map(d => {
      const cls = d.pct >= 70 ? 'high' : d.pct >= 40 ? 'mid' : 'low';
      return `
        <div class="dam-row">
          <div class="dam-row-info">
            <div class="dam-row-name">${d.name}</div>
            <div class="dam-row-meta">Nivel: ${d.level.toFixed(2)} m · Cap: ${d.capacity} hm³</div>
          </div>
          <div class="dam-row-pct ${cls}">${d.pct.toFixed(0)}%</div>
        </div>
      `;
    }).join('');
}

function animateNumber(elId, target, decimals = 0) {
  const el = document.getElementById(elId);
  const start = parseFloat(el.textContent.replace(/,/g, '')) || 0;
  const duration = 800;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
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

/* ------------------------------------------------------------
   9. TARJETA SOCIAL
------------------------------------------------------------ */
function renderSocialCard() {
  const totalCapacity = state.dams.reduce((s, d) => s + (d.capacity * d.pct / 100), 0);
  const installed = state.dams.reduce((s, d) => s + d.capacity, 0);
  const pct = installed ? (totalCapacity / installed) * 100 : 0;

  document.getElementById('scCapacity').textContent =
    Math.round(totalCapacity).toLocaleString('es-DO');
  document.getElementById('scPct').textContent = `${pct.toFixed(1)}% del total instalado`;
  document.getElementById('scDate').textContent =
    state.lastUpdate.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });

  const damsSorted = state.dams.slice().sort((a, b) => b.pct - a.pct).slice(0, 6);
  document.getElementById('scDams').innerHTML = damsSorted.map(d => `
    <div class="sc-dam-item">
      <span class="sc-dam-name">${d.name.replace('Presa de ', '')}</span>
      <div class="sc-dam-bar"><div style="width:${d.pct}%"></div></div>
      <span class="sc-dam-pct">${d.pct.toFixed(0)}%</span>
    </div>
  `).join('');

  const rainsSorted = state.rains.slice().sort((a, b) => b.mm - a.mm);
  document.getElementById('scRegions').innerHTML = rainsSorted.map(r => `
    <div class="sc-region-item">
      <span class="sc-region-name">${r.name}</span>
      <span class="sc-region-mm">${r.mm.toFixed(1)} mm</span>
    </div>
  `).join('');

  document.getElementById('scTimestamp').textContent =
    state.lastUpdate.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
}

/* ------------------------------------------------------------
   10. DESCARGA
------------------------------------------------------------ */
async function downloadImage() {
  const btn = document.getElementById('downloadBtn');
  btn.disabled = true;
  const originalText = btn.querySelector('span').textContent;
  btn.querySelector('span').textContent = 'Generando imagen…';

  try {
    renderSocialCard();
    const card = document.getElementById('socialCard');
    await new Promise(r => setTimeout(r, 120));

    const canvas = await html2canvas(card, {
      backgroundColor: '#01579b',
      scale: 1,
      useCORS: true,
      logging: false,
      width: card.offsetWidth,
      height: card.offsetHeight,
      windowWidth: card.offsetWidth,
      windowHeight: card.offsetHeight
    });

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `reporte-hidrico-rd-${date}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      showToast('Imagen descargada ✅');
    }, 'image/png', 0.95);
  } catch (err) {
    console.error(err);
    showToast('Error al generar la imagen', true);
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = originalText;
  }
}

/* ------------------------------------------------------------
   11. CONTROLES
------------------------------------------------------------ */
document.getElementById('toggleRain').addEventListener('change', e => {
  if (e.target.checked) map.addLayer(rainLayer);
  else map.removeLayer(rainLayer);
});

document.getElementById('toggleDams').addEventListener('change', e => {
  if (e.target.checked) map.addLayer(damLayer);
  else map.removeLayer(damLayer);
});

document.getElementById('refreshBtn').addEventListener('click', fetchData);
document.getElementById('downloadBtn').addEventListener('click', downloadImage);

document.getElementById('fitBoundsBtn').addEventListener('click', () => {
  if (state._damsBounds && state._damsBounds.isValid()) {
    map.fitBounds(state._damsBounds, { padding: [60, 60], maxZoom: 10 });
  }
});

/* ------------------------------------------------------------
   12. UI HELPERS
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
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ------------------------------------------------------------
   13. BOOTSTRAP
------------------------------------------------------------ */
function renderAll() {
  renderRains();
  renderDams();
  renderDashboard();

  if (!state._fitted && state._damsBounds && state._damsBounds.isValid()) {
    map.fitBounds(state._damsBounds, {
      padding: [60, 60],
      maxZoom: 10,
      animate: true,
      duration: 0.8
    });
    state._fitted = true;
  }
}

async function init() {
  renderAll();
  await fetchData();
  setInterval(fetchData, 5 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', init);
