// --- js/public-inventory.js ---
// Configuración de Supabase
const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos del DOM para la vista pública
const tablaInventarioBody = document.getElementById('tabla-inventario'); // Correctly references the tbody
const searchPublicInput = document.getElementById('search-public'); // Search input element
const filterPublicTypeSelect = document.getElementById('filter-public-type'); // Type filter dropdown
const filterPublicStatusSelect = document.getElementById('filter-public-status'); // Status filter dropdown
const mensaje = document.getElementById('mensaje'); // Message paragraph element

// Helper function for consistent message display (Fixed timeout for loading/error)
function displayMessage(text, type = 'info') {
    // Ensure the message element exists
    if (!mensaje) {
        console.error("Message element with ID 'mensaje' not found!");
        // Optionally, use console.log for the message if element is missing
        // console.log(`Message (${type}): ${text}`);
        return;
    }

    mensaje.textContent = text;
    // Added styling based on type, similar to other pages
    mensaje.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'; // Using blue for info
    mensaje.style.backgroundColor = type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#cfe2ff'; // Added light background based on type
    mensaje.style.border = type === 'error' ? '1px solid #f5c6cb' : type === 'success' ? '1px solid #c3e6cb' : '1px solid #b9daff'; // Added border
    mensaje.style.padding = '10px'; // Added padding
    mensaje.style.borderRadius = '4px'; // Added border radius
    mensaje.style.marginBottom = '15px'; // Added margin
    mensaje.style.textAlign = 'center'; // Center text
    mensaje.style.display = text ? 'block' : 'none'; // Show/hide based on text content

    // Clear the message after a few seconds (only for info/success messages)
    // Error and Loading messages should remain visible until replaced
    if (type === 'info' || type === 'success') {
        setTimeout(() => {
            mensaje.textContent = '';
            mensaje.style.backgroundColor = ''; // Clear background
            mensaje.style.border = 'none'; // Remove border
            mensaje.style.padding = '';
            mensaje.style.borderRadius = '';
            mensaje.style.marginBottom = '';
            mensaje.style.textAlign = '';
            mensaje.style.display = 'none';
        }, 5000); // Message disappears after 5 seconds
    }
    // Note: To clear 'loading' or 'error' messages, call displayMessage('') or displayMessage('new text', 'new type')
}


/**
 * Carga los tipos de activos desde Supabase y los muestra en el dropdown de filtro
 */
async function loadPublicAssetTypes() {
  try {
    const { data, error } = await client.from('asset_types').select('asset_type_id, name').order('name', { ascending: true });

    if (error) throw error;

    // For the filter dropdown
    if (filterPublicTypeSelect) { // Check if element exists
        filterPublicTypeSelect.innerHTML = '<option value="">Todos los tipos</option>'; // Keep original "Todos" option
        data.forEach(tipo => {
            const opt = document.createElement('option');
            opt.value = tipo.asset_type_id;
            opt.textContent = tipo.name;
            filterPublicTypeSelect.appendChild(opt);
        });
    }

  } catch (error) {
    console.error('Error al cargar tipos de activos para filtro público:', error.message);
    // Maybe show a less intrusive message for filter loading error, or rely on table load error
  }
}


/**
 * Carga y filtra los activos para la vista pública
 */
