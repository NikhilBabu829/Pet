mod input_hooks;

use input_hooks::SharedState;

#[derive(serde::Serialize)]
struct MonitorBounds {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
}

#[derive(serde::Serialize)]
struct ActivitySnapshot {
    wpm: u32,
    mouse_speed: f64,
    is_typing: bool,
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

#[tauri::command]
fn get_activity_snapshot(state: tauri::State<SharedState>) -> ActivitySnapshot {
    let s = state.lock().unwrap();
    ActivitySnapshot {
        wpm: s.wpm,
        mouse_speed: s.mouse_speed,
        is_typing: s.is_typing,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            use tauri::Manager;

            // Start global keyboard/mouse hooks in background threads
            let shared_state = input_hooks::start(app.handle().clone());
            app.manage(shared_state);

            if let Some(window) = app.get_webview_window("main") {
                // Size the window to the primary monitor's LOGICAL pixel dimensions so it
                // never overflows on HiDPI/Retina displays (physical px / scale_factor = logical px).
                if let Ok(Some(monitor)) = window.primary_monitor() {
                    let scale = monitor.scale_factor();
                    let phys = monitor.size();
                    let logical_w = phys.width  as f64 / scale;
                    let logical_h = phys.height as f64 / scale;
                    let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                        width: logical_w,
                        height: logical_h,
                    }));
                    let _ = window.set_position(tauri::Position::Logical(
                        tauri::LogicalPosition { x: 0.0, y: 0.0 },
                    ));
                }

                // On Windows, start in click-through mode; frontend toggles per-region
                #[cfg(target_os = "windows")]
                let _ = window.set_ignore_cursor_events(true);
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
            get_monitor_bounds,
            get_activity_snapshot
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
