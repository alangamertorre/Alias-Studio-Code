const { readTextFile } = window.__TAURI__.fs;

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

window.iniciarEditor = async function () {
  const editores = document.querySelectorAll(".editor");
  const editor = [...editores].find((el) => !el.dataset.monacoInit);

  if (!editor) {
    return;
  }
  editor.dataset.monacoInit = "true";

  async function crearEditor() {
    monaco.editor.defineTheme("asc-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        {
          token: "",
          foreground: "#D4D4D4",
        },
      ],
      colors: { "editor.background": "#121314" },
    });

    const fileValue = await readTextFile(window.fileExport);

    const ext = window.fileExport.split(".").pop();
    const fileLenguaje = dataLang(ext) || "plaintext";

    window.editorInstances = window.editorInstances || {};

    const nuevaInstancia = monaco.editor.create(editor, {
      value: fileValue,
      language: fileLenguaje,
      theme: "asc-dark",
      automaticLayout: true,
      fontLigatures: true,
      fontSize: 14,
      renderWhitespace: false,
      links: true,
      formatOnPaste: false,
      minifyWhitespace: true,
      largeFileOptimizations: true,
    });
    window.editorInstances[editor.id] = nuevaInstancia;
    window.editorActual = nuevaInstancia;

    //Enlace errores, warns, lin. & col. ...
    monaco.editor.onDidChangeMarkers((uris) => {
      const model = nuevaInstancia.getModel();
      if (!model) return;

      const markers = monaco.editor.getModelMarkers({ resource: model.uri });

      const num_err = markers.filter((marker) => marker.severity === 8).length;

      const num_adv = markers.filter((marker) => marker.severity === 4).length;

      document.querySelector(".err_txt").innerText = num_err;
      document.querySelector(".adv_txt").innerText = num_adv;
    });

    nuevaInstancia.onDidChangeCursorPosition((event) => {
      const num_lin = event.position.lineNumber;
      const num_col = event.position.column;

      document.getElementById("lin2").innerText = num_lin;
      document.getElementById("col2").innerText = num_col;
    });

    saveEditor();
  }

  if (!window.__monacoRequireConfig) {
    window.__monacoRequireConfig = true;
    require.config({
      paths: { vs: "./sistem/vs" },
      ignoreDuplicateModules: ["vs/editor/editor.main"],
      "vs/nls": {
        availableLanguages: { "*": "es" },
      },
    });
    window.MonacoEnvironment = {
      getWorkerUrl: function () {
        return `data:text/javascript;charset=${window.editorCodification},
          self.MonacoEnvironment = { baseUrl: './sistem/vs/' };
          importScripts('./sistem/vs/base/worker/workerMain.js');`;
      },
    };
  }

  if (window.monaco) {
    crearEditor();
  } else {
    require(["vs/editor/editor.main"], crearEditor);
  }
};

window.iniciarEditor();
