/* ============================================================
   OBSERVATORIO HÍDRICO RD — Fase 2
   Consumo de API · Mapa Leaflet · Dashboard · Export PNG
   ============================================================ */

const API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnQ-zUzUz8ahCSNVoH8cTbEWjhQjKA-ECr7Q6ENxpaGNP4_Zbnv0bIAuFqNmXLK3C7x07lEwLKWDICmADn2sFmim6l2yw72xP-J5nZ_XKGY9sqnBulJhf6jqpjiMZ8iZYU8wc5u6cxLbdh8GZSdIsWSBdW8mRiJuNMTW2_ptLwzPFBa-BiivRXbRVUNZy2byuk7id6Gi-f4QIcwIi9c2T3DfCPiO0qq3crMucMUXuJ_8N4GVrNU60q1pabxQL3F6MO95TdSmr6HCfIoAEEsxNinlQsg1Gw&lib=MqzpnpKQXI6-7R1puCMPz8jkmKwee5e9k';

/* ------------------------------------------------------------
   1. GEOGRAFÍA — Regiones de lluvia (polígonos aproximados)
------------------------------------------------------------ */
const RAIN_REGIONS = [
  {
    name: 'Cibao Norte',
    coords: [[19.65,-71.05],[19.65,-70.35],[19.20,-70.00],[18.90,-70.35],[19.00,-70.90],[19.30,-71.10]],
    color: '#2196f3'
  },
  {
    name: 'Cibao Sur',
    coords: [[19.20,-70.45],[19.25,-70.05],[18.75,-69.90],[18.60,-70.35],[18.90,-70.65]],
    color: '#1e88e5'
  },
  {
    name: 'Región Este',
    coords: [[19.00,-69.30],[19.05,-68.40],[18.35,-68.30],[18.15,-69.00],[18.55,-69.60]],
    color: '#42a5f5'
  },
  {
    name: 'Región Sur',
    coords: [[18.60,-70.30],[18.75,-69.55],[18.20,-69.45],[17.95,-70.05],[18.30,-70.45]],
    color: '#039be5'
  },
  {
    name: 'Suroeste',
    coords: [[19.05,-71.75],[19.15,-71.00],[18.55,-70.85],[17.95,-71.25],[17.85,-71.90],[18.55,-71.95]],
    color: '#0288d1'
  }
];

/* ------------------------------------------------------------
   2. GEOGRAFÍA — Presas reales de República Dominicana
   capacity = capacidad útil aproximada en hm³ (millones m³)
------------------------------------------------------------ */
const DAMS = [
  { name: 'Presa de Hatillo',    lat: 18.955, lng: -70.153, capacity: 380, defaultLevel: 280, defaultPct: 82 },
  { name: 'Presa de Valdesia',   lat: 18.543, lng: -70.277, capacity: 137, defaultLevel: 148, defaultPct: 74 },
  { name: 'Presa de Jigüey',     lat: 18.850, lng: -70.483, capacity: 120, defaultLevel: 540, defaultPct: 68 },
  { name: 'Presa de Aguacate',   lat: 18.783, lng: -70.617, capacity: 80,  defaultLevel: 610, defaultPct: 71 },
  { name: 'Presa de Sabana Yegua', lat: 18.567, lng: -71.017, capacity: 670, defaultLevel: 425, defaultPct: 88 },
  { name: 'Presa de Sabaneta',   lat: 19.017, lng: -71.317, capacity: 200, defaultLevel: 640, defaultPct: 62 },
  { name: 'Presa de Bao',        lat: 19.183, lng: -70.983, capacity: 270, defaultLevel: 360, defaultPct: 79 },
  { name: 'Presa de Monción',    lat: 19.417, lng: -71.183, capacity: 300, defaultLevel: 355, defaultPct: 85 },
  { name: 'Presa de Tavera',     lat: 19.283, lng: -70.700, capacity: 170, defaultLevel: 320, defaultPct: 76 },
  { name: 'Presa López-Angostura', lat: 18.883, lng: -70.317, capacity: 130, defaultLevel: 380, defaultPct: 69 }
];

/* ------------------------------------------------------------
   3. ESTADO GLOBAL
------------------------------------------------------------ */
const state = {
  rains: RAIN_REGIONS.map(r => ({ name: r.name, mm: 0, coords: r.coords, color: r.color })),
  dams: DAMS.map(d => ({ ...d, level: d.defaultLevel, pct: d.defaultPct })),
  lastUpdate: new Date()
};

/* ------------------------------------------------------------
   4. INICIALIZACIÓN DEL MAPA
------------------------------------------------------------ */
const map = L.map('map', {
  center: [18.7357, -70.1627],   // Centro RD
  zoom: 8,
  zoomControl: false,
  attributionControl: false
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  subdomains: 'abcd'
}).addTo(map);

L.control.zoom({ position: 'bottomright' }).addTo(map);

/* Capas contenedoras (para toggle) */
const rainLayer = L.layerGroup().addTo(map);
const damLayer  = L.layerGroup().addTo(map);

