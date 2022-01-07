import React from "react";

export function Footer() {
  return (
    <footer>
      <h6>ℵ</h6>
      <div>
        © 2013<span>–</span>2021
        <br />
        KaRus&nbsp;/&nbsp;приложение
        <br />
        Lacerta&nbsp;/&nbsp;рунический шрифт
        <br />
        Сделано с<span className="heart">♥</span>
        в&nbsp;Долине и Сиднее
        <br />
        <span style={{ color: "#fff" }}>(env:{process.env.NODE_ENV})</span>
      </div>
    </footer>
  );
}
