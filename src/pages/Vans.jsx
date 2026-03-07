import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useMes } from "../context/MesContext";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, Users, Truck, Route, FileText, Receipt, HelpCircle, Plus, Trash2, Edit } from "lucide-react";

function Vans() {
  const { usuario } = useAuth();
  const { mesActivo, setMesActivo } = useMes();
  const navigate = useNavigate();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [furgonetas, setFurgonetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Nuevo estado para trabajadores
  const [trabajadores, setTrabajadores] = useState([]);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [pagoMensual, setPagoMensual] = useState("");
  const [trabajador_id, setTrabajadorId] = useState("");
  const [notas, setNotas] = useState("");
  const [editFur, setEditFur] = useState(null);

  // Función para crear nueva (abre modal)
  const crearFurgoneta = () => {
    setEditFur(null);
    limpiarCampos();
    setMostrarForm(true);
  };

  // Obtener trabajadores para el select
  const obtenerTrabajadores = async () => {
    const { data, error } = await supabase
      .from("trabajadores")
      .select("*")
      .eq("user_id", usuario.id);
    if (!error) {
      setTrabajadores(data);
    }
  };

  // Editar
  const editarFurgoneta = (furgoneta) => {
    setEditFur(furgoneta);
    setNombre(furgoneta.nombre);
    setMatricula(furgoneta.matricula);
    setPagoMensual(furgoneta.pago_mensual);
    setTrabajadorId(furgoneta.trabajador_id);
    setNotas(furgoneta.notas);
    setMostrarForm(true);
  };

  // Leer furgonetas
  const obtenerFurgonetas = async () => {
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
  };

  // Eliminar
  const eliminarFurgoneta = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta furgoneta?")) return;
    setError(null);
    const { error } = await supabase.from("furgonetas").delete().eq("id", id);
    if (error) {
      setError(error.message);
      alert("Error al eliminar");
      return;
    }
    obtenerFurgonetas();
  };

  // Submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const payload = {
      nombre,
      matricula,
      pago_mensual: parseFloat(pagoMensual),
      trabajador_id: trabajador_id === "Vacio" ? null : trabajador_id,
      notas,
    };

    if (editFur === null) {
      const { error } = await supabase.from("furgonetas").insert(payload);
      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("furgonetas")
        .update(payload)
        .eq("id", editFur.id);
      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }
    }

    limpiarCampos();
    setCargando(false);
    setMostrarForm(false);
    obtenerFurgonetas();
  };

  const limpiarCampos = () => {
    setNombre("");
    setMatricula("");
    setPagoMensual("");
    setTrabajadorId("");
    setNotas("");
    setEditFur(null);
  };

  const cerrarModal = () => {
    limpiarCampos();
    setMostrarForm(false);
  };

  useEffect(() => {
    obtenerFurgonetas();
    obtenerTrabajadores();
  }, []);

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
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">FDrive</h1>
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
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors hover:text-black cursor-pointer ${
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
              Gestión de furgonetas
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

        {/* CONTENIDO DE VANS */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* Botón agregar furgoneta */}
          <button
            onClick={crearFurgoneta}
            className="cursor-pointer mb-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Furgoneta
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

          {!cargando && furgonetas.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-400 font-medium">No hay furgonetas aún</p>
            </div>
          )}

          {!cargando && furgonetas.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  Lista de furgonetas
                  <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {furgonetas.length}
                  </span>
                </h4>
              </div>
              <div className="divide-y divide-gray-100">
                {furgonetas.map((furgoneta) => {
                  const trabajadorAsignado = trabajadores.find(
                    (t) => t.id === furgoneta.trabajador_id
                  );
                  return (
                    <div
                      key={furgoneta.id}
                      className="px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                            {furgoneta.matricula?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {furgoneta.nombre || "Sin nombre"}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {furgoneta.matricula} · {trabajadorAsignado?.nombre || "Sin asignar"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 ml-13 sm:ml-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {parseFloat(furgoneta.pago_mensual || 0).toFixed(2)} €
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Pago mensual
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editarFurgoneta(furgoneta)}
                            className="cursor-pointer p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18}/>
                          </button>
                          <button
                            onClick={() => eliminarFurgoneta(furgoneta.id)}
                            className="cursor-pointer p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                      {editFur ? "Editar furgoneta" : "Nueva furgoneta"}
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
                        Nombre / Modelo
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Renault Kangoo"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Matrícula
                      </label>
                      <input
                        type="text"
                        placeholder="1234 ABC"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Pago mensual (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={pagoMensual}
                        onChange={(e) => setPagoMensual(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Asignar a trabajador
                      </label>
                      <select
                        value={trabajador_id}
                        onChange={(e) => setTrabajadorId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Vacio">Selecciona un trabajador</option>
                        {trabajadores.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
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

export default Vans;