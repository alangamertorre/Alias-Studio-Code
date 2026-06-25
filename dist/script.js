//Imports
const {
  readTextFile,
  writeTextFile,
  readDir,
  BaseDirectory,
  create,
  mkdir,
  remove,
} = window.__TAURI__.fs;
const { basename, extname, join, appLocalDataDir } = window.__TAURI__.path;
const { open, confirm } = window.__TAURI__.dialog;

//Window consts & style settings

window.editorExist =
  document.querySelectorAll('.pestaña[data-tipo="editor"]').length >= 1
    ? true
    : false;
window.editorCodification = "utf-8";

document.querySelector(".cont-btn6").style.display = "none";
document.getElementById("txt_adv6").style.display = "flex";

//AppLocalData

const AppTimelineData = (async () => {
  const rutaSubcarpetas = `Users/timeline`;
  await mkdir(rutaSubcarpetas, {
    baseDir: BaseDirectory.AppLocalData,
    recursive: true,
  });
  const rutaBase = await appLocalDataDir();
  return await join(rutaBase, rutaSubcarpetas);
})();

//----------------------------
// DOM
//----------------------------
const barra1 = document.querySelector(".barra1");

const todos_btn_barra1 = document.querySelectorAll(".btn");
const Archivos = document.getElementById("archivos");
const Busqueda = document.getElementById("busqueda");
const GH = document.getElementById("gh");
const IA = document.getElementById("ia");
const Complementos = document.getElementById("complementos");
const Lenguaje = document.getElementById("lenguaje");

const InfoCode = document.querySelector(".InfoDelCodigo");

const barra3 = document.querySelector(".barra3");
const margen2 = document.querySelector(".margen2");
const crearPestana = document.querySelector(".crear-pestaña");
const limpiarPestana = document.querySelector(".limpiar-pestaña");

const cajaVisualizacion = document.querySelector(".caja-visualizacion");
const monacoEditor = document.querySelectorAll(".editor");
const visualizador = document.querySelectorAll(".visualizador");

const barra4 = document.querySelector(".barra4");
const ancho_barra4 = document.querySelector(".w-bar");

//btn1
const function_btn1 = document.querySelector(".func-btn1");
const menu_btn1 = document.querySelectorAll(".y");
const btn1_open = document.getElementById("btn1-open");
const btn_open2_barra4 = barra4.querySelector(".btn-open2");
const btn_open2_barra4_svg = btn_open2_barra4.querySelector("svg");

document.querySelector(".txt-adv-btn1").style.display = "none";
const btn1_timeline = document.querySelector(".btn1-timeline");

//btn2
const function_btn2 = document.querySelector(".func-btn2");

//btn3
const function_btn3 = document.querySelector(".func-btn3");

//btn4
const function_btn4 = document.querySelector(".func-btn4");

//btn5
const function_btn5 = document.querySelector(".func-btn5");

//btn6
const function_btn6 = document.querySelector(".func-btn6");
const btns_leng = document.querySelectorAll(".cont-btn6-item");

// IDs únicos
const btn_open_barra4 = document.getElementById("btn-open-barra4");
const btn_open = document.querySelectorAll(".btn-open-inicio");

const opt1_btn_open = document.querySelectorAll(".opt1-btn-open");
const opt2_btn_open = document.querySelectorAll(".opt2-btn-open");

const txt_adv = document.querySelectorAll(".txt-adv");
const txt_adv1 = document.getElementById("txt_adv1");
const txt_adv2 = document.getElementById("txt_adv2");
const txt_adv3 = document.getElementById("txt_adv3");

const btn_min = document.getElementById("btn-min");
const btn_max = document.getElementById("btn-max");
const btn_close = document.getElementById("btn-close");

//----------------------------
// Estado de pestañas
//----------------------------
let tp_pes = null;
let pestanaActiva = null;

//----------------------------
// Crear elemento visualizador en el DOM según tipo
//----------------------------
let tipoSintetizado;
async function crearElementoVisualizador(tipo, pestanaId) {
  if (multimedia === false) {
    const el = document.createElement("div");
    el.className = "visualizador";

    tipoSintetizado = tipo === "n_pes" ? "n-pes" : "editor";
    el.id = `vis-${tipoSintetizado}-${pestanaId}`;

    el.innerHTML =
      tipo === "n_pes"
        ? `
    <div class="caja1-np">
      <div class="logo-np"></div>
      <div class="txt-content1-np">
        <h1 class="h1-np">¿En qué trabajaremos?</h1>
        <h2 class="h2-np" style="font-size:larger;">Alias Studio Code</h2>
        <button class="btn-open-inicio">
          Abrir carpeta
          <div class="btn-open2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              aria-hidden="true" class="svg-btn-open">
              <polyline points="6,10 12,16 18,10" fill="none" stroke="white"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </button>
        <div class="menu-des-btn-open">
          <button class="opt1-btn-open">Abrir archivo</button>
          <div style="height:1px;width:100%;background-color:rgba(21,50,78,0.959)" class="lin-barra4"></div>
          <button class="opt2-btn-open">Abrir proyecto</button>
        </div>
      </div>
    </div>
    <div class="caja2-np">
      <h2 class="txt-h2-files-np">Archivos recientes</h2>
      <div class="cont-arch-np">
        ${Array.from({ length: 8 }, (_, i) => `<p id="a${i + 1}"></p>`).join("")}
      </div>
    </div>
  `
        : `
     <div class="editor" id="editor-${pestanaId}" style="width:100%; height:100%;" data-editor="text"></div>
  `;

    cajaVisualizacion.appendChild(el);

    const pes_editor = document.querySelectorAll(
      '.pestaña[data-tipo="editor"]',
    );
    const total = pes_editor.length;
    window.editorExist = total >= 1 ? true : false;

    if (tipo === "editor") {
      if (window.iniciarEditor) {
        window.iniciarEditor();
      } else {
        await import("./pes/editor/editor.js");
        if (typeof saveEditor === "function") saveEditor();
      }
    }

    return el;
  } else if (multimedia === true) {
    crearMultimedia(multimediaType, window.fileExport, pestanaId);
  } else {
    console.error("Multimedia is not defined. code=1");
  }
}

let pestana_Id;
function getVisualizador(tipo, pestanaId) {
  pestana_Id = pestanaId;
  return crearElementoVisualizador(tipo, pestanaId);
}

