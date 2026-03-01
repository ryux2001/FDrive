import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function RoutesList() {
  const { usuario } = useAuth();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [rutas, setRutas] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [furgonetas, setFurgonetas] = useState([]);
  const [registrosDiesel, setRegistrosDiesel] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal de diésel
  const [modalDieselAbierto, setModalDieselAbierto] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [nuevoMontoDiesel, setNuevoMontoDiesel] = useState("");
  const [nuevaDescripcionDiesel, setNuevaDescripcionDiesel] = useState("");
  const [cargandoDiesel, setCargandoDiesel] = useState(false);

  // Estados del formulario de rutas (incluyendo nuevos campos)
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [trabajadorId, setTrabajadorId] = useState("");
  const [furgonetaId, setFurgonetaId] = useState("");
  const [diasTrabajados, setDiasTrabajados] = useState("");
  const [pagoPorDiaCobrado, setPagoPorDiaCobrado] = useState("");
  const [pagoChofer, setPagoChofer] = useState("");
  const [porcentajeIva, setPorcentajeIva] = useState("");
  const [vacaciones, setVacaciones] = useState(""); // nuevo campo
  const [seguridadSocial, setSeguridadSocial] = useState(""); // nuevo campo

  const [editRuta, setEditRuta] = useState(null);

  function crearRuta() {
    setEditRuta(null);
    limpiarCampos();
    setMostrarForm(true);
  }

  // Cargar todos los datos
  async function fetchAllData() {
    setCargando(true);
    setError(null);

    try {
      const [trabajadoresRes, furgonetasRes, rutasRes, dieselRes] = await Promise.all([
        supabase.from("trabajadores").select("*").eq("user_id", usuario.id),
        supabase.from("furgonetas").select("*").eq("user_id", usuario.id),
        supabase.from("rutas").select("*").eq("user_id", usuario.id),
        supabase.from("diesel_registros").select("*").eq("user_id", usuario.id),
      ]);

      if (trabajadoresRes.error) throw trabajadoresRes.error;
      if (furgonetasRes.error) throw furgonetasRes.error;
      if (rutasRes.error) throw rutasRes.error;
      if (dieselRes.error) throw dieselRes.error;

      setTrabajadores(trabajadoresRes.data || []);
      setFurgonetas(furgonetasRes.data || []);
      setRutas(rutasRes.data || []);
      setRegistrosDiesel(dieselRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (usuario) fetchAllData();
  }, [usuario]);

  function editarRuta(ruta) {
    setEditRuta(ruta);
    setNombre(ruta.nombre);
    setEmpresa(ruta.empresa);
    setTrabajadorId(ruta.trabajador_id || "");
    setFurgonetaId(ruta.furgoneta_id || "");
    setDiasTrabajados(ruta.dias_trabajados);
    setPagoPorDiaCobrado(ruta.pago_por_dia_cobrado);
    setPagoChofer(ruta.pago_chofer);
    setPorcentajeIva(ruta.porcentaje_iva);
    setVacaciones(ruta.vacaciones || "");
    setSeguridadSocial(ruta.seguridad_social || "");
    setMostrarForm(true);
  }

  async function eliminarRuta(id) {
    if (!confirm("¿Seguro que quieres eliminar esta ruta?")) return;
    setError(null);
    const { error } = await supabase.from("rutas").delete().eq("id", id);
    if (error) {
      setError(error.message);
      alert("Error al eliminar: " + error.message);
      return;
    }
    fetchAllData();
  }

  const handleTrabajadorChange = (e) => {
    const id = e.target.value;
    setTrabajadorId(id);
    const trabajador = trabajadores.find(t => String(t.id) === id);
    if (trabajador) {
      setPagoChofer(trabajador.monto);
    } else {
      setPagoChofer("");
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const rutaData = {
      nombre,
      empresa,
      trabajador_id: trabajadorId || null,
      furgoneta_id: furgonetaId || null,
      dias_trabajados: parseInt(diasTrabajados),
      pago_por_dia_cobrado: parseFloat(pagoPorDiaCobrado),
      pago_chofer: parseFloat(pagoChofer),
      porcentaje_iva: parseFloat(porcentajeIva),
      vacaciones: vacaciones ? parseFloat(vacaciones) : 0,
      seguridad_social: seguridadSocial ? parseFloat(seguridadSocial) : 0,
      user_id: usuario.id,
    };

    let error;
    if (editRuta === null) {
      const { error: insertError } = await supabase.from("rutas").insert(rutaData);
      error = insertError;
    } else {
      const { error: updateError } = await supabase
        .from("rutas")
        .update(rutaData)
        .eq("id", editRuta.id);
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
    setEditRuta(null);
    fetchAllData();
  }

  const limpiarCampos = () => {
    setNombre("");
    setEmpresa("");
    setTrabajadorId("");
    setFurgonetaId("");
    setDiasTrabajados("");
    setPagoPorDiaCobrado("");
    setPagoChofer("");
    setPorcentajeIva("");
    setVacaciones("");
    setSeguridadSocial("");
  };

  const cerrarModal = () => {
    limpiarCampos();
    setEditRuta(null);
    setMostrarForm(false);
  };

  // Funciones para el modal de diésel
  function abrirModalDiesel(ruta) {
    setRutaSeleccionada(ruta);
    setModalDieselAbierto(true);
    setNuevoMontoDiesel("");
    setNuevaDescripcionDiesel("");
  }

  function cerrarModalDiesel() {
    setModalDieselAbierto(false);
    setRutaSeleccionada(null);
  }

  async function agregarRegistroDiesel(e) {
    e.preventDefault();
    if (!rutaSeleccionada) return;
    setCargandoDiesel(true);
    setError(null);

    const { error } = await supabase.from("diesel_registros").insert({
      ruta_id: rutaSeleccionada.id,
      monto: parseFloat(nuevoMontoDiesel),
      descripcion: nuevaDescripcionDiesel,
      user_id: usuario.id,
    });

    if (error) {
      setError(error.message);
      setCargandoDiesel(false);
      return;
    }

    // Recargar registros de diésel
    const { data, error: fetchError } = await supabase
      .from("diesel_registros")
      .select("*")
      .eq("user_id", usuario.id);
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setRegistrosDiesel(data);
    }

    setNuevoMontoDiesel("");
    setNuevaDescripcionDiesel("");
    setCargandoDiesel(false);
  }

  async function eliminarRegistroDiesel(id) {
    if (!confirm("¿Eliminar este registro de diésel?")) return;
    const { error } = await supabase.from("diesel_registros").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }
    // Actualizar localmente
    setRegistrosDiesel(prev => prev.filter(r => r.id !== id));
  }

  // Filtrar registros de la ruta seleccionada
  const registrosRuta = registrosDiesel.filter(r => r.ruta_id === rutaSeleccionada?.id);

  // Calcular diésel acumulado por ruta
  const dieselPorRuta = registrosDiesel.reduce((acc, reg) => {
    if (!reg.ruta_id) return acc;
    acc[reg.ruta_id] = (acc[reg.ruta_id] || 0) + parseFloat(reg.monto || 0);
    return acc;
  }, {});

  // Calcular ganancia real de una ruta incluyendo nuevos gastos
  function calcularGananciaReal(ruta) {
    const ingresosBrutos = ruta.dias_trabajados * ruta.pago_por_dia_cobrado;
    const ingresosConIva = ingresosBrutos * (1 + ruta.porcentaje_iva / 100);
    
    // Gastos: pago chofer + vacaciones + seguridad social (todos sin IVA)
    const gastosPersonal = (ruta.pago_chofer || 0) + (ruta.vacaciones || 0) + (ruta.seguridad_social || 0);
    
    // Pago furgoneta (sin IVA)
    const furgoneta = furgonetas.find(f => f.id === ruta.furgoneta_id);
    const pagoFurgoneta = furgoneta ? parseFloat(furgoneta.pago_mensual) : 0;
    
    const dieselTotal = dieselPorRuta[ruta.id] || 0;
    
    return ingresosConIva - gastosPersonal - pagoFurgoneta - dieselTotal;
  }

  // Ganancia total de todas las rutas
  const gananciaTotal = rutas.reduce((sum, ruta) => sum + calcularGananciaReal(ruta), 0);

  return (
    <>
      <div>
        <header className="flex gap-3">
          <h2>Rutas</h2>
          <nav>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main>
          <div>
            <button onClick={crearRuta}>Agregar Ruta</button>
            {cargando && <p>Cargando...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!cargando && rutas.length > 0 && (
              <h3>Ganancia total: {gananciaTotal.toFixed(2)} €</h3>
            )}

            {!cargando && rutas.length === 0 && <p>No hay rutas aún</p>}

            {rutas.map((ruta) => {
              const trabajador = trabajadores.find((t) => t.id === ruta.trabajador_id);
              const furgoneta = furgonetas.find((f) => f.id === ruta.furgoneta_id);
              const gananciaReal = calcularGananciaReal(ruta);
              return (
                <div key={ruta.id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
                  <p><strong>{ruta.nombre}</strong> ({ruta.empresa})</p>
                  <p>Trabajador: {trabajador?.nombre || "Sin asignar"} (pago fijo: {ruta.pago_chofer} €)</p>
                  <p>Furgoneta: {furgoneta?.matricula || "Sin asignar"} (pago mensual: {furgoneta ? furgoneta.pago_mensual : 0} €)</p>
                  <p>Días trabajados: {ruta.dias_trabajados}</p>
                  <p>Pago por día cobrado: {ruta.pago_por_dia_cobrado} €</p>
                  <p>IVA: {ruta.porcentaje_iva}%</p>
                  <p>Vacaciones (prorrateo): {ruta.vacaciones || 0} €</p>
                  <p>Seguridad Social: {ruta.seguridad_social || 0} €</p>
                  <p>Gastos diésel (acumulado): {dieselPorRuta[ruta.id]?.toFixed(2) || "0"} €</p>
                  <p><strong>Ganancia real: {gananciaReal.toFixed(2)} €</strong></p>
                  <button onClick={() => editarRuta(ruta)}>Editar</button>
                  <button onClick={() => eliminarRuta(ruta.id)}>Eliminar</button>
                  <button onClick={() => abrirModalDiesel(ruta)}>Diésel</button>
                </div>
              );
            })}

            {/* Modal de diésel */}
            {modalDieselAbierto && rutaSeleccionada && (
              <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "5px",
                  maxWidth: "500px",
                  width: "100%",
                  maxHeight: "80vh",
                  overflowY: "auto"
                }}>
                  <h3>Gestión de diésel - {rutaSeleccionada.nombre}</h3>
                  
                  {/* Lista de registros existentes */}
                  <h4>Registros actuales</h4>
                  {registrosRuta.length === 0 ? (
                    <p>No hay registros de diésel para esta ruta.</p>
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {registrosRuta.map(reg => (
                        <li key={reg.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px", borderBottom: "1px solid #eee", padding: "5px 0" }}>
                          <span>
                            <strong>{reg.monto} €</strong> - {reg.descripcion || "Sin descripción"}
                          </span>
                          <button onClick={() => eliminarRegistroDiesel(reg.id)} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}>
                            ✖
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Formulario para agregar nuevo registro */}
                  <h4>Agregar nuevo gasto de diésel</h4>
                  <form onSubmit={agregarRegistroDiesel}>
                    <input
                      type="number"
                      placeholder="Monto (€)"
                      value={nuevoMontoDiesel}
                      onChange={(e) => setNuevoMontoDiesel(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
                    />
                    <input
                      type="text"
                      placeholder="Descripción (opcional)"
                      value={nuevaDescripcionDiesel}
                      onChange={(e) => setNuevaDescripcionDiesel(e.target.value)}
                      style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
                    />
                    <button type="submit" disabled={cargandoDiesel} style={{ marginRight: "10px" }}>
                      {cargandoDiesel ? "Guardando..." : "Agregar"}
                    </button>
                    <button type="button" onClick={cerrarModalDiesel}>
                      Cerrar
                    </button>
                  </form>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
              </div>
            )}

            {/* Formulario de rutas */}
            {mostrarForm && (
              <div style={{ border: "1px solid #000", padding: "20px", marginTop: "20px" }}>
                <h3>{editRuta ? "Editar Ruta" : "Nueva Ruta"}</h3>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Nombre de la ruta"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Empresa"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    required
                  />
                  <select
                    value={trabajadorId}
                    onChange={handleTrabajadorChange}
                  >
                    <option value="">Seleccionar trabajador</option>
                    {trabajadores.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} ({t.tipo}) - {t.monto} €
                      </option>
                    ))}
                  </select>
                  <select
                    value={furgonetaId}
                    onChange={(e) => setFurgonetaId(e.target.value)}
                  >
                    <option value="">Seleccionar furgoneta</option>
                    {furgonetas.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.matricula} - {f.nombre} (pago: {f.pago_mensual} €)
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Días trabajados"
                    value={diasTrabajados}
                    onChange={(e) => setDiasTrabajados(e.target.value)}
                    required
                    min="1"
                    step="1"
                  />
                  <input
                    type="number"
                    placeholder="Pago por día cobrado (€)"
                    value={pagoPorDiaCobrado}
                    onChange={(e) => setPagoPorDiaCobrado(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    placeholder="Pago chofer (mensual fijo, €)"
                    value={pagoChofer}
                    onChange={(e) => setPagoChofer(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    placeholder="Vacaciones prorrateadas (€)"
                    value={vacaciones}
                    onChange={(e) => setVacaciones(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    placeholder="Seguridad Social (€)"
                    value={seguridadSocial}
                    onChange={(e) => setSeguridadSocial(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={porcentajeIva}
                    onChange={(e) => setPorcentajeIva(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar % IVA</option>
                    <option value="0">0%</option>
                    <option value="20">20%</option>
                    <option value="21">21%</option>
                  </select>
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

export default RoutesList;