// js/inventory-admin.js

const SUPABASE_URL      = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tabla    = document.getElementById('tabla-activos');
const mensaje  = document.getElementById('mensaje');
const formDiv  = document.getElementById('formulario-activo');
const form     = document.getElementById('form-nuevo-activo');

// 1) Cargar activos
async function cargarActivos() {
  const { data, error } = await client
    .from('assets')
    .select(`
      serial_number,
      make,
      model,
      status,
      asset_type_id ( name ),
      users ( full_name )
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

// 2) Mostrar/ocultar formulario
function mostrarFormulario() {
  formDiv.style.display = 'block';
  mensaje.textContent = '';
}
function cancelarFormulario() {
  form.reset();
  formDiv.style.display = 'none';
  mensaje.textContent = '';
}

// 3) Insertar activo nuevo
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevoActivo = {
    serial_number: document.getElementById('serie').value.trim().replace(/'/g, ''),
    make:          document.getElementById('marca').value.trim(),
    model:         document.getElementById('modelo').value.trim().replace(/'/g, ''),
    status:        document.getElementById('estado').value,
    asset_type_id: 1 // Cambia según tu catálogo
  };

  const { error } = await client.from('assets').insert(nuevoActivo);

  if (error) {
    console.error('❌ Error al insertar:', error.message);
    mensaje.textContent = '❌ No se pudo guardar el activo.';
    mensaje.style.color = 'red';
  } else {
    mensaje.textContent = '✅ Activo agregado correctamente.';
    mensaje.style.color = 'green';
    form.reset();
    formDiv.style.display = 'none';
    cargarActivos();
  }
});

// 4) Eliminar activo (comillas corregidas)
async function eliminarActivo(serialRaw) {
  const serial = serialRaw.replace(/'/g, '');
  const ok = confirm(`¿Seguro que deseas eliminar el activo con serie "${serial}"?`);
  if (!ok) return;

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

// 5) Placeholder para editar
function editarActivo(serialRaw) {
  const serial = serialRaw.replace(/'/g, '');
  alert(`Aquí cargarías el formulario para editar la serie: ${serial}`);
  // Luego: obtener activo, mostrar en formulario y actualizar con .update()
}

// 6) Inicializar
cargarActivos();