var editorMultimedia;
async function crearMultimedia(type, file, id) {
  const { convertFileSrc } = window.__TAURI__.core;
  const ruta = convertFileSrc(file);

  const multimediaDiv = document.createElement("div");
  multimediaDiv.className = "visualizador";
  multimediaDiv.id = `vis-editor-${id}`;
  multimediaDiv.dataset.editor = "media";

  if (type === "video") {
    multimediaDiv.innerHTML = `
      <video disablePictureInPicture controls class="visualizador-media">
        <source src="${ruta}" type="video/mp4">
      </video>
    `;
  } else if (type === "audio") {
    multimediaDiv.innerHTML = `
      <audio controls class="visualizador-media">
        <source src="${ruta}" type="audio/mpeg">
      </audio>
    `;
  } else if (type === "foto") {
    multimediaDiv.innerHTML = `
      <img src="${ruta}" alt="Multimedia ${id}" class="visualizador-media" id="media-img"  draggable=true/>
      
      <div id='maxi-btn'></div>
      <div id="mini-btn"></div>
      <div id="normal-btn"></div>
    `;
  } else {
    multimediaDiv.innerHTML = `<p>Archivo no compatible</p>`;
  }

  cajaVisualizacion.appendChild(multimediaDiv);
  editorMultimedia = multimediaDiv;

  zoomFoto();
}

//Lógica para zoom en fotos
function zoomFoto() {
  let zoom = 1.0;
  const fotoZoom = document.querySelector(".visualizador-media");
  if (!fotoZoom) return;

  document.getElementById("maxi-btn").addEventListener("click", () => {
    if (fotoZoom.style.transform !== `scale(15)`) {
      zoom += 0.5;
      fotoZoom.style.transform = `scale(${zoom})`;
    } else {
      fotoZoom.style.transform = `scale(${zoom})`;
    }
  });

  document.getElementById("mini-btn").addEventListener("click", () => {
    if (fotoZoom.style.transform !== `scale(0)`) {
      zoom -= 0.5;
      fotoZoom.style.transform = `scale(${zoom})`;
    } else {
      fotoZoom.style.transform = `scale(${zoom})`;
    }
  });

  document.getElementById("normal-btn").addEventListener("click", () => {
    zoom = 1.0;
    fotoZoom.style.transform = `scale(${zoom})`;

    fotoZoom.style.top = "50%";
    fotoZoom.style.left = "50%";
    fotoZoom.style.transform = "translate(-50%, -50%)";
  });
}

//----------------------------
// Mostrar visualizador con animación
//----------------------------
function mostrarVisualizador(tipo, pestanaId) {
  const tipoSint = tipo === "n_pes" ? "n-pes" : "editor";
  const element = document.getElementById(`vis-${tipoSint}-${pestanaId}`);
  if (!element) return;

  element.style.display = "flex";
  element.style.opacity = 0;

  anime({
    targets: element,
    duration: 200,
    opacity: [0, 1],
    easing: "easeInOutQuad",
    complete: () => {
      const editorEl = element.querySelector(".editor");
      if (editorEl && editorEl.id && window.editorInstances?.[editorEl.id]) {
        window.editorInstances[editorEl.id].layout();
      }
    },
  });
  actualizarEditor(tp_pes, element.dataset.editor);
}

//----------------------------
// Ocultar visualizador con animación
//----------------------------
function ocultarVisualizador(tipo, pestanaId) {
  const tipoSint = tipo === "n_pes" ? "n-pes" : "editor";
  const element = document.getElementById(`vis-${tipoSint}-${pestanaId}`);
  if (!element) return;

  anime({
    targets: element,
    duration: 200,
    opacity: [1, 0],
    easing: "easeInOutQuad",
    complete: () => {
      element.style.display = "none";
      element.remove();
      if (tipoSint === "editor") return;
      const total = element.length;
      window.editorExist = total >= 1 ? true : false;
    },
  });
  actualizarEditor(tp_pes, element.dataset.editor);
}

//----------------------------
// Actualizar visualizador
//----------------------------
function actualizarVisualizador(animar = false) {
  const hayPestañas = document.querySelectorAll(".pestaña").length > 0;
  if (!hayPestañas || !pestanaActiva) {
    document.querySelectorAll(".visualizador").forEach((vis) => {
      vis.style.display = "none";
      vis.style.opacity = 0;
    });
    return;
  }

  const id = pestanaActiva.dataset.id;
  const tipo = pestanaActiva.dataset.tipo;
  const tipoSint = tipo === "n_pes" ? "n-pes" : "editor";
  const idActivo = `vis-${tipoSint}-${id}`;

  document.querySelectorAll(".visualizador").forEach((vis) => {
    if (vis.id !== idActivo) {
      vis.style.display = "none";
      vis.style.opacity = 0;
    }
  });

  if (animar) {
    mostrarVisualizador(tipo, id);
  } else {
    const el = document.getElementById(idActivo);
    if (el) {
      el.style.display = "flex";
      el.style.opacity = 1;
    }
  }
  const element = document.getElementById(idActivo).dataset.editor;
  actualizarEditor(tp_pes, element);
}

function actualizarEditor(tipo = "", data_editor = "text") {
  if (tipo === "editor" && data_editor === "text") {
    document.querySelector(".cont-btn6").style.display = "flex";
    document.getElementById("txt_adv6").style.display = "none";
    InfoCode.style.display = "flex";
  } else {
    document.querySelector(".cont-btn6").style.display = "none";
    document.getElementById("txt_adv6").style.display = "flex";
    InfoCode.style.display = "none";
  }

  if (tipo === "editor" && pestanaActiva.dataset.ext) {
    lenguajeIcon(pestanaActiva.dataset.ext, "icon");
  } else {
    lenguajeIcon("", "icon");
  }

  const pes_editor = document.querySelectorAll('.pestaña[data-tipo="editor"]');
  const total = pes_editor.length;
  window.editorExist = total >= 1 ? true : false;
}

//----------------------------
// Seleccionar pestaña activa
//----------------------------
function seleccionarPestana(pestana) {
  document
    .querySelectorAll(".pestaña")
    .forEach((p) => p.classList.remove("activa"));

  pestana.classList.add("activa");
  pestanaActiva = pestana;
  tp_pes = pestana.dataset.tipo;

  actualizarVisualizador(false);
}

//----------------------------
// Crear nueva pestaña
//----------------------------
let pestanaCounter = 0;

function crearNuevaPestana(tp, name = "Editor", icon) {
  const pestanaId = ++pestanaCounter;
  const esPrimera = document.querySelectorAll(".pestaña").length === 0;

  const nuevaPestana = document.createElement("div");
  nuevaPestana.className = "pestaña";
  nuevaPestana.dataset.id = pestanaId;
  nuevaPestana.dataset.tipo = tp;
  nuevaPestana.dataset.ext = icon;
  nuevaPestana.dataset.name = name;

  const btnCerrar = document.createElement("div");
  btnCerrar.className = "BtnPestaña";

  const texto = document.createElement("span");
  texto.textContent = tp === "n_pes" ? "Nueva Pestaña" : name;

  const icono = document.createElement("div");
  icono.className = "iconoPestaña";

  let iconoUrl;
  if (name === "Editor") {
    iconoUrl = "url('img/Icon.png')";
  } else if (icon) {
    iconoUrl = `url('img/Lenguajes/${icon}')`;
  } else {
    iconoUrl = "url('img/Lenguaje.svg')";
  }
  icono.style.backgroundImage = iconoUrl;

  nuevaPestana.appendChild(btnCerrar);
  nuevaPestana.appendChild(texto);
  nuevaPestana.appendChild(icono);

  barra3.insertBefore(nuevaPestana, margen2);

  getVisualizador(tp, pestanaId);

  pestanaActiva = nuevaPestana;
  tp_pes = tp;
  document
    .querySelectorAll(".pestaña")
    .forEach((p) => p.classList.remove("activa"));
  nuevaPestana.classList.add("activa");

  actualizarEditor(tp_pes);
  editorList();
  actualizarVisualizador(esPrimera);

  nuevaPestana.addEventListener("click", () =>
    seleccionarPestana(nuevaPestana),
  );

  anime({
    targets: nuevaPestana,
    translateX: [-(nuevaPestana.offsetWidth + 50), 0],
    opacity: [0, 1],
    duration: 400,
    easing: "easeInOutQuad",
  });

  btnCerrar.addEventListener("click", (e) => {
    e.stopPropagation();
    eliminarPestana(nuevaPestana);
  });
}

