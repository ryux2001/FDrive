import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Employees() {
  const { usuario } = useAuth();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  {
    /*Estados para el formulario CRUD:CREATE*/
  }
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [tipo, setTipo] = useState("");
  const [rol, setRol] = useState("");
  const [monto, setMonto] = useState('');
  const [notas, setNotas] = useState("");

  function crearTrabajador (){
    setEditTrab(null)
    limpiarCampos()
    setMostrarForm(true)
  }

  /*Estado para saber el trabajador que estamos editando CRUD: UPDATE*/
  const [editTrab, setEditTrab] = useState(null);

  async function editarTrabajador(trabajador) {
    setEditTrab(trabajador);
    setNombre(trabajador.nombre);
    setEmpresa(trabajador.empresa);
    setTipo(trabajador.tipo);
    setRol(trabajador.rol);
    setMonto(trabajador.monto);
    setNotas(trabajador.notas);
    setMostrarForm(true);
  }

  //CRUD: READ
  async function obtenerTrabajadores() {
    setCargando(true);
    setError(null);
    const { data, error } = await supabase
      .from("trabajadores")
      .select("*")
      .eq("user_id", usuario.id);
    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    setTrabajadores(data);
    setCargando(false);
  }

  /*CRUD: DELETE*/
  async function eliminarTrabajador(id) {
    if (!confirm("Seguro que quieres eliminar este trabajador?")) {
      return;
    }
    setError(null);
    const { error } = await supabase.from("trabajadores").delete().eq("id", id);
    if (error) {
      setError(error.message);
      alert("Error al eliminar:", error);
      return;
    }
    obtenerTrabajadores();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    if (editTrab === null) {
      const { error } = await supabase
        .from("trabajadores")
        .insert({ nombre, empresa, tipo, rol, monto: parseFloat(monto), notas });
      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("trabajadores")
        .update({ nombre, empresa, tipo, rol, monto: parseFloat(monto), notas })
        .eq('id', editTrab.id)
      if (error) {
        setError(error.message);
        setCargando(false);
        setEditTrab(null)
        return;
      }
    }

    limpiarCampos()
    setCargando(false);
    setMostrarForm(false);
    obtenerTrabajadores();
  }

  const limpiarCampos = ()=>{
    setNombre("");
    setEmpresa("");
    setTipo("");
    setRol("");
    setMonto('');
    setNotas("");
  }

  const cerrarModal = ()=>{
    limpiarCampos()
    setEditTrab(null)
    setMostrarForm(false)
  }

  useEffect(() => {
    obtenerTrabajadores();
  }, []);

  return (
    <>
      <div>
        <header>
          <h2>Trabajadores</h2>
          <nav>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main>
          <div>
            <button onClick={crearTrabajador}>
              Agregar Trabajador
            </button>
            {cargando && <p>Cargando...</p>}
            {error && <p>{error}</p>}

            {!cargando && trabajadores.length === 0 && (
              <p>No hay trabajadores aun</p>
            )}

            {trabajadores.map((trabajador) => (
              <div key={trabajador.id}>
                <p>{trabajador.nombre}</p>
                <p>{trabajador.tipo}</p>
                <p>{trabajador.rol}</p>
                <button onClick={() => editarTrabajador(trabajador)}>Editar Trabajador</button>
                <button onClick={() => eliminarTrabajador(trabajador.id)}>
                  Eliminar Trabajador
                </button>
              </div>
            ))}

            {/*Formulario*/}
            {mostrarForm && (
              <div>
                <h3>Agregar nuevo trabajador</h3>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="empresa"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <option value="">Selecciona tipo</option>
                    <option value="empleado">Empleado</option>
                    <option value="autonomo">Autónomo</option>
                  </select>
                  <input
                    type="text"
                    placeholder="rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder={tipo === "empleado" ? "Sueldo" : "Ganancia"}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                  />
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

export default Employees;
