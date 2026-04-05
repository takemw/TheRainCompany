(() => {
  const root = document.querySelector(".Window3");
  if (!root) return;

  // Elementos UI
  const coverImg = root.querySelector(".CD-preview img");
  const artistInput = root.querySelector("input.artist");
  const trackInput  = root.querySelector("input.track");
  const urlInput    = root.querySelector(".yt-url");
  const loadBtn     = root.querySelector(".yt-load");
  const vol         = root.querySelector(".vol");
  const buttons     = root.querySelectorAll(".player-buttons button");

  // Validación mínima
  if (!coverImg || !artistInput || !trackInput || !urlInput || !loadBtn || !vol) {
    console.warn("Faltan elementos en Window3. Revisa clases/estructura.");
    return;
  }

  // Playlist simple (se llena con cada Load)
  const playlist = [];
  let index = -1;

  // YouTube player
  let player = null;
  let playerReady = false;
  let pendingVideoId = "";

  // --- Helpers ---
  const isYouTubeUrl = (u = "") => /youtu\.be|youtube\.com/i.test(u);

  function extractVideoId(url) {
    try {
      const u = new URL(url);

      if (u.hostname.includes("youtu.be")) {
        return u.pathname.replace("/", "");
      }

      const v = u.searchParams.get("v");
      if (v) return v;

      const parts = u.pathname.split("/").filter(Boolean);

      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];

      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];

    } catch (e) {
      // URL inválida
    }
    return "";
  }

  async function fetchOEmbed(url) {
    // oEmbed de YouTube devuelve title, author_name, thumbnail_url [2](https://nutbread.github.io/yia/)[3](https://www.agent37.com/blog/youtube-iframe-api)
    const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error("oEmbed failed");
    return res.json();
  }

  async function setMeta(url, videoId) {
    try {
      const meta = await fetchOEmbed(url);
      trackInput.value  = meta.title || "-";
      artistInput.value = meta.author_name || "-";
      if (meta.thumbnail_url) coverImg.src = meta.thumbnail_url;
    } catch (e) {
      // fallback de miniatura por patrón de YouTube [4](https://alanrezende.com/free-youtube-video-info-api-title-aspect-ratio-thumbnail-author-working-2024)
      trackInput.value  = "YouTube";
      artistInput.value = videoId || "-";
      if (videoId) coverImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  async function loadUrl(url) {
    url = (url || "").trim();
    if (!url || !isYouTubeUrl(url)) {
      trackInput.value = "URL inválida";
      artistInput.value = "-";
      return;
    }

    const id = extractVideoId(url);
    if (!id) {
      trackInput.value = "No se pudo leer el ID";
      artistInput.value = "-";
      return;
    }

    // playlist
    playlist.push(url);
    index = playlist.length - 1;

    await setMeta(url, id);

    // cargar en player
    if (player && playerReady) {
      player.loadVideoById(id);
      player.setVolume(Number(vol.value || 40));
      // No hacemos autoplay forzado; el usuario le da ▶
    } else {
      pendingVideoId = id;
    }
  }

  // Controles (IFrame API) [1](https://iframely.com/docs/oembed-api)
  function play()  { if (playerReady && player) player.playVideo(); }
  function pause() { if (playerReady && player) player.pauseVideo(); }
  function stop()  { if (playerReady && player) player.stopVideo(); }

  async function prev() {
    if (playlist.length === 0) return;
    index = (index - 1 + playlist.length) % playlist.length;
    await loadUrl(playlist[index]);
  }

  async function next() {
    if (playlist.length === 0) return;
    index = (index + 1) % playlist.length;
    await loadUrl(playlist[index]);
  }

  // Botones
  buttons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      if (action === "play") play();
      if (action === "pause") pause();
      if (action === "stop") stop();
      if (action === "prev") await prev();
      if (action === "next") await next();
    });
  });

  // Volumen (YouTube permite ajustar volumen) [1](https://iframely.com/docs/oembed-api)
  vol.addEventListener("input", () => {
    if (playerReady && player) player.setVolume(Number(vol.value));
  });

  // Load
  loadBtn.addEventListener("click", () => loadUrl(urlInput.value));
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadUrl(urlInput.value);
  });

  // Crear player cuando la API esté lista (callback oficial) [1](https://iframely.com/docs/oembed-api)
  function initPlayer() {
    if (player) return;

    player = new YT.Player("ytPlayer", {
      width: "320",
      height: "180",
      videoId: "",
      playerVars: { playsinline: 1 },
      events: {
        onReady: () => {
          playerReady = true;
          player.setVolume(Number(vol.value || 40));
          if (pendingVideoId) {
            player.loadVideoById(pendingVideoId);
            pendingVideoId = "";
          }
        }
      }
    });
  }

  if (window.YT && window.YT.Player) {
    initPlayer();
  } else {
    window.onYouTubeIframeAPIReady = initPlayer;
  }
})();
``