//----------------------------
// Eliminar una pestaña concreta
//----------------------------
async function eliminarPestana(pestana) {
  const eraActiva = pestana === pestanaActiva;
  const tipo = pestana.dataset.tipo;
  const id = pestana.dataset.id;
  const pestañas = document.querySelectorAll(".pestaña");

  if (tipo === "editor") {
    const btn = document.querySelector(".BtnPestaña.unsaved");
    if (btn) {
      const vis = document.getElementById(`editor-${id}`);
      const instancia_editor = vis
        ? monaco.editor.getModels().find((m) => m.uri.path.includes(id))
        : null;

      const cm = await confirm(
        "Los cambios no se guardarán si cierras ahora. ¿Desea guardarlos?",
      );
      if (cm && instancia_editor) {
        statusBtnsEliminadores("save", instancia_editor);
      }
    }
  }

  if (eraActiva) {
    const restantes = [...pestañas].filter((p) => p !== pestana);
    if (restantes.length > 0) {
      seleccionarPestana(restantes[restantes.length - 1]);
    } else {
      pestanaActiva = null;
      tp_pes = null;
    }
  }

  ocultarVisualizador(tipo, id);

  anime({
    targets: pestana,
    translateX: -(pestana.offsetWidth + 50),
    opacity: [1, 0],
    duration: 400,
    easing: "easeInOutQuad",
    complete: () => {
      pestana.remove();
      editorList();

      const restantes = document.querySelectorAll(".pestaña");
      if (restantes.length === 0) {
        actualizarVisualizador(true);
      }

      anime({
        targets: restantes,
        translateX: -pestana.offsetWidth,
        duration: 400,
        easing: "easeInOutQuad",
      });
    },
  });
}

//----------------------------
// Evento crear pestaña
//----------------------------
crearPestana.addEventListener("click", () => crearNuevaPestana("n_pes"));

//----------------------------
// Atajos de teclado
//----------------------------
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && !e.altKey && e.key.toLowerCase() === "t") {
    e.preventDefault();
    crearNuevaPestana("n_pes");
  }
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "t") {
    e.preventDefault();
    openFile();
  }
  if (e.ctrlKey && e.key.toLowerCase() === "w") {
    e.preventDefault();
    e.stopPropagation();
    if (pestanaActiva) eliminarPestana(pestanaActiva);
  }
  if (e.ctrlKey && !e.altKey) {
    const num = parseInt(e.key);
    if (!isNaN(num) && num >= 1) {
      e.preventDefault();
      const pestañas = document.querySelectorAll(".pestaña");
      const pestana = pestañas[num - 1];
      if (pestana) seleccionarPestana(pestana);
    }
  }
  if (e.ctrlKey && e.key.toLowerCase() === "s") {
    statusBtnsEliminadores("save");
  }
  if (e.ctrlKey && e.key.toLowerCase() === "c") {
    e.preventDefault();
    openFolder();
  }
});

//----------------------------
// Limpiar todas las pestañas
//----------------------------
let animacionLimpiar = false;

limpiarPestana.addEventListener("click", () => {
  if (animacionLimpiar) return;
  animacionLimpiar = true;

  const pestañas = document.querySelectorAll(".pestaña");
  const visualizador = document.querySelectorAll(".visualizador");
  visualizador.forEach((el) => {
    anime({
      targets: el,
      duration: 400,
      opacity: [1, 0],
      complete: () => {
        el.remove();
        editorList();
      },
    });
  });

  anime({
    targets: pestañas,
    translateX: (p) => -(p.offsetWidth + 50),
    opacity: 0,
    duration: 400,
    easing: "easeInOutQuad",
    complete: () => {
      pestañas.forEach((p) => p.remove());
      pestanaActiva = null;
      tp_pes = null;
      animacionLimpiar = false;
      actualizarVisualizador(true);
    },
  });
});

//----------------------
// Sistema barra 4 — resize
//----------------------
let mouse_barra4 = false;

ancho_barra4.addEventListener("mousedown", () => {
  mouse_barra4 = true;
});

document.addEventListener("mousemove", (e) => {
  if (!mouse_barra4) return;
  let nuevoAncho = e.clientX - barra4.offsetLeft;
  if (nuevoAncho < 120) nuevoAncho = 120;
  if (nuevoAncho > window.innerWidth * 0.8)
    nuevoAncho = window.innerWidth * 0.8;
  barra4.style.width = nuevoAncho + "px";
});

document.addEventListener("mouseup", () => {
  mouse_barra4 = false;
});

//----------------------
// Barra lateral (estilo VS Code)
//----------------------
const CLAVES_PANEL = [
  "archivos",
  "busqueda",
  "gh",
  "ia",
  "complementos",
  "lenguaje",
];
const elementosPaneles = [Archivos, Busqueda, GH, IA, Complementos, Lenguaje];

let barra4_abierta = false;
let panelActivo = null;
let animando = false;

todos_btn_barra1.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    if (animando) return;
    const panelClickado = CLAVES_PANEL[index];
    if (!barra4_abierta) {
      abrirBarra4(panelClickado);
    } else if (panelActivo === panelClickado) {
      cerrarBarra4();
    } else {
      cambiarPanel(panelClickado);
    }
  });
});

elementosPaneles.forEach((el, index) => {
  el.addEventListener("click", () => {
    if (animando) return;
    cambiarPanel(CLAVES_PANEL[index]);
  });
});

function abrirBarra4(panel) {
  animando = true;
  panelActivo = panel;
  barra4.style.display = "flex";
  actualizarUI();

  anime({
    targets: barra4,
    duration: 400,
    opacity: [0, 1],
    translateX: [-150, 0],
    easing: "easeInOutQuad",
    complete: () => {
      barra4_abierta = true;
      animando = false;
    },
  });
}

