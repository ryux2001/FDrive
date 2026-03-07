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
  Trash2,
  Edit,
  Plus
} from "lucide-react";

function Employees() {
  const { usuario } = useAuth();
  const { mesActivo, setMesActivo } = useMes();
  const navigate = useNavigate();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [tipo, setTipo] = useState("");
  const [rol, setRol] = useState("");
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");
  const [editTrab, setEditTrab] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");

  // Función para crear nuevo (abre modal)
  const crearTrabajador = () => {
    setEditTrab(null);
    limpiarCampos();
    setMostrarForm(true);
  };

  // Editar
  const editarTrabajador = (trabajador) => {
    setEditTrab(trabajador);
    setNombre(trabajador.nombre);
    setEmpresa(trabajador.empresa);
    setTipo(trabajador.tipo);
    setRol(trabajador.rol);
    setMonto(trabajador.monto);
    setNotas(trabajador.notas);
    setFechaInicio(trabajador.fecha_inicio)
    setMostrarForm(true);
  };

  // Leer trabajadores
  const obtenerTrabajadores = async () => {
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
  };

  // Eliminar
  const eliminarTrabajador = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este trabajador?")) return;
    setError(null);
    const { error } = await supabase.from("trabajadores").delete().eq("id", id);
    if (error) {
      setError(error.message);
      alert("Error al eliminar");
      return;
    }
    obtenerTrabajadores();
  };

  // Submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    if (editTrab === null) {
      const { error } = await supabase.from("trabajadores").insert({
        nombre,
        empresa,
        tipo,
        rol,
        monto: parseFloat(monto),
        notas,
        fecha_inicio: fechaInicio,
      });
      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("trabajadores")
        .update({
          nombre,
          empresa,
          tipo,
          rol,
          monto: parseFloat(monto),
          notas,
          fecha_inicio: fechaInicio,
        })
        .eq("id", editTrab.id);
      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }
    }

    limpiarCampos();
    setCargando(false);
    setMostrarForm(false);
    obtenerTrabajadores();
  };

  const limpiarCampos = () => {
    setNombre("");
    setEmpresa("");
    setTipo("");
    setRol("");
    setMonto("");
    setNotas("");
    setEditTrab(null);
    setFechaInicio("");
  };

  const cerrarModal = () => {
    limpiarCampos();
    setMostrarForm(false);
  };

  useEffect(() => {
    obtenerTrabajadores();
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Si está cargando la página (no los trabajadores) mostramos spinner igual que Dashboard
  if (!usuario) return null; // mientras carga la sesión

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
            className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors hover:text-black ${
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
                {
                  to: "/employees",
                  label: "Trabajadores",
                  icon: <Users size={18} />,
                },
                { to: "/vans", label: "Furgonetas", icon: <Truck size={18} /> },
                { to: "/routes", label: "Rutas", icon: <Route size={18} /> },
                {
                  to: "/invoices",
                  label: "Facturas",
                  icon: <FileText size={18} />,
                },
                {
                  to: "/expenses",
                  label: "Gastos Propios",
                  icon: <Receipt size={18} />,
                },
                {
                  to: "/supports",
                  label: "Soportes",
                  icon: <HelpCircle size={18} />,
                },
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
            className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
              Gestión de trabajadores
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

        {/* CONTENIDO DE EMPLOYEES */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* Botón agregar trabajador */}
          <button
            onClick={crearTrabajador}
            className="cursor-pointer mb-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
          >
            <Plus size={18}/>
            Trabajador
          </button>

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

          {!cargando && trabajadores.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-400 font-medium">
                No hay trabajadores aún
              </p>
            </div>
          )}

          {!cargando && trabajadores.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  Lista de trabajadores
                  <span className="text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {trabajadores.length}
                  </span>
                </h4>
              </div>
              <div className="divide-y divide-gray-100">
                {trabajadores.map((trabajador) => (
                  <div
                    key={trabajador.id}
                    className="px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                          {trabajador.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {trabajador.nombre}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {trabajador.empresa} · {trabajador.rol}
                          </p>
                          <p className="text-xs text-gray-500">
                            fecha inico: {trabajador.fecha_inicio? trabajador.fecha_inicio : "Desconocido" }
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 ml-13 sm:ml-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {parseFloat(trabajador.monto || 0).toFixed(2)} €
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {trabajador.tipo === "empleado"
                            ? "Sueldo"
                            : "Ganancia"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarTrabajador(trabajador)}
                          className="cursor-pointer p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18}/>
                        </button>
                        <button
                          onClick={() => eliminarTrabajador(trabajador.id)}
                          className="cursor-pointer p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODAL formulario */}
          {mostrarForm && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editTrab ? "Editar trabajador" : "Nuevo trabajador"}
                    </h3>
                    <button
                      onClick={cerrarModal}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Empresa
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Transportes S.L."
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre del trabajador"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Tipo
                        </label>
                        <select
                          value={tipo}
                          onChange={(e) => setTipo(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">Selecciona</option>
                          <option value="empleado">Empleado</option>
                          <option value="autonomo">Autónomo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Rol
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Conductor"
                          value={rol}
                          onChange={(e) => setRol(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        {tipo === "empleado"
                          ? "Sueldo mensual (€)"
                          : "Ganancia mensual (€)"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Notas (opcional)
                      </label>
                      <textarea
                        placeholder="Observaciones..."
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        rows="3"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      ></textarea>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Fecha de inicio
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 12/12/2026"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
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
        </div>
      </main>
    </div>
  );
}

export default Employees;
