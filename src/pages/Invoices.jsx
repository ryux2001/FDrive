import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useMes } from "../context/MesContext";
import { Link } from "react-router-dom";

function Invoices() {
  const { usuario } = useAuth();
  const { mesActivo } = useMes(); // obtenemos el mes activo del contexto
  const [mostrarForm, setMostrarForm] = useState(false);
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");

  const [editFactura, setEditFactura] = useState(null);

  // Función para crear nueva factura (abre formulario vacío)
  function crearFactura() {
    setEditFactura(null);
    limpiarCampos();
    setMostrarForm(true);
  }

  // Cargar facturas del mes activo
  async function obtenerFacturas() {
    if (!mesActivo) {
      setCargando(false);
      return;
    }
    setCargando(true);
    setError(null);
    const { data, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("user_id", usuario.id)
      .eq("mes_id", mesActivo.id); // filtramos por el mes activo
    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }
    setFacturas(data);
    setCargando(false);
  }

  // Cuando cambie el mes activo, recargamos las facturas
  useEffect(() => {
    if (usuario && mesActivo) {
      obtenerFacturas();
    } else {
      setFacturas([]);
      setCargando(false);
    }
  }, [usuario, mesActivo]);

  // Cargar datos de una factura para editar
  function editarFactura(factura) {
    setEditFactura(factura);
    setNombre(factura.nombre);
    setMonto(factura.monto);
    setMostrarForm(true);
  }

  // Eliminar factura
  async function eliminarFactura(id) {
    if (!confirm("¿Seguro que quieres eliminar esta factura?")) return;
    setError(null);
    const { error } = await supabase.from("facturas").delete().eq("id", id);
    if (error) {
      setError(error.message);
      alert("Error al eliminar: " + error.message);
      return;
    }
    obtenerFacturas(); // recargar
  }

  // Enviar formulario (crear o actualizar)
  async function handleSubmit(e) {
    e.preventDefault();
    if (!mesActivo) {
      setError("No hay un mes activo seleccionado");
      return;
    }
    setCargando(true);
    setError(null);

    const facturaData = {
      nombre,
      monto: parseFloat(monto),
      mes_id: mesActivo.id, // asignamos el mes activo automáticamente
      user_id: usuario.id,
    };

    let error;
    if (editFactura === null) {
      // Crear
      const { error: insertError } = await supabase
        .from("facturas")
        .insert(facturaData);
      error = insertError;
    } else {
      // Actualizar
      const { error: updateError } = await supabase
        .from("facturas")
        .update(facturaData)
        .eq("id", editFactura.id);
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
    setEditFactura(null);
    obtenerFacturas(); // recargar
  }

  const limpiarCampos = () => {
    setNombre("");
    setMonto("");
  };

  const cerrarModal = () => {
    limpiarCampos();
    setEditFactura(null);
    setMostrarForm(false);
  };

  // Calcular total de facturas
  const totalFacturas = facturas.reduce((sum, f) => sum + parseFloat(f.monto), 0);

  return (
    <>
      <div>
        <header className="flex gap-3">
          <h2>Facturas</h2>
          <nav>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main>
          <div>
            {!mesActivo ? (
              <p>No hay un mes activo seleccionado. Por favor, selecciona un mes en el dashboard.</p>
            ) : (
              <>
                <p>Mes activo: {mesActivo.nombre} (ID: {mesActivo.id})</p>
                <button onClick={crearFactura}>Agregar Factura</button>
                {cargando && <p>Cargando...</p>}
                {error && <p>{error}</p>}

                {!cargando && facturas.length === 0 && <p>No hay facturas para este mes.</p>}

                {facturas.length > 0 && (
                  <>
                    <h3>Total facturado: {totalFacturas.toFixed(2)} €</h3>
                    {facturas.map((factura) => (
                      <div key={factura.id}>
                        <p><strong>{factura.nombre}</strong></p>
                        <p>Monto: {factura.monto} €</p>
                        <button onClick={() => editarFactura(factura)}>Editar</button>
                        <button onClick={() => eliminarFactura(factura.id)}>Eliminar</button>
                      </div>
                    ))}
                  </>
                )}

                {/* Formulario modal */}
                {mostrarForm && (
                  <div>
                    <h3>{editFactura ? "Editar Factura" : "Nueva Factura"}</h3>
                    <form onSubmit={handleSubmit}>
                      <input
                        type="text"
                        placeholder="Nombre de la factura"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Monto (€)"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        required
                      />
                      <button type="submit" disabled={cargando}>
                        {cargando ? "Guardando..." : "Guardar"}
                      </button>
                      {error && <p>{error}</p>}
                      <button type="button" onClick={cerrarModal}>
                        Cancelar
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Invoices;