function cerrarBarra4() {
  animando = true;

  anime({
    targets: barra4,
    duration: 400,
    opacity: [1, 0],
    translateX: -150,
    easing: "easeInOutQuad",
    complete: () => {
      barra4.style.display = "none";
      barra4_abierta = false;
      panelActivo = null;
      animando = false;
      actualizarUI();
    },
  });
}

function cambiarPanel(panel) {
  panelActivo = panel;
  actualizarUI();
}

function actualizarUI() {
  function_btn1.style.display = panelActivo === "archivos" ? "flex" : "none";
  function_btn2.style.display = panelActivo === "busqueda" ? "flex" : "none";
  function_btn3.style.display = panelActivo === "gh" ? "flex" : "none";
  function_btn4.style.display = panelActivo === "ia" ? "flex" : "none";
  function_btn5.style.display =
    panelActivo === "complementos" ? "flex" : "none";
  function_btn6.style.display = panelActivo === "lenguaje" ? "flex" : "none";
  elementosPaneles.forEach((el, index) => {
    el.classList.toggle(
      "panel-activo",
      CLAVES_PANEL[index] === panelActivo && barra4.style.display === "flex",
    );
  });
}

//------------------------
// Menu desplegable btn 1
//------------------------
function menu_btn1_func() {
  menu_btn1.forEach((btn1) => {
    let abierto = false;

    btn1.addEventListener("click", () => {
      const contenedor = btn1.closest(".btn1-c");
      if (!contenedor) return;

      const txt = contenedor.querySelector(".txt-adv");
      const caja_txt = contenedor.querySelector(".txt-adv-btn1");
      const btnOpen = contenedor.querySelector("#btn1-open-barra4");

      const editorLists = [...contenedor.querySelectorAll(".editorList")];

      const file_schema = [...contenedor.querySelectorAll(".file-schema-item")];

      const folder_schema = [
        ...contenedor.querySelectorAll(".folder-schema-item"),
      ];

      const timeline_items = [
        ...document.querySelectorAll(".btn1-timeline-item"),
      ];

      if (!txt) return;

      if (!abierto) {
        txt.style.display = "flex";

        if (caja_txt) {
          caja_txt.style.display = "block";
        }

        btn1_timeline.style.display = "flex";

        const mostrarEditors =
          btn1.id === "y_adv1" && window.editorExist && editorLists.length > 0;

        const mostrarSchema =
          btn1.id === "y_adv2" &&
          (file_schema.length > 0 || folder_schema.length > 0);

        const mostrarTimeline =
          btn1.id === "y_adv3" && timeline_items.length >= 1;

        // Ocultar TODO primero
        editorLists.forEach((el) => {
          el.style.display = "none";
        });

        [...file_schema, ...folder_schema].forEach((el) => {
          el.style.display = "none";
        });

        btn1_timeline.style.display = "none";

        txt_adv1.style.display =
          btn1.id === "y_adv1" && !mostrarEditors ? "flex" : "none";

        txt_adv2.style.display =
          btn1.id === "y_adv2" && !mostrarSchema ? "flex" : "none";

        txt_adv3.style.display =
          btn1.id === "y_adv3" && !mostrarTimeline ? "flex" : "none";

        let targets = txt;

        if (mostrarEditors) {
          editorLists.forEach((el) => {
            el.style.display = "flex";
            el.style.opacity = "1";
          });

          targets = editorLists;
        }

        if (mostrarSchema) {
          [...file_schema, ...folder_schema].forEach((el) => {
            el.style.display = "flex";
            el.style.opacity = "1";
          });

          targets = [...file_schema, ...folder_schema];
        }

        if (mostrarTimeline) {
          btn1_timeline.style.display = "flex";

          [...timeline_items].forEach((el) => {
            el.style.display = "flex";
            el.style.opacity = "1";
          });

          targets = [...timeline_items];
        }

        if (btnOpen) {
          btnOpen.style.display = mostrarSchema ? "none" : "flex";
          btn1_open.style.display =
            btnOpen.style.display === "flex" &&
            btn_open2_barra4_svg.style.transform === "rotate(0deg)"
              ? "flex"
              : "none";
        }

        anime.remove(btn1);
        anime.remove(targets);

        anime({
          targets: btn1,
          rotate: 180,
          duration: 200,
          easing: "easeInOutQuad",
        });

        anime({
          targets,
          opacity: [0, 1],
          translateY: [-10, 0],
          duration: 200,
          easing: "easeOutQuad",
        });

        abierto = true;
      } else {
        anime({
          targets: btn1,
          rotate: 0,
          duration: 200,
          easing: "easeInOutQuad",
        });

        anime({
          targets: [
            txt,
            ...editorLists,
            ...file_schema,
            ...folder_schema,
            ...timeline_items,
          ],
          opacity: [1, 0],
          translateY: [0, -10],
          duration: 200,
          easing: "easeInQuad",
          complete: () => {
            txt.style.display = "none";

            btn1_timeline.style.display = "none";

            if (caja_txt) {
              caja_txt.style.display = "none";
            }

            editorLists.forEach((el) => {
              el.style.display = "none";
            });

            [...file_schema, ...folder_schema].forEach((el) => {
              el.style.display = "none";
            });

            txt_adv1.style.display = "none";
            txt_adv2.style.display = "none";

            if (btnOpen) {
              btnOpen.style.display = "none";
              btn1_open.style.display = "none";
            }
          },
        });

        abierto = false;
      }
    });
  });
}
menu_btn1_func();

//-------------------------
// Menu desplegable btn open
//-------------------------

// Btn barra 4
btn_open2_barra4.addEventListener("click", (e) => {
  e.stopPropagation();

  const contenedor = btn_open2_barra4.closest(
    ".txt-adv-btn1, .txt-content1-np",
  );
  const menu = contenedor?.querySelector(".menu-des-btn-open");

  if (!menu || !btn_open2_barra4_svg) return;

  const isVisible = menu.style.display === "flex";

  if (!isVisible) {
    menu.style.display = "flex";
    anime({
      targets: btn_open2_barra4_svg,
      rotate: [180, 0],
      duration: 310,
      easing: "easeInOutQuad",
    });
    anime({
      targets: menu,
      translateY: [-50, 0],
      opacity: [0, 1],
      duration: 300,
      easing: "easeInOutQuad",
    });
  } else {
    anime({
      targets: btn_open2_barra4_svg,
      rotate: [0, 180],
      duration: 310,
      easing: "easeInOutQuad",
    });
    anime({
      targets: menu,
      translateY: [0, -50],
      opacity: [1, 0],
      duration: 300,
      easing: "easeInOutQuad",
      complete: () => {
        menu.style.display = "none";
      },
    });
  }
});

