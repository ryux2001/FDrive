import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <div>
        <header className="flex justify-between">
          <div className="flex">
            <h1>FDrive</h1>
            <h2>Bienvenido</h2>
          </div>
          <nav>
            <Link to="/register">Registrarse</Link>
            <Link to="/login">Iniciar Sesion</Link>
          </nav>
        </header>
      </div>
    </>
  );
}

export default Home;
