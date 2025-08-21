// Minimal SPA router + UI bindings
const views = ["home", "artists", "artist", "album", "track", "videos", "admin", "auth"];

function showView(name) {
  views.forEach(v => document.getElementById(`view-${v}`)?.classList.add("hidden"));
  document.getElementById(`view-${name}`)?.classList.remove("hidden");
}

async function router() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [route, arg] = hash.split("/");

  switch (route) {
    case "artists":
      showView("artists");
      renderArtists();
      break;
    case "artist":
      showView("artist");
      renderArtist(arg);
      break;
    case "album":
      showView("album");
      renderAlbum(arg);
      break;
    case "track":
      showView("track");
      renderTrack(arg);
      break;
    case "videos":
      showView("videos");
      renderVideos();
      break;
    case "admin":
      showView("admin");
      guardAdmin();
      break;
    case "auth":
      showView("auth");
      break;
    default:
      showView("home");
      renderHome();
  }
}

window.addEventListener("hashchange", router);
document.addEventListener("DOMContentLoaded", () => {
  router();
  bindAuthUI();
  bindAdminUI();
  bindPlayer();
});

// Auth UI
async function bindAuthUI() {
  document.getElementById("btn-signup")?.addEventListener("click", async () => {
    const email = document.getElementById("su-email").value.trim();
    const password = document.getElementById("su-pass").value.trim();
    try {
      await api("/api/auth/signup", { method: "POST", body: { email, password } });
      document.getElementById("auth-feedback").textContent = "Account created. You can log in.";
    } catch (e) {
      document.getElementById("auth-feedback").textContent = e.message;
    }
  });

  document.getElementById("btn-login")?.addEventListener("click", async () => {
    const email = document.getElementById("li-email").value.trim();
    const password = document.getElementById("li-pass").value.trim();
    try {
      await api("/api/auth/login", { method: "POST", body: { email, password } });
      document.getElementById("auth-feedback").textContent = "Logged in.";
      location.hash = "#/";
    } catch (e) {
      document.getElementById("auth-feedback").textContent = e.message;
    }
  });

  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
      location.hash = "#/auth";
    } catch (e) {
      console.error(e);
    }
  });
}

// Admin guard
async function guardAdmin() {
  try {
    const me = await api("/api/auth/me");
    if (me.role !== "admin") {
      location.hash = "#/auth";
    } else {
      document.getElementById("nav-admin")?.classList.remove("hidden");
    }
  } catch (e) {
    location.hash = "#/auth";
  }
}

// Admin UI
function setFeedback(msg) {
  const el = document.getElementById("admin-feedback");
  if (el) el.textContent = msg;
}

function bindAdminUI() {
  document.getElementById("btn-add-artist")?.addEventListener("click", async () => {
    try {
      const name = document.getElementById("a-name").value.trim();
      const genres = document.getElementById("a-genres").value
        .split(",").map(s => s.trim()).filter(Boolean);
      const bio = document.getElementById("a-bio").value.trim();
      const r = await api("/api/artists", { method: "POST", body: { name, genres, bio } });
      setFeedback("Artist added: " + r.id);
    } catch (e) { setFeedback(e.message); }
  });

  document.getElementById("btn-add-album")?.addEventListener("click", async () => {
    try {
      const artistId = document.getElementById("al-artistId").value.trim();
      const title = document.getElementById("al-title").value.trim();
      const type = document.getElementById("al-type").value;
      const releaseDate = document.getElementById("al-date").value;
      const r = await api("/api/albums", { method: "POST", body: { artistId, title, type, releaseDate } });
      setFeedback("Album added: " + r.id);
    } catch (e) { setFeedback(e.message); }
  });

  document.getElementById("btn-add-track")?.addEventListener("click", async () => {
    try {
      const albumId = document.getElementById("t-albumId").value.trim();
      const title = document.getElementById("t-title").value.trim();
      const duration = document.getElementById("t-duration").value.trim();
      const lyrics = document.getElementById("t-lyrics").value.trim();
      const audioUrl = document.getElementById("t-audio").value.trim();
      const tabsUrl = document.getElementById("t-tabs").value.trim();
      const videoUrl = document.getElementById("t-video").value.trim();
      const r = await api("/api/tracks", { method: "POST", body: { albumId, title, duration, lyrics, audioUrl, tabsUrl, videoUrl } });
      setFeedback("Track added: " + r.id);
    } catch (e) { setFeedback(e.message); }
  });

  document.getElementById("btn-add-video")?.addEventListener("click", async () => {
    try {
      const artistId = document.getElementById("v-artistId").value.trim();
      const title = document.getElementById("v-title").value.trim();
      const url = document.getElementById("v-url").value.trim();
      const r = await api("/api/videos", { method: "POST", body: { artistId, title, url } });
      setFeedback("Video added: " + r.id);
    } catch (e) { setFeedback(e.message); }
  });
}