// Btns visualizador (dinámicos) — delegación en document
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-open2");
  if (!btn) return;

  e.stopPropagation();

  const btnPadre = btn.closest("button");
  const contenedor = btnPadre?.parentElement;
  const menu = contenedor?.querySelector(":scope > .menu-des-btn-open");
  const svg = btn.querySelector(".svg-btn-open");
  if (!menu || !svg) return;

  const isVisible =
    parseFloat(menu.style.opacity) > 0 ||
    (menu.style.display === "flex" && menu.style.opacity !== "0");

  if (!isVisible) {
    menu.style.display = "flex";
    anime({
      targets: svg,
      rotate: [180, 0],
      duration: 310,
      easing: "easeInOutQuad",
    });
    anime({
      targets: menu,
      translateY: [-50, 0],
      opacity: [0, 1],
      duration: 300,
      easing: "easeInOutQuad",
    });
  } else {
    anime({
      targets: svg,
      rotate: [0, 180],
      duration: 310,
      easing: "easeInOutQuad",
    });
    anime({
      targets: menu,
      translateY: [0, -50],
      opacity: [1, 0],
      duration: 300,
      easing: "easeInOutQuad",
      complete: () => {
        menu.style.display = "none";
        menu.style.opacity = "0";
      },
    });
  }
});

//-------------------------
// Sistema cambio nombre de la selección
//-------------------------
function actualizarBoton(btn, nuevoTexto) {
  if (!btn) return;
  const nodoTexto = [...btn.childNodes].find(
    (n) => n.nodeType === Node.TEXT_NODE,
  );
  if (nodoTexto) nodoTexto.textContent = nuevoTexto;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".opt1-btn-open, .opt2-btn-open");
  if (!btn) return;

  e.stopPropagation();

  const textoAccion = btn.firstChild.textContent.trim();

  const contenedor = btn.closest(".txt-adv-btn1, .txt-content1-np");
  if (!contenedor) return;

  const botonRelacionado = contenedor.querySelector(
    "#btn1-open-barra4, .btn-open-inicio",
  );
  if (!botonRelacionado) return;

  const nodoTextoBtnRel = [...botonRelacionado.childNodes].find(
    (n) => n.nodeType === Node.TEXT_NODE,
  );
  btn.firstChild.textContent = nodoTextoBtnRel
    ? nodoTextoBtnRel.textContent.trim()
    : "";
  actualizarBoton(botonRelacionado, textoAccion);

  if (textoAccion === "Abrir archivo") {
    openFile();
  } else if (textoAccion === "Abrir carpeta") {
    openFolder();
  } else if (textoAccion === "Abrir proyecto") {
    // futuro
  } else {
    console.error("code=1: Opción desconocida:", textoAccion);
  }
});

document.addEventListener("click", (e) => {
  const botonRelacionado = e.target.closest(
    "#btn1-open-barra4, .btn-open-inicio",
  );
  if (!botonRelacionado) return;
  if (e.target.closest(".btn-open2")) return;

  e.stopPropagation();

  const nodoTexto = [...botonRelacionado.childNodes].find(
    (n) => n.nodeType === Node.TEXT_NODE,
  );
  const textoAccion = nodoTexto ? nodoTexto.textContent.trim() : "";

  if (textoAccion === "Abrir archivo") {
    openFile();
  } else if (textoAccion === "Abrir carpeta") {
    openFolder();
  } else if (textoAccion === "Abrir proyecto") {
    // futuro
  } else {
    console.error("code=1: Opción desconocida:", textoAccion);
  }
});

/*
 * File Sistem Update (useing fs)
 */

//Code
var multimedia = false;
var multimediaType;

async function openFile(icon, ruta) {
  if (icon === "so") {
    const file = ruta;
    if (!file) return;
    window.fileExport = file;
    let fileName = await basename(file);

    if (fileName.length > 11) {
      fileName = fileName.slice(0, 7) + "...";
    }

    const fileType = await extname(file);
    const Name = await basename(file);
    let iconResult = lenguajeIcon(fileType, "", Name);

    crearNuevaPestana("editor", fileName, iconResult);
  } else if (icon !== "icon") {
    const file = await open({
      directory: false,
      multiple: false,
      title: "Select file, plese.",
    });
    if (!file) return;
    window.fileExport = file;
    let fileName = await basename(file);

    if (fileName.length > 11) {
      fileName = fileName.slice(0, 7) + "...";
    }

    let fileType;
    try {
      fileType = await extname(file);
    } catch (err) {
      fileType = ".txt";
    }
    const Name = await basename(file);
    let iconResult = lenguajeIcon(fileType, "", Name);

    crearNuevaPestana("editor", fileName, iconResult);
  } else if (icon === "icon") {
    lenguajeIcon("", "icon");
  }
}

function lenguajeIcon(terminacion, i, name) {
  const icon_barra1 = document.getElementById("langIcon");
  let icon = iconDATA(terminacion, name);

  if (
    !icon &&
    typeof terminacion === "string" &&
    terminacion.toLowerCase().endsWith(".svg")
  ) {
    icon = terminacion;
  }

  if (icon) {
    icon_barra1.src = `img/Lenguajes/${icon}`;
    return icon;
  } else if (i === "icon") {
    icon_barra1.src = "img/Lenguaje.svg";
    return null;
  }
}

