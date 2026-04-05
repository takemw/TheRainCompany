document.addEventListener("DOMContentLoaded", () => {
  // 1) Tomamos el contenedor real de tu ventana
  const window2 = document.querySelector(".window2");
  if (!window2) return;

  // 2) Elementos dentro de window2 (SIN IDs, como en tu HTML)
  const select = window2.querySelector(".assistant-list select");
  const previewImg = window2.querySelector(".assistant-preview img");
  const buttonsContainer = window2.querySelector(".assistant-buttons");

  // Modal (estos sí existen con ID en tu HTML)
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  // Si falta algo esencial, no rompemos
  if (!select || !previewImg || !buttonsContainer) {
    console.warn("Faltan elementos en Window2: select/previewImg/buttons.");
    return;
  }

  // 3) Encontrar botones por el texto (porque no tienen ID)
  const allBtns = Array.from(buttonsContainer.querySelectorAll("button"));

  const setDefaultBtn = allBtns.find(b => b.textContent.trim().toLowerCase() === "set as default");
  const showImageBtn = allBtns.find(b => b.textContent.trim().toLowerCase() === "show image");
  const cancelBtn = allBtns.find(b => b.textContent.trim().toLowerCase() === "cancel");

  // Estado: "selección actual" y "default"
  let defaultSrc = previewImg.getAttribute("src") || "";
  let defaultAlt = previewImg.getAttribute("alt") || "Preview";

  function getSelectedData() {
    const opt = select.options[select.selectedIndex];
    return {
      name: (opt.value || opt.textContent || "").trim(),
      src: opt.dataset.img || ""
    };
  }

  // (A) Cambiar preview al seleccionar (esto es lo más natural)
  function updatePreview() {
    const { name, src } = getSelectedData();
    if (!src) return;

    previewImg.src = src;
    previewImg.alt = name || "Preview";
  }

  // (B) Set as Default: fija la imagen seleccionada como default
  function setAsDefault() {
    const { name, src } = getSelectedData();
    if (!src) return;

    defaultSrc = src;
    defaultAlt = name || "Preview";

    // Deja el preview como default confirmado
    previewImg.src = defaultSrc;
    previewImg.alt = defaultAlt;
  }

  // (C) Modal: abre/cierra la imagen en grande
  function openModal() {
    if (!modal || !modalImg || !modalCloseBtn) {
      console.warn("Modal no encontrado o incompleto (imageModal/modalImg/modalCloseBtn).");
      return;
    }

    modalImg.src = previewImg.src;
    modalImg.alt = previewImg.alt || "Imagen";

    if (modalTitle) {
      modalTitle.textContent = `Show Image - ${modalImg.alt}`;
    }

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    if (modalImg) modalImg.src = "";
  }

  // (D) Cancel: vuelve al default guardado
  function cancelSelection() {
    if (!defaultSrc) return;
    previewImg.src = defaultSrc;
    previewImg.alt = defaultAlt;

    // Si quieres que también vuelva la selección del select al default,
    // buscamos el option que tenga data-img igual al defaultSrc
    const options = Array.from(select.options);
    const idx = options.findIndex(o => (o.dataset.img || "") === defaultSrc);
    if (idx >= 0) select.selectedIndex = idx;
  }

  // Eventos
  select.addEventListener("change", updatePreview);

  if (setDefaultBtn) setDefaultBtn.addEventListener("click", setAsDefault);
  if (showImageBtn) showImageBtn.addEventListener("click", openModal);
  if (cancelBtn) cancelBtn.addEventListener("click", cancelSelection);

  // También abrir modal al hacer click sobre la imagen del preview
  previewImg.addEventListener("click", openModal);

  // Cerrar modal
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);

  // Cerrar modal haciendo click fuera de la ventana modal
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Inicializa el preview con el option selected
  updatePreview();
});