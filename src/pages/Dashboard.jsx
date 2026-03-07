import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useMes } from "../context/MesContext";
import { Link } from "react-router-dom";
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
} from "lucide-react";

function Dashboard() {
  const { usuario } = useAuth();
  const { mesActivo, setMesActivo } = useMes();
  const [meses, setMeses] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [error, setError] = useState(null);

  // Estados del formulario y totales
  const [nombreMes, setNombreMes] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [totalFacturas, setTotalFacturas] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [totalRutas, setTotalRutas] = useState(0);

  //Para guardar las plantillas
  const [nombrePlantilla, setNombrePlantilla] = useState("");
  const [mostrarFromPlantilla, setMostrarFormPlantilla] = useState(false);

  //Para cargar las planmtillas
  const [plantillas, setPlantillas] = useState([]);
  const [mostrarFormCargarPlantilla, setMostrarFormCargarPlantilla] =
    useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [nombreMesPlantilla, setNombreMesPlantilla] = useState("");
  const [mesPlantilla, setMesPlantilla] = useState("");
  const [anioPlantilla, setAnioPlantilla] = useState(new Date().getFullYear());

  useEffect(() => {
    obtenerMeses();
    obtenerPlantillas();
  }, []);
  useEffect(() => {
    if (mesActivo) calcularTotales();
  }, [mesActivo]);

  async function obtenerMeses() {
    setCargando(true);
    const { data, error } = await supabase
      .from("meses")
      .select("*")
      .eq("user_id", usuario.id)
      .order("anio", { ascending: false })
      .order("mes", { ascending: false });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }
    setMeses(data);
    setCargando(false);
  }

  async function calcularTotales() {
    try {
      const [
        facturasRes,
        gastosRes,
        trabajadoresRes,
        furgonetasRes,
        dieselRes,
        rutasRes,
        soportesRes,
      ] = await Promise.all([
        supabase
          .from("facturas")
          .select("monto")
          .eq("user_id", usuario.id)
          .eq("mes_id", mesActivo.id),
        supabase
          .from("gastos_propios")
          .select("monto")
          .eq("user_id", usuario.id)
          .eq("mes_id", mesActivo.id),
        supabase.from("trabajadores").select("monto").eq("user_id", usuario.id),
        supabase
          .from("furgonetas")
          .select("pago_mensual")
          .eq("user_id", usuario.id),
        supabase
          .from("diesel_registros")
          .select("monto")
          .eq("user_id", usuario.id)
          .eq("mes_id", mesActivo.id),
        supabase.from("rutas").select("*").eq("user_id", usuario.id),
        supabase
          .from("soportes")
          .select("monto_pagado")
          .eq("user_id", usuario.id)
          .eq("mes_id", mesActivo.id),
      ]);

      const azul = (facturasRes.data || []).reduce(
        (sum, f) => sum + parseFloat(f.monto),
        0,
      );
      setTotalFacturas(azul);

      const totalSoportes = (soportesRes.data || []).reduce(
        (sum, s) => sum + parseFloat(s.monto_pagado || 0),
        0,
      );
      const gastosPropios = (gastosRes.data || []).reduce(
        (sum, g) => sum + parseFloat(g.monto),
        0,
      );
      const sueldosTrabajadores = (trabajadoresRes.data || []).reduce(
        (sum, t) => sum + parseFloat(t.monto || 0),
        0,
      );
      const pagoFurgonetas = (furgonetasRes.data || []).reduce(
        (sum, f) => sum + parseFloat(f.pago_mensual || 0),
        0,
      );
      const totalDiesel = (dieselRes.data || []).reduce(
        (sum, d) => sum + parseFloat(d.monto || 0),
        0,
      );
      setTotalGastos(
        gastosPropios +
          sueldosTrabajadores +
          pagoFurgonetas +
          totalDiesel +
          totalSoportes,
      );

      const furgonetas = furgonetasRes.data || [];
      const gananciaRutas = (rutasRes.data || []).reduce((sum, ruta) => {
        const ingresosBrutos = ruta.dias_trabajados * ruta.pago_por_dia_cobrado;
        const ingresosConIva = ingresosBrutos * (1 + ruta.porcentaje_iva / 100);
        const gastosPersonal =
          (ruta.pago_chofer || 0) +
          (ruta.vacaciones || 0) +
          (ruta.seguridad_social || 0);
        const furgoneta = furgonetas.find((f) => f.id === ruta.furgoneta_id);
        const pagoFurgoneta = furgoneta
          ? parseFloat(furgoneta.pago_mensual)
          : 0;
        return sum + ingresosConIva - gastosPersonal - pagoFurgoneta;
      }, 0);
      setTotalRutas(gananciaRutas);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCrearMes(e) {
    e.preventDefault();
    setCargando(true);
    const { data, error } = await supabase
      .from("meses")
      .insert({ nombre: nombreMes, mes: parseInt(mes), anio: parseInt(anio) })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }
    setMesActivo(data);
    setMostrarForm(false);
    setNombreMes("");
    setMes("");
    obtenerMeses();
    setCargando(false);
  }

  //Guardar plantilla
  async function guardarPlantilla(e) {
    e.preventDefault();
    setError(null);

    const [trabajadoresRes, furgonetasRes, rutasRes] = await Promise.all([
      supabase.from("trabajadores").select("*").eq("user_id", usuario.id),
      supabase.from("furgonetas").select("*").eq("user_id", usuario.id),
      supabase.from("rutas").select("*").eq("user_id", usuario.id),
    ]);

    const datos = {
      trabajadores: trabajadoresRes.data || [],
      furgonetas: furgonetasRes.data || [],
      rutas: rutasRes.data || [],
    };

    const { error } = await supabase.from("plantillas").insert({
      nombre: nombrePlantilla,
      datos,
      user_id: usuario.id,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setNombrePlantilla("");
    setMostrarFormPlantilla(false);
    alert("Plantilla guardada correctamente");
    obtenerPlantillas();
  }

  //Cargar plantillas
  async function obtenerPlantillas() {
    const { data } = await supabase
      .from("plantillas")
      .select("*")
      .eq("user_id", usuario.id);
    if (data) setPlantillas(data);
  }

  //Eliminar mes
  async function eliminarMes(id) {
    if (!confirm("¿Seguro que quieres eliminar este mes?")) return;
    setError(null);
    const { error } = await supabase.from("meses").delete().eq("id", id);
    if (error) {
      setError(error.message);
      alert("Error al eliminar");
      return;
    }
    obtenerMeses();
  }

  async function cargarPlantilla(e) {
    e.preventDefault();
    if (!plantillaSeleccionada) return;
    setCargando(true);
    setError(null);

    // 1. Crear el mes nuevo
    const { data: nuevoMes, error: mesError } = await supabase
      .from("meses")
      .insert({
        nombre: nombreMesPlantilla,
        mes: parseInt(mesPlantilla),
        anio: parseInt(anioPlantilla),
      })
      .select()
      .single();

    if (mesError) {
      setError(mesError.message);
      setCargando(false);
      return;
    }

    setMesActivo(nuevoMes);
    setMostrarFormCargarPlantilla(false);
    setNombreMesPlantilla("");
    setMesPlantilla("");
    setPlantillaSeleccionada(null);
    obtenerMeses();
    setCargando(false);
  }

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const gananciaReal = totalFacturas - totalGastos;
  const esPositivo = gananciaReal >= 0;

  if (cargando)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );

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
              setMesActivo(null);
              setMenuMovilAbierto(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${!mesActivo ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"} hover:text-black cursor-pointer`}
          >
            <LayoutDashboard size={18} /> Salir del mes
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
            onClick={async () => {
              await supabase.auth.signOut();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm cursor-pointer font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
              Administrador de rutas
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:block">
              Hola, {usuario.user_metadata.nombre}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
              {usuario.user_metadata.nombre.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* SIN MES SELECCIONADO */}
          {!mesActivo && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                    ¡Buen día!, {usuario.user_metadata.nombre}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Selecciona o crea un periodo para tus métricas.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMostrarFormCargarPlantilla(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-full text-sm font-bold border border-gray-200 bg-white hover:bg-gray-200 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    Cargar plantilla
                  </button>
                  <button
                    onClick={() => setMostrarForm(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg cursor-pointer shadow-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    + Nuevo Mes
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Mis Meses{" "}
                    <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                      {meses.length}
                    </span>
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {meses.map((m) => (
                    <div
                      key={m.id}
                      className="px-2 sm:px-4 md:px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="invisible sm:visible w-0 h-0 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                          {m.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-700 truncate max-w-[150px] sm:max-w-none">
                          {m.nombre}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => eliminarMes(m.id)}
                          className="px-4 py-2 rounded-lg cursor-pointer bg-gray-50 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-all shadow-sm"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => setMesActivo(m)}
                          className="px-4 py-2 rounded-lg cursor-pointer bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                  {meses.length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-400">
                      No hay meses creados todavía.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MES ACTIVO */}
          {mesActivo && (
            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  {mesActivo.nombre}
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMostrarFormPlantilla(true)}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 transition-all shadow-sm hover:cursor-pointer"
                  >
                    Guardar plantilla
                  </button>
                  <button
                    onClick={() => setMesActivo(null)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 transition-all shadow-sm hover:cursor-pointer"
                  >
                    Cambiar Mes
                  </button>
                </div>
              </div>

              {/* GRILLA DE TOTALES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Facturado */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">
                    Facturado
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalFacturas.toFixed(2)} €
                  </p>
                  <div className="mt-3 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-3/4 rounded-full"></div>
                  </div>
                </div>
                {/* Estimado */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-purple-600 text-xs font-bold uppercase tracking-wider">
                    Estimado próximo
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalRutas.toFixed(2)} €
                  </p>
                  <div className="mt-3 h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full w-2/3 rounded-full"></div>
                  </div>
                </div>
                {/* Gastos */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-orange-600 text-xs font-bold uppercase tracking-wider">
                    Gastos totales
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalGastos.toFixed(2)} €
                  </p>
                  <div className="mt-3 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                    <div className="bg-orange-600 h-full w-2/3 rounded-full"></div>
                  </div>
                </div>
                {/* Ganancia real */}
                <div
                  className={`p-5 rounded-2xl border shadow-sm ${esPositivo ? "bg-white border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${esPositivo ? "text-green-600" : "text-red-600"}`}
                  >
                    Ganancia real
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${esPositivo ? "text-green-600" : "text-red-600"}`}
                  >
                    {gananciaReal.toFixed(2)} €
                  </p>
                  <div className="mt-3">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md ${esPositivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {esPositivo ? "Positivo" : "Negativo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL CREAR MES */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900">
                  Nuevo periodo
                </h3>
                <button
                  onClick={() => setMostrarForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCrearMes} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Febrero 2025"
                    value={nombreMes}
                    onChange={(e) => setNombreMes(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Mes
                    </label>
                    <select
                      value={mes}
                      onChange={(e) => setMes(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Selecciona</option>
                      {nombresMeses.map((nombre, index) => (
                        <option key={index} value={index + 1}>
                          {nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      value={anio}
                      onChange={(e) => setAnio(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    {cargando ? "Creando..." : "Crear periodo"}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </form>
            </div>
          </div>
        </div>
      )}

      {/*MODAL GUARDAR PLANTILLA */}
      {mostrarFromPlantilla && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900">
                  Guardar plantilla
                </h3>
                <button
                  onClick={() => setMostrarFormPlantilla(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={guardarPlantilla} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Nombre de la plantilla
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Plantilla base invierno"
                    value={nombrePlantilla}
                    onChange={(e) => setNombrePlantilla(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    Guardar
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </form>
            </div>
          </div>
        </div>
      )}

      {/*Modal de cargar plantilla */}
      {mostrarFormCargarPlantilla && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900">
                  Cargar plantilla
                </h3>
                <button
                  onClick={() => setMostrarFormCargarPlantilla(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={cargarPlantilla} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Selecciona plantilla
                  </label>
                  <select
                    value={plantillaSeleccionada?.id || ""}
                    onChange={(e) =>
                      setPlantillaSeleccionada(
                        plantillas.find((p) => String(p.id) === e.target.value),
                      )
                    }
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Selecciona una plantilla</option>
                    {plantillas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Nombre del mes
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Marzo 2025"
                    value={nombreMesPlantilla}
                    onChange={(e) => setNombreMesPlantilla(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Mes
                    </label>
                    <select
                      value={mesPlantilla}
                      onChange={(e) => setMesPlantilla(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Selecciona</option>
                      {nombresMeses.map((nombre, index) => (
                        <option key={index} value={index + 1}>
                          {nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      value={anioPlantilla}
                      onChange={(e) => setAnioPlantilla(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    {cargando ? "Creando..." : "Crear mes con plantilla"}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