function iconDATA(terminacion, name) {
  const iconMap = [
    { terminacion: "js", svg: "js.svg" },
    { terminacion: "javascript", svg: "js.svg" },
    { terminacion: "html", svg: "html.svg" },
    { terminacion: "css", svg: "css.svg" },
    { terminacion: "python", svg: "python.svg" },
    { terminacion: "py", svg: "python.svg" },
    { terminacion: "rs", svg: "rust.svg" },
    { terminacion: "ts", svg: "typescript.svg" },
    { terminacion: "json", svg: "json.svg" },
    { terminacion: "jsonl", svg: "json.svg" },
    { terminacion: "jsonc", svg: "json.svg" },
    { terminacion: "cs", svg: "csharp.svg" },
    { terminacion: "cpp", svg: "cpp.svg" },
    { terminacion: "c", svg: "c.svg" },
    { terminacion: "txt", svg: "text.svg" },
    { terminacion: "docx", svg: "document.svg" },
    { terminacion: "odt", svg: "document.svg" },
    { terminacion: "vue", svg: "vue.svg" },
    { terminacion: "apk", svg: "android.svg" },
    { terminacion: "kt", svg: "android.svg" },
    { terminacion: "jsx", svg: "react.svg" },
    { terminacion: "tsx", svg: "react.svg" },
    { terminacion: "rct", svg: "react.svg" },
    { terminacion: "exe", svg: "exe.svg" },
    { terminacion: "msi", svg: "exe.svg" },
    { terminacion: "bat", svg: "console.svg" },
    { terminacion: "batch", svg: "console.svg" },
    { terminacion: "cmd", svg: "console.svg" },
    { terminacion: "vbs", svg: "console.svg" },
    { terminacion: "go", svg: "go.svg" },
    { terminacion: "md", svg: "markdown.svg" },
    { terminacion: "mk", svg: "markfile.svg" },
    { terminacion: "mak", svg: "markfile.svg" },
    { terminacion: "ng", svg: "angular.svg" },
    { terminacion: "angular", svg: "angular.svg" },
    { terminacion: "applescript", svg: "applescript.svg" },
    { terminacion: "scpt", svg: "applescript.svg" },
    { terminacion: "gs", svg: "apps-script.svg" },
    { terminacion: "gscript", svg: "apps-script.svg" },
    { terminacion: "arch", svg: "architecture.svg" },
    { terminacion: "architecture", svg: "architecture.svg" },
    { terminacion: "adoc", svg: "asciidoc.svg" },
    { terminacion: "asciidoc", svg: "asciidoc.svg" },
    { terminacion: "asm", svg: "assembly.svg" },
    { terminacion: "s", svg: "assembly.svg" },
    { terminacion: "mp3", svg: "audio.svg" },
    { terminacion: "m4a", svg: "audio.svg" },
    { terminacion: "wav", svg: "audio.svg" },
    { terminacion: "flac", svg: "audio.svg" },
    { terminacion: "ogg", svg: "audio.svg" },
    { terminacion: "mp4", svg: "video.svg" },
    { terminacion: "avi", svg: "video.svg" },
    { terminacion: "mkv", svg: "video.svg" },
    { terminacion: "mov", svg: "video.svg" },
    { terminacion: "wmv", svg: "video.svg" },
    { terminacion: "aac", svg: "audio.svg" },
    { terminacion: "azure", svg: "azure.svg" },
    { terminacion: "bib", svg: "bibliography.svg" },
    { terminacion: "bibtex", svg: "bibliography.svg" },
    { terminacion: "bst", svg: "bibtex-style.svg" },
    { terminacion: "c3", svg: "c3.svg" },
    { terminacion: "crt", svg: "certificate.svg" },
    { terminacion: "cert", svg: "certificate.svg" },
    { terminacion: "changelog", svg: "changelog.svg" },
    { terminacion: "changes", svg: "changelog.svg" },
    { terminacion: "chrome", svg: "chrome.svg" },
    { terminacion: "claude", svg: "claude.svg" },
    { terminacion: "clj", svg: "clojure.svg" },
    { terminacion: "clojure", svg: "clojure.svg" },
    { terminacion: "edn", svg: "clojure.svg" },
    { terminacion: "coffee", svg: "coffee.svg" },
    { terminacion: "coffeescript", svg: "coffee.svg" },
    { terminacion: "command", svg: "command.svg" },
    { terminacion: "cz", svg: "commitizen.svg" },
    { terminacion: "commitlint", svg: "commitlint.svg" },
    { terminacion: "cue", svg: "cue.svg" },
    { terminacion: "cursor", svg: "cursor.svg" },
    { terminacion: "db", svg: "database.svg" },
    { terminacion: "sqlite", svg: "database.svg" },
    { terminacion: "sql", svg: "database.svg" },
    { terminacion: "deno", svg: "deno.svg" },
    { terminacion: "denoscript", svg: "deno.svg" },
    { terminacion: "deps", svg: "dependencies-update.svg" },
    { terminacion: "dll", svg: "dll.svg" },
    { terminacion: "lib", svg: "dll.svg" },
    { terminacion: "dockerfile", svg: "docker.svg" },
    { terminacion: "docker", svg: "docker.svg" },
    { terminacion: "esbuild", svg: "esbuild.svg" },
    { terminacion: "eslintrc", svg: "eslint.svg" },
    { terminacion: "gml", svg: "gamemaker.svg" },
    { terminacion: "gamemaker", svg: "gamemaker.svg" },
    { terminacion: "gemini", svg: "gemini-ai.svg" },
    { terminacion: "gitignore", svg: "git.svg" },
    { terminacion: "gitkeep", svg: "git.svg" },
    { terminacion: "gitattributes", svg: "git.svg" },
    { terminacion: "yml", svg: "github-actions-workflow.svg" },
    { terminacion: "yaml", svg: "github-actions-workflow.svg" },
    { terminacion: "gitlab", svg: "gitlab.svg" },
    { terminacion: "gd", svg: "godot.svg" },
    { terminacion: "gdscript", svg: "godot.svg" },
    { terminacion: "hex", svg: "hex.svg" },
    { terminacion: "http", svg: "http.svg" },
    { terminacion: "rest", svg: "http.svg" },
    { terminacion: "png", svg: "image.svg" },
    { terminacion: "jpg", svg: "image.svg" },
    { terminacion: "jpeg", svg: "image.svg" },
    { terminacion: "gif", svg: "image.svg" },
    { terminacion: "webp", svg: "image.svg" },
    { terminacion: "svg", svg: "image.svg" },
    { terminacion: "jar", svg: "jar.svg" },
    { terminacion: "java", svg: "java.svg" },
    { terminacion: "jl", svg: "julia.svg" },
    { terminacion: "julia", svg: "julia.svg" },
    { terminacion: "lib", svg: "lib.svg" },
    { terminacion: "a", svg: "lib.svg" },
    { terminacion: "so", svg: "lib.svg" },
    { terminacion: "lua", svg: "lua.svg" },
    { terminacion: "makefile", svg: "makefile.svg" },
    { terminacion: "make", svg: "makefile.svg" },
    { terminacion: "markdown", svg: "markdown.svg" },
    { terminacion: "mdown", svg: "markdown.svg" },
    { terminacion: "mcfunction", svg: "minecraft.svg" },
    { terminacion: "mcaddon", svg: "minecraft.svg" },
    { terminacion: "ps1", svg: "powershell.svg" },
    { terminacion: "ps", svg: "powershell.svg" },
    { terminacion: "powershell", svg: "powershell.svg" },
  ];

  const nameMap = [
    { name: "authors", svg: "authors.svg" },
    { name: "license", svg: "license.svg" },
    { name: "LICENSE", svg: "license.svg" },
    { name: "certificate", svg: "certificate.svg" },
    { name: "readme", svg: "readme.svg" },
    { name: "README", svg: "readme.svg" },
  ];

  const multimediaMap = [
    { audio: "mp3" },
    { audio: "acc" },
    { audio: "wav" },
    { audio: "flac" },
    { audio: "m4a" },
    { video: "mp4" },
    { video: "mov" },
    { video: "avi" },
    { foto: "png" },
    { foto: "jpg" },
    { foto: "ico" },
    { foto: "svg" },
    { foto: "gif" },
  ];

  if (multimediaMap.find((el) => el.audio === terminacion)) {
    multimedia = true;
    multimediaType = "audio";
  } else if (multimediaMap.find((el) => el.video === terminacion)) {
    multimedia = true;
    multimediaType = "video";
  } else if (multimediaMap.find((el) => el.foto === terminacion)) {
    multimedia = true;
    multimediaType = "foto";
  } else {
    multimedia = false;
  }

  const normalizedName = typeof name === "string" ? name.toLowerCase() : "";
  const normalizedName2 = normalizedName.split(".")[0];
  const nameMatch = nameMap.find((item) => item.name === normalizedName2);

  if (nameMatch) {
    return nameMatch.svg;
  } else {
    const normalizedExt =
      typeof terminacion === "string"
        ? terminacion.replace(/^\./, "").toLowerCase()
        : "";
    const extMatch = iconMap.find((item) => item.terminacion === normalizedExt);
    if (extMatch) {
      return extMatch.svg;
    } else {
      return null;
    }
  }
}

