import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useMes } from '../context/MesContext'
import { Link } from 'react-router-dom'

function Dashboard() {
  const { usuario } = useAuth()
  const { mesActivo, setMesActivo } = useMes()
  const [meses, setMeses] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [error, setError] = useState(null)

  // Estados del formulario
  const [nombreMes, setNombreMes] = useState('')
  const [mes, setMes] = useState('')
  const [anio, setAnio] = useState(new Date().getFullYear())

  // Estados para los totales
  const [totalFacturas, setTotalFacturas] = useState(0)
  const [totalGastos, setTotalGastos] = useState(0)
  const [totalRutas, setTotalRutas] = useState(0)

  useEffect(() => {
    obtenerMeses()
  }, [])

  useEffect(() => {
    if (mesActivo) calcularTotales()
  }, [mesActivo])

  async function obtenerMeses() {
    setCargando(true)
    setError(null)
    const { data, error } = await supabase
      .from('meses')
      .select('*')
      .eq('user_id', usuario.id)
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }
    setMeses(data)
    setCargando(false)
  }

  async function calcularTotales() {
    try {
      const [facturasRes, gastosRes, trabajadoresRes, furgonetasRes, dieselRes, rutasRes] = await Promise.all([
        supabase.from('facturas').select('monto').eq('user_id', usuario.id).eq('mes_id', mesActivo.id),
        supabase.from('gastos_propios').select('monto').eq('user_id', usuario.id).eq('mes_id', mesActivo.id),
        supabase.from('trabajadores').select('monto').eq('user_id', usuario.id),
        supabase.from('furgonetas').select('pago_mensual').eq('user_id', usuario.id),
        supabase.from('diesel_registros').select('monto').eq('user_id', usuario.id).eq('mes_id', mesActivo.id),
        supabase.from('rutas').select('*').eq('user_id', usuario.id),
      ])

      // Total azul: suma de facturas
      const azul = (facturasRes.data || []).reduce((sum, f) => sum + parseFloat(f.monto), 0)
      setTotalFacturas(azul)

      // Total naranja: todos los gastos
      const gastosPropios = (gastosRes.data || []).reduce((sum, g) => sum + parseFloat(g.monto), 0)
      const sueldosTrabajadores = (trabajadoresRes.data || []).reduce((sum, t) => {
        return sum + parseFloat(t.monto || 0)
      }, 0)
      const pagoFurgonetas = (furgonetasRes.data || []).reduce((sum, f) => sum + parseFloat(f.pago_mensual || 0), 0)
      const totalDiesel = (dieselRes.data || []).reduce((sum, d) => sum + parseFloat(d.monto || 0), 0)
      setTotalGastos(gastosPropios + sueldosTrabajadores + pagoFurgonetas + totalDiesel)

      // Total morado: ganancia estimada de rutas
      const furgonetas = furgonetasRes.data || []
      const gananciaRutas = (rutasRes.data || []).reduce((sum, ruta) => {
        const ingresosBrutos = ruta.dias_trabajados * ruta.pago_por_dia_cobrado
        const ingresosConIva = ingresosBrutos * (1 + ruta.porcentaje_iva / 100)
        const gastosPersonal = (ruta.pago_chofer || 0) + (ruta.vacaciones || 0) + (ruta.seguridad_social || 0)
        const furgoneta = furgonetas.find(f => f.id === ruta.furgoneta_id)
        const pagoFurgoneta = furgoneta ? parseFloat(furgoneta.pago_mensual) : 0
        return sum + ingresosConIva - gastosPersonal - pagoFurgoneta
      }, 0)
      setTotalRutas(gananciaRutas)

    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCrearMes(e) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const { data, error } = await supabase
      .from('meses')
      .insert({ nombre: nombreMes, mes: parseInt(mes), anio: parseInt(anio) })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }

    setMesActivo(data)
    setMostrarForm(false)
    setNombreMes('')
    setMes('')
    obtenerMeses()
    setCargando(false)
  }

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const gananciaReal = totalFacturas - totalGastos
  const esPositivo = gananciaReal >= 0

  if (cargando) return <p>Cargando...</p>

  return (
    <div>
      <header>
        <h1>FDrive</h1>
        <p>Bienvenido, {usuario.user_metadata.nombre}</p>
        <button onClick={async () => { await supabase.auth.signOut() }}>
          Cerrar sesión
        </button>
      </header>

      {/* Sin mes activo */}
      {!mesActivo && (
        <div>
          {meses.length === 0 ? (
            <div>
              <p>No tienes ningún mes registrado, ¿quieres crear uno?</p>
              <button onClick={() => setMostrarForm(true)}>Crear mes nuevo</button>
              <button disabled>Usar plantilla (En desarrollo)</button>
            </div>
          ) : (
            <div>
              <h2>Selecciona un mes</h2>
              {meses.map((m) => (
                <div key={m.id}>
                  <p>{m.nombre}</p>
                  <button onClick={() => setMesActivo(m)}>Entrar</button>
                </div>
              ))}
              <button onClick={() => setMostrarForm(true)}>Crear mes nuevo</button>
            </div>
          )}
        </div>
      )}

      {/* Mes activo */}
      {mesActivo && (
        <div>
          <h2>Mes activo: {mesActivo.nombre}</h2>
          <button onClick={() => setMesActivo(null)}>Cambiar mes</button>

          <nav>
            <Link to="/employees">Trabajadores</Link>
            <Link to="/vans">Furgonetas</Link>
            <Link to="/routes">Rutas</Link>
            <Link to="/invoices">Facturas</Link>
            <Link to="/expenses">Gastos propios</Link>
          </nav>

          {/* Totales */}
          <div>
            <div>
              <p style={{ color: 'blue' }}>Facturado este mes</p>
              <p style={{ color: 'blue' }}>{totalFacturas.toFixed(2)} €</p>
            </div>
            <div>
              <p style={{ color: 'purple' }}>Estimado mes siguiente</p>
              <p style={{ color: 'purple' }}>{totalRutas.toFixed(2)} €</p>
            </div>
            <div>
              <p style={{ color: 'orange' }}>Total gastos</p>
              <p style={{ color: 'orange' }}>{totalGastos.toFixed(2)} €</p>
            </div>
            <div>
              <p>Ganancia real</p>
              <p style={{ color: esPositivo ? 'green' : 'red' }}>
                {gananciaReal.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear mes */}
      {mostrarForm && (
        <div>
          <h3>Crear nuevo mes</h3>
          <form onSubmit={handleCrearMes}>
            <input
              type="text"
              placeholder="Nombre (ej: Febrero 2025)"
              value={nombreMes}
              onChange={(e) => setNombreMes(e.target.value)}
              required
            />
            <select value={mes} onChange={(e) => setMes(e.target.value)} required>
              <option value="">Selecciona mes</option>
              {nombresMeses.map((nombre, index) => (
                <option key={index + 1} value={index + 1}>{nombre}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Año"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              required
            />
            <button type="submit" disabled={cargando}>Crear</button>
            <button type="button" onClick={() => setMostrarForm(false)}>Cancelar</button>
            {error && <p>{error}</p>}
          </form>
        </div>
      )}
    </div>
  )
}

export default Dashboard