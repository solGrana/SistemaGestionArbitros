/* main.js — Dashboard Gestión de Árbitros */

// ── Guard + usuario actual ────────────────────────────────────────────────────
if (!localStorage.getItem('access_token')) window.location.href = '/';
const ME = JSON.parse(localStorage.getItem('usuario') || '{}');
const isAdmin = ['admin', 'organizacion'].includes(ME.rol);

document.querySelectorAll('#uAvatar, #topbarAvatar').forEach(el => el.textContent = (ME.nombre || 'U')[0].toUpperCase());
document.getElementById('uName').textContent = ME.nombre || '';
document.getElementById('uRole').textContent = ME.rol || '';
if (!isAdmin) document.querySelectorAll('.ao').forEach(el => el.remove());
if (ME.rol !== 'admin') document.querySelectorAll('.admin-only').forEach(el => el.remove());

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, tipo = '') {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Secciones ─────────────────────────────────────────────────────────────────
const TITULOS = { dashboard: 'Dashboard', partidos: 'Partidos', torneos: 'Torneos', usuarios: 'Árbitros y Usuarios' };

function showSection(id) {
  const sec = document.getElementById('sec-' + id);
  if (!sec) return;
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  sec.style.display = 'block';
  document.querySelector(`.nav-item[data-s="${id}"]`)?.classList.add('active');
  document.getElementById('topTitle').textContent = TITULOS[id] || id;
  ({ dashboard: loadDashboard, partidos: loadPartidos, torneos: loadTorneos, usuarios: loadUsuarios }[id] || (() => { }))();
}

document.querySelectorAll('.nav-item[data-s]').forEach(el =>
  el.addEventListener('click', () => showSection(el.dataset.s)));

function showConfirm(message, onConfirm, { icon = '⚠️', okText = 'Confirmar' } = {}) {
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmIcon').textContent = icon;
  const okBtn = document.getElementById('confirmOkBtn');
  okBtn.textContent = okText;
  const freshBtn = okBtn.cloneNode(true);
  okBtn.replaceWith(freshBtn);
  freshBtn.addEventListener('click', () => { closeModal('modalConfirm'); onConfirm(); });
  openModal('modalConfirm');
}

function logout() {
  showConfirm('¿Seguro que querés cerrar sesión?', () => {
    localStorage.clear();
    window.location.href = '/';
  }, { icon: '🚪', okText: 'Cerrar sesión' });
}

// ── Modales ───────────────────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Deshabilita el botón mientras `accion` está en curso, para que dos clicks
// seguidos (o un doble click) no disparen dos creaciones del mismo objeto.
async function conBotonBloqueado(idBoton, accion) {
  const btn = document.getElementById(idBoton);
  if (btn.disabled) return;
  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    await accion();
  } finally {
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
}
document.querySelectorAll('.modal-overlay').forEach(o =>
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); }));

