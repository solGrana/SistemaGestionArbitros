/* api.js — cliente HTTP con auto-refresh de JWT */
const API = {
  base: '/api',

  _token()  { return localStorage.getItem('access_token'); },
  _headers() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this._token()}` };
  },

  async _fetch(url, opts = {}) {
    let res = await fetch(this.base + url, { ...opts, headers: this._headers() });

    if (res.status === 401) {
      const ok = await this._refresh();
      if (ok) res = await fetch(this.base + url, { ...opts, headers: this._headers() });
      else    { localStorage.clear(); window.location.href = '/'; return; }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Error en el servidor');
    }
    if (res.status === 204) return null;
    return res.json();
  },

  async _refresh() {
    const rt = localStorage.getItem('refresh_token');
    if (!rt) return false;
    try {
      const r = await fetch(this.base + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!r.ok) return false;
      const d = await r.json();
      localStorage.setItem('access_token',  d.access_token);
      localStorage.setItem('refresh_token', d.refresh_token);
      return true;
    } catch { return false; }
  },

  get:    (url)       => API._fetch(url),
  post:   (url, body) => API._fetch(url, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (url, body) => API._fetch(url, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (url)       => API._fetch(url, { method: 'DELETE' }),
};
