const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

// CORRECTO: accedemos desde window.supabase
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .limit(1);

    const estado = document.getElementById('estado-conexion');

    if (error) {
      console.error('❌ Error al conectar con Supabase:', error.message);
      estado.textContent = '❌ Error al conectar con Supabase. Revisa tu configuración.';
    } else {
      console.log('✅ Conexión exitosa. Datos:', data);
      estado.textContent = '✅ Conexión exitosa con Supabase.';
    }
  } catch (e) {
    console.error('❌ Error inesperado:', e);
  }
}

testConnection();
