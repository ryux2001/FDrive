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
} from "lucide-react";

function Supports() {
  const { usuario } = useAuth();
  const { mesActivo, setMesActivo } = useMes();
  const navigate = useNavigate();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [soportes, setSoportes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [montoCobrado, setMontoCobrado] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [trabajadorId, setTrabajadorId] = useState("");
  const [editSoporte, setEditSoporte] = useState(null);

  // Obtener trabajadores para el select
  const obtenerTrabajadores = async () => {
    const { data } = await supabase
      .from("trabajadores")
      .select("id, nombre")
      .eq("user_id", usuario.id);
    if (data) setTrabajadores(data);
  };

  // Obtener soportes del mes activo
  const obtenerSoportes = async () => {
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
  };

  useEffect(() => {
    if (usuario && mesActivo) {
      obtenerSoportes();
      obtenerTrabajadores();
    } else {
      setSoportes([]);
      setCargando(false);
    }
  }, [usuario, mesActivo]);

  const crearSoporte = () => {
    setEditSoporte(null);
    limpiarCampos();
    setMostrarForm(true);
  };

  const editarSoporte = (soporte) => {
    setEditSoporte(soporte);
    setNombre(soporte.nombre);
    setMontoCobrado(soporte.monto_cobrado);
    setMontoPagado(soporte.monto_pagado);
    setTrabajadorId(soporte.trabajador_id);
    setMostrarForm(true);
  };

  const eliminarSoporte = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este soporte?")) return;
    setError(null);
    const { error } = await supabase.from("soportes").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    obtenerSoportes();
  };

  const handleSubmit = async (e) => {
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
      const { error: insertError } = await supabase
        .from("soportes")
        .insert(soporteData);
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
  };

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

  const totalGanancia = soportes.reduce(
    (sum, s) =>
      sum + (parseFloat(s.monto_cobrado) - parseFloat(s.monto_pagado)),
    0
  );
  const gananciaPositiva = totalGanancia >= 0;

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
            } hover:cursor-pointer`}
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
              Gestión de soportes / extras
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

        {/* CONTENIDO DE SUPPORTS */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {!mesActivo ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-500 font-medium mb-4">
                No hay un mes activo seleccionado.
              </p>
              <Link
                to="/dashboard"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-blue-100 transition-all"
              >
                Ir al Dashboard y seleccionar un mes
              </Link>
            </div>
          ) : (
            <>
              {/* Cabecera con mes activo y botón agregar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Mes activo
                  </p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {mesActivo.nombre}
                  </h3>
                </div>
                <button
                  onClick={crearSoporte}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar Soporte
                </button>
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

              {!cargando && soportes.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <p className="text-gray-400 font-medium">
                    No hay soportes para este mes.
                  </p>
                </div>
              )}

              {soportes.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 md:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      Lista de soportes
                      <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        {soportes.length}
                      </span>
                    </h4>
                    <div
                      className={`px-3 py-1.5 rounded-full border ${
                        gananciaPositiva
                          ? "bg-green-50 border-green-100"
                          : "bg-red-50 border-red-100"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${
                          gananciaPositiva ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        Ganancia total: {totalGanancia.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {soportes.map((soporte) => {
                      const trabajador = trabajadores.find(
                        (t) => t.id === soporte.trabajador_id
                      );
                      const ganancia =
                        parseFloat(soporte.monto_cobrado) -
                        parseFloat(soporte.monto_pagado);
                      const esPositiva = ganancia >= 0;
                      return (
                        <div
                          key={soporte.id}
                          className="px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold shrink-0">
                                {soporte.nombre?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {soporte.nombre}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {trabajador?.nombre || "Sin asignar"}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                              <div>
                                <span className="text-gray-400">Cobrado:</span>{" "}
                                <span className="font-medium">
                                  {soporte.monto_cobrado} €
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Pagado:</span>{" "}
                                <span className="font-medium">
                                  {soporte.monto_pagado} €
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Ganancia:</span>{" "}
                                <span
                                  className={`font-medium ${
                                    esPositiva
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {ganancia.toFixed(2)} €
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-13 sm:ml-0">
                            <button
                              onClick={() => editarSoporte(soporte)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => eliminarSoporte(soporte.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODAL FORMULARIO */}
              {mostrarForm && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                  <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-xl font-bold text-gray-900">
                          {editSoporte ? "Editar soporte" : "Nuevo soporte"}
                        </h3>
                        <button
                          onClick={cerrarModal}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Nombre del soporte
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Extra fin de semana"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Trabajador
                          </label>
                          <select
                            value={trabajadorId}
                            onChange={(e) => setTrabajadorId(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="">Selecciona trabajador</option>
                            {trabajadores.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Monto cobrado (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={montoCobrado}
                            onChange={(e) => setMontoCobrado(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Monto pagado al trabajador (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={montoPagado}
                            onChange={(e) => setMontoPagado(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Supports;