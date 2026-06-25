document.addEventListener("DOMContentLoaded", async () => {
  const { invoke } = window.__TAURI_INTERNALS__;
  const cerrarBtn = document.getElementById("btn-close");
  const minimizarBtn = document.getElementById("btn-min");
  const btn_aux = document.getElementById("btn-maximize");
  const maximizarBtn = document.getElementById("btn-max");

  // Cerrar ventana
  cerrarBtn?.addEventListener("click", async () => {
    await invoke("plugin:window|close");
  });

  // Minimizar ventana
  minimizarBtn?.addEventListener("click", async () => {
    await invoke("plugin:window|minimize");
  });

  // Maximizar / restaurar ventana
  const { getCurrentWindow } = window.__TAURI__.window;
  const appWindow = getCurrentWindow();

  maximizarBtn?.addEventListener("click", async () => {
    const estaMaximizada = await appWindow.isMaximized();

    if (estaMaximizada) {
      btn_aux.src = "img/bar-sis-no-full.svg"; // icono de restaurar
      await invoke("plugin:window|unmaximize");
    } else {
      btn_aux.src = "img/bar-sis-maximize.svg"; // icono de maximizar
      await invoke("plugin:window|maximize");
    }
  });
});
