import { useEffect, useState } from 'react';
import { API_URL } from './config';

interface Nave {
  id: number;
  tipo?: { nombreTipo: string };
  piloto?: { nombre: string };
  modelo: string;
  descripcion: string;
  patente: string;
}

function Mostrarnaves() {
  const [naves, setNaves] = useState<Nave[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/naves/verNaves`)
      .then((res) => res.json())
      .then((data) => setNaves(data.data ?? []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <header>
        <h1>Naves</h1>
      </header>
      <div>
        {naves.map((nave) => (
          <div key={nave.id}>
            <div>Tipo de nave: {nave.tipo?.nombreTipo}</div>
            <div>Piloto: {nave.piloto?.nombre}</div>
            <div>Modelo: {nave.modelo}</div>
            <div>Descripción: {nave.descripcion}</div>
            <div>Patente: {nave.patente}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Mostrarnaves;
