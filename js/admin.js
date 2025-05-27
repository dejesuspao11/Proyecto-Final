const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0'; // Usa tu clave completa
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verificar autenticación
client.auth.getUser().then(({ data, error }) => {
  if (error || !data.user) {
    window.location.href = "login.html";
  }
});

const form = document.getElementById('form-activo');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const tipo = document.getElementById('tipo').value;
  const estado = document.getElementById('estado').value;
  const asignado = document.getElementById('asignado').value.trim();

  const { data, error } = await client.from('activos').insert([
    { nombre, tipo, estado, asignado }
  ]);

  if (error) {
    mensaje.textContent = '❌ Error al crear el activo.';
    mensaje.style.color = 'red';
    console.error(error);
  } else {
    mensaje.textContent = '✅ Activo creado con éxito.';
    mensaje.style.color = 'green';
    form.reset();
  }
});
