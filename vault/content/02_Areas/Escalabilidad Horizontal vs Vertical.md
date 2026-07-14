---
tags:
  - sistemas
  - escalabilidad
  - estado/perenne
  - publish-true
---
Cuando un sistema se queda sin recursos (CPU, RAM, Almacenamiento) debido al aumento de tráfico, existen dos estrategias principales para solucionar el problema.

## 1. Escalabilidad Vertical (Scale Up)
Consiste en añadir más potencia al servidor existente (más RAM, mejor procesador).
* **Ventajas:** Muy simple de implementar; no requiere cambios en la arquitectura del software.
* **Desventajas:** Tiene un límite físico (el hardware máximo disponible en el mercado) y crea un **Punto Único de Fallo (SPOF)**: si ese servidor se cae, todo el sistema cae.

## 2. Escalabilidad Horizontal (Scale Out)
Consiste en añadir más servidores a la red para distribuir la carga de trabajo entre ellos.
* **Ventajas:** Crecimiento prácticamente infinito; alta disponibilidad (si un servidor muere, los demás responden).
* **Desventajas:** Requiere un balanceador de carga y añade complejidad en la consistencia de los datos.

---
**Conexiones:**
* Volver al [[MOC Diseño de Sistemas]]