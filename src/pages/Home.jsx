import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#344054] font-sans selection:bg-blue-100">
      {/* HEADER RESPONSIVE */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-blue-600 text-white font-black text-lg md:text-xl p-2 md:p-2.5 rounded-xl shadow-lg shadow-blue-100">FD</div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">FDrive</h1>
        </div>
        <nav className="flex items-center gap-3 md:gap-6">
          <Link to="/login" className="text-xs md:text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Entrar</Link>
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold shadow-md shadow-blue-50 transition-all">
            Empezar
          </Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        {/* HERO SECTION AJUSTADO */}
        <section className="text-center space-y-6 md:space-y-8 mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-white border border-gray-200 rounded-full text-[10px] md:text-[12px] font-bold text-blue-600 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            GESTIÓN PARA PAQUETERÍA
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight max-w-4xl mx-auto">
            Control total de tus rutas y gastos.
          </h2>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            Optimiza la rentabilidad de tus rutas y visualiza tus beneficios mediante ciclos mensuales inteligentes.
          </p>
          <div className="flex justify-center pt-4">
            <Link to="/register" className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl text-center">
              Crear mi primer mes
            </Link>
          </div>
        </section>

        {/* GRID ADAPTATIVO */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm group">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <span className="font-bold">01</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ciclos Mensuales</h3>
            <p className="text-gray-500 leading-relaxed font-medium text-sm md:text-base">
              El capital facturado al final de un mes es el presupuesto para los gastos del siguiente.
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm group">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
              <span className="font-bold">02</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Previsión de Rutas</h3>
            <p className="text-gray-500 leading-relaxed font-medium text-sm md:text-base">
              Calcula ingresos brutos y netos por trayecto, incluyendo IVA y gastos de personal.
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm group">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
              <span className="font-bold">03</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Control de Flota</h3>
            <p className="text-gray-500 leading-relaxed font-medium text-sm md:text-base">
              Asigna vehículos a empleados o autónomos y controla pagos mensuales de la flota.
            </p>
          </div>
        </section>

        {/* INDICADORES VISUALES DASHBOARD (Apilados en móvil) */}
        <section className="mt-16 md:mt-32 bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-sm">
          <div className="max-w-3xl mb-12 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Tu Dashboard Financiero</h3>
            <p className="text-gray-500 font-medium text-sm md:text-base">Código de colores intuitivo basado en tu operativa real:</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            <div className="flex flex-col items-center md:items-start space-y-3">
              <div className="h-2 w-12 bg-blue-500 rounded-full"></div>
              <h4 className="font-bold text-gray-900">Azul</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Facturado Actual</p>
            </div>
            <div className="flex flex-col items-center md:items-start space-y-3">
              <div className="h-2 w-12 bg-purple-500 rounded-full"></div>
              <h4 className="font-bold text-gray-900">Morado</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Monto Hipotético</p>
            </div>
            <div className="flex flex-col items-center md:items-start space-y-3">
              <div className="h-2 w-12 bg-red-500 rounded-full"></div>
              <h4 className="font-bold text-gray-900">Rojo</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gastos Totales</p>
            </div>
            <div className="flex flex-col items-center md:items-start space-y-3">
              <div className="h-2 w-12 bg-green-500 rounded-full"></div>
              <h4 className="font-bold text-gray-900">Resultado</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Beneficio Total</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white py-8 md:py-12 px-8 text-center">
        <p className="text-xs md:text-sm font-bold text-gray-400">© 2025 FDrive. Gestión profesional de paquetería.</p>
      </footer>
    </div>
  );
}

export default Home;