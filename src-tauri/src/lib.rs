#[derive(serde::Serialize)]
struct MonitorBounds {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn set_ignore_cursor_events(window: tauri::WebviewWindow, ignore: bool) -> Result<(), String> {
    window
        .set_ignore_cursor_events(ignore)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_monitor_bounds(app: tauri::AppHandle) -> Result<Vec<MonitorBounds>, String> {
    app.available_monitors()
        .map(|monitors| {
            monitors
                .into_iter()
                .map(|m| MonitorBounds {
                    x: m.position().x,
                    y: m.position().y,
                    width: m.size().width,
                    height: m.size().height,
                })
                .collect()
        })
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            // On Windows, start in click-through mode; frontend toggles per-region via set_ignore_cursor_events
            #[cfg(target_os = "windows")]
            {
                if let Some(window) = _app.get_webview_window("main") {
                    let _ = window.set_ignore_cursor_events(true);
                }
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            set_ignore_cursor_events,
            get_monitor_bounds
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
