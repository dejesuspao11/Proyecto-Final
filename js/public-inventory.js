// Configuración de Supabase
const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tabla = document.getElementById('tabla-inventario'); // Correctly references the tbody

async function obtenerInventario() {
  try {
    const { data, error } = await client
      .from('assets')
      .select(`
        serial_number,
        make,
        model,
        status,
        asset_type_id ( name ),
        users ( full_name )
      `) // <<< Removed the comments from inside the string literal
      .order('make', { ascending: true }); // Optional: Keep consistent ordering

    if (error) throw error;

    // Clear previous content before populating
    tabla.innerHTML = '';

    if (!data || data.length === 0) {
        // Display message if no data found
        tabla.innerHTML = `
          <tr><td colspan="6">No se encontraron activos.</td></tr>
        `;
        return; // Exit the function
    }


    // Populate table with fetched data
    data.forEach(item => {
      const fila = document.createElement('tr');

      // Map the status value to display text
      const estadoDisplay = item.status === 'assigned' ? 'Asignado' : 'Libre';

      fila.innerHTML = `
        <td>${item.asset_type_id?.name || '-'}</td>
        <td>${item.make || '-'}</td>
        <td>${(item.model || '-').replace(/'/g, '')}</td>
        <td>${(item.serial_number || '-').replace(/'/g, '')}</td>
        <td>${estadoDisplay}</td>
        <td>${item.users?.full_name || 'Sin asignar'}</td>
      `;
      tabla.appendChild(fila);
    });

  } catch (err) {
    console.error('Error al cargar inventario público:', err.message);
    // Display error message in the table, ensure colspan is correct (6 columns)
    tabla.innerHTML = `
      <tr><td colspan="6">❌ Error al obtener datos. ${err.message}</td></tr>
    `;
  }
}

// Execute the function to load data when the script runs (page loads)
obtenerInventario();