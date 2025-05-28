// --- js/inventory-admin.js ---
// Configuración de Supabase
const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

// IMPORTANT: Use window.supabase if you are loading the library via a script tag in HTML
// Otherwise, just use supabase.createClient
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // Changed to window.supabase for consistency

// Elementos del DOM
const tabla = document.getElementById('tabla-activos');
const mensaje = document.getElementById('mensaje'); // Assuming element with id="mensaje"
const formDiv = document.getElementById('formulario-activo');
const form = document.getElementById('form-nuevo-activo');
const usuarioSelect = document.getElementById('usuario');
const proveedorSelect = document.getElementById('proveedor');
const tipoSelect = document.getElementById('tipo');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroEstado = document.getElementById('filtro-estado');
const filtroProveedor = document.getElementById('filtro-proveedor');
const filtroBusqueda = document.getElementById('filtro-busqueda');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
const btnNuevoActivo = document.getElementById('btn-nuevo-activo');
const btnCancelar = document.getElementById('btn-cancelar');
const btnLogout = document.getElementById('btn-logout'); // Assuming you add a button with id="btn-logout" in your HTML

// Mapeo de proveedores
const proveedores = {
  1: "Compañía",
  2: "KC Rentas",
  3: "New Era"
};

// Variable para controlar el activo en edición
let activoEditando = null;

// Helper function for consistent message display (Added)
function displayMessage(text, type = 'info') {
  mensaje.textContent = text;
  mensaje.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
  // Optional: Add/remove CSS classes for styling
  // mensaje.className = type === 'error' ? 'message error' : type === 'success' ? 'message success' : 'message info';
}


/**
 * Carga los usuarios desde Supabase y los muestra en el dropdown correspondiente
 */
