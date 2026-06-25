use std::env;
use tauri::{Emitter, Manager, Listener};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    //Files
        .setup(|app| {
            // Capturamos los argumentos nativos que el SO le envía al ejecutable
            let args: Vec<String> = env::args().collect();

            // Si hay más de un argumento, el segundo (índice 1) es la ruta del archivo
            if args.len() > 1 {
                let ruta_archivo = args.clone();
                let app_handle = app.handle().clone();

                // Buscamos la ventana principal usando el trait Manager
                if let Some(ventana) = app.get_webview_window("main") {
                    // Eliminamos el genérico <String> de tauri::Event
                    ventana.listen("frontend-listo", move |_event: tauri::Event| {
                        // Enviamos la ruta del archivo usando el trait Emitter
                        let _ = app_handle.emit("abrir-archivo-externo", ruta_archivo.clone());
                    });
                }
            }

            Ok(())
        })
        
    //plugins & tauri run
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}