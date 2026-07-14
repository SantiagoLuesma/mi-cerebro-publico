---
tags:
  - sistemas
  - bases-de-datos
  - arquitectura
  - estado/en-progreso
  - publish-true
---
En aplicaciones modernas, el volumen de operaciones de **lectura** (usuarios viendo posts, buscando productos) suele ser drásticamente mayor que el de **escritura** (usuarios creando cuentas o subiendo fotos). Las réplicas de lectura solucionan el cuello de botella que esto genera.

## ¿Cómo funciona?
Se separa la base de datos en dos roles:
1. **Instancia Principal (Primary/Writer):** Se encarga exclusivamente de las escrituras y modificaciones de datos.
2. **Instancias Réplicas (Secondary/Readers):** Copian los datos de la principal de forma asíncrona y se encargan exclusivamente de responder a las consultas de lectura.



## Desafío Principal: Consistencia Eventual
Como la replicación toma unos milisegundos, es posible que un usuario guarde un cambio (en la Principal) e inmediatamente intente leerlo (desde una Réplica) y no lo vea reflejado al instante. A esto se le conoce como **Consistencia Eventual**.

---
**Conexiones:**
* Concepto relacionado con: [[Escalabilidad Horizontal vs Vertical]] (porque esto es escalar la BD horizontalmente).
* Mapa conceptual: [[MOC Diseño de Sistemas]]