// ── Helpers de formato ────────────────────────────────────────────────────────
function fDT(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}
function fMoney(n) { return n ? `$${Number(n).toLocaleString('es-AR')}` : '$0'; }
function rolBadge(r) {
  return { admin: 'badge-red', arbitro: 'badge-blue', organizacion: 'badge-amber' }[r] || 'badge-gray';
}
function cupo(p) {
  const a = p.asignaciones?.length || 0;
  const t = p.cantidad_arbitros + p.cantidad_asistentes;
  const cls = a === 0 ? 'cupo-vacio' : a >= t ? 'cupo-completo' : 'cupo-parcial';
  return `<span class="cupo ${cls}"><span class="cupo-dot"></span>${a}/${t}</span>`;
}
function equipos(p) {
  if (!p.equipo_local && !p.equipo_visitante) return '—';
  return `${p.equipo_local || '—'} <span style="color:var(--muted)">vs</span> ${p.equipo_visitante || '—'}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const [partidos, torneos, arbitros] = await Promise.all([
      API.get('/partidos'), API.get('/torneos'), API.get('/usuarios?rol=arbitro'),
    ]);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const proximosPartidos = partidos.filter(p => new Date(p.fecha_hora) >= hoy);
    const sinAsignar = proximosPartidos.filter(p =>
      p.asignaciones.length < p.cantidad_arbitros + p.cantidad_asistentes);

    document.getElementById('stPartidos').textContent = proximosPartidos.length;
    document.getElementById('stSinAsig').textContent = sinAsignar.length;
    document.getElementById('stTorneos').textContent = torneos.filter(t => t.activo).length;
    document.getElementById('stArbitros').textContent = arbitros.length;

    const proximos = [...proximosPartidos]
      .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
      .slice(0, 10);

    document.getElementById('dashTableBody').innerHTML = proximos.length
      ? proximos.map(p => `
          <tr>
            <td>${fDT(p.fecha_hora)}</td>
            <td>${p.torneo_nombre || '—'}</td>
            <td>${p.organizacion_nombre || 'Sin organización'}</td>
            <td><strong>${p.cancha}</strong></td>
            <td>${equipos(p)}</td>
            <td>${cupo(p)}</td>
            <td><div class="td-actions">
              <button class="btn btn-sm btn-primary ao" onclick="abrirAsignar(${p.id})">Asignar</button>
              <button class="btn-icon" onclick="exportarPartido(${p.id})" title="Exportar partido">📄</button>
            </div></td>
          </tr>`).join('')
      : `<tr><td colspan="7"><div class="empty-state"><div class="ei">📋</div><p>Sin próximos partidos</p></div></td></tr>`;
  } catch (e) { toast(e.message, 'err'); }
}

// ═════════════════════════════════════════════════════════════════════════════
// TORNEOS
// ═════════════════════════════════════════════════════════════════════════════
let _torneos = [];

async function loadTorneos() {
  try {
    _torneos = await API.get('/torneos');
    renderTorneos(_torneos);
  } catch (e) { toast(e.message, 'err'); }
}

function renderTorneos(list) {
  document.getElementById('torneosTbody').innerHTML = list.length
    ? list.map(t => `
        <tr>
          <td>${t.id}</td>
          <td><strong>${t.nombre}</strong></td>
          <td>${t.organizacion_nombre || '—'}</td>
          <td>${t.descripcion || '—'}</td>
          <td>${t.fecha_inicio || '—'}</td>
          <td>${t.fecha_fin || '—'}</td>
          <td><span class="badge ${t.activo ? 'badge-green' : 'badge-gray'}">${t.activo ? 'Activo' : 'Inactivo'}</span></td>
          <td class="ao"><div class="td-actions">
            <button class="btn-icon" onclick="editarTorneo(${t.id})">✏️</button>
            <button class="btn-icon" onclick="eliminarTorneo(${t.id})">🗑️</button>
          </div></td>
        </tr>`).join('')
    : `<tr><td colspan="8"><div class="empty-state"><div class="ei">🏆</div><p>Sin torneos</p></div></td></tr>`;
}

async function abrirModalTorneo(t = null) {
  // Cargar usuarios con rol organizacion o admin
  const usuarios = await API.get('/usuarios');
  const orgs = usuarios.filter(u => ['organizacion', 'admin'].includes(u.rol));

  document.getElementById('mTorneoOrg').innerHTML =
    `<option value="">Sin organizador</option>` +
    orgs.map(u => `<option value="${u.id}" ${t?.organizacion_id == u.id ? 'selected' : ''}>${u.nombre}</option>`).join('');

  document.getElementById('mTorneoTitle').textContent = t ? 'Editar torneo' : 'Nuevo torneo';
  document.getElementById('mTorneoId').value = t?.id || '';
  document.getElementById('mTorneoNombre').value = t?.nombre || '';
  document.getElementById('mTorneoDesc').value = t?.descripcion || '';
  document.getElementById('mTorneoFechaI').value = t?.fecha_inicio || '';
  document.getElementById('mTorneoFechaF').value = t?.fecha_fin || '';
  document.getElementById('mTorneoActivo').checked = t?.activo ?? true;
  openModal('modalTorneo');
}

async function guardarTorneo() {
  const id = document.getElementById('mTorneoId').value;
  const orgId = document.getElementById('mTorneoOrg').value;
  const body = {
    nombre: document.getElementById('mTorneoNombre').value.trim(),
    descripcion: document.getElementById('mTorneoDesc').value.trim() || null,
    fecha_inicio: document.getElementById('mTorneoFechaI').value || null,
    fecha_fin: document.getElementById('mTorneoFechaF').value || null,
    activo: document.getElementById('mTorneoActivo').checked,
    organizacion_id: orgId ? parseInt(orgId) : null,
  };
  if (!body.nombre) { toast('El nombre es obligatorio', 'err'); return; }
  await conBotonBloqueado('mTorneoGuardarBtn', async () => {
    try {
      id ? await API.patch(`/torneos/${id}`, body) : await API.post('/torneos', body);
      toast(id ? 'Torneo actualizado ✓' : 'Torneo creado ✓', 'ok');
      closeModal('modalTorneo');
      loadTorneos();
    } catch (e) { toast(e.message, 'err'); }
  });
}

function editarTorneo(id) { abrirModalTorneo(_torneos.find(t => t.id === id)); }
async function eliminarTorneo(id) {
  if (!confirm('¿Eliminar este torneo?')) return;
  try { await API.delete(`/torneos/${id}`); toast('Eliminado', 'ok'); loadTorneos(); }
  catch (e) { toast(e.message, 'err'); }
}

// ═════════════════════════════════════════════════════════════════════════════
// PARTIDOS
// ═════════════════════════════════════════════════════════════════════════════
let _partidos = [];

async function loadPartidos() {
  try {
    _partidos = await API.get('/partidos');
    poblarFiltroTorneo();
    renderPartidos(_partidos);
  } catch (e) { toast(e.message, 'err'); }
}

function poblarFiltroTorneo() {
  const map = new Map(_partidos.map(p => [p.torneo_id, p.torneo_nombre]));
  document.getElementById('filtroTorneo').innerHTML =
    `<option value="">Todos los torneos</option>` +
    [...map.entries()].map(([id, n]) => `<option value="${id}">${n || id}</option>`).join('');
}

function filtrarPartidos() {
  const tid = document.getElementById('filtroTorneo').value;
  const sinA = document.getElementById('filtroSinAsig').checked;
  const buscar = document.getElementById('buscarPartido').value.toLowerCase();
  let list = _partidos;
  if (tid) list = list.filter(p => p.torneo_id == tid);
  if (sinA) list = list.filter(p => p.asignaciones.length < p.cantidad_arbitros + p.cantidad_asistentes);
  if (buscar) list = list.filter(p =>
    p.cancha.toLowerCase().includes(buscar) ||
    (p.torneo_nombre || '').toLowerCase().includes(buscar) ||
    (p.equipo_local || '').toLowerCase().includes(buscar) ||
    (p.equipo_visitante || '').toLowerCase().includes(buscar));
  renderPartidos(list);
}

function renderPartidos(list) {
  document.getElementById('partidosTbody').innerHTML = list.length
    ? list.map(p => {
      const pills = (p.asignaciones || []).map(a =>
        `<span class="arbitro-pill">${a.usuario.nombre} <span class="badge ${a.rol === 'asistente' ? 'badge-amber' : 'badge-blue'}" style="font-size:10px">${a.rol}</span></span>`
      ).join('');
      return `<tr>
          <td>${fDT(p.fecha_hora)}</td>
          <td><strong>${p.cancha}</strong></td>
          <td>${equipos(p)}</td>
          <td>${p.torneo_nombre || '—'}
              <div style="font-size:11px;color:var(--muted);margin-top:2px">${p.organizacion_nombre || 'Sin organización'}</div>
          </td>
          <td>${cupo(p)}</td>
          <td><div class="arbitro-list">${pills || '<span style="color:var(--muted);font-size:12px">Sin asignar</span>'}</div></td>
          <td><span class="badge ${p.modalidad_pago === 'en_cancha' ? 'badge-blue' : 'badge-amber'}">${p.modalidad_pago === 'en_cancha' ? 'En cancha' : 'Administrador'}</span></td>
          <td>${fMoney(p.valor_arbitro)}</td>
          <td><div class="td-actions">
            <button class="btn btn-sm btn-primary ao" onclick="abrirAsignar(${p.id})">⚡</button>
            <button class="btn-icon" onclick="exportarPartido(${p.id})" title="Exportar partido">📄</button>
            <button class="btn-icon ao" onclick="editarPartido(${p.id})">✏️</button>
            <button class="btn-icon ao" onclick="eliminarPartido(${p.id})">🗑️</button>
          </div></td>
        </tr>`;
    }).join('')
    : `<tr><td colspan="9"><div class="empty-state"><div class="ei">📋</div><p>Sin partidos</p></div></td></tr>`;
}

async function abrirModalPartido(p = null) {
  const torneos = _torneos.length ? _torneos : await API.get('/torneos');
  const usuarios = await API.get('/usuarios');

  document.getElementById('mPartidoTorneo').innerHTML =
    torneos.map(t => {
      const org = usuarios.find(u => u.id === t.organizacion_id);
      const label = org ? `${t.nombre} — ${org.nombre}` : `${t.nombre} — Sin organización`;
      return `<option value="${t.id}" ${p?.torneo_id == t.id ? 'selected' : ''}>${label}</option>`;
    }).join('');

  document.getElementById('mPartidoTitle').textContent     = p ? 'Editar partido' : 'Nuevo partido';
  document.getElementById('mPartidoId').value              = p?.id || '';
  document.getElementById('mPartidoCancha').value          = p?.cancha || '';
  document.getElementById('mPartidoDireccion').value       = p?.direccion || '';
  document.getElementById('mPartidoLat').value             = p?.ubicacion_lat || '';
  document.getElementById('mPartidoLng').value             = p?.ubicacion_lng || '';
  document.getElementById('mPartidoEquipoLocal').value     = p?.equipo_local || '';
  document.getElementById('mPartidoEquipoVisitante').value = p?.equipo_visitante || '';
  document.getElementById('mPartidoFecha').value           = p?.fecha_hora ? p.fecha_hora.slice(0,16) : '';
  document.getElementById('mPartidoCantArb').value         = p?.cantidad_arbitros   ?? 1;
  document.getElementById('mPartidoCantAsis').value        = p?.cantidad_asistentes ?? 0;
  document.getElementById('mPartidoModalidad').value       = p?.modalidad_pago || 'en_cancha';
  document.getElementById('mPartidoValorArb').value        = p?.valor_arbitro   ?? 0;
  document.getElementById('mPartidoValorAsis').value       = p?.valor_asistente ?? 0;
  document.getElementById('mPartidoNotas').value = p?.notas || '';
  openModal('modalPartido');
  actualizarMapaPartido();
}

// ── Ubicación de la cancha (mapa) ────────────────────────────────────────────
let _partidoMapa = null;
let _partidoMarcador = null;

function actualizarMapaPartido() {
  if (!_partidoMapa) {
    _partidoMapa = L.map('mPartidoMapa').setView([-34.6037, -58.3816], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(_partidoMapa);
    _partidoMapa.on('click', e => ubicarEnMapaPartido(e.latlng.lat, e.latlng.lng));
  }

  setTimeout(() => _partidoMapa.invalidateSize(), 150);

  const lat = parseFloat(document.getElementById('mPartidoLat').value);
  const lng = parseFloat(document.getElementById('mPartidoLng').value);
  if (!isNaN(lat) && !isNaN(lng)) {
    ubicarEnMapaPartido(lat, lng);
  } else if (_partidoMarcador) {
    _partidoMapa.removeLayer(_partidoMarcador);
    _partidoMarcador = null;
  }
}

function ubicarEnMapaPartido(lat, lng) {
  document.getElementById('mPartidoLat').value = lat;
  document.getElementById('mPartidoLng').value = lng;
  if (_partidoMarcador) {
    _partidoMarcador.setLatLng([lat, lng]);
  } else {
    _partidoMarcador = L.marker([lat, lng]).addTo(_partidoMapa);
  }
  _partidoMapa.setView([lat, lng], 15);
}

async function buscarDireccionPartido() {
  const direccion = document.getElementById('mPartidoDireccion').value.trim();
  if (!direccion) { toast('Escribí una localidad o dirección para buscar', 'err'); return; }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(direccion)}`);
    const data = await res.json();
    if (!data.length) { toast('No se encontró esa ubicación', 'err'); return; }
    ubicarEnMapaPartido(parseFloat(data[0].lat), parseFloat(data[0].lon));
  } catch (e) { toast('No se pudo buscar la ubicación', 'err'); }
}

