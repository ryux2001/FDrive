import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useMes } from "../context/MesContext";
import { Link } from "react-router-dom";

function Supports() {
  const { usuario } = useAuth();
  const { mesActivo } = useMes();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [soportes, setSoportes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [nombre, setNombre] = useState("");
  const [montoCobrado, setMontoCobrado] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [trabajadorId, setTrabajadorId] = useState("");

  const [editSoporte, setEditSoporte] = useState(null);

  if (!mesActivo) {
    return (
      <div>
        <header>
          <h2>Soportes / Extras</h2>
          <nav><Link to="/dashboard">Dashboard</Link></nav>
        </header>
        <main><p>No hay un mes activo seleccionado.</p></main>
      </div>
    );
  }

  async function obtenerTrabajadores() {
    const { data } = await supabase
      .from("trabajadores")
      .select("id, nombre")
      .eq("user_id", usuario.id);
    if (data) setTrabajadores(data);
  }

  async function obtenerSoportes() {
    setCargando(true);
    setError(null);
    const { data, error } = await supabase
      .from("soportes")
      .select("*")
      .eq("user_id", usuario.id)
      .eq("mes_id", mesActivo.id);
    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }
    setSoportes(data || []);
    setCargando(false);
  }

  useEffect(() => {
    if (usuario && mesActivo) {
      obtenerSoportes();
      obtenerTrabajadores();
    }
  }, [usuario, mesActivo]);

  function crearSoporte() {
    setEditSoporte(null);
    limpiarCampos();
    setMostrarForm(true);
  }

  function editarSoporte(soporte) {
    setEditSoporte(soporte);
    setNombre(soporte.nombre);
    setMontoCobrado(soporte.monto_cobrado);
    setMontoPagado(soporte.monto_pagado);
    setTrabajadorId(soporte.trabajador_id);
    setMostrarForm(true);
  }

  async function eliminarSoporte(id) {
    if (!confirm("¿Seguro que quieres eliminar este soporte?")) return;
    setError(null);
    const { error } = await supabase.from("soportes").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    obtenerSoportes();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const soporteData = {
      nombre,
      monto_cobrado: parseFloat(montoCobrado),
      monto_pagado: parseFloat(montoPagado),
      trabajador_id: trabajadorId,
      mes_id: mesActivo.id,
      user_id: usuario.id,
    };

    let error;
    if (editSoporte === null) {
      const { error: insertError } = await supabase.from("soportes").insert(soporteData);
      error = insertError;
    } else {
      const { error: updateError } = await supabase
        .from("soportes")
        .update(soporteData)
        .eq("id", editSoporte.id);
      error = updateError;
    }

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    limpiarCampos();
    setCargando(false);
    setMostrarForm(false);
    setEditSoporte(null);
    obtenerSoportes();
  }

  const limpiarCampos = () => {
    setNombre("");
    setMontoCobrado("");
    setMontoPagado("");
    setTrabajadorId("");
  };

  const cerrarModal = () => {
    limpiarCampos();
    setEditSoporte(null);
    setMostrarForm(false);
  };

  const totalGanancia = soportes.reduce((sum, s) => sum + (parseFloat(s.monto_cobrado) - parseFloat(s.monto_pagado)), 0);

  return (
    <div>
      <header>
        <h2>Soportes / Extras</h2>
        <nav><Link to="/dashboard">Dashboard</Link></nav>
      </header>
      <main>
        <button onClick={crearSoporte}>Agregar Soporte</button>
        {cargando && <p>Cargando...</p>}
        {error && <p>{error}</p>}

        {!cargando && soportes.length === 0 && <p>No hay soportes para este mes.</p>}

        {soportes.length > 0 && (
          <>
            <h3>Ganancia total soportes: {totalGanancia.toFixed(2)} €</h3>
            {soportes.map((soporte) => (
              <div key={soporte.id}>
                <p><strong>{soporte.nombre}</strong></p>
                <p>Trabajador: {trabajadores.find(t => t.id === soporte.trabajador_id)?.nombre}</p>
                <p>Cobrado: {soporte.monto_cobrado} €</p>
                <p>Pagado: {soporte.monto_pagado} €</p>
                <p>Ganancia: {(parseFloat(soporte.monto_cobrado) - parseFloat(soporte.monto_pagado)).toFixed(2)} €</p>
                <button onClick={() => editarSoporte(soporte)}>Editar</button>
                <button onClick={() => eliminarSoporte(soporte.id)}>Eliminar</button>
              </div>
            ))}
          </>
        )}

        {mostrarForm && (
          <div>
            <h3>{editSoporte ? "Editar Soporte" : "Nuevo Soporte"}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nombre del soporte"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <select value={trabajadorId} onChange={(e) => setTrabajadorId(e.target.value)} required>
                <option value="">Selecciona trabajador</option>
                {trabajadores.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Monto cobrado (€)"
                value={montoCobrado}
                onChange={(e) => setMontoCobrado(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Monto pagado al trabajador (€)"
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value)}
                required
              />
              <button type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar"}
              </button>
              {error && <p>{error}</p>}
              <button type="button" onClick={cerrarModal}>Cancelar</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Supports;