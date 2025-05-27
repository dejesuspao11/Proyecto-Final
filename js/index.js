const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const estado = document.getElementById('estado-conexion');

// Verificar sesión activa
client.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    // Si no hay sesión activa, redirige al login
    window.location.href = '/private/login.html';
  } else {
    estado.textContent = '✅ Conexión exitosa con Supabase.';
    estado.style.color = 'green';
    console.log('Usuario autenticado:', session.user.email);
  }
}).catch((error) => {
  console.error('❌ Error al verificar la sesión:', error);
  estado.textContent = '❌ Error al verificar la sesión.';
  estado.style.color = 'red';
});