// Renderers
async function renderHome() {
  const latest = await api("/api/latest");
  const grid = document.getElementById("home-latest");
  grid.innerHTML = "";

  function card(x) {
    return `
      <div class="card">
        <div class="text-sm text-slate-400">${x.type}</div>
        <div class="font-semibold">${x.title}</div>
        <div class="text-sm text-slate-400">${x.subtitle || ""}</div>
      </div>`;
  }

  latest.items.forEach(x => grid.innerHTML += card(x));
}

async function renderArtists() {
  const res = await api("/api/artists");
  const list = document.getElementById("artists-list");
  list.innerHTML = "";

  res.items.forEach(a => {
    const el = document.createElement("a");
    el.href = `#/artist/${a.id}`;
    el.className = "card";
    el.innerHTML = `
      <div class="font-semibold">${a.name}</div>
      <div class="text-sm text-slate-400">${(a.genres || []).join(", ")}</div>`;
    list.appendChild(el);
  });
}

async function renderArtist(id) {
  const a = await api(`/api/artists?id=${encodeURIComponent(id)}`);
  const el = document.getElementById("artist-detail");
  el.innerHTML = `
    <div class="card">
      <div class="text-2xl font-bold">${a.name}</div>
      <div class="text-sm text-slate-400 mb-2">${(a.genres || []).join(", ")}</div>
      <p>${a.bio || ""}</p>
      <h3 class="mt-4 font-semibold">Albums</h3>
      <ul>${(a.albums || []).map(al => `<li><a href='#/album/${al.id}'>${al.title}</a></li>`).join("")}</ul>
    </div>`;
}

async function renderAlbum(id) {
  const al = await api(`/api/albums?id=${encodeURIComponent(id)}`);
  const el = document.getElementById("album-detail");
  el.innerHTML = `
    <div class="card">
      <div class="text-2xl font-bold">${al.title}</div>
      <div class="text-sm text-slate-400 mb-2">${al.type?.toUpperCase() || ""} ${al.releaseDate || ""}</div>
      <h3 class="mt-4 font-semibold">Tracks</h3>
      <ol>${(al.tracks || []).map(t => `<li><a href='#/track/${t.id}'>${t.title}</a></li>`).join("")}</ol>
    </div>`;
}

async function renderTrack(id) {
  const t = await api(`/api/tracks?id=${encodeURIComponent(id)}`);
  const el = document.getElementById("track-detail");
  el.innerHTML = `
    <div class="card">
      <div class="text-2xl font-bold">${t.title}</div>
      <div class="text-sm text-slate-400 mb-2">${t.duration || ""}</div>
      <pre class="whitespace-pre-wrap">${t.lyrics || ""}</pre>
    </div>`;
}

async function renderVideos() {
  const res = await api("/api/videos");
  const grid = document.getElementById("videos-grid");
  grid.innerHTML = "";

  res.items.forEach(v => {
    const el = document.createElement("a");
    el.href = v.url;
    el.target = "_blank";
    el.rel = "noopener";
    el.className = "card";
    el.innerHTML = `
      <div class="font-semibold">${v.title}</div>
      <div class="text-sm text-slate-400">${v.artistId || ""}</div>`;
    grid.appendChild(el);
  });
}

// Player (very basic)
let queue = [], idx = -1, audioEl, npTitle, npSub, npProg;

function bindPlayer() {
  audioEl = document.getElementById("audio");
  npTitle = document.getElementById("np-title");
  npSub = document.getElementById("np-sub");
  npProg = document.getElementById("np-progress");

  document.getElementById("np-play").addEventListener("click", () => {
    if (!audioEl.src) return;
    audioEl.paused ? audioEl.play() : audioEl.pause();
  });

  document.getElementById("np-prev").addEventListener("click", () => {
    if (idx > 0) { idx--; playIdx(); }
  });

  document.getElementById("np-next").addEventListener("click", () => {
    if (idx < queue.length - 1) { idx++; playIdx(); }
  });

  npProg.addEventListener("input", () => {
    if (audioEl.duration) {
      audioEl.currentTime = (npProg.value / 100) * audioEl.duration;
    }
  });

  audioEl.addEventListener("timeupdate", () => {
    if (!audioEl.duration) return;
    npProg.value = Math.floor((audioEl.currentTime / audioEl.duration) * 100);
  });
}

async function enqueueTrack(id) {
  const t = await api(`/api/tracks?id=${encodeURIComponent(id)}`);
  queue.push(t);
  if (idx === -1) { idx = 0; playIdx(); }
}

function playIdx() {
  const t = queue[idx];
  audioEl.src = t.audioUrl || "";
  npTitle.textContent = t.title;
  npSub.textContent = t.duration || "";
  audioEl.play();
}