async function guardarPartido() {
  const id = document.getElementById('mPartidoId').value;
  const body = {
    torneo_id: parseInt(document.getElementById('mPartidoTorneo').value),
    cancha: document.getElementById('mPartidoCancha').value.trim(),
    direccion: document.getElementById('mPartidoDireccion').value.trim() || null,
    ubicacion_lat: document.getElementById('mPartidoLat').value || null,
    ubicacion_lng: document.getElementById('mPartidoLng').value || null,
    equipo_local: document.getElementById('mPartidoEquipoLocal').value.trim(),
    equipo_visitante: document.getElementById('mPartidoEquipoVisitante').value.trim(),
    fecha_hora: document.getElementById('mPartidoFecha').value,
    cantidad_arbitros: parseInt(document.getElementById('mPartidoCantArb').value),
    cantidad_asistentes: parseInt(document.getElementById('mPartidoCantAsis').value),
    modalidad_pago: document.getElementById('mPartidoModalidad').value,
    valor_arbitro: parseInt(document.getElementById('mPartidoValorArb').value) || 0,
    valor_asistente: parseInt(document.getElementById('mPartidoValorAsis').value) || 0,
    notas: document.getElementById('mPartidoNotas').value.trim() || null,
  };
  if (!body.cancha || !body.fecha_hora || !body.equipo_local || !body.equipo_visitante) { toast('Completá los campos obligatorios', 'err'); return; }
  await conBotonBloqueado('mPartidoGuardarBtn', async () => {
    try {
      id ? await API.patch(`/partidos/${id}`, body) : await API.post('/partidos', body);
      toast(id ? 'Partido actualizado ✓' : 'Partido creado ✓', 'ok');
      closeModal('modalPartido');
      loadPartidos();
    } catch (e) { toast(e.message, 'err'); }
  });
}

