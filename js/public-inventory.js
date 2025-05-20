const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cargarInventario() {
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

  const tabla = document.getElementById('tabla-inventario');
  if (error) {
    console.error('Error al cargar inventario:', error.message);
    tabla.innerHTML = `<tr><td colspan="6">❌ Error al obtener datos.</td></tr>`;
    return;
  }

  if (data.length === 0) {
    tabla.innerHTML = `<tr><td colspan="6">No hay activos registrados.</td></tr>`;
    return;
  }

  data.forEach(item => {
    const fila = `
      <tr>
        <td>${item.asset_type_id?.name || 'N/A'}</td>
        <td>${item.make}</td>
        <td>${item.model}</td>
        <td>${item.serial_number}</td>
        <td>${item.status === 'free' ? 'Disponible' : 'Asignado'}</td>
        <td>${item.users?.full_name || 'Sin asignar'}</td>
      </tr>
    `;
    tabla.innerHTML += fila;
  });
}

cargarInventario();
