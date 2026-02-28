import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Vans() {
  const { usuario } = useAuth();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [furgonetas, setFurgonetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Nuevo estado para trabajadores
  const [trabajadores, setTrabajadores] = useState([]);

  /*Estados para el formulario CRUD:CREATE*/
  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [pagoMensual, setPagoMensual] = useState("");
  const [trabajador_id, setTrabajadorId] = useState("");
  const [notas, setNotas] = useState("");

  function crearFurgoneta() {
    setEditFur(null);
    limpiarCampos();
    setMostrarForm(true);
  }

  /*Estado para saber la furgoneta que estamos editando CRUD: UPDATE*/
  const [editFur, setEditFur] = useState(null);

  // Función para obtener trabajadores
  async function obtenerTrabajadores() {
    const { data, error } = await supabase
      .from("trabajadores")
      .select("*")
      .eq("user_id", usuario.id);
    if (error) {
      return;
    }

    setTrabajadores(data);
  }

  async function editarFurgoneta(furgoneta) {
    setEditFur(furgoneta);
    setMatricula(furgoneta.matricula);
    setPagoMensual(furgoneta.pago_mensual);
    setTrabajadorId(furgoneta.trabajador_id);
    setNotas(furgoneta.notas);
    setMostrarForm(true);
  }

  //CRUD: READ
  async function obtenerFurgonetas() {
    setCargando(true);
    setError(null);
    const { data, error } = await supabase
      .from("furgonetas")
      .select("*")
      .eq("user_id", usuario.id);
    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    setFurgonetas(data);
    setCargando(false);
  }

  /*CRUD: DELETE*/
  async function eliminarFurgoneta(id) {
    if (!confirm("Seguro que quieres eliminar esta furgoneta?")) {
      return;
    }
    setError(null);
    const { error } = await supabase.from("furgonetas").delete().eq("id", id);
    if (error) {
      setError(error.message);
      alert("Error al eliminar:", error);
      return;
    }
    obtenerFurgonetas();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    if (editFur === null) {
      const { error } = await supabase.from("furgonetas").insert({
        nombre,
        matricula,
        pago_mensual: parseFloat(pagoMensual),
        trabajador_id,
        notas,
      });
      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("furgonetas")
        .update({
          nombre,
          matricula,
          pago_mensual: parseFloat(pagoMensual),
          trabajador_id,
          notas,
        })
        .eq("id", editFur.id);
      if (error) {
        setError(error.message);
        setCargando(false);
        setEditFur(null);
        return;
      }
    }

    limpiarCampos();
    setCargando(false);
    setMostrarForm(false);
    obtenerFurgonetas();
  }

  const limpiarCampos = () => {
    setNombre("");
    setMatricula("");
    setPagoMensual("");
    setTrabajadorId("");
    setNotas("");
  };

  const cerrarModal = () => {
    limpiarCampos();
    setEditFur(null);
    setMostrarForm(false);
  };

  useEffect(() => {
    obtenerFurgonetas();
    obtenerTrabajadores();
  }, []);

  return (
    <>
      <div>
        <header className="flex gap-3">
          <h2>Furgonetas</h2>
          <nav>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main>
          <div>
            <button onClick={crearFurgoneta}>Agregar Furgoneta</button>
            {cargando && <p>Cargando...</p>}
            {error && <p>{error}</p>}

            {!cargando && furgonetas.length === 0 && (
              <p>No hay furgonetas aun</p>
            )}

            {furgonetas.map((furgoneta) => (
              <div key={furgoneta.id}>
                <p>{furgoneta.matricula}</p>
                <p>{furgoneta.pago_mensual}</p>
                <p>
                  {
                    trabajadores.find((t) => t.id === furgoneta.trabajador_id)
                      ?.nombre
                  }
                </p>
                <button onClick={() => editarFurgoneta(furgoneta)}>
                  Editar Furgoneta
                </button>
                <button onClick={() => eliminarFurgoneta(furgoneta.id)}>
                  Eliminar Furgoneta
                </button>
              </div>
            ))}

            {/*Formulario*/}
            {mostrarForm && (
              <div>
                <h3>Agregar nueva furgoneta</h3>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="nombre/modelo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="matricula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="pago_mensual"
                    value={pagoMensual}
                    onChange={(e) => setPagoMensual(e.target.value)}
                  />
                  <select
                    value={trabajador_id}
                    onChange={(e) => setTrabajadorId(e.target.value)}
                  >
                    <option value="">Selecciona un trabajador</option>
                    {trabajadores.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="notas"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  ></textarea>
                  <button type="submit" disabled={cargando}>
                    {cargando ? "Guardando" : "Guardar"}
                  </button>
                  {error && <p>{error}</p>}
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

export default Vans;
