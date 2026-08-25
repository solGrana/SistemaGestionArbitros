/* main.js — Dashboard Gestión de Árbitros */

// ── Guard + usuario actual ────────────────────────────────────────────────────
if (!localStorage.getItem('access_token')) window.location.href = '/';
const ME = JSON.parse(localStorage.getItem('usuario') || '{}');
const isAdmin = ['admin', 'organizacion'].includes(ME.rol);

document.getElementById('uAvatar').textContent = (ME.nombre || 'U')[0].toUpperCase();
document.getElementById('uName').textContent = ME.nombre || '';
document.getElementById('uRole').textContent = ME.rol || '';
if (!isAdmin) document.querySelectorAll('.ao').forEach(el => el.remove());

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
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('sec-' + id).style.display = 'block';
  document.querySelector(`.nav-item[data-s="${id}"]`)?.classList.add('active');
  document.getElementById('topTitle').textContent = TITULOS[id] || id;
  ({ dashboard: loadDashboard, partidos: loadPartidos, torneos: loadTorneos, usuarios: loadUsuarios }[id] || (() => { }))();
}

document.querySelectorAll('.nav-item[data-s]').forEach(el =>
  el.addEventListener('click', () => showSection(el.dataset.s)));

function logout() { localStorage.clear(); window.location.href = '/'; }

// ── Modales ───────────────────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
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

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const [partidos, torneos, arbitros] = await Promise.all([
      API.get('/partidos'), API.get('/torneos'), API.get('/usuarios?rol=arbitro'),
    ]);
    const sinAsignar = partidos.filter(p =>
      p.asignaciones.length < p.cantidad_arbitros + p.cantidad_asistentes);

    document.getElementById('stPartidos').textContent = partidos.length;
    document.getElementById('stSinAsig').textContent = sinAsignar.length;
    document.getElementById('stTorneos').textContent = torneos.filter(t => t.activo).length;
    document.getElementById('stArbitros').textContent = arbitros.length;

    const proximos = [...partidos]
      .filter(p => new Date(p.fecha_hora) >= new Date())
      .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
      .slice(0, 6);

    document.getElementById('dashTableBody').innerHTML = proximos.length
      ? proximos.map(p => `
          <tr>
            <td>${fDT(p.fecha_hora)}</td>
            <td>${p.torneo_nombre || '—'}</td>
            <td><strong>${p.cancha}</strong></td>
            <td>${cupo(p)}</td>
            <td><button class="btn btn-sm btn-primary ao" onclick="abrirAsignar(${p.id})">Asignar</button></td>
          </tr>`).join('')
      : `<tr><td colspan="5"><div class="empty-state"><div class="ei">📋</div><p>Sin próximos partidos</p></div></td></tr>`;
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
          <td>${t.descripcion || '—'}</td>
          <td>${t.fecha_inicio || '—'}</td>
          <td>${t.fecha_fin || '—'}</td>
          <td><span class="badge ${t.activo ? 'badge-green' : 'badge-gray'}">${t.activo ? 'Activo' : 'Inactivo'}</span></td>
          <td class="ao"><div class="td-actions">
            <button class="btn-icon" onclick="editarTorneo(${t.id})">✏️</button>
            <button class="btn-icon" onclick="eliminarTorneo(${t.id})">🗑️</button>
          </div></td>
        </tr>`).join('')
    : `<tr><td colspan="7"><div class="empty-state"><div class="ei">🏆</div><p>Sin torneos</p></div></td></tr>`;
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
  try {
    id ? await API.patch(`/torneos/${id}`, body) : await API.post('/torneos', body);
    toast(id ? 'Torneo actualizado ✓' : 'Torneo creado ✓', 'ok');
    closeModal('modalTorneo');
    loadTorneos();
  } catch (e) { toast(e.message, 'err'); }
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
  if (buscar) list = list.filter(p => p.cancha.toLowerCase().includes(buscar) || (p.torneo_nombre || '').toLowerCase().includes(buscar));
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
          <td>${p.torneo_nombre || '—'}
              <div style="font-size:11px;color:var(--muted);margin-top:2px">${p.organizacion_nombre || 'Sin organización'}</div>
          </td>
          <td>${cupo(p)}</td>
          <td><div class="arbitro-list">${pills || '<span style="color:var(--muted);font-size:12px">Sin asignar</span>'}</div></td>
          <td><span class="badge ${p.modalidad_pago === 'en_cancha' ? 'badge-blue' : 'badge-amber'}">${p.modalidad_pago === 'en_cancha' ? 'En cancha' : 'Administrador'}</span></td>
          <td>${fMoney(p.valor_arbitro)}</td>
          <td><div class="td-actions">
            <button class="btn btn-sm btn-primary ao" onclick="abrirAsignar(${p.id})">⚡</button>
            <button class="btn-icon ao" onclick="editarPartido(${p.id})">✏️</button>
            <button class="btn-icon ao" onclick="eliminarPartido(${p.id})">🗑️</button>
          </div></td>
        </tr>`;
    }).join('')
    : `<tr><td colspan="8"><div class="empty-state"><div class="ei">📋</div><p>Sin partidos</p></div></td></tr>`;
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
  document.getElementById('mPartidoFecha').value           = p?.fecha_hora ? p.fecha_hora.slice(0,16) : '';
  document.getElementById('mPartidoCantArb').value         = p?.cantidad_arbitros   ?? 1;
  document.getElementById('mPartidoCantAsis').value        = p?.cantidad_asistentes ?? 0;
  document.getElementById('mPartidoModalidad').value       = p?.modalidad_pago || 'en_cancha';
  document.getElementById('mPartidoValorArb').value        = p?.valor_arbitro   ?? 0;
  document.getElementById('mPartidoValorAsis').value       = p?.valor_asistente ?? 0;
  openModal('modalPartido');
}