function editorList() {
  const pes_editor = document.querySelectorAll('.pestaña[data-tipo="editor"]');
  const total = pes_editor.length;
  window.editorExist = total >= 1 ? true : false;

  // Crear editorList para las pestañas que aún no la tienen
  pes_editor.forEach((pes) => {
    const icon = pes.dataset.ext;
    const id = pes.dataset.id;
    const name = pes.dataset.name || "";
    crearEditorList(total, icon, id, name);
  });

  // Eliminar editorList huérfanas (pestaña ya no existe en el DOM)
  document.querySelectorAll(".editorList").forEach((el) => {
    const id = el.id.replace("editorList-", "");
    if (!document.querySelector(`.pestaña[data-id="${id}"]`)) {
      eliminarEditorList(id);
    }
  });
}

let editorList_btn = document.querySelectorAll(".editorList-btn");
let editorList_btn_img = document.querySelectorAll(".editorList-btn-img");
async function crearEditorList(total, icon, id, name = "") {
  window.editorExist = total >= 1 ? true : false;
  if (window.editorExist === false) return;
  if (document.getElementById(`editorList-${id}`)) return;

  // Usar el nombre ya truncado de la pestaña; fallback a fileExport si está vacío
  let fileName = name;
  if (!fileName && window.fileExport) {
    fileName = String(await basename(String(window.fileExport)));
  }
  if ([...fileName].length > 13) {
    fileName = fileName.slice(0, 13) + "...";
  }

  const editorList = document.createElement("div");
  editorList.className = "editorList";
  editorList.id = `editorList-${id}`;
  editorList.style.display = "none";

  editorList.innerHTML = `
    <button class='editorList-btn'>
      <img class='editorList-btn-img' src='img/Clear.svg'>
    </button>
    <p>${fileName}</p>
    <img src='img/Lenguajes/${icon}' class='img'>
  `;

  const btn1_c = document.getElementById("y_adv1").closest(".btn1-c");
  const c_btn1 = document.getElementById("y_adv1").closest(".c-btn1");
  btn1_c.insertBefore(editorList, c_btn1.nextSibling);

  editorList_btn = document.querySelectorAll(".editorList-btn");
  editorList_btn_img = document.querySelectorAll(".editorList-btn-img");
}

function eliminarEditorList(id) {
  const editorList = document.getElementById(`editorList-${id}`);
  if (!editorList) return;
  anime({
    targets: editorList,
    opacity: [1, 0],
    translateX: [0, -200],
    duration: 250,
    easing: "easeInOutQuad",
    complete: () => {
      editorList.remove();
      window.editorExist =
        document.querySelectorAll('.pestaña[data-tipo="editor"]').length >= 1
          ? true
          : false;
    },
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".editorList-btn, .editorList-btn-img");
  if (!btn) return;

  e.stopPropagation();

  const editorList = btn.closest(".editorList");
  if (!editorList) return;

  const id = editorList.id.replace("editorList-", "");

  const pestana = document.querySelector(`.pestaña[data-id="${id}"]`);

  if (pestana) {
    eliminarPestana(pestana);
  }
  eliminarEditorList(id);
  menu_btn1_func(true);
});

async function saveEditor() {
  const editorInstancia = window.editorActual;
  if (!editorInstancia) return;

  editorInstancia.onDidChangeModelContent((e) => {
    statusBtnsEliminadores(true);
  });
}

async function statusBtnsEliminadores(status, vis) {
  const editorInstancia = !vis ? window.editorActual : vis;

  const pes = pestanaActiva;
  if (!pes) return;

  const id = pes.dataset.id;
  const btn_pes = pes.querySelector(".BtnPestaña");

  const list = document.getElementById(`editorList-${id}`);
  const btn_list = list?.querySelector(".editorList-btn-img");

  const btns = [btn_pes, btn_list].filter(Boolean);

  if (status === true) {
    btns.forEach((e) => e.classList.add("unsaved"));
  } else if (status === "save") {
    if (!editorInstancia) return;

    const file = window.fileExport;
    const newFile = await writeTextFile(file, editorInstancia.getValue(), {
      baseDir: BaseDirectory.AppLocalData,
    });

    btns.forEach((e) => e.classList.remove("unsaved"));

    //Time line caché

    const nombreArchivo = `${Math.floor(Math.random() * 9999999)}_${Date.now()}.txt`;

    const rutaSubcarpetas = `Users/timeline`;

    await mkdir(rutaSubcarpetas, {
      baseDir: BaseDirectory.AppLocalData,
      recursive: true,
    });

    const archivo = await create(`${rutaSubcarpetas}/${nombreArchivo}`, {
      baseDir: BaseDirectory.AppLocalData,
    });

    await archivo.write(new TextEncoder().encode(editorInstancia.getValue()));
    await archivo.close();

    timeline_manager("create", nombreArchivo);
  } else if (status === false) {
    btns.forEach((e) => e.classList.remove("unsaved"));
  }
}

//Timeline gestor
let timeline_id = 0;

async function timeline_manager(mode, backup) {
  const btn1_timeline_items = document.querySelectorAll(".btn1-timeline-item");

  if (mode === "create") {
    //Time & ruta
    const ruta_para = await join(await AppTimelineData, backup);
    let timeclock = Number(
      String(await basename(ruta_para, ".txt")).split("_")[1],
    );

    //Crear elemento
    timeline_id++;
    const timeline_obj = document.createElement("div");
    timeline_obj.className = "btn1-timeline-item";
    timeline_obj.id = `timeline-item-${timeline_id}`;
    timeline_obj.dataset.ruta = ruta_para;
    timeline_obj.innerHTML = `
      <img src="./img/circle.svg">
      <p class='btn1-timeline-item-txt'>Archivo guardado</p>
      <p class='btn1-timeline-item-time' data-time='${timeclock}'>${timeline_manager("time")}</p>
    `;
    timeline_obj.addEventListener("click", () => {
      openFile("so", ruta_para);
    });
    btn1_timeline.appendChild(timeline_obj);
    timeline_manager("time");

    if (btn1_timeline_items.length < 15) return;
    const ultimo = btn1_timeline_items[btn1_timeline_items.length - 1];
    const ruta = ultimo.dataset.ruta;
    ultimo.remove();
    await remove(ruta);
  } else if (mode === "load") {
    const ruta = await AppTimelineData;
    const dir = await readDir(ruta, { baseDir: BaseDirectory.AppLocalData });
    for (const fol of dir) {
      if (!fol.isFile) continue;
      timeline_manager("create", fol.name);
    }
  } else if (mode === "time") {
    document.querySelectorAll(".btn1-timeline-item-time").forEach((e) => {
      e.textContent = timeline_clock(e.dataset.time);
    });
  }
}
timeline_manager("load");

