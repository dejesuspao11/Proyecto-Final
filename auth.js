const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('signup-form');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error('❌ Error al registrar:', error.message);
    mensaje.textContent = `❌ Error: ${error.message}`;
    mensaje.style.color = 'red';
  } else {
    console.log('✅ Usuario registrado:', data);
    mensaje.textContent = '✅ Registro exitoso. Revisa tu correo para confirmar la cuenta.';
    mensaje.style.color = 'green';
    form.reset();
  }
});
