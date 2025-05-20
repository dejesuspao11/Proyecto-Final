const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0'; // ← Usa tu anon key real

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('update-form');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('new-password').value.trim();

  const { data, error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('❌ Error al actualizar la contraseña:', error.message);
    mensaje.textContent = `❌ ${error.message}`;
    mensaje.style.color = 'red';
  } else {
    console.log('✅ Contraseña actualizada:', data);
    mensaje.textContent = '✅ Contraseña actualizada correctamente. Ahora puedes iniciar sesión.';
    mensaje.style.color = 'green';
    form.reset();
  }
});
