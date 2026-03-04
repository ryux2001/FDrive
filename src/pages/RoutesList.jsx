import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useMes } from "../context/MesContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Truck,
  Route,
  FileText,
  Receipt,
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Fuel,
} from "lucide-react";

function RoutesList() {
  const { mesActivo } = useMes();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [rutas, setRutas] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [furgonetas, setFurgonetas] = useState([]);
  const [registrosDiesel, setRegistrosDiesel] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Estados para el modal de diésel
  const [modalDieselAbierto, setModalDieselAbierto] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [nuevoMontoDiesel, setNuevoMontoDiesel] = useState("");
  const [nuevaDescripcionDiesel, setNuevaDescripcionDiesel] = useState("");
  const [cargandoDiesel, setCargandoDiesel] = useState(false);

  // Estados del formulario de rutas
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [trabajadorId, setTrabajadorId] = useState("");
  const [furgonetaId, setFurgonetaId] = useState("");
  const [diasTrabajados, setDiasTrabajados] = useState("");
  const [pagoPorDiaCobrado, setPagoPorDiaCobrado] = useState("");
  const [pagoChofer, setPagoChofer] = useState("");
  const [porcentajeIva, setPorcentajeIva] = useState("");
  const [vacaciones, setVacaciones] = useState("");
  const [seguridadSocial, setSeguridadSocial] = useState("");

  const [editRuta, setEditRuta] = useState(null);

  const crearRuta = () => {
    setEditRuta(null);
    limpiarCampos();
    setMostrarForm(true);
  };

  // Cargar todos los datos
  const fetchAllData = async () => {
    setCargando(true);
    setError(null);

    try {
      const [trabajadoresRes, furgonetasRes, rutasRes, dieselRes] =
        await Promise.all([
          supabase.from("trabajadores").select("*").eq("user_id", usuario.id),
          supabase.from("furgonetas").select("*").eq("user_id", usuario.id),
          supabase.from("rutas").select("*").eq("user_id", usuario.id),
          supabase
            .from("diesel_registros")
            .select("*")
            .eq("user_id", usuario.id)
            .eq("mes_id", mesActivo?.id),
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
  };

  useEffect(() => {
    if (usuario) fetchAllData();
  }, [usuario, mesActivo]);

  const editarRuta = (ruta) => {
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
  };

  const eliminarRuta = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta ruta?")) return;
    setError(null);
    const { error } = await supabase.from("rutas").delete().eq("id", id);
    if (error) {
      setError(error.message);
      alert("Error al eliminar: " + error.message);
      return;
    }
    fetchAllData();
  };

  const handleTrabajadorChange = (e) => {
    const id = e.target.value;
    setTrabajadorId(id);
    const trabajador = trabajadores.find((t) => String(t.id) === id);
    if (trabajador) {
      setPagoChofer(trabajador.monto);
    } else {
      setPagoChofer("");
    }
  };

  const handleSubmit = async (e) => {
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
      const { error: insertError } = await supabase
        .from("rutas")
        .insert(rutaData);
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
  };

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
  const abrirModalDiesel = (ruta) => {
    setRutaSeleccionada(ruta);
    setModalDieselAbierto(true);
    setNuevoMontoDiesel("");
    setNuevaDescripcionDiesel("");
  };

  const cerrarModalDiesel = () => {
    setModalDieselAbierto(false);
    setRutaSeleccionada(null);
  };

  const agregarRegistroDiesel = async (e) => {
    e.preventDefault();
    if (!rutaSeleccionada) return;
    setCargandoDiesel(true);
    setError(null);

    const { error } = await supabase.from("diesel_registros").insert({
      ruta_id: rutaSeleccionada.id,
      monto: parseFloat(nuevoMontoDiesel),
      descripcion: nuevaDescripcionDiesel,
      user_id: usuario.id,
      mes_id: mesActivo?.id || null,
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
      .eq("user_id", usuario.id)
      .eq("mes_id", mesActivo?.id);
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setRegistrosDiesel(data);
    }

    setNuevoMontoDiesel("");
    setNuevaDescripcionDiesel("");
    setCargandoDiesel(false);
  };

  const eliminarRegistroDiesel = async (id) => {
    if (!confirm("¿Eliminar este registro de diésel?")) return;
    const { error } = await supabase
      .from("diesel_registros")
      .delete()
      .eq("id", id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }
    // Actualizar localmente
    setRegistrosDiesel((prev) => prev.filter((r) => r.id !== id));
  };

  // Filtrar registros de la ruta seleccionada
  const registrosRuta = registrosDiesel.filter(
    (r) => r.ruta_id === rutaSeleccionada?.id
  );

  // Calcular diésel acumulado por ruta
  const dieselPorRuta = registrosDiesel.reduce((acc, reg) => {
    if (!reg.ruta_id) return acc;
    acc[reg.ruta_id] = (acc[reg.ruta_id] || 0) + parseFloat(reg.monto || 0);
    return acc;
  }, {});

  // Calcular ganancia real de una ruta
  const calcularGananciaReal = (ruta) => {
    const ingresosBrutos = ruta.dias_trabajados * ruta.pago_por_dia_cobrado;
    const ingresosConIva = ingresosBrutos * (1 + ruta.porcentaje_iva / 100);

    const gastosPersonal =
      (ruta.pago_chofer || 0) +
      (ruta.vacaciones || 0) +
      (ruta.seguridad_social || 0);

    const furgoneta = furgonetas.find((f) => f.id === ruta.furgoneta_id);
    const pagoFurgoneta = furgoneta ? parseFloat(furgoneta.pago_mensual) : 0;

    const dieselTotal = dieselPorRuta[ruta.id] || 0;

    return ingresosConIva - gastosPersonal - pagoFurgoneta - dieselTotal;
  };

  // Ganancia total de todas las rutas
  const gananciaTotal = rutas.reduce(
    (sum, ruta) => sum + calcularGananciaReal(ruta),
    0
  );

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (!usuario) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#344054] font-sans overflow-hidden">
      {/* OVERLAY PARA MÓVIL */}
      {menuMovilAbierto && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuMovilAbierto(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          ${menuMovilAbierto ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            FDrive
          </h1>
          <button
            className="md:hidden p-2"
            onClick={() => setMenuMovilAbierto(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => {
              // setMesActivo(null);
              setMenuMovilAbierto(false);
              navigate("/dashboard");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              !mesActivo
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          {mesActivo && (
            <div className="pt-4 space-y-1">
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Módulos
              </p>
              {[
                { to: "/employees", label: "Trabajadores", icon: <Users size={18} /> },
                { to: "/vans", label: "Furgonetas", icon: <Truck size={18} /> },
                { to: "/routes", label: "Rutas", icon: <Route size={18} /> },
                { to: "/invoices", label: "Facturas", icon: <FileText size={18} /> },
                { to: "/expenses", label: "Gastos Propios", icon: <Receipt size={18} /> },
                { to: "/supports", label: "Soportes", icon: <HelpCircle size={18} /> },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuMovilAbierto(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto h-screen scroll-smooth">
        {/* TOP BAR */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 px-4 md:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setMenuMovilAbierto(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-medium text-gray-400 hidden sm:block">
              Gestión de rutas
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:block">
              Hola, {usuario.user_metadata.nombre}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
              {usuario.user_metadata.nombre?.charAt(0)}
            </div>
          </div>
        </header>

        {/* CONTENIDO DE ROUTES */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* Botón agregar ruta y ganancia total */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <button
              onClick={crearRuta}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Agregar Ruta
            </button>
            {!cargando && rutas.length > 0 && (
              <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
                  Ganancia total
                </span>
                <span className="text-lg font-bold text-green-600">
                  {gananciaTotal.toFixed(2)} €
                </span>
              </div>
            )}
          </div>

          {cargando && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {!cargando && rutas.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-400 font-medium">No hay rutas aún</p>
            </div>
          )}

          {!cargando && rutas.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  Lista de rutas
                  <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {rutas.length}
                  </span>
                </h4>
              </div>
              <div className="divide-y divide-gray-100">
                {rutas.map((ruta) => {
                  const trabajador = trabajadores.find(
                    (t) => t.id === ruta.trabajador_id
                  );
                  const furgoneta = furgonetas.find(
                    (f) => f.id === ruta.furgoneta_id
                  );
                  const gananciaReal = calcularGananciaReal(ruta);
                  const esPositiva = gananciaReal >= 0;
                  return (
                    <div
                      key={ruta.id}
                      className="px-5 md:px-6 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                              {ruta.nombre?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {ruta.nombre}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {ruta.empresa}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-2">
                            <div>
                              <span className="text-gray-400">Días:</span>{" "}
                              <span className="font-medium">{ruta.dias_trabajados}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Pago/día:</span>{" "}
                              <span className="font-medium">{ruta.pago_por_dia_cobrado} €</span>
                            </div>
                            <div>
                              <span className="text-gray-400">IVA:</span>{" "}
                              <span className="font-medium">{ruta.porcentaje_iva}%</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Chofer:</span>{" "}
                              <span className="font-medium">{trabajador?.nombre || "Sin asignar"}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Furgoneta:</span>{" "}
                              <span className="font-medium">{furgoneta?.matricula || "Sin asignar"}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Vacaciones:</span>{" "}
                              <span className="font-medium">{ruta.vacaciones || 0} €</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Seg. Social:</span>{" "}
                              <span className="font-medium">{ruta.seguridad_social || 0} €</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Diésel:</span>{" "}
                              <span className="font-medium">
                                {dieselPorRuta[ruta.id]?.toFixed(2) || "0"} €
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 lg:gap-6">
                          <div className="text-right">
                            <p className={`text-sm font-bold ${esPositiva ? "text-green-600" : "text-red-600"}`}>
                              {gananciaReal.toFixed(2)} €
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Ganancia real
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editarRuta(ruta)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => eliminarRuta(ruta.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button
                              onClick={() => abrirModalDiesel(ruta)}
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Gestionar diésel"
                            >
                              <Fuel size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODAL DE DIÉSEL */}
          {modalDieselAbierto && rutaSeleccionada && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-gray-900">
                      Diésel - {rutaSeleccionada.nombre}
                    </h3>
                    <button
                      onClick={cerrarModalDiesel}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Lista de registros existentes */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Registros actuales
                    </h4>
                    {registrosRuta.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No hay registros de diésel para esta ruta.
                      </p>
                    ) : (
                      <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {registrosRuta.map((reg) => (
                          <li
                            key={reg.id}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
                          >
                            <span className="text-sm">
                              <span className="font-bold">{reg.monto} €</span>{" "}
                              {reg.descripcion && `- ${reg.descripcion}`}
                            </span>
                            <button
                              onClick={() => eliminarRegistroDiesel(reg.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Formulario para agregar nuevo registro */}
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Agregar nuevo gasto de diésel
                  </h4>
                  <form onSubmit={agregarRegistroDiesel} className="space-y-4">
                    <div>
                      <input
                        type="number"
                        placeholder="Monto (€)"
                        value={nuevoMontoDiesel}
                        onChange={(e) => setNuevoMontoDiesel(e.target.value)}
                        required
                        min="0"
                        step="0.01"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Descripción (opcional)"
                        value={nuevaDescripcionDiesel}
                        onChange={(e) => setNuevaDescripcionDiesel(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-4 rounded-xl">
                        {error}
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={cargandoDiesel}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                      >
                        {cargandoDiesel ? "Guardando..." : "Agregar"}
                      </button>
                      <button
                        type="button"
                        onClick={cerrarModalDiesel}
                        className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold bg-white hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* MODAL FORMULARIO DE RUTAS */}
          {mostrarForm && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-auto max-h-[90vh]">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editRuta ? "Editar ruta" : "Nueva ruta"}
                    </h3>
                    <button
                      onClick={cerrarModal}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Nombre de la ruta
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Ruta Norte"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Transportes SL"
                          value={empresa}
                          onChange={(e) => setEmpresa(e.target.value)}
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Trabajador
                        </label>
                        <select
                          value={trabajadorId}
                          onChange={handleTrabajadorChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">Seleccionar trabajador</option>
                          {trabajadores.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nombre} ({t.tipo}) - {t.monto} €
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Furgoneta
                        </label>
                        <select
                          value={furgonetaId}
                          onChange={(e) => setFurgonetaId(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">Seleccionar furgoneta</option>
                          {furgonetas.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.matricula} - {f.nombre} (pago: {f.pago_mensual} €)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Días trabajados
                        </label>
                        <input
                          type="number"
                          placeholder="Ej: 20"
                          value={diasTrabajados}
                          onChange={(e) => setDiasTrabajados(e.target.value)}
                          required
                          min="1"
                          step="1"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Pago/día (€)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={pagoPorDiaCobrado}
                          onChange={(e) => setPagoPorDiaCobrado(e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Pago chofer (€)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={pagoChofer}
                          onChange={(e) => setPagoChofer(e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          IVA (%)
                        </label>
                        <select
                          value={porcentajeIva}
                          onChange={(e) => setPorcentajeIva(e.target.value)}
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">Seleccionar</option>
                          <option value="0">0%</option>
                          <option value="20">20%</option>
                          <option value="21">21%</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Vacaciones (€)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={vacaciones}
                          onChange={(e) => setVacaciones(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Seguridad Social (€)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={seguridadSocial}
                          onChange={(e) => setSeguridadSocial(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-4 rounded-xl">
                        {error}
                      </div>
                    )}

                    <div className="pt-2 flex gap-3">
                      <button
                        type="submit"
                        disabled={cargando}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                      >
                        {cargando ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        type="button"
                        onClick={cerrarModal}
                        className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold bg-white hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RoutesList;