function editarPartido(id) { abrirModalPartido(_partidos.find(p => p.id === id)); }

async function eliminarPartido(id) {
  if (!confirm('¿Eliminar este partido?')) return;
  try { await API.delete(`/partidos/${id}`); toast('Eliminado', 'ok'); loadPartidos(); }
  catch (e) { toast(e.message, 'err'); }
}

async function exportarPartido(id) {
  try {
    const p = await API.get(`/partidos/${id}`);
    const arbitrosHtml = (p.asignaciones && p.asignaciones.length)
      ? p.asignaciones.map(a => `
          <div class="arb">
            <span>${a.usuario.nombre} <span class="muted">(${a.usuario.email})</span></span>
            <span class="badge">${a.rol}</span>
          </div>`).join('')
      : '<div class="muted" style="padding:8px 0">Sin árbitros asignados</div>';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ficha de partido — ${p.cancha}</title>
<style>
  body   { font-family: Arial, Helvetica, sans-serif; color:#0f172a; max-width:640px; margin:0 auto; padding:40px 32px; }
  h1     { font-size:20px; margin-bottom:4px; }
  .sub   { color:#64748b; font-size:13px; margin-bottom:24px; }
  .row   { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid #e2e8f0; font-size:13px; }
  .row .label { color:#64748b; }
  .row .value { font-weight:600; text-align:right; }
  h2     { font-size:14px; margin:26px 0 8px; }
  .arb   { padding:8px 0; border-bottom:1px solid #e2e8f0; font-size:13px; display:flex; justify-content:space-between; align-items:center; }
  .badge { display:inline-block; padding:2px 9px; border-radius:99px; background:#eff6ff; color:#1d4ed8; font-size:11px; font-weight:600; }
  .muted { color:#94a3b8; }
  .notas { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; font-size:13px; white-space:pre-wrap; }
  footer { margin-top:32px; font-size:11px; color:#94a3b8; text-align:center; }
</style>
</head>
<body>
  <h1>⚽ ${p.equipo_local || '—'} vs ${p.equipo_visitante || '—'}</h1>
  <div class="sub">${p.torneo_nombre || 'Sin torneo'} · ${p.organizacion_nombre || 'Sin organización'}</div>

  <div class="row"><span class="label">Fecha y hora</span><span class="value">${fDT(p.fecha_hora)}</span></div>
  <div class="row"><span class="label">Cancha</span><span class="value">${p.cancha}</span></div>
  <div class="row"><span class="label">Árbitros / asistentes requeridos</span><span class="value">${p.cantidad_arbitros} / ${p.cantidad_asistentes}</span></div>
  <div class="row"><span class="label">Modalidad de pago</span><span class="value">${p.modalidad_pago === 'en_cancha' ? 'En cancha' : 'Administrador'}</span></div>
  <div class="row"><span class="label">Valor árbitro</span><span class="value">${fMoney(p.valor_arbitro)}</span></div>
  <div class="row"><span class="label">Valor asistente</span><span class="value">${fMoney(p.valor_asistente)}</span></div>

  <h2>Árbitros asignados</h2>
  ${arbitrosHtml}

  ${p.notas ? `<h2>Notas / Observaciones</h2><div class="notas">${p.notas}</div>` : ''}

  <footer>Gestión de Árbitros — exportado el ${fDT(new Date().toISOString())}</footer>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) { toast('Habilitá las ventanas emergentes para exportar', 'err'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  } catch (e) { toast(e.message, 'err'); }
}

// ═════════════════════════════════════════════════════════════════════════════
// ASIGNACIONES
// ═════════════════════════════════════════════════════════════════════════════
function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mismoDia(fechaA, fechaB) {
  const a = new Date(fechaA), b = new Date(fechaB);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

async function abrirAsignar(partidoId) {
  const [partido, disponibles, todosPartidos] = await Promise.all([
    API.get(`/partidos/${partidoId}`),
    API.get(`/asignaciones/disponibles?partido_id=${partidoId}`),
    API.get('/partidos'),
  ]);

  const idsOcupadosMismoDia = new Set();
  todosPartidos.forEach(p2 => {
    if (p2.id === partido.id || !mismoDia(p2.fecha_hora, partido.fecha_hora)) return;
    (p2.asignaciones || []).forEach(a => idsOcupadosMismoDia.add(a.usuario.id));
  });

  document.getElementById('mAsigInfo').innerHTML =
    `<strong>${equipos(partido)}</strong><br>
   ${partido.cancha} — ${fDT(partido.fecha_hora)}<br>
   <span style="font-size:12px;color:var(--muted)">${partido.torneo_nombre || ''} · ${partido.organizacion_nombre || 'Sin organización'}</span>`;

  document.getElementById('mAsigAsignados').innerHTML = partido.asignaciones.length
    ? partido.asignaciones.map(a => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <div>
            <strong style="font-size:13px">${a.usuario.nombre}</strong>
            <span class="badge ${a.rol === 'asistente' ? 'badge-amber' : 'badge-blue'}" style="margin-left:6px">${a.rol}</span>
          </div>
          <button class="btn btn-sm btn-danger" onclick="desasignar(${partidoId},${a.usuario.id})">Quitar</button>
        </div>`).join('')
    : '<p style="color:var(--muted);font-size:13px;padding:8px 0">Sin árbitros asignados aún</p>';

  // ── Calcular cercanía a la cancha, si el partido tiene ubicación cargada ──
  const pLat = parseFloat(partido.ubicacion_lat);
  const pLng = parseFloat(partido.ubicacion_lng);
  const tieneUbicacionPartido = !isNaN(pLat) && !isNaN(pLng);

  const conDistancia = disponibles.map(u => {
    const lat = parseFloat(u.ubicacion_lat);
    const lng = parseFloat(u.ubicacion_lng);
    const distancia = (tieneUbicacionPartido && !isNaN(lat) && !isNaN(lng))
      ? distanciaKm(pLat, pLng, lat, lng)
      : null;
    return { ...u, _distancia: distancia };
  });

  if (tieneUbicacionPartido) {
    conDistancia.sort((a, b) => {
      if (a._distancia === null) return 1;
      if (b._distancia === null) return -1;
      return a._distancia - b._distancia;
    });
  }

  const cantidadConDistancia = conDistancia.filter(u => u._distancia !== null).length;
  const cantidadRecomendados = Math.min(5, cantidadConDistancia);
  conDistancia.forEach((u, i) => {
    u._recomendado = u._distancia !== null && i < cantidadRecomendados;
    u._distanciaTxt = u._distancia === null
      ? (tieneUbicacionPartido ? 'Sin ubicación registrada' : '')
      : u._distancia < 1 ? `${Math.round(u._distancia * 1000)} m` : `${u._distancia.toFixed(1)} km`;
    u._ocupadoMismoDia = idsOcupadosMismoDia.has(u.id);
  });

  document.getElementById('mAsigDisponiblesHint').textContent =
    cantidadConDistancia > 0 ? '· ordenados por cercanía a la cancha' : '';

  _asigDisponibles = conDistancia;
  _asigPartidoId = partidoId;
  document.getElementById('mAsigBuscar').value = '';
  renderMAsigDisponibles(conDistancia, partidoId);

  document.getElementById('mAsigPartidoId').value = partidoId;
  openModal('modalAsignar');
}

let _asigDisponibles = [];
let _asigPartidoId = null;

function renderMAsigDisponibles(lista, partidoId) {
  document.getElementById('mAsigDisponibles').innerHTML = lista.length
    ? lista.map(u => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);${u._ocupadoMismoDia ? 'opacity:.5' : ''}">
          <div>
            <strong style="font-size:13px">${u.nombre}</strong>
            ${u._recomendado ? '<span class="badge badge-green" style="margin-left:6px">⭐ Recomendado</span>' : ''}
            ${u._ocupadoMismoDia ? '<span class="badge badge-gray" style="margin-left:6px">Ocupado ese día</span>' : ''}
            <div style="font-size:12px;color:var(--muted)">
              ${u.email}${u._distanciaTxt ? ` · 📍 ${u._distanciaTxt}` : ''}
            </div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-primary"   onclick="confirmarAsignar(${partidoId},${u.id},'arbitro',${!!u._ocupadoMismoDia})">Árbitro</button>
            <button class="btn btn-sm btn-secondary" onclick="confirmarAsignar(${partidoId},${u.id},'asistente',${!!u._ocupadoMismoDia})">Asistente</button>
          </div>
        </div>`).join('')
    : `<p style="color:var(--muted);font-size:13px;padding:8px 0">${document.getElementById('mAsigBuscar').value.trim() ? 'No se encontraron árbitros con ese criterio' : 'No hay árbitros disponibles'}</p>`;
}

function confirmarAsignar(partidoId, usuarioId, rol, ocupadoMismoDia) {
  if (!ocupadoMismoDia) { asignar(partidoId, usuarioId, rol); return; }
  showConfirm(
    'Este árbitro ya tiene otro partido asignado ese mismo día. ¿Querés asignarlo igual?',
    () => asignar(partidoId, usuarioId, rol),
    { icon: '⚠️', okText: 'Asignar igual' }
  );
}

function filtrarDisponiblesAsignar() {
  const buscar = document.getElementById('mAsigBuscar').value.toLowerCase().trim();
  const lista = buscar
    ? _asigDisponibles.filter(u => u.nombre.toLowerCase().includes(buscar) || u.email.toLowerCase().includes(buscar))
    : _asigDisponibles;
  renderMAsigDisponibles(lista, _asigPartidoId);
}

async function asignar(partidoId, usuarioId, rol) {
  try {
    await API.post('/asignaciones/', { partido_id: partidoId, usuario_id: usuarioId, rol });
    toast('Árbitro asignado ✓', 'ok');
    abrirAsignar(partidoId);
    loadPartidos();
    loadDashboard();
  } catch (e) { toast(e.message, 'err'); }
}

async function desasignar(partidoId, usuarioId) {
  try {
    await API.delete(`/asignaciones/?partido_id=${partidoId}&usuario_id=${usuarioId}`);
    toast('Árbitro removido', 'ok');
    abrirAsignar(partidoId);
    loadPartidos();
    loadDashboard();
  } catch (e) { toast(e.message, 'err'); }
}

// ═════════════════════════════════════════════════════════════════════════════
// USUARIOS
// ═════════════════════════════════════════════════════════════════════════════
let _usuarios = [];

async function loadUsuarios() {
  try {
    _usuarios = await API.get('/usuarios');
    renderUsuarios(_usuarios);
  } catch (e) { toast(e.message, 'err'); }
}

function filtrarUsuarios() {
  const buscar = document.getElementById('buscarUsuario').value.toLowerCase();
  const rol = document.getElementById('filtroRol').value;
  let list = _usuarios;
  if (rol) list = list.filter(u => u.rol === rol);
  if (buscar) list = list.filter(u => u.nombre.toLowerCase().includes(buscar) || u.email.toLowerCase().includes(buscar));
  renderUsuarios(list);
}

function renderUsuarios(list) {
  document.getElementById('usuariosTbody').innerHTML = list.length
    ? list.map(u => `
        <tr>
          <td>${u.id}</td>
          <td><strong>${u.nombre}</strong></td>
          <td>${u.email}</td>
          <td><span class="badge ${rolBadge(u.rol)}">${u.rol}</span></td>
          <td>${u.telefono || '—'}</td>
          <td class="ao"><div class="td-actions">
            <button class="btn-icon" onclick="editarUsuario(${u.id})">✏️</button>
            <button class="btn-icon" onclick="eliminarUsuario(${u.id})">🗑️</button>
          </div></td>
        </tr>`).join('')
    : `<tr><td colspan="6"><div class="empty-state"><div class="ei">👤</div><p>Sin usuarios</p></div></td></tr>`;
}

function abrirModalUsuario(u = null) {
  document.getElementById('mUsuarioTitle').textContent = u ? 'Editar usuario' : 'Nuevo árbitro';
  document.getElementById('mUsuarioId').value = u?.id || '';
  document.getElementById('mUsuarioNombre').value = u?.nombre || '';
  document.getElementById('mUsuarioEmail').value = u?.email || '';
  document.getElementById('mUsuarioPassword').value = '';
  document.getElementById('mUsuarioRol').value = u?.rol || 'arbitro';
  document.getElementById('mUsuarioTelefono').value = u?.telefono || '';
  document.getElementById('mUsuarioDireccion').value = u?.direccion || '';
  document.getElementById('mUsuarioLat').value = u?.ubicacion_lat || '';
  document.getElementById('mUsuarioLng').value = u?.ubicacion_lng || '';
  document.getElementById('mUsuarioPassGroup').style.display = u ? 'none' : 'block';
  document.getElementById('mUsuarioEmailGroup').style.display = u ? 'none' : 'block';
  actualizarPasswordUsuario();
  openModal('modalUsuario');
  actualizarDireccionUsuario();
}

function actualizarPasswordUsuario() {
  const passGroup = document.getElementById('mUsuarioPassGroup');
  if (passGroup.style.display === 'none') return;
  const requierePassword = document.getElementById('mUsuarioRol').value === 'admin';
  const passInput = document.getElementById('mUsuarioPassword');
  passInput.disabled = !requierePassword;
  document.getElementById('mUsuarioPassHint').style.display = requierePassword ? 'none' : 'block';
  if (!requierePassword) passInput.value = '';
}

// ── Dirección + mapa (solo para usuarios con rol Árbitro) ───────────────────────
let _usuarioMapa = null;
let _usuarioMarcador = null;

function actualizarDireccionUsuario() {
  const grupo = document.getElementById('mUsuarioDireccionGroup');
  const esArbitro = document.getElementById('mUsuarioRol').value === 'arbitro';
  grupo.style.display = esArbitro ? 'block' : 'none';
  if (!esArbitro) return;

  if (!_usuarioMapa) {
    _usuarioMapa = L.map('mUsuarioMapa').setView([-34.6037, -58.3816], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(_usuarioMapa);
    _usuarioMapa.on('click', e => ubicarEnMapaUsuario(e.latlng.lat, e.latlng.lng));
  }

  setTimeout(() => _usuarioMapa.invalidateSize(), 150);

  const lat = parseFloat(document.getElementById('mUsuarioLat').value);
  const lng = parseFloat(document.getElementById('mUsuarioLng').value);
  if (!isNaN(lat) && !isNaN(lng)) {
    ubicarEnMapaUsuario(lat, lng);
  } else if (_usuarioMarcador) {
    _usuarioMapa.removeLayer(_usuarioMarcador);
    _usuarioMarcador = null;
  }
}

function ubicarEnMapaUsuario(lat, lng) {
  document.getElementById('mUsuarioLat').value = lat;
  document.getElementById('mUsuarioLng').value = lng;
  if (_usuarioMarcador) {
    _usuarioMarcador.setLatLng([lat, lng]);
  } else {
    _usuarioMarcador = L.marker([lat, lng]).addTo(_usuarioMapa);
  }
  _usuarioMapa.setView([lat, lng], 15);
}

async function buscarDireccionUsuario() {
  const direccion = document.getElementById('mUsuarioDireccion').value.trim();
  if (!direccion) { toast('Escribí una dirección para buscar', 'err'); return; }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(direccion)}`);
    const data = await res.json();
    if (!data.length) { toast('No se encontró esa dirección', 'err'); return; }
    ubicarEnMapaUsuario(parseFloat(data[0].lat), parseFloat(data[0].lon));
  } catch (e) { toast('No se pudo buscar la dirección', 'err'); }
}

async function guardarUsuario() {
  const id = document.getElementById('mUsuarioId').value;
  const ubicacion = {
    direccion: document.getElementById('mUsuarioDireccion').value.trim() || null,
    ubicacion_lat: document.getElementById('mUsuarioLat').value || null,
    ubicacion_lng: document.getElementById('mUsuarioLng').value || null,
  };
  await conBotonBloqueado('mUsuarioGuardarBtn', async () => {
    try {
      if (id) {
        await API.patch(`/usuarios/${id}`, {
          nombre: document.getElementById('mUsuarioNombre').value.trim(),
          rol: document.getElementById('mUsuarioRol').value,
          telefono: document.getElementById('mUsuarioTelefono').value.trim() || null,
          ...ubicacion,
        });
        toast('Usuario actualizado ✓', 'ok');
      } else {
        await API.post('/auth/register', {
          nombre: document.getElementById('mUsuarioNombre').value.trim(),
          email: document.getElementById('mUsuarioEmail').value.trim(),
          password: document.getElementById('mUsuarioPassword').value,
          rol: document.getElementById('mUsuarioRol').value,
          telefono: document.getElementById('mUsuarioTelefono').value.trim() || null,
          ...ubicacion,
        });
        toast('Usuario creado ✓', 'ok');
      }
      closeModal('modalUsuario');
      loadUsuarios();
    } catch (e) { toast(e.message, 'err'); }
  });
}

function editarUsuario(id) { abrirModalUsuario(_usuarios.find(u => u.id === id)); }

async function eliminarUsuario(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  try { await API.delete(`/usuarios/${id}`); toast('Eliminado', 'ok'); loadUsuarios(); }
  catch (e) { toast(e.message, 'err'); }
}

// ── Arranque ──────────────────────────────────────────────────────────────────
showSection('dashboard');