async function loadPublicInventory() {
  // Ensure table body exists
  if (!tablaInventarioBody) {
      console.error("Table body element with ID 'tabla-inventario' not found!");
      displayMessage("Error interno: No se pudo cargar la tabla.", 'error');
      return;
  }

  // Declare finalFilterString outside the try block
  let finalFilterString = ''; // Moved declaration here

  // Show loading message in the table body and the message paragraph
  tablaInventarioBody.innerHTML = '<tr><td colspan="6">Cargando inventario...</td></tr>';
  displayMessage('Cargando inventario...', 'loading'); // Use 'loading' type

  try {
    // Build the base query, selecting only columns needed for public view
    let query = client
      .from('assets')
      .select(`
        asset_type_id ( name ),
        make,
        model,
        serial_number,
        status,
        users ( full_name )
      `)
      .order('make', { ascending: true }); // Default sorting

    // Get current filter and search values (with checks if elements exist)
    const searchTerm = searchPublicInput ? searchPublicInput.value.toLowerCase().trim() : '';
    const selectedType = filterPublicTypeSelect ? filterPublicTypeSelect.value : '';
    const selectedStatus = filterPublicStatusSelect ? filterPublicStatusSelect.value : '';

    // Array to hold individual filter conditions for the .filter() method
    const filterParts = [];

    // Apply dropdown filters (These will be AND conditions)
    // Type filter is based on asset_type_id (integer foreign key)
    if (selectedType && selectedType !== '') {
      filterParts.push(`asset_type_id.eq.${selectedType}`);
    }

    // Status filter is based on status (string column)
    if (selectedStatus && selectedStatus !== '') {
       filterParts.push(`status.eq.'${selectedStatus}'`);
    }

    // Apply search term (OR conditions across *publicly accessible/displayable* fields)
    if (searchTerm) {
      const orConditions = [];

      // Fields to search: Marca, Modelo, Serie, Estado (display text)
      // IMPORTANT: Removed search on 'asset_type_id!inner.name' AND 'users!inner.full_name'
      // These are the most likely culprits for RLS/parse errors on joined tables for anonymous users.
      orConditions.push(`make.ilike.%${searchTerm}%`);                     // Search Make
      orConditions.push(`model.ilike.%${searchTerm}%`);                   // Search Model
      orConditions.push(`serial_number.ilike.%${searchTerm}%`);           // Search Serial Number

      // Search by Estado (mapping display text 'Asignado'/'Libre' to db values 'assigned'/'free')
      // Check if the search term *includes* the display text (case-insensitive)
      if ('asignado'.includes(searchTerm)) {
          orConditions.push(`status.eq.'assigned'`);
      }
       if ('libre'.includes(searchTerm)) {
          orConditions.push(`status.eq.'free'`);
      }

      // If there are any OR conditions, combine them into a single string wrapped in 'or()'
      if (orConditions.length > 0) {
          // Add the combined OR clause to the main filterParts array
          filterParts.push(`or(${orConditions.join(',')})`);
      }
    }

    // Apply all combined filters using the .filter() method
    if (filterParts.length > 0) {
        finalFilterString = filterParts.join(','); // Assign value
        console.log("Applying filter string:", finalFilterString); // Debugging
        query = query.filter(finalFilterString);
    } else {
        // If no filters or search term, finalFilterString remains empty
        finalFilterString = ''; // Explicitly set to empty string if no filters applied
        console.log("No filters applied."); // Debugging
    }


    // Execute the query
    const { data, error } = await query;

    if (error) {
        console.error("Supabase Query Error:", error); // Log the full error object
        throw error; // Throw to be caught by the catch block below
    }

    // Clear previous table rows
    tablaInventarioBody.innerHTML = '';

    if (!data || data.length === 0) {
      tablaInventarioBody.innerHTML = '<tr><td colspan="6">No se encontraron activos con los filtros/búsqueda seleccionados.</td></tr>';
      displayMessage('No se encontraron activos.', 'info'); // Clear loading message and show no results
      return;
    }

    // Populate the table with fetched data
    data.forEach(item => {
      const row = document.createElement('tr');

      // Map the status value to display text and add class
      const statusText = item.status === 'assigned' ? 'Asignado' : 'Libre';
      const statusClass = item.status; // 'assigned' or 'free'

      row.innerHTML = `
        <td>${item.asset_type_id?.name || '-'}</td>
        <td>${item.make || '-'}</td>
        <td>${item.model || '-'}</td>
        <td>${item.serial_number || '-'}</td>
        <td class="status ${statusClass}">${statusText}</td> <!-- Added class here -->
        <td>${item.users?.full_name || 'Sin asignar'}</td> <!-- Keep display, but data might be null due to RLS -->
      `;
      tablaInventarioBody.appendChild(row);
    });

    // Clear loading message on success
    displayMessage('');

  } catch (err) {
    console.error('Error al cargar inventario público:', err); // Log the full error object
    console.error('Failed query filter string:', finalFilterString); // Log the failed string (now accessible)

    // Check for specific Supabase parse errors or RLS errors
    let displayErrMessage = '❌ Error al obtener datos. Intente nuevamente.';
     if (err.message && err.message.includes('failed to parse filter')) {
         displayErrMessage = '❌ Error al aplicar filtros/búsqueda. Formato incorrecto.';
         console.error("Supabase Filter Parse Error:", err.message);
     } else if (err.message && err.message.includes('permission denied for table')) {
         displayErrMessage = '❌ Error de permisos. No se puede obtener el inventario.';
          console.error("Supabase RLS Error:", err.message);
     } else if (err.message) {
         displayErrMessage = `❌ Error: ${err.message}`; // Display the actual error message
          console.error("Other Error:", err.message);
     } else {
          console.error("Unknown Error:", err);
     }


    tablaInventarioBody.innerHTML = `
      <tr><td colspan="6">${displayErrMessage}</td></tr>
    `; // Generic error in table

    displayMessage(`${displayErrMessage}`, 'error'); // Also show in message area
  }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Public inventory page loaded.");

    // Load asset types for the filter dropdown
    loadPublicAssetTypes();

    // Load initial inventory data
    // This will also be triggered by filter/search changes
    loadPublicInventory();

    // Add event listeners for filtering and searching
    // Check if elements exist before adding listeners
    if (searchPublicInput) {
        // Use 'input' for live search as user types
        searchPublicInput.addEventListener('input', loadPublicInventory);
        console.log("Event listener attached to #search-public");
    } else { console.warn("Search input #search-public not found. Filters/Search may not work."); }

     if (filterPublicTypeSelect) {
         filterPublicTypeSelect.addEventListener('change', loadPublicInventory); // Filter when type changes
         console.log("Event listener attached to #filter-public-type");
     } else { console.warn("Type filter #filter-public-type not found. Filters/Search may not work."); }

     if (filterPublicStatusSelect) {
        filterPublicStatusSelect.addEventListener('change', loadPublicInventory); // Filter when status changes
        console.log("Event listener attached to #filter-public-status");
     } else { console.warn("Status filter #filter-public-status not found. Filters/Search may not work."); }

     // Note: #mensaje element needs to exist in your HTML for displayMessage to work
     if (!mensaje) { console.warn("Message element #mensaje not found. Messages will not display."); }
     else { console.log("Message element #mensaje found."); }
});