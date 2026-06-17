use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

pub struct InputState {
    pub keystroke_count: u32,
    pub wpm: u32,
    pub is_typing: bool,
    pub last_keystroke: Option<Instant>,
    pub mouse_x: f64,
    pub mouse_y: f64,
    pub mouse_speed: f64,
    last_mouse_pos: (f64, f64),
    last_mouse_time: Instant,
    last_mouse_emit: Instant,
}

pub type SharedState = Arc<Mutex<InputState>>;

#[derive(serde::Serialize, Clone)]
struct TypingUpdate {
    wpm: u32,
    active: bool,
}

#[derive(serde::Serialize, Clone)]
struct MouseMovePayload {
    x: f64,
    y: f64,
    speed: f64,
}

pub fn start(app: AppHandle) -> SharedState {
    let now = Instant::now();
    let state: SharedState = Arc::new(Mutex::new(InputState {
        keystroke_count: 0,
        wpm: 0,
        is_typing: false,
        last_keystroke: None,
        mouse_x: 0.0,
        mouse_y: 0.0,
        mouse_speed: 0.0,
        last_mouse_pos: (0.0, 0.0),
        last_mouse_time: now,
        last_mouse_emit: now,
    }));

    // Thread 1: rdev listener — keyboard + mouse events
    {
        let state = Arc::clone(&state);
        let app = app.clone();
        thread::spawn(move || {
            let result = rdev::listen(move |event: rdev::Event| {
                match event.event_type {
                    rdev::EventType::KeyPress(_) => {
                        let mut s = state.lock().unwrap();
                        s.keystroke_count += 1;
                        s.last_keystroke = Some(Instant::now());
                    }
                    rdev::EventType::MouseMove { x, y } => {
                        let mut s = state.lock().unwrap();
                        let now = Instant::now();
                        let dt = now.duration_since(s.last_mouse_time).as_secs_f64();
                        let dx = x - s.last_mouse_pos.0;
                        let dy = y - s.last_mouse_pos.1;
                        let speed = if dt > 0.0 {
                            (dx * dx + dy * dy).sqrt() / dt
                        } else {
                            0.0
                        };
                        s.mouse_x = x;
                        s.mouse_y = y;
                        s.mouse_speed = speed;
                        s.last_mouse_pos = (x, y);
                        s.last_mouse_time = now;

                        // Throttle emissions to ~30 Hz (33ms between emits)
                        if now.duration_since(s.last_mouse_emit).as_millis() >= 33 {
                            s.last_mouse_emit = now;
                            let _ = app.emit("mouse-move", MouseMovePayload { x, y, speed });
                        }
                    }
                    _ => {}
                }
            });
            if let Err(e) = result {
                // CGEventTap / WH_KEYBOARD_LL may fail if accessibility/input-monitoring
                // permission is not granted. Log and degrade gracefully.
                eprintln!(
                    "[input_hooks] rdev::listen failed (check Accessibility/Input Monitoring permission): {:?}",
                    e
                );
            }
        });
    }

    // Thread 2: 1 Hz WPM ticker
    {
        let state = Arc::clone(&state);
        let app = app.clone();
        thread::spawn(move || loop {
            thread::sleep(Duration::from_secs(1));
            let mut s = state.lock().unwrap();
            let count = s.keystroke_count;
            s.keystroke_count = 0;
            // WPM = keystrokes/sec × 60s/min ÷ 5 chars/word = count × 12
            let wpm = count * 12;
            let active = s
                .last_keystroke
                .map(|t| t.elapsed() < Duration::from_secs(2))
                .unwrap_or(false);
            s.wpm = wpm;
            s.is_typing = active;
            drop(s);
            let _ = app.emit("typing-update", TypingUpdate { wpm, active });
        });
    }

    state
}
