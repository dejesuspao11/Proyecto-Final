// js/inventory-admin.js

const SUPABASE_URL      = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Referencias al DOM
const tabla    = document.getElementById('tabla-activos');
const mensaje  = document.getElementById('mensaje');
const formDiv  = document.getElementById('formulario-activo');
const form     = document.getElementById('form-nuevo-activo');

let modoEdicion    = false;
let serieEnEdicion = null;

// 1) Cargar y mostrar todos los activos
async function cargarActivos() {
  const { data, error } = await client
    .from('assets')
    .select(`
      serial_number,
      make,
      model,
      status,
      asset_type_id(name),
      users(full_name)
    `);

  if (error) {
    console.error('❌ Error al cargar activos:', error.message);
    tabla.innerHTML = `<tr><td colspan="7">Error al cargar datos.</td></tr>`;
    return;
  }

  if (!data.length) {
    tabla.innerHTML = `<tr><td colspan="7">No hay activos registrados.</td></tr>`;
    return;
  }

  tabla.innerHTML = '';
  data.forEach(item => {
    const sn    = (item.serial_number || '').replace(/'/g, '');
    const model = (item.model         || '').replace(/'/g, '');
    const type  = item.asset_type_id?.name || '-';
    const user  = item.users?.full_name   || 'Sin asignar';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${type}</td>
      <td>${item.make || '-'}</td>
      <td>${model}</td>
      <td>${sn}</td>
      <td>${item.status || '-'}</td>
      <td>${user}</td>
      <td>
        <button onclick="editarActivo('${sn}')">✏️</button>
        <button onclick="eliminarActivo('${sn}')">🗑️</button>
      </td>
    `;
    tabla.appendChild(row);
  });
}

// 2) Mostrar formulario
function mostrarFormulario() {
  formDiv.style.display = 'block';
  mensaje.textContent = '';
}

// 3) Cancelar (volver a modo crear)
function cancelarFormulario() {
  form.reset();
  formDiv.style.display = 'none';
  mensaje.textContent = '';
  modoEdicion = false;
  serieEnEdicion = null;
}

// 4) Manejar submit (crear o editar)
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const serialNumber = document.getElementById('serie').value.trim();

  // Validación síncrona del patrón
  const regex = /^[A-Za-z0-9]{6,15}$/;
  if (!regex.test(serialNumber)) {
    mensaje.textContent = '❌ El número de serie debe tener entre 6 y 15 caracteres alfanuméricos sin espacios.';
    mensaje.style.color = 'red';
    return;
  }

  const activo = {
    serial_number: serialNumber.replace(/'/g, ''),
    make:          document.getElementById('marca').value.trim(),
    model:         document.getElementById('modelo').value.trim().replace(/'/g, ''),
    status:        document.getElementById('estado').value,
    asset_type_id: 1,    // Ajusta según tu catálogo
    vendor_id:     1,    // Valor por defecto
    user_id:       null  // Sin asignar
  };

  if (modoEdicion) {
    const { error } = await client
      .from('assets')
      .update(activo)
      .eq('serial_number', serieEnEdicion);

    if (error) {
      console.error('❌ Error al actualizar:', error.message);
      mensaje.textContent = '❌ No se pudo actualizar el activo.';
      mensaje.style.color = 'red';
    } else {
      mensaje.textContent = '✅ Activo actualizado correctamente.';
      mensaje.style.color = 'green';
      cancelarFormulario();
      cargarActivos();
    }

  } else {
    // Verificar duplicado
    const { data: dup } = await client
      .from('assets')
      .select('serial_number')
      .eq('serial_number', activo.serial_number);

    if (dup.length) {
      mensaje.textContent = `❌ Ya existe un activo con la serie "${activo.serial_number}".`;
      mensaje.style.color = 'red';
      return;
    }

    const { error } = await client.from('assets').insert(activo);

    if (error) {
      console.error('❌ Error al insertar:', error.message);
      mensaje.textContent = '❌ No se pudo guardar el activo.';
      mensaje.style.color = 'red';
    } else {
      mensaje.textContent = '✅ Activo agregado correctamente.';
      mensaje.style.color = 'green';
      cancelarFormulario();
      cargarActivos();
    }
  }
});

// 5) Eliminar un activo
async function eliminarActivo(serialRaw) {
  const serial = serialRaw.replace(/'/g, '');
  if (!confirm(`¿Eliminar activo con serie "${serial}"?`)) return;

  const { error } = await client
    .from('assets')
    .delete()
    .eq('serial_number', serial);

  if (error) {
    console.error('❌ Error al eliminar:', error.message);
    mensaje.textContent = '❌ No se pudo eliminar el activo.';
    mensaje.style.color = 'red';
  } else {
    mensaje.textContent = '✅ Activo eliminado.';
    mensaje.style.color = 'green';
    cargarActivos();
  }
}

// 6) Cargar datos para editar
async function editarActivo(serialRaw) {
  const serial = serialRaw.replace(/'/g, '');

  const { data, error } = await client
    .from('assets')
    .select('*')
    .eq('serial_number', serial)
    .single();

  if (error || !data) {
    console.error('❌ No se pudo cargar el activo:', error?.message);
    mensaje.textContent = '❌ No se pudo cargar el activo.';
    mensaje.style.color = 'red';
    return;
  }

  document.getElementById('marca').value  = data.make;
  document.getElementById('modelo').value = data.model;
  document.getElementById('serie').value  = data.serial_number;
  document.getElementById('estado').value = data.status;

  modoEdicion    = true;
  serieEnEdicion = data.serial_number;
  formDiv.style.display = 'block';
  mensaje.textContent = '';
}

// 7) Inicializar tabla al cargar página
cargarActivos();
