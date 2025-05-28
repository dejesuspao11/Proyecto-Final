const SUPABASE_URL     = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tabla    = document.getElementById('tabla-activos');
const mensaje  = document.getElementById('mensaje');
const formDiv  = document.getElementById('formulario-activo');
const form     = document.getElementById('form-nuevo-activo');
const usuarioSelect = document.getElementById('usuario');

const proveedores = {
  1: "Compañía",
  2: "KC Rentas",
  3: "New Era"
};

// --- Cargar usuarios para el menú desplegable ---
async function cargarUsuarios() {
  const { data, error } = await client.from('users').select('user_id, full_name');

  if (error) {
    console.error('Error al cargar usuarios:', error.message);
    return;
  }

  usuarioSelect.innerHTML = '<option value="">-- Selecciona un usuario --</option>';
  data.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.full_name;
    usuarioSelect.appendChild(option);
  });
}

// --- Cargar activos ---
async function cargarActivos() {
  const { data, error } = await client
    .from('assets')
    .select(`
      serial_number,
      make,
      model,
      status,
      vendor_id,
      asset_type_id ( name ),
      users ( full_name )
    `);

  if (error) {
    console.error('❌ Error al cargar activos:', error.message);
    tabla.innerHTML = `<tr><td colspan="8">Error al cargar datos.</td></tr>`;
    return;
  }

  if (!data.length) {
    tabla.innerHTML = `<tr><td colspan="8">No hay activos registrados.</td></tr>`;
  } else {
    tabla.innerHTML = '';
    data.forEach(item => {
      const sn    = (item.serial_number || '').replace(/'/g, '');
      const model = (item.model         || '').replace(/'/g, '');
      const type  = item.asset_type_id?.name || '-';
      const user  = item.users?.full_name   || 'Sin asignar';
      const vendor = proveedores[item.vendor_id] || 'Desconocido';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${type}</td>
        <td>${item.make || '-'}</td>
        <td>${model}</td>
        <td>${sn}</td>
        <td>${item.status || '-'}</td>
        <td>${user}</td>
        <td>${vendor}</td>
        <td>
          <button onclick="editarActivo('${sn}')">✏️</button>
          <button onclick="eliminarActivo('${sn}')">🗑️</button>
        </td>
      `;
      tabla.appendChild(row);
    });
  }
}

// --- Mostrar/ocultar formulario ---
function mostrarFormulario() {
  formDiv.style.display = 'block';
  mensaje.textContent = '';
}
function cancelarFormulario() {
  form.reset();                            // Limpia todos los campos
  formDiv.style.display = 'none';         // Oculta el formulario
  mensaje.textContent = '';               // Limpia el mensaje
  activoEditando = null;                  // Reinicia modo edición
  document.getElementById('serie').disabled = false; // Reactiva el campo de serie
  document.getElementById('form-titulo').textContent = 'Nuevo activo'; // Restaura el título
}

// --- Crear activo ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevoActivo = {
    serial_number: document.getElementById('serie').value.trim().replace(/'/g, ''),
    make: document.getElementById('marca').value.trim(),
    model: document.getElementById('modelo').value.trim(),
    status: document.getElementById('estado').value,
    asset_type_id: 1,
    user_id: parseInt(document.getElementById('usuario').value) || null,
    vendor_id: parseInt(document.getElementById('proveedor').value),
  };

  const { data: existente } = await client
    .from('assets')
    .select('serial_number')
    .eq('serial_number', nuevoActivo.serial_number)
    .single();

  if (existente) {
    mensaje.textContent = '❌ Ya existe un activo con ese número de serie.';
    mensaje.style.color = 'red';
    return;
  }

  const { error } = await client.from('assets').insert(nuevoActivo);

  if (error) {
    console.error('❌ Error al insertar:', error.message);
    mensaje.textContent = '❌ No se pudo guardar el activo.';
    mensaje.style.color = 'red';
  } else {
    mensaje.textContent = '✅ Activo guardado correctamente.';
    mensaje.style.color = 'green';
    form.reset();
    formDiv.style.display = 'none';
    cargarActivos();
  }
});

// --- Eliminar activo ---
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

// --- Placeholder edición ---
function editarActivo(serialRaw) {
  const serial = serialRaw.replace(/'/g, '');
  alert(`Aquí cargarías el formulario para editar la serie: ${serial}`);
}

// --- Inicialización ---
cargarUsuarios();
cargarActivos();

let activoEditando = null;

// --- Editar activo ---
async function editarActivo(serialRaw) {
  const serial = serialRaw.replace(/'/g, '');
  const { data, error } = await client
    .from('assets')
    .select('*')
    .eq('serial_number', serial)
    .single();

  if (error || !data) {
    mensaje.textContent = '❌ Error al cargar datos para editar.';
    mensaje.style.color = 'red';
    console.error(error);
    return;
  }

  // Rellenar el formulario con los datos existentes
  document.getElementById('marca').value = data.make || '';
  document.getElementById('modelo').value = data.model || '';
  document.getElementById('serie').value = data.serial_number || '';
  document.getElementById('estado').value = data.status || 'free';
  document.getElementById('usuario').value = data.user_id || '';
  document.getElementById('proveedor').value = data.vendor_id || 1;

  activoEditando = data.serial_number;

  // Ocultar campo de número de serie para evitar edición directa
  document.getElementById('serie').disabled = true;
  document.getElementById('form-titulo').textContent = 'Editar activo';
  formDiv.style.display = 'block';
  mensaje.textContent = '';
}

// --- Evento submit con soporte para crear o actualizar ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const activo = {
    make: document.getElementById('marca').value.trim(),
    model: document.getElementById('modelo').value.trim(),
    status: document.getElementById('estado').value,
    user_id: parseInt(document.getElementById('usuario').value) || null,
    vendor_id: parseInt(document.getElementById('proveedor').value),
  };

  if (activoEditando) {
    // UPDATE
    const { error } = await client
      .from('assets')
      .update(activo)
      .eq('serial_number', activoEditando);

    if (error) {
      mensaje.textContent = '❌ No se pudo actualizar el activo.';
      mensaje.style.color = 'red';
      console.error(error);
    } else {
      mensaje.textContent = '✅ Activo actualizado correctamente.';
      mensaje.style.color = 'green';
      cancelarFormulario();
      cargarActivos();
    }

    activoEditando = null;
    document.getElementById('serie').disabled = false;
  } else {
    // CREATE
    const nuevo = {
      ...activo,
      serial_number: document.getElementById('serie').value.trim().replace(/'/g, '')
    };

    const { data: existente } = await client
      .from('assets')
      .select('serial_number')
      .eq('serial_number', nuevo.serial_number)
      .single();

    if (existente) {
      mensaje.textContent = '❌ Ya existe un activo con ese número de serie.';
      mensaje.style.color = 'red';
      return;
    }

    const { error } = await client.from('assets').insert(nuevo);

    if (error) {
      mensaje.textContent = '❌ No se pudo guardar el activo.';
      mensaje.style.color = 'red';
      console.error(error);
    } else {
      mensaje.textContent = '✅ Activo creado correctamente.';
      mensaje.style.color = 'green';
      cancelarFormulario();
      cargarActivos();
    }
  }
});

