// Configuración de Supabase
const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos del DOM
const tabla = document.getElementById('tabla-activos');
const mensaje = document.getElementById('mensaje');
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

// Mapeo de proveedores
const proveedores = {
  1: "Compañía",
  2: "KC Rentas",
  3: "New Era"
};

// Variable para controlar el activo en edición
let activoEditando = null;

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
    mostrarMensaje('Error al cargar usuarios', 'error');
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
    mostrarMensaje('Error al cargar tipos de activos', 'error');
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
    mostrarMensaje('Error al cargar los activos', 'error');
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
    
    mostrarMensaje('Activo eliminado correctamente', 'success');
    cargarActivos();
  } catch (error) {
    console.error('Error al eliminar activo:', error.message);
    mostrarMensaje('Error al eliminar el activo', 'error');
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
    mensaje.textContent = '';
  } catch (error) {
    console.error('Error al cargar activo para edición:', error.message);
    mostrarMensaje('Error al cargar el activo para edición', 'error');
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
    vendor_id: parseInt(document.getElementById('proveedor').value),
    asset_type_id: parseInt(document.getElementById('tipo').value)
  };

  // Validación básica
  if (!activo.serial_number || !activo.make || !activo.model || isNaN(activo.asset_type_id)) {
    mostrarMensaje('Por favor complete todos los campos requeridos', 'error');
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
      
      mostrarMensaje('Activo actualizado correctamente', 'success');
    } else {
      // Verificar si el número de serie ya existe
      const { data: existente } = await client
        .from('assets')
        .select('serial_number')
        .eq('serial_number', activo.serial_number)
        .maybeSingle();

      if (existente) {
        mostrarMensaje('Ya existe un activo con ese número de serie', 'error');
        return;
      }

      // Crear nuevo activo
      const { error } = await client.from('assets').insert([activo]);
      
      if (error) throw error;
      
      mostrarMensaje('Activo creado correctamente', 'success');
    }
    
    cancelarFormulario();
    cargarActivos();
  } catch (error) {
    console.error('Error al guardar activo:', error.message);
    mostrarMensaje('Error al guardar el activo: ' + error.message, 'error');
  }
}

/**
 * Muestra un mensaje al usuario
 * @param {string} texto - Texto del mensaje
 * @param {string} tipo - Tipo de mensaje (success, error, warning)
 */
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.style.color = tipo === 'error' ? '#dc3545' : tipo === 'success' ? '#28a745' : '#ffc107';
  mensaje.style.backgroundColor = tipo === 'error' ? '#f8d7da' : tipo === 'success' ? '#d4edda' : '#fff3cd';
  mensaje.style.border = tipo === 'error' ? '1px solid #f5c6cb' : tipo === 'success' ? '1px solid #c3e6cb' : '1px solid #ffeeba';
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

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  // Asignar event listeners
  form.addEventListener('submit', manejarSubmitFormulario);
  btnNuevoActivo.addEventListener('click', mostrarFormulario);
  btnCancelar.addEventListener('click', cancelarFormulario);
  filtroTipo.addEventListener('change', cargarActivos);
  filtroEstado.addEventListener('change', cargarActivos);
  filtroProveedor.addEventListener('change', cargarActivos);
  filtroBusqueda.addEventListener('input', cargarActivos);
  btnLimpiarFiltros.addEventListener('click', limpiarFiltros);

  // Cargar datos iniciales
  cargarUsuarios();
  cargarTipos();
  cargarActivos();
});