App de Gastos: Autónomos y Empresas de Paquetería 

    Contexto: Solución específica para autónomos con rutas de paquetería (Vinted, Inpost) que necesitan organizar gastos de empleados, autónomos subcontratados y logística de furgonetas.

1. Gestión de Personal (Empleados y Autónomos) 

El sistema requiere una suma total de todos los gastos generados por el personal, incluyendo trabajos extra y seguridad social. Este apartado permite crear, editar y eliminar registros que luego se vincularán a las rutas.

Empleados 

    Sueldo: Registro de pago en efectivo, transferencia o ambos.

    Trabajos extra: Especificar monto y método de pago (efectivo/transferencia).

    Control de tiempo: Registro de vacaciones y días libres tomados.

    Penalizaciones: Montos a descontar por infracciones.

    Diésel: Monto exacto entregado mensualmente.

    Rol: Definición del trabajo (soporte o ruta fija específica) y empresa a la que pertenece.

Autónomos 

    Rol: Definición de acciones (soporte o ruta específica) y empresa.

    Ganancia: Monto acordado por sus servicios.

Nota sobre Soportes/Extras: No son montos fijos; cada mes se debe registrar el monto cobrado por el soporte y el monto pagado al trabajador por dicho extra.

2. Flota de Furgonetas 

Control detallado de los vehículos alquilados:

    Asignación: Quién utiliza la unidad (empleado o autónomo).

    Costes: Monto del pago mensual.

    Identificación: Matrícula y registro fotográfico del estado actual del vehículo.

3. Control de Rutas 

Este módulo centraliza la rentabilidad por trayecto:

    Detalles: Empresa cliente y tarifa (por día o por volumen de trabajo).

    Costes asociados: Identificación de qué gastos cubre cada ruta (chofer, furgoneta, diésel, SS, etc.).

Ejemplo de Estructura de Ganancia (Ruta 02):

Para un trabajador autónomo (ej. Juan) con una lógica de IVA del 20% (ajustado por módulos):

    Ingreso Bruto: 
    20 dıˊas×180€=3600€

    Ingreso con IVA (20%): 
    3600×0.20=720+3600=4320€

    Pago Chofer: 
    20×150=3000€

    Pago Chofer con IVA: 
    3000×0.20=600+3000=3600€

    Resultado Final:

        Ganancia: 4320€ 

        Pagos: −3600€ 

        Total Ganancia Neta: 720€ 

4. Gastos Propios y Facturación 

    Gastos Propios: Registro de cuota de autónomo, pagos a Hacienda y otros gastos fijos mensuales.

    Facturación: Registro sencillo por mes con nombre de factura, monto individual y cálculo del total acumulado.

    Historial: Consulta de datos de meses anteriores.

5. Lógica de Funcionamiento y UI 

La aplicación opera por ciclos mensuales:

    Monto Disponible: El dinero cobrado a finales de enero se usa para los gastos de febrero.

    Referencia: Las ganancias de rutas actuales sirven como previsión para el cobro del mes siguiente.

    Plantillas: Capacidad de guardar la configuración de un mes (rutas, trabajadores) para cargarla en el siguiente y evitar trabajo repetitivo.

Indicadores Visuales (Dashboard):
Color	Significado
Azul	Suma total del apartado de Facturas (disponible actual)
Morado	Monto hipotético del mes siguiente (basado en rutas)
Rojo	Suma de todos los gastos (furgonetas, personal, etc.)
Verde/Rojo	Resultado final (Azul - Rojo). Positivo en verde, negativo en rojo

6. Especificaciones Técnicas 

    Arquitectura: Lógica escalable, modular y sin estilos CSS complejos inicialmente.

    Stack:

        Frontend: React.js (JSX) + Vite.

        Estilos: Tailwind CSS (fase posterior).

        Backend/DB: Supabase (autenticación y almacenamiento de meses/plantillas).

        Librerías: react-router-dom, @supabase/supabase-js.