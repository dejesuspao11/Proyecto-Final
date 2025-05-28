// --- js/login.js ---
const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('login-form'); // Renamed variable from 'form' for clarity
const messageElement = document.getElementById('mensaje'); // <--- CORRECTED: Get the element with id="mensaje"


// Helper function for consistent message display
function displayMessage(text, type = 'info') {
    messageElement.textContent = text;
    // Optional: Add CSS classes for better styling flexibility
    messageElement.className = ''; // Clear previous classes
    if (type === 'error') {
        messageElement.classList.add('error');
    } else if (type === 'success') {
        messageElement.classList.add('success');
    } else { // info
         messageElement.classList.add('info');
    }
    // Or continue using inline styles if preferred:
    // messageElement.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
}


loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Basic client-side validation
   if (!email || !password) {
       displayMessage('Por favor, ingresa correo y contraseña.', 'error');
       return; // Stop if fields are empty
   }


  displayMessage('Iniciando sesión...', 'info'); // Show loading state


  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('❌ Error al iniciar sesión:', error.message);
    // Provide more specific error messages based on Supabase errors
    if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_grant')) {
        displayMessage('Credenciales inválidas. Verifica tu correo y contraseña.', 'error');
    } else if (error.message.includes('Email not confirmed')) {
         displayMessage('Tu correo electrónico no ha sido confirmado. Por favor, revisa tu bandeja de entrada.', 'error');
    }
     else {
       displayMessage(`❌ Error al iniciar sesión: ${error.message}`, 'error');
    }
  } else {
    console.log('✅ Sesión iniciada:', data);
    displayMessage('✅ Inicio de sesión exitoso. Redirigiendo...', 'success');

    // Redirect to the admin panel
    // Assuming login.html and inventory-admin.html are in the same 'private' folder
    window.location.href = 'inventory-admin.html'; // Adjust path if necessary
  }
});

// Check if the user is already logged in on page load and redirect them
async function checkSessionAndRedirect() {
    const { data: { session }, error } = await client.auth.getSession();

    if (error) {
         console.error('Error checking session:', error.message);
         // If there's an error getting the session, don't redirect, allow login attempt.
         displayMessage('Error al verificar la sesión. Intenta iniciar sesión.', 'error');
         return;
    }

    if (session) {
        console.log('User already logged in, redirecting to admin.');
        // Redirect to the admin panel
         // Assuming login.html and inventory-admin.html are in the same 'private' folder
        window.location.href = 'inventory-admin.html'; // Adjust path if necessary
    } else {
        // No session found, user needs to log in. Clear any lingering message.
        displayMessage('');
    }
}

// Execute the session check when the page finishes loading
document.addEventListener('DOMContentLoaded', checkSessionAndRedirect);