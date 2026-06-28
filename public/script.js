"use strict";

const endpointData = {
  auth: [
    {
      method: "POST",
      path: "/auth/register",
      desc: "Create a new account",
      auth: false,
    },
    {
      method: "POST",
      path: "/auth/login",
      desc: "Login and receive token pair",
      auth: false,
    },
    {
      method: "POST",
      path: "/auth/refresh",
      desc: "Rotate refresh token",
      auth: false,
    },
    { method: "GET", path: "/auth/me", desc: "Get own profile", auth: true },
    {
      method: "POST",
      path: "/auth/logout",
      desc: "Invalidate current session",
      auth: true,
    },
    {
      method: "POST",
      path: "/auth/logout-all",
      desc: "Logout from all devices",
      auth: true,
    },
    {
      method: "POST",
      path: "/auth/change-password",
      desc: "Change password",
      auth: true,
    },
  ],
  users: [
    {
      method: "GET",
      path: "/users",
      desc: "Paginated user list",
      auth: true,
      role: "admin/mod",
    },
    {
      method: "GET",
      path: "/users/:id",
      desc: "Get user by ID",
      auth: true,
      role: "admin/mod",
    },
    {
      method: "PATCH",
      path: "/users/profile",
      desc: "Update own profile",
      auth: true,
    },
    {
      method: "PATCH",
      path: "/users/:id/role",
      desc: "Assign role to user",
      auth: true,
      role: "admin",
    },
    {
      method: "PATCH",
      path: "/users/:id/deactivate",
      desc: "Soft-delete user",
      auth: true,
      role: "admin",
    },
    {
      method: "PATCH",
      path: "/users/:id/activate",
      desc: "Re-activate user",
      auth: true,
      role: "admin",
    },
    {
      method: "DELETE",
      path: "/users/:id",
      desc: "Permanently delete user",
      auth: true,
      role: "admin",
    },
  ],
  products: [
    {
      method: "GET",
      path: "/products",
      desc: "Paginated product list",
      auth: false,
    },
    {
      method: "GET",
      path: "/products/stats",
      desc: "Aggregated stats by category",
      auth: true,
      role: "admin/mod",
    },
    {
      method: "GET",
      path: "/products/:id",
      desc: "Get product by ID",
      auth: false,
    },
    { method: "POST", path: "/products", desc: "Create a product", auth: true },
    {
      method: "PATCH",
      path: "/products/:id",
      desc: "Partial update (owner/admin)",
      auth: true,
    },
    {
      method: "DELETE",
      path: "/products/:id",
      desc: "Delete product (owner/admin)",
      auth: true,
    },
  ],
  health: [
    {
      method: "GET",
      path: "/health",
      desc: "API status, DB, uptime, memory",
      auth: false,
    },
  ],
};

const demos = [
  {
    cmd: "curl -X POST /api/v1/auth/login",
    lines: [
      { text: "{", cls: "" },
      { text: '  "success": true,', cls: "indent" },
      { text: '  "message": "Login successful.",', cls: "indent" },
      { text: '  "data": {', cls: "indent" },
      { text: '    "user": {', cls: "indent2" },
      {
        text: '      <span class="t-key">"email"</span>: <span class="t-val">"dev@example.com"</span>,',
        cls: "indent2",
      },
      {
        text: '      <span class="t-key">"role"</span>:  <span class="t-val">"admin"</span>',
        cls: "indent2",
      },
      { text: "    },", cls: "indent" },
      {
        text: '    <span class="t-key">"accessToken"</span>:  <span class="t-val">"eyJhbGci..."</span>,',
        cls: "indent",
      },
      {
        text: '    <span class="t-key">"refreshToken"</span>: <span class="t-val">"eyJhbGci..."</span>',
        cls: "indent",
      },
      { text: "  }", cls: "indent" },
      { text: "}", cls: "" },
    ],
  },
  {
    cmd: "curl /api/v1/products?category=electronics",
    lines: [
      { text: "{", cls: "" },
      { text: '  "success": true,', cls: "indent" },
      { text: '  "data": { "products": [ ... ] },', cls: "indent" },
      { text: '  "meta": {', cls: "indent" },
      {
        text: '    <span class="t-key">"total"</span>:      <span class="t-num">42</span>,',
        cls: "indent2",
      },
      {
        text: '    <span class="t-key">"page"</span>:       <span class="t-num">1</span>,',
        cls: "indent2",
      },
      {
        text: '    <span class="t-key">"totalPages"</span>: <span class="t-num">5</span>,',
        cls: "indent2",
      },
      {
        text: '    <span class="t-key">"hasNextPage"</span>: <span class="t-val">true</span>',
        cls: "indent2",
      },
      { text: "  }", cls: "indent" },
      { text: "}", cls: "" },
    ],
  },
  {
    cmd: "curl /api/v1/health",
    lines: [
      { text: "{", cls: "" },
      {
        text: '  <span class="t-key">"status"</span>:      <span class="t-val">"healthy"</span>,',
        cls: "indent",
      },
      {
        text: '  <span class="t-key">"database"</span>:    <span class="t-green">"connected"</span>,',
        cls: "indent",
      },
      {
        text: '  <span class="t-key">"uptime"</span>:      <span class="t-num">3600</span>,',
        cls: "indent",
      },
      {
        text: '  <span class="t-key">"memory"</span>:      <span class="t-val">"45 MB"</span>',
        cls: "indent",
      },
      { text: "}", cls: "" },
    ],
  },
];

