#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    fs::{self, File},
    io::{self, Read, Write},
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, Ordering},
        Mutex,
    },
    thread,
    time::Duration,
};
use tauri::{AppHandle, Manager, WindowEvent};

const STATE_FILE: &str = "state.json.snap";
const BACKUP_FILE: &str = "state.json.snap.bak";
const TEMP_FILE: &str = "state.json.snap.tmp";

/// Frontend gets this long to save pending changes before the app quits anyway.
const CLOSE_TIMEOUT: Duration = Duration::from_secs(5);

/// Serializes writes so concurrent `set_state` calls can't interleave.
static WRITE_LOCK: Mutex<()> = Mutex::new(());
static CLOSING: AtomicBool = AtomicBool::new(false);

fn state_dir() -> Result<PathBuf, String> {
    let mut dir = dirs::home_dir().ok_or("Can't find the home directory.")?;
    dir.push(".runes24");
    fs::create_dir_all(&dir).map_err(|e| format!("Can't create {}: {}", dir.display(), e))?;
    Ok(dir)
}

/// `Ok(None)` means there is no saved state yet (first launch).
/// Any other problem is an error, so the frontend never mistakes an
/// unreadable file for an empty one and overwrites it.
#[tauri::command(async)]
fn get_initial_state() -> Result<Option<String>, String> {
    let path = state_dir()?.join(STATE_FILE);
    let file = match File::open(&path) {
        Ok(file) => file,
        Err(e) if e.kind() == io::ErrorKind::NotFound => return Ok(None),
        Err(e) => return Err(format!("Can't open {}: {}", path.display(), e)),
    };
    let mut string = String::new();
    snap::read::FrameDecoder::new(file)
        .read_to_string(&mut string)
        .map_err(|e| format!("Can't read {}: {}", path.display(), e))?;
    Ok(Some(string))
}

/// Write to a temporary file, sync it, keep the previous state as a backup,
/// then atomically move the new file into place.
#[tauri::command(async)]
fn set_state(data: String) -> Result<(), String> {
    let _guard = WRITE_LOCK.lock().unwrap_or_else(|e| e.into_inner());
    let dir = state_dir()?;
    let path = dir.join(STATE_FILE);
    let temp = dir.join(TEMP_FILE);
    let write = || -> io::Result<()> {
        let mut encoder = snap::write::FrameEncoder::new(File::create(&temp)?);
        encoder.write_all(data.as_bytes())?;
        let file = encoder
            .into_inner()
            .map_err(|e| io::Error::new(e.error().kind(), e.error().to_string()))?;
        file.sync_all()?;
        if path.exists() {
            fs::copy(&path, dir.join(BACKUP_FILE))?;
        }
        fs::rename(&temp, &path)
    };
    write().map_err(|e| format!("Can't save {}: {}", path.display(), e))
}

/// Called by the frontend once pending changes are saved after `close-requested`.
#[tauri::command]
fn exit_app(app: AppHandle) {
    app.exit(0);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_initial_state,
            set_state,
            exit_app
        ])
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                api.prevent_close();
                // A second close click, or a frontend that never answers,
                // must still be able to quit.
                if CLOSING.swap(true, Ordering::SeqCst) {
                    event.window().app_handle().exit(0);
                    return;
                }
                let app = event.window().app_handle();
                if event.window().emit("close-requested", ()).is_err() {
                    app.exit(0);
                    return;
                }
                thread::spawn(move || {
                    thread::sleep(CLOSE_TIMEOUT);
                    app.exit(0);
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
