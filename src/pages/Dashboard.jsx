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

  useEffect(() => {
    obtenerMeses()
  }, [])

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