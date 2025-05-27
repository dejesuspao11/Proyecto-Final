const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tabla = document.getElementById('tabla-inventario');

async function obtenerInventario() {
  try {
    const { data, error } = await client
      .from('assets')
      .select(`
        serial_number,
        make,
        model,
        status,
        users ( full_name )
      `);

    if (error) throw error;

    tabla.innerHTML = ''; // Limpiar contenido previo

    data.forEach(item => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${item.asset_type_id || '-'}</td>
        <td>${item.make || '-'}</td>
        <td>${(item.model || '-').replace(/'/g, '')}</td>
        <td>${item.serial_number || '-'}</td>
        <td>${item.status || '-'}</td>
        <td>${item.users?.full_name || 'Sin asignar'}</td>
      `;
      tabla.appendChild(fila);
    });

  } catch (err) {
    console.error('Error al cargar inventario:', err.message);
    tabla.innerHTML = `
      <tr><td colspan="6">❌ Error al obtener datos.</td></tr>
    `;
  }
}

obtenerInventario();
