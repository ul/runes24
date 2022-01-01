import Stack from "@mui/material/Stack";
import React from "react";

export function Footer() {
  return (
    <footer style={{ fontSize: "0.8rem", textAlign: "center" }}>
      <h6 style={{ opacity: 0.5, margin: "2rem 0px 0.4rem" }}>ℵ</h6>
      <div>
        © 2013<span>–</span>2021
        <br />
        <span>
          <a href="http://telemach.livejournal.com">KaRus</a>
          &nbsp;/&nbsp;приложение
          <br />
        </span>
        <span>
          <a href="http://restlos.livejournal.com/">Lacerta</a>
          &nbsp;/&nbsp;рунический шрифт
          <br />
        </span>
        Сделано с
        <span style={{ padding: "0px 0.25rem", color: "#F44336" }}>♥</span>
        в&nbsp;<a href="/img/valley.jpg">Долине</a> и Сиднее
      </div>
    </footer>
  );
}
