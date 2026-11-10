# Propuesta TP DSW

## Grupo
### Integrantes
* 52963 - Martinelli, Juan Bautista
* 52175 - Bruno, Julian
* 50949 - Gallucci, Juan Augusto
* 53168 - Gonzalez, Nahuan

### Repositorios
* [fullstack app](https://github.com/Juan-A-G03/FlySolo_DSW.git)


## Tema
### Descripción
*Sistema de viajes y valoración del servicio estilo Uber, ambientado en el universo de Star Wars.*

### Modelo
*Nota*: INCLUIR IMAGEN DEL DER

## Alcance Funcional 

### Alcance Mínimo 

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Planeta<br>3. CRUD Nave|
|CRUD dependiente|1. CRUD Administrador {depende de} CRUD Usuario<br>2. CRUD Viaje {depende de} CRUD Planeta/Usuario<br>3. CRUD Review {depende de} CRUD Usuario|
|Listado<br>+<br>detalle| 1. Listado de planetas filtrado por descripción parcial => detalle CRUD Planeta<br> 2. Listado de viajes disponibles filtrado por el estado que se encuentra el mismo => detalle CRUD Viaje|
|CUU/Epic|1. Solicitar un viaje<br>2. Realizar una review del piloto|
