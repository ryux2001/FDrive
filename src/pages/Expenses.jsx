import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useMes } from "../context/MesContext";
import { Link } from "react-router-dom";

function Expenses() {
  const { usuario } = useAuth();
  const { mesActivo } = useMes();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");

  const [editGasto, setEditGasto] = useState(null);

  // Si no hay mes activo, mostramos un mensaje
  if (!mesActivo) {
    return (
      <div>
        <header className="flex gap-3">
          <h2>Gastos Propios</h2>
          <nav>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main>
          <p>No hay un mes activo seleccionado.</p>
        </main>
      </div>
    );
  }

  // Cargar gastos del mes activo
  async function fetchGastos() {
    setCargando(true);
    setError(null);
    const { data, error } = await supabase
      .from("gastos_propios")
      .select("*")
      .eq("user_id", usuario.id)
      .eq("mes_id", mesActivo.id);

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }
    setGastos(data || []);
    setCargando(false);
  }

  useEffect(() => {
    if (usuario && mesActivo) {
      fetchGastos();
    }
  }, [usuario, mesActivo]);

  // Abrir formulario para nuevo gasto
  function crearGasto() {
    setEditGasto(null);
    limpiarCampos();
    setMostrarForm(true);
  }

  // Cargar datos para editar
  function editarGasto(gasto) {
    setEditGasto(gasto);
    setNombre(gasto.nombre);
    setMonto(gasto.monto);
    setMostrarForm(true);
  }

  // Eliminar gasto
  async function eliminarGasto(id) {
    if (!confirm("¿Seguro que quieres eliminar este gasto?")) return;
    setError(null);
    const { error } = await supabase.from("gastos_propios").delete().eq("id", id);
    if (error) {
      setError(error.message);
      alert("Error al eliminar: " + error.message);
      return;
    }
    fetchGastos();
  }

  // Enviar formulario (crear o actualizar)
  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const gastoData = {
      nombre,
      monto: parseFloat(monto),
      mes_id: mesActivo.id,
      user_id: usuario.id,
    };

    let error;
    if (editGasto === null) {
      const { error: insertError } = await supabase.from("gastos_propios").insert(gastoData);
      error = insertError;
    } else {
      const { error: updateError } = await supabase
        .from("gastos_propios")
        .update(gastoData)
        .eq("id", editGasto.id);
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
    setEditGasto(null);
    fetchGastos();
  }

  const limpiarCampos = () => {
    setNombre("");
    setMonto("");
  };

  const cerrarModal = () => {
    limpiarCampos();
    setEditGasto(null);
    setMostrarForm(false);
  };

  return (
    <>
      <div>
        <header className="flex gap-3">
          <h2>Gastos Propios</h2>
          <nav>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main>
          <div>
            <button onClick={crearGasto}>Agregar Gasto</button>
            {cargando && <p>Cargando...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!cargando && gastos.length === 0 && <p>No hay gastos aún</p>}

            {gastos.map((gasto) => (
              <div key={gasto.id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
                <p><strong>{gasto.nombre}</strong></p>
                <p>Monto: {gasto.monto} €</p>
                <button onClick={() => editarGasto(gasto)}>Editar</button>
                <button onClick={() => eliminarGasto(gasto.id)}>Eliminar</button>
              </div>
            ))}

            {/* Formulario modal */}
            {mostrarForm && (
              <div style={{ border: "1px solid #000", padding: "20px", marginTop: "20px" }}>
                <h3>{editGasto ? "Editar Gasto" : "Nuevo Gasto"}</h3>
                <form onSubmit={handleSubmit}>
                  <textarea
                    placeholder="Título / Descripción"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    rows="3"
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                  <input
                    type="number"
                    placeholder="Monto (€)"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                  <button type="submit" disabled={cargando}>
                    {cargando ? "Guardando..." : "Guardar"}
                  </button>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <button type="button" onClick={cerrarModal}>
                    Cancelar
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Expenses;