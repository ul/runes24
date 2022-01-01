#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    fs::{create_dir_all, read_to_string, write},
    path::PathBuf,
};

fn get_state_path() -> PathBuf {
    let mut state_path = dirs::home_dir().unwrap();
    state_path.push(".runes24");
    create_dir_all(&state_path).unwrap();
    state_path.push("state.json");
    state_path
}

#[tauri::command]
fn get_initial_state() -> Option<String> {
    read_to_string(get_state_path()).ok()
}

#[tauri::command]
fn set_state(data: String) {
    write(get_state_path(), data).unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_initial_state, set_state])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
