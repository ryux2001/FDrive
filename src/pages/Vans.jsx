
import { Link } from 'react-router-dom'


function Vans() {
  return (
    <>
      <header>
        <h2>Furgonetas</h2>
        <nav>
            <Link to='/dashboard'>Dashboard</Link>
        </nav>
      </header>
    </>
  )
}

export default Vans