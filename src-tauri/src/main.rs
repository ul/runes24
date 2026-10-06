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
use tauri::{AppHandle, Emitter, Manager, RunEvent, WindowEvent};

const STATE_FILE: &str = "state.json.snap";
const BACKUP_FILE: &str = "state.json.snap.bak";
const TEMP_FILE: &str = "state.json.snap.tmp";

/// Frontend gets this long to save pending changes before the app quits anyway.
const CLOSE_TIMEOUT: Duration = Duration::from_secs(5);

/// Serializes writes so concurrent `set_state` calls can't interleave.
static WRITE_LOCK: Mutex<()> = Mutex::new(());
/// Set once quitting has started, so a second request quits right away.
static CLOSING: AtomicBool = AtomicBool::new(false);
/// Set when the app may really exit.
static EXIT_ALLOWED: AtomicBool = AtomicBool::new(false);

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

fn force_exit(app: &AppHandle) {
    EXIT_ALLOWED.store(true, Ordering::SeqCst);
    app.exit(0);
}

/// Ask the frontend to save pending changes; it answers with `exit_app`.
/// A second request, or a frontend that never answers, still quits.
fn begin_quit(app: &AppHandle) {
    if CLOSING.swap(true, Ordering::SeqCst) || app.emit("close-requested", ()).is_err() {
        force_exit(app);
        return;
    }
    let app = app.clone();
    thread::spawn(move || {
        thread::sleep(CLOSE_TIMEOUT);
        force_exit(&app);
    });
}

/// Called by the frontend once pending changes are saved after `close-requested`.
#[tauri::command]
fn exit_app(app: AppHandle) {
    force_exit(&app);
}

const QUIT_MENU_ID: &str = "quit";

/// Replaces Tauri's default macOS menu, whose Quit terminates the app
/// without giving the frontend a chance to save. Edit items make the native
/// clipboard shortcuts work in the webview.
#[cfg(target_os = "macos")]
fn app_menu(app: &AppHandle) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
    let quit = MenuItemBuilder::with_id(QUIT_MENU_ID, "Quit Runes Circle")
        .accelerator("CmdOrCtrl+Q")
        .build(app)?;
    let app_submenu = SubmenuBuilder::new(app, "Runes Circle")
        .about(None)
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .item(&quit)
        .build()?;
    // No Undo/Redo items: their shortcuts must reach the editor's own history.
    let edit = SubmenuBuilder::new(app, "Edit")
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;
    let window = SubmenuBuilder::new(app, "Window")
        .minimize()
        .fullscreen()
        .separator()
        .close_window()
        .build()?;
    MenuBuilder::new(app)
        .items(&[&app_submenu, &edit, &window])
        .build()
}

fn main() {
    let builder = tauri::Builder::default();
    #[cfg(target_os = "macos")]
    let builder = builder.menu(app_menu);
    builder
        .invoke_handler(tauri::generate_handler![
            get_initial_state,
            set_state,
            exit_app
        ])
        .on_menu_event(|app, event| {
            if event.id() == QUIT_MENU_ID {
                begin_quit(app);
            }
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                begin_quit(window.app_handle());
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            // E.g. all windows closed by other means.
            if let RunEvent::ExitRequested { api, .. } = event {
                if !EXIT_ALLOWED.load(Ordering::SeqCst) {
                    api.prevent_exit();
                    begin_quit(app);
                }
            }
        });
}
