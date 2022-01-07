#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    fs::{create_dir_all, File},
    io::{Read, Write},
    path::PathBuf,
};

fn get_state_path() -> PathBuf {
    let mut state_path = dirs::home_dir().unwrap();
    state_path.push(".runes24");
    create_dir_all(&state_path).unwrap();
    state_path.push("state.json.snap");
    state_path
}

#[tauri::command(async)]
fn get_initial_state() -> Option<String> {
    let file = File::open(get_state_path()).ok()?;
    let mut rdr = snap::read::FrameDecoder::new(file);
    let mut string = String::new();
    rdr.read_to_string(&mut string).ok()?;
    Some(string)
}

#[tauri::command(async)]
fn set_state(data: String) -> Option<bool> {
    let file = File::create(get_state_path()).ok()?;
    let mut wtr = snap::write::FrameEncoder::new(file);
    wtr.write_all(&data.into_bytes()).ok()?;
    Some(true)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_initial_state, set_state])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
