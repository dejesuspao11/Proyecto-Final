# 📦 Inventario de Activos de TI

## Descripción de la Aplicación

Esta aplicación web permitirá gestionar el inventario de activos de TI como (laptops y monitores). El administrador de TI puede agregar nuevos dispositivos, eliminarlos del inventario y asignarlos a usuarios de la organización.

## Funcionalidades Principales

- Vista de tabla amigable para gerencia y administración.
- Botón de “Agregar Activo” que abre una ventana para ingresar información.
- Función de eliminación disponible solo para el administrador.
- Visualización clara de:  - Marca y modelo
  - Número de serie
  - Tipo (Propiedad / Renta)
  - Estado (Disponible / En uso)
  - Asignado a (si aplica)
- Persistencia de datos en `localStorage`.

## Algoritmo de Funcionamiento

1. Iniciar un arreglo de activos.
2. Al hacer clic en “Agregar Activo”:
   - Se abre una ventana.
   - El administrador ingresa los datos del activo.
   - Se valida que los campos estén llenos y que el número de serie sea único.
   - El activo se añade al arreglo y se guarda en `localStorage`.
   - Se actualiza la tabla.
3. Al hacer clic en un icono 🗑️:
   - Se elimina el activo del arreglo y se actualiza la tabla.
4. La información permanece en `localStorage`.

Se usará HTML, CSS y JavaScript.