/* ------------------------------------------------------------
   5. RENDER DE CAPAS
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

    const popupHtml = `
      <div class="rain-popup-title">🌧️ ${r.name}</div>
      <div class="rain-popup-value">${r.mm.toFixed(1)}<small>mm</small></div>
    `;
    poly.bindPopup(popupHtml, { closeButton: false, offset: [0, -4] });

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

  state.dams.forEach(d => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="dam-marker ${damPctClass(d.pct)}"><span>💧</span></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([d.lat, d.lng], { icon });

    const popupHtml = `
      <div class="popup-title">🏞️ ${d.name}</div>
      <div class="popup-row"><span>Nivel de operación</span><span>${d.level.toFixed(2)} m</span></div>
      <div class="popup-row"><span>Porcentaje útil</span><span>${d.pct.toFixed(1)} %</span></div>
      <div class="popup-row"><span>Capacidad útil</span><span>${d.capacity} hm³</span></div>
    `;
    marker.bindPopup(popupHtml, { closeButton: false, maxWidth: 240 });

    marker.addTo(damLayer);
  });
}

/* ------------------------------------------------------------
   6. CONSUMO DE LA API
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
    console.warn('API error, usando datos demo:', err.message);
    // Mantener los datos por defecto (demo) y avisar
    showToast('Usando datos de demostración', true);
  } finally {
    setRefreshing(false);
    renderAll();
  }
}

/* ------------------------------------------------------------
   7. MAPEO DE DATOS DE LA API → ESTADO
------------------------------------------------------------ */
function applyApiData(payload) {
  // Acepta tanto { ok, lluvias, presas } como { lluvias, presas } o arrays sueltos
  let lluvias = [];
  let presas  = [];

  if (Array.isArray(payload)) {
    // Array único: intenta inferir por campos
    payload.forEach(row => {
      if (row.Nombre_Presa) presas.push(row);
      else if (row.Estacion || row.Milimetros !== undefined) lluvias.push(row);
    });
  } else if (payload && typeof payload === 'object') {
    lluvias = payload.lluvias || payload.Lluvias || [];
    presas  = payload.presas  || payload.Presas  || [];
  }

  /* ----- Presas: agrupar por nombre y tomar el último registro ----- */
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

  // Aplicar al estado
  state.dams = DAMS.map(d => {
    const key = normalize(d.name);
    // Búsqueda por coincidencia exacta o parcial
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

  /* ----- Lluvias: agrupar por región y tomar el último registro ----- */
  const rainMap = new Map();
  lluvias.forEach(r => {
    const region = (r.Cuenca || r.Estacion || '').trim();
    if (!region) return;
    const key = normalize(region);
    const fecha = r.Fecha || '';
    const prev = rainMap.get(key);
    if (!prev || new Date(fecha) >= new Date(prev.Fecha || 0)) {
      rainMap.set(key, {
        region,
        mm: Number(r.Milimetros) || 0,
        Fecha: fecha
      });
    }
  });

  // Aplicar a las regiones (búsqueda flexible)
  state.rains = RAIN_REGIONS.map(region => {
    const key = normalize(region.name);
    let match = null;
    for (const [k, v] of rainMap) {
      if (k.includes(key) || key.includes(k) ||
          k.includes('norte') && key.includes('norte') ||
          k.includes('sur')   && key.includes('sur') ||
          k.includes('este')  && key.includes('este') ||
          k.includes('suroeste') && key.includes('suroeste')) {
        match = v; break;
      }
    }
    return {
      ...region,
      mm: match ? match.mm : 0
    };
  });
}

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // sin acentos
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

  // Lista mini de presas
  const list = document.getElementById('damsList');
  list.innerHTML = state.dams
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
  document.getElementById('scPct').textContent =
    `${pct.toFixed(1)}% del total instalado`;
  document.getElementById('scDate').textContent =
    state.lastUpdate.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });

  // Presas (top 6 ordenadas)
  const damsSorted = state.dams.slice().sort((a, b) => b.pct - a.pct).slice(0, 6);
  document.getElementById('scDams').innerHTML = damsSorted.map(d => `
    <div class="sc-dam-item">
      <span class="sc-dam-name">${d.name.replace('Presa de ', '').replace('Presa ', '')}</span>
      <div class="sc-dam-bar"><div style="width:${d.pct}%"></div></div>
      <span class="sc-dam-pct">${d.pct.toFixed(0)}%</span>
    </div>
  `).join('');

  // Regiones
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
   10. DESCARGA DE IMAGEN
------------------------------------------------------------ */
async function downloadImage() {
  const btn = document.getElementById('downloadBtn');
  btn.disabled = true;
  const originalText = btn.querySelector('span').textContent;
  btn.querySelector('span').textContent = 'Generando imagen…';

  try {
    renderSocialCard();
    const card = document.getElementById('socialCard');

    // Esperar un frame para asegurar render
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
   11. CONTROLES / TOGGLES
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
}

async function init() {
  renderAll();     // datos demo iniciales (visibles al instante)
  await fetchData(); // reemplaza con datos reales de la API
  // Refresco automático cada 5 minutos
  setInterval(fetchData, 5 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', init);