function timeline_clock(timestamp) {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);

  if (min < 1) return "Ahora";
  if (min < 60) return `${min}m`;
  if (h < 24) return `${h}h`;
  return `${d}d`;
}

//Canviar lenguaje
function dataLang(ext) {
  const extensionLenguaje = {
    js: "javascript",
    javascript: "javascript",
    ts: "typescript",
    html: "html",
    css: "css",
    jsx: "javascript",
    tsx: "typescript",
    rct: "javascript",
    json: "json",
    jsonl: "json",
    jsonc: "json",
    md: "markdown",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    bat: "bat",
    batch: "bat",
    cmd: "bat",
    vbs: "vb",
    ng: "typescript",
    angular: "typescript",
    gs: "javascript",
    gscript: "javascript",
    adoc: "markdown",
    asciidoc: "markdown",
    db: "sql",
    sqlite: "sql",
    sql: "sql",
    deno: "typescript",
    denoscript: "typescript",
    esbuild: "javascript",
    eslintrc: "json",
    yml: "yaml",
    yaml: "yaml",
    markdown: "markdown",
    mdown: "markdown",
    ps1: "powershell",
    ps: "powershell",
    powershell: "powershell",
  };
  return extensionLenguaje[ext];
}

btns_leng.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!window.editorActual) return;

    let dataset = btn.dataset.lang;
    pestanaActiva.dataset.ext = dataset;
    lenguajeIcon(dataset);

    const model = window.editorActual.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, dataLang(dataset) || "plaintext");
    }

    if (pestanaActiva === null) return;

    const iconoPestaña = pestanaActiva.querySelector(".iconoPestaña");
    const iconoList1 = document.getElementById(
      `editorList-${pestanaActiva.dataset.id}`,
    );
    const iconoList2 = iconoList1.querySelector(".img");

    if (iconoPestaña) {
      iconoPestaña.style.backgroundImage = `url('img/Lenguajes/${iconDATA(dataset)}')`;
    }
    if (iconoList2) {
      iconoList2.src = `img/Lenguajes/${iconDATA(dataset)}`;
    }
  });
});

//Abrir carpeta
async function openFolder() {
  const rutaFolder = await open({
    directory: true,
    multiple: false,
    title: "Select folder, plese.",
  });

  if (!rutaFolder) return;

  //escanFolder
  const arbolEstructura = await scanFolder(rutaFolder);

  //crearEsquema
  createFolderSchema(arbolEstructura, rutaFolder);
}

async function scanFolder(directory) {
  const rutaFolder = directory;
  try {
    const listaComponentes = await readDir(rutaFolder);
    let nodos = [];

    for (const componente of listaComponentes) {
      const rutaAbsoluta = await join(rutaFolder, componente.name);

      if (componente.isDirectory) {
        nodos.push({
          name: componente.name,
          path: rutaAbsoluta,
          type: "directory",
          children: await scanFolder(rutaAbsoluta),
        });
      } else if (componente.isFile) {
        nodos.push({
          name: componente.name,
          path: rutaAbsoluta,
          type: "file",
        });
      }
    }

    return nodos.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "directory" ? -1 : 1;
    });
  } catch (error) {
    console.error(
      "Error in estructure of directory, error:",
      error,
      "Directory:",
      directory,
    );
    return [];
  }
}

let list_folder_schema = 0;
async function createFolderSchema(
  nodes,
  ruta = "",
  container = document.querySelector(".folder-schema"),
) {
  if (container.classList.contains("folder-schema")) {
    container.innerHTML = "";
  }
  if (ruta !== "") {
    document.getElementById("nombre-carpeta-abierta").textContent =
      await basename(ruta);
  }

  for (let i = 0; i < nodes.length; i++) {
    const content = nodes[i];
    const name = await basename(content.path);

    let fileName = [...name].length > 22 ? name.slice(0, 22) + "..." : name;
    list_folder_schema++;

    if (content.type === "directory") {
      const folder = document.createElement("div");
      folder.className = "folder-schema-item";
      folder.id = `file-${list_folder_schema}`;
      folder.dataset.path = content.path;
      folder.innerHTML = `
        <div class="folder-schema-item-header">
          <div class="folder-schema-item-btn"></div>
          <img src="img/Fs/folder.svg">
          <p>${fileName}</p>
        </div>
      `;
      container.appendChild(folder);

      if (content.children && content.children.length > 0) {
        const subContainer = document.createElement("div");
        subContainer.className = "sub-folder-schema-item";

        folder.appendChild(subContainer);

        await createFolderSchema(content.children, "", subContainer);
      }
    } else if (content.type === "file") {
      let terminacion = "";
      try {
        terminacion = await extname(content.path);
      } catch (e) {
        terminacion = "";
      }

      const file = document.createElement("div");
      file.className = "file-schema-item";
      file.dataset.path = content.path;
      file.id = `file-${list_folder_schema}`;

      const iconSrc = iconDATA(terminacion, name)
        ? `img/Lenguajes/${iconDATA(terminacion, name)}`
        : "img/Fs/file.svg";

      file.innerHTML = `
        <img src="${iconSrc}">
        <p>${fileName}</p>
      `;
      container.appendChild(file);
    } else {
      console.error("File/folder isn't valid");
    }
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".file-schema-item")) return;

  let id = e.target.id;
  const file = document.getElementById(id);
  if (!file) return;

  let ruta = file.dataset.path;
  openFile("so", ruta);
});

document.addEventListener("click", (e) => {
  const folder = e.target.closest(".folder-schema-item");
  if (!folder) return;

  const folder_btn = folder.querySelector(".folder-schema-item-btn");
  const sub_folder = folder.querySelector(".sub-folder-schema-item");

  let abierto = folder_btn.style.transform === "rotate(180deg)";

  const TL = anime.timeline({
    duration: 400,
    easing: "easeInOutQuad",
  });

  TL.add(
    {
      targets: folder_btn,
      rotate: abierto ? [180, 0] : [0, 180],
    },
    "-=300",
  ).add(
    {
      targets: sub_folder,
      opacity: !abierto ? [0, 1] : [1, 0],
      begin: () => {
        if (!abierto) sub_folder.style.display = "flex";
      },
      complete: () => {
        if (abierto) sub_folder.style.display = "none";
      },
    },
    "-=150",
  );
});

//Open file to OS
const { listen, emit } = window.__TAURI__.event;

async function inicializarAperturaExterna() {
  await listen("abrir-archivo-externo", async (event) => {
    const argumentos = event.payload;

    if (argumentos && argumentos.length > 1) {
      try {
        const rutaDelArchivo = argumentos[1];
        await openFile("so", rutaDelArchivo);
      } catch (error) {
        console.error("Error al intentar leer el archivo externo:", error);
      }
    }
  });

  await emit("frontend-listo", {});
}

inicializarAperturaExterna();