async function cargarUsuarios() {
  try {
    const { data, error } = await client.from('users').select('user_id, full_name').order('full_name', { ascending: true });

    if (error) throw error;

    usuarioSelect.innerHTML = '<option value="">-- Selecciona un usuario --</option>';
    data.forEach(user => {
      const opt = document.createElement('option');
      opt.value = user.user_id;
      opt.textContent = user.full_name;
      usuarioSelect.appendChild(opt);
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error.message);
    // Don't necessarily need to show a message for this auxiliary data load error
    // mostrarMensaje('Error al cargar usuarios', 'error'); // Using original mostrarMensaje - Consider unifying
  }
}

/**
 * Carga los tipos de activos desde Supabase y los muestra en los dropdowns correspondientes
 */
async function cargarTipos() {
  try {
    const { data, error } = await client.from('asset_types').select('asset_type_id, name').order('name', { ascending: true });

    if (error) throw error;

    // Para el formulario
    tipoSelect.innerHTML = '<option value="">-- Selecciona tipo de activo --</option>';
    // Para el filtro
    filtroTipo.innerHTML = '<option value="">Todos</option>';

    data.forEach(tipo => {
      // Opciones para el formulario
      const opt = document.createElement('option');
      opt.value = tipo.asset_type_id;
      opt.textContent = tipo.name;
      tipoSelect.appendChild(opt);

      // Opciones para el filtro
      const optFiltro = document.createElement('option');
      optFiltro.value = tipo.asset_type_id;
      optFiltro.textContent = tipo.name;
      filtroTipo.appendChild(optFiltro);
    });
  } catch (error) {
    console.error('Error al cargar tipos de activos:', error.message);
     // mostrarMensaje('Error al cargar tipos de activos', 'error'); // Using original mostrarMensaje - Consider unifying
  }
}

/**
 * Carga los activos desde Supabase aplicando los filtros seleccionados
 */
async function cargarActivos() {
  try {
    // Construir la consulta base
    let query = client
      .from('assets')
      .select(`
        serial_number,
        make,
        model,
        status,
        vendor_id,
        asset_type_id ( name ),
        users ( full_name )
      `)
      .order('make', { ascending: true });

    // Aplicar filtros
    if (filtroTipo.value) {
      query = query.eq('asset_type_id', filtroTipo.value);
    }

    if (filtroEstado.value) {
      query = query.eq('status', filtroEstado.value);
    }

    if (filtroProveedor.value) {
      query = query.eq('vendor_id', filtroProveedor.value);
    }

    if (filtroBusqueda.value) {
      const searchTerm = `%${filtroBusqueda.value}%`;
      query = query.or(`serial_number.ilike.${searchTerm},make.ilike.${searchTerm}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      tabla.innerHTML = '<tr><td colspan="8">No se encontraron activos con los filtros seleccionados.</td></tr>';
      return;
    }

    // Generar la tabla
    tabla.innerHTML = '';
    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.asset_type_id?.name || '-'}</td>
        <td>${item.make || '-'}</td>
        <td>${item.model || '-'}</td>
        <td>${item.serial_number || '-'}</td>
        <td>${item.status === 'assigned' ? 'Asignado' : 'Libre'}</td>
        <td>${item.users?.full_name || 'Sin asignar'}</td>
        <td>${proveedores[item.vendor_id] || 'Desconocido'}</td>
        <td class="acciones">
          <button onclick="editarActivo('${item.serial_number}')">✏️ Editar</button>
          <button onclick="eliminarActivo('${item.serial_number}')">🗑️ Eliminar</button>
        </td>
      `;
      tabla.appendChild(row);
    });

  } catch (error) {
    console.error('Error al cargar activos:', error.message);
    tabla.innerHTML = '<tr><td colspan="8">Error al cargar los activos. Intente nuevamente.</td></tr>';
    // mostrarMensaje('Error al cargar los activos', 'error'); // Using original mostrarMensaje - Consider unifying
  }
}

/**
 * Muestra u oculta el formulario para agregar/editar activos
 */
function mostrarFormulario() {
  formDiv.style.display = 'block';
  mensaje.textContent = '';
  document.getElementById('form-titulo').textContent = 'Nuevo activo';
  form.reset();
  activoEditando = null;
  document.getElementById('serie').disabled = false;
}

/**
 * Oculta el formulario y limpia los campos
 */
function cancelarFormulario() {
  formDiv.style.display = 'none';
  mensaje.textContent = '';
  form.reset();
  activoEditando = null;
  document.getElementById('serie').disabled = false;
}

/**
 * Elimina un activo después de confirmación
 * @param {string} serialNumber - Número de serie del activo a eliminar
 */
async function eliminarActivo(serialNumber) {
  if (!confirm(`¿Está seguro que desea eliminar el activo con serie "${serialNumber}"?`)) {
    return;
  }

  try {
    const { error } = await client.from('assets').delete().eq('serial_number', serialNumber);

    if (error) throw error;

    displayMessage('Activo eliminado correctamente', 'success'); // Using new displayMessage
    cargarActivos();
  } catch (error) {
    console.error('Error al eliminar activo:', error.message);
    displayMessage('Error al eliminar el activo', 'error'); // Using new displayMessage
  }
}

/**
 * Carga los datos de un activo en el formulario para edición
 * @param {string} serialNumber - Número de serie del activo a editar
 */
async function editarActivo(serialNumber) {
  try {
    const { data, error } = await client.from('assets').select('*').eq('serial_number', serialNumber).single();

    if (error || !data) throw error || new Error('Activo no encontrado');

    // Llenar el formulario con los datos del activo
    document.getElementById('marca').value = data.make || '';
    document.getElementById('modelo').value = data.model || '';
    document.getElementById('serie').value = data.serial_number || '';
    document.getElementById('estado').value = data.status || 'free';
    document.getElementById('usuario').value = data.user_id || '';
    document.getElementById('proveedor').value = data.vendor_id || '';
    document.getElementById('tipo').value = data.asset_type_id || '';

    activoEditando = data.serial_number;
    document.getElementById('serie').disabled = true;
    document.getElementById('form-titulo').textContent = 'Editar activo';
    formDiv.style.display = 'block';
    mensaje.textContent = ''; // Clear message when showing form
  } catch (error) {
    console.error('Error al cargar activo para edición:', error.message);
    displayMessage('Error al cargar el activo para edición', 'error'); // Using new displayMessage
  }
}

/**
 * Maneja el envío del formulario para crear o actualizar un activo
 */
async function manejarSubmitFormulario(e) {
  e.preventDefault();

  // Obtener los valores del formulario
  const activo = {
    make: document.getElementById('marca').value.trim(),
    model: document.getElementById('modelo').value.trim(),
    status: document.getElementById('estado').value,
    serial_number: document.getElementById('serie').value.trim(),
    user_id: document.getElementById('usuario').value ? parseInt(document.getElementById('usuario').value) : null,
    vendor_id: document.getElementById('proveedor').value ? parseInt(document.getElementById('proveedor').value) : null, // Ensure vendor_id can be null if '-- Selecciona proveedor --' is selected
    asset_type_id: document.getElementById('tipo').value ? parseInt(document.getElementById('tipo').value) : null // Ensure asset_type_id can be null if '-- Selecciona tipo de activo --' is selected
  };

  // Validación básica (Adjust as needed based on your DB schema NOT NULL constraints)
  if (!activo.serial_number || !activo.make || !activo.model || activo.asset_type_id === null || activo.vendor_id === null) { // Added check for asset_type_id and vendor_id being null
    displayMessage('Por favor complete los campos requeridos (Marca, Modelo, Serie, Tipo, Proveedor).', 'error'); // Updated message
    return;
  }

  try {
    if (activoEditando) {
      // Actualizar activo existente
      const { error } = await client
        .from('assets')
        .update(activo)
        .eq('serial_number', activoEditando);

      if (error) throw error;

      displayMessage('Activo actualizado correctamente', 'success'); // Using new displayMessage
    } else {
      // Verificar si el número de serie ya existe
      const { data: existente } = await client
        .from('assets')
        .select('serial_number')
        .eq('serial_number', activo.serial_number)
        .maybeSingle();

      if (existente) {
        displayMessage('Ya existe un activo con ese número de serie', 'error'); // Using new displayMessage
        return;
      }

      // Crear nuevo activo
      const { error } = await client.from('assets').insert([activo]);

      if (error) throw error;

      displayMessage('Activo creado correctamente', 'success'); // Using new displayMessage
    }

    cancelarFormulario();
    cargarActivos(); // Reload data after successful save
  } catch (error) {
    console.error('Error al guardar activo:', error.message);
    displayMessage('Error al guardar el activo: ' + error.message, 'error'); // Using new displayMessage
  }
}

/**
 * Muestra un mensaje al usuario (Kept for backwards compatibility, but prefer displayMessage)
 * @param {string} texto - Texto del mensaje
 * @param {string} tipo - Tipo de mensaje (success, error, warning)
 */
function mostrarMensaje(texto, tipo) {
  // You can either remove this function or update it to use displayMessage
  // For now, keeping it but recommending using displayMessage
  console.warn("Using deprecated mostrarMensaje. Use displayMessage instead.");
  const msgElement = document.getElementById('mensaje'); // Assuming 'mensaje' is used by mostrarMensaje
  msgElement.textContent = texto;
  msgElement.style.color = tipo === 'error' ? '#dc3545' : tipo === 'success' ? '#28a745' : '#ffc107';
  msgElement.style.backgroundColor = tipo === 'error' ? '#f8d7da' : tipo === 'success' ? '#d4edda' : '#fff3cd';
  msgElement.style.border = tipo === 'error' ? '1px solid #f5c6cb' : tipo === 'success' ? '1px solid #c3e6cb' : '1px solid #ffeeba';
  msgElement.style.padding = '10px';
  msgElement.style.borderRadius = '4px';
  msgElement.style.marginBottom = '15px';
   // Clear the message after a few seconds
  setTimeout(() => {
    msgElement.textContent = '';
    msgElement.style.backgroundColor = '';
    msgElement.style.border = 'none';
    msgElement.style.padding = '';
    msgElement.style.borderRadius = '';
    msgElement.style.marginBottom = '';
  }, 5000);
}


/**
 * Limpia todos los filtros y recarga los activos
 */
function limpiarFiltros() {
  filtroTipo.value = '';
  filtroEstado.value = '';
  filtroProveedor.value = '';
  filtroBusqueda.value = '';
  cargarActivos();
}

// --- Authentication Check and Logout ---

// Function to check session and protect the route
async function checkAuth() {
    // Get session data
    const { data: { session }, error } = await client.auth.getSession();

    if (error) {
        console.error('Error getting session:', error.message);
        // Treat session check error as unauthenticated for safety
        redirectToLogin();
        return; // Stop execution
    }

    if (!session) {
        // No active session, redirect to login page
        console.log('No active session found, redirecting to login.');
        redirectToLogin();
    } else {
        // User is authenticated, proceed with loading data
        console.log('Authenticated user:', session.user.email);
        // Load initial data that depends on being authenticated
        cargarUsuarios(); // Load users for assignment dropdown
        cargarTipos(); // Load types for filter and form
        cargarActivos(); // Load assets into the table
        // You could also fetch user-specific data here if needed later
    }
}

// Function to handle logout
async function handleLogout() {
    const { error } = await client.auth.signOut();

    if (error) {
        console.error('Error signing out:', error.message);
        displayMessage('Error al cerrar sesión', 'error');
    } else {
        console.log('Signed out successfully.');
        // Redirect to the login page after logout
        redirectToLogin();
    }
}

// Helper function for redirection
function redirectToLogin() {
    // Assuming inventory-admin.html is in 'private' folder, login.html is also in 'private' folder
    window.location.href = 'login.html'; // Adjust path if necessary
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // --- IMPORTANT: AUTHENTICATION CHECK FIRST ---
  // Don't load sensitive data or set up authenticated features until auth is confirmed.
  checkAuth(); // Call the authentication check function

  // Assign other event listeners AFTER the page structure is loaded
  form.addEventListener('submit', manejarSubmitFormulario);
  btnNuevoActivo.addEventListener('click', mostrarFormulario);
  btnCancelar.addEventListener('click', cancelarFormulario);

  // Add event listeners for the filter dropdowns and search input
  filtroTipo.addEventListener('change', cargarActivos);
  filtroEstado.addEventListener('change', cargarActivos);
  filtroProveedor.addEventListener('change', cargarActivos);
  filtroBusqueda.addEventListener('input', cargarActivos); // Use 'input' for live search
  btnLimpiarFiltros.addEventListener('click', limpiarFiltros);

  // Add event listener for the logout button
  if (btnLogout) { // Check if the element exists
     btnLogout.addEventListener('click', handleLogout);
  } else {
      console.warn("Logout button with id 'btn-logout' not found.");
  }

  // Initial data loading calls removed from here - they are now called inside checkAuth
  // cargarUsuarios();
  // cargarTipos();
  // cargarActivos();
});