import { createContext, useContext, useState } from 'react'

const MesContext = createContext()

export function MesProvider({ children }) {
  const [mesActivo, setMesActivo] = useState(null)

  return (
    <MesContext.Provider value={{ mesActivo, setMesActivo }}>
      {children}
    </MesContext.Provider>
  )
}

export function useMes() {
  return useContext(MesContext)
}