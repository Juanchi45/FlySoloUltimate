import { useEffect, useState } from "react";
import styles from "./listarUsuarios.module.css";
import { API_URL } from "./config";

interface Usuario {
    id: number;
    nombre: string;
    email: string;
}

function ListarUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/usuarios/verUsuarios`)
            .then(res => res.json())
            .then(info => setUsuarios(info.data))
            .catch(err => console.log(err));
    }, []); 

    return (  
        <>
            <header className={styles.header}>
                <h1>Lista de Usuarios</h1>
            </header>

            <div className={styles.contenedor}>
                {usuarios.map((usuario) => (
                    <div className={styles.tarjeta} key={usuario.id}>
                        <div className={styles.datos}>
                            <div>{"Nombre: "}{usuario.nombre}</div>
                            <div>{"Email: "}{usuario.email}</div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
} 

export default ListarUsuarios;