const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Proteger acceso solo para usuarios autenticados
client.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    window.location.href = '/private/login.html';
  } else {
    cargarInventario();
  }
});

async function cargarInventario() {
  const tabla = document.getElementById('tabla-inventario');

  const { data, error } = await client
    .from('assets') // usa el nombre real de tu tabla
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
    tabla.innerHTML = `<tr><td colspan="5">Error al cargar datos.</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tabla.innerHTML = `<tr><td colspan="5">No hay activos registrados.</td></tr>`;
    return;
  }

  tabla.innerHTML = ''; // Limpiar antes de renderizar

  data.forEach((item) => {
    const fila = `
      <tr>
        <td>${item.serial_number}</td>
        <td>${item.make} ${item.model}</td>
        <td>${item.asset_type_id?.name || 'N/A'}</td>
        <td>${item.status}</td>
        <td>${item.users?.full_name || 'No asignado'}</td>
      </tr>
    `;
    tabla.innerHTML += fila;
  });
}