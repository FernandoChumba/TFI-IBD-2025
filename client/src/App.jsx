import { useState } from 'react'
import Axios from 'axios'
import './App.css'
import './index.css'

function App() {
  
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState(0);
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [anio , setAnio] = useState(0);


  //solicitud de agregar un nuevo empleado a la db
  const resgistrar= ()=>{
    Axios.post("http://localhost:5200/create",{
      nombre: nombre,
      edad: edad,
      pais: pais,
      cargo: cargo,
      anio: anio
    }).then(()=>{
      alert("empleado registrado");
    });
    
  }

  return (
    <div>
    <div className='flex flex-col p-10 justify-center w-full items-center bg-green-300' >
      <label>Nombre<input type="text" className='border-2 border-red-600 m-[10px] h-[30px] pl-[10px] w-[300px] rounded'
      onChange={(event)=>{
        setNombre(event.target.value);
      }} /></label>
      <label>Edad <input type="number" className='border-2 border-red-600 m-[10px] h-[30px] pl-[10px] w-[300px] rounded'
      onChange={(event) => {
        setEdad(event.target.value)
      }} /></label>
      <label>Pais<input type="text" className='border-2 border-red-600 m-[10px] h-[30px] pl-[10px] w-[300px] rounded' 
      onChange={(event)=>
        setPais(event.target.value)
      }/></label>
      <label>Cargo <input type="text" className='border-2 border-red-600 m-[10px] h-[30px] pl-[10px] w-[300px] rounded'
      onChange={(event)=>
        setCargo(event.target.value)
      } /></label>
      <label>Años<input type="date" className='border-2 border-red-600 m-[10px] h-[30px] pl-[10px] w-[300px] rounded'
      onChange={(event)=>{
        setAnio(event.target.value)
      }} /></label>
      <button className='border-2 bg-yellow-100 mt-4 h-[50px] pl-[10px] w-[320px] rounded' onClick={resgistrar}>Registrar</button>
    </div>
    
    </div>
  )
}

export default App