async function guardarPartido() {
  const id = document.getElementById('mPartidoId').value;
  const body = {
    torneo_id: parseInt(document.getElementById('mPartidoTorneo').value),
    cancha: document.getElementById('mPartidoCancha').value.trim(),
    fecha_hora: document.getElementById('mPartidoFecha').value,
    cantidad_arbitros: parseInt(document.getElementById('mPartidoCantArb').value),
    cantidad_asistentes: parseInt(document.getElementById('mPartidoCantAsis').value),
    modalidad_pago: document.getElementById('mPartidoModalidad').value,
    valor_arbitro: parseInt(document.getElementById('mPartidoValorArb').value) || 0,
    valor_asistente: parseInt(document.getElementById('mPartidoValorAsis').value) || 0,
  };
  if (!body.cancha || !body.fecha_hora) { toast('Completá los campos obligatorios', 'err'); return; }
  try {
    id ? await API.patch(`/partidos/${id}`, body) : await API.post('/partidos', body);
    toast(id ? 'Partido actualizado ✓' : 'Partido creado ✓', 'ok');
    closeModal('modalPartido');
    loadPartidos();
  } catch (e) { toast(e.message, 'err'); }
}

function editarPartido(id) { abrirModalPartido(_partidos.find(p => p.id === id)); }

async function eliminarPartido(id) {
  if (!confirm('¿Eliminar este partido?')) return;
  try { await API.delete(`/partidos/${id}`); toast('Eliminado', 'ok'); loadPartidos(); }
  catch (e) { toast(e.message, 'err'); }
}

// ═════════════════════════════════════════════════════════════════════════════
// ASIGNACIONES
// ═════════════════════════════════════════════════════════════════════════════
async function abrirAsignar(partidoId) {
  const [partido, disponibles] = await Promise.all([
    API.get(`/partidos/${partidoId}`),
    API.get(`/asignaciones/disponibles?partido_id=${partidoId}`),
  ]);

  document.getElementById('mAsigInfo').innerHTML =
    `<strong>${partido.cancha}</strong> — ${fDT(partido.fecha_hora)}<br>
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

  document.getElementById('mAsigDisponibles').innerHTML = disponibles.length
    ? disponibles.map(u => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <div>
            <strong style="font-size:13px">${u.nombre}</strong>
            <span style="font-size:12px;color:var(--muted);margin-left:6px">${u.email}</span>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-primary"   onclick="asignar(${partidoId},${u.id},'arbitro')">Árbitro</button>
            <button class="btn btn-sm btn-secondary" onclick="asignar(${partidoId},${u.id},'asistente')">Asistente</button>
          </div>
        </div>`).join('')
    : '<p style="color:var(--muted);font-size:13px;padding:8px 0">No hay árbitros disponibles</p>';

  document.getElementById('mAsigPartidoId').value = partidoId;
  openModal('modalAsignar');
}

async function asignar(partidoId, usuarioId, rol) {
  try {
    await API.post('/asignaciones/', { partido_id: partidoId, usuario_id: usuarioId, rol });
    toast('Árbitro asignado ✓', 'ok');
    abrirAsignar(partidoId);
    loadPartidos();
  } catch (e) { toast(e.message, 'err'); }
}

async function desasignar(partidoId, usuarioId) {
  try {
    await API.delete(`/asignaciones/?partido_id=${partidoId}&usuario_id=${usuarioId}`);
    toast('Árbitro removido', 'ok');
    abrirAsignar(partidoId);
    loadPartidos();
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
  document.getElementById('mUsuarioPassGroup').style.display = u ? 'none' : 'block';
  document.getElementById('mUsuarioEmailGroup').style.display = u ? 'none' : 'block';
  openModal('modalUsuario');
}

async function guardarUsuario() {
  const id = document.getElementById('mUsuarioId').value;
  try {
    if (id) {
      await API.patch(`/usuarios/${id}`, {
        nombre: document.getElementById('mUsuarioNombre').value.trim(),
        rol: document.getElementById('mUsuarioRol').value,
        telefono: document.getElementById('mUsuarioTelefono').value.trim() || null,
      });
      toast('Usuario actualizado ✓', 'ok');
    } else {
      await API.post('/auth/register', {
        nombre: document.getElementById('mUsuarioNombre').value.trim(),
        email: document.getElementById('mUsuarioEmail').value.trim(),
        password: document.getElementById('mUsuarioPassword').value,
        rol: document.getElementById('mUsuarioRol').value,
        telefono: document.getElementById('mUsuarioTelefono').value.trim() || null,
      });
      toast('Usuario creado ✓', 'ok');
    }
    closeModal('modalUsuario');
    loadUsuarios();
  } catch (e) { toast(e.message, 'err'); }
}

function editarUsuario(id) { abrirModalUsuario(_usuarios.find(u => u.id === id)); }

async function eliminarUsuario(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  try { await API.delete(`/usuarios/${id}`); toast('Eliminado', 'ok'); loadUsuarios(); }
  catch (e) { toast(e.message, 'err'); }
}

// ── Arranque ──────────────────────────────────────────────────────────────────
showSection('dashboard');