class TerminalDemo {
  constructor() {
    this.cmdEl = document.getElementById("typed-cmd");
    this.outputEl = document.getElementById("terminal-output");
    this.cursorEl = document.getElementById("cursor");
    this.demoIdx = 0;
  }
  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  async type(text) {
    this.cmdEl.textContent = "";
    for (const ch of text) {
      this.cmdEl.textContent += ch;
      await this.sleep(36 + Math.random() * 28);
    }
  }
  async showOutput(lines) {
    this.outputEl.innerHTML = "";
    await this.sleep(200);
    for (const line of lines) {
      const el = document.createElement("span");
      el.className = "output-line" + (line.cls ? " " + line.cls : "");
      el.innerHTML = line.text;
      this.outputEl.appendChild(el);
      await this.sleep(55);
    }
  }
  async run() {
    while (true) {
      const demo = demos[this.demoIdx % demos.length];
      this.outputEl.innerHTML = "";
      await this.type(demo.cmd);
      this.cursorEl.style.display = "none";
      await this.sleep(400);
      await this.showOutput(demo.lines);
      await this.sleep(3200);
      this.outputEl.innerHTML = "";
      this.cmdEl.textContent = "";
      this.cursorEl.style.display = "inline";
      await this.sleep(400);
      this.demoIdx++;
    }
  }
}

function renderEndpoints(group) {
  const table = document.getElementById("endpoints-table");
  const rows = endpointData[group];
  const header = `<div class="ep-row ep-row__header"><div>Method</div><div>Endpoint</div><div>Description</div></div>`;
  const body = rows
    .map((r) => {
      const m = r.method.toLowerCase();
      const authBadge = r.auth
        ? `<span class="auth-required">🔒 ${r.role || "JWT"}</span>`
        : `<span style="color:var(--text-3);font-size:0.75rem;font-family:var(--mono)">public</span>`;
      return `<div class="ep-row">
      <div><span class="method-badge method-badge--${m}">${r.method}</span></div>
      <div class="ep-row__path">/api/v1${r.path}</div>
      <div class="ep-row__desc" style="display:flex;align-items:center;gap:10px;justify-content:flex-end;">
        <span style="color:var(--text-2);font-size:0.82rem;">${r.desc}</span>${authBadge}
      </div>
    </div>`;
    })
    .join("");
  table.innerHTML = header + body;
}

function initScrollAnimations() {
  const targets = document.querySelectorAll(
    ".feature-card,.sec-card,.tech-card,.arch-layer,.stat,.qs-step",
  );
  targets.forEach((el) => el.classList.add("fade-in"));
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );
  targets.forEach((el) => observer.observe(el));
}

function initNav() {
  const nav = document.getElementById("nav");
  window.addEventListener(
    "scroll",
    () => nav.classList.toggle("scrolled", window.scrollY > 40),
    { passive: true },
  );
}

function initCopyBtn() {
  const btn = document.getElementById("copy-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(
        "git clone https://github.com/yourusername/rest-api-framework.git",
      )
      .then(() => {
        btn.classList.add("copied");
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
        }, 2000);
      });
  });
}

function initTabs() {
  const tabs = document.querySelectorAll(".ep-tab");
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("ep-tab--active"));
      tab.classList.add("ep-tab--active");
      renderEndpoints(tab.dataset.group);
    }),
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initTabs();
  initScrollAnimations();
  initCopyBtn();
  renderEndpoints("auth");
  new TerminalDemo().run();
});
