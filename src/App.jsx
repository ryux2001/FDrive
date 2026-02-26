import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';

function App() {
  useEffect(() => {
    async function probarConexion() {
      const { data, error } = await supabase.from('trabajadores').select('*')
      console.log('data:', data)
      console.log('error:', error)
    }

    probarConexion()
  }, [])

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
      </Routes>
    </>
  )
}

export default App
