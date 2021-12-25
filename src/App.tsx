import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

function App() {
  const [msgFromRust, setMsgFromRust] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleHelloWorld = async () => {
    try {
      const response = await invoke("hello_world_test", {
        event: inputValue || "nope",
      });
      setMsgFromRust(`${response}`);
      console.log("response ", response);
    } catch (error) {
      console.log("error ", error);
    }
  };

  return (
    <div>
      <input
        value={inputValue}
        placeholder="input for rust"
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={handleHelloWorld}>call rust</button>
      {!!msgFromRust && <p>response message: {msgFromRust}</p>}
    </div>
  );
}

export default App;
