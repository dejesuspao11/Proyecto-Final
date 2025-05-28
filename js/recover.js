// --- js/recover.js ---
const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const recoverForm = document.getElementById('recover-form'); // Renamed variable
const authMessage = document.getElementById('auth-message'); // Assuming element with id="auth-message"

// Helper function for consistent message display
function displayMessage(text, type = 'info') {
    authMessage.textContent = text;
    authMessage.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
}

recoverForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();

  displayMessage('Enviando enlace de recuperación...'); // Show loading state

  // Supabase recommends setting the redirectTo URL in the Auth -> URL Configuration
  // in your Supabase project dashboard. This is more secure.
  // Remove the redirectTo option from the JS call if it's set in the dashboard.
  // If you *must* set it in code, ensure it's not hardcoded to localhost for production.
  const { data, error } = await client.auth.resetPasswordForEmail(email, {
    // redirectTo: 'http://127.0.0.1:5500/private/update-password.html' // REMOVE THIS LINE if set in dashboard
  });

  if (error) {
    console.error('❌ Error al enviar el correo:', error.message);
     displayMessage(`❌ Error: ${error.message}`, 'error');
  } else {
    // Supabase security: API returns success even if the email doesn't exist
    // to prevent email enumeration. Show a generic success message.
    console.log('✅ Solicitud de recuperación procesada:', data);
    displayMessage('📧 Si la cuenta existe, hemos enviado un enlace de recuperación a tu correo electrónico.', 'success');
    recoverForm.reset();
  }
});

// Optional: Check if the user is already logged in and redirect them (less common for recover page)
// async function checkSessionAndRedirect() {
//     const { data: { session } = {} } = await client.auth.getSession(); // Destructure with default empty object
//     if (session) {
//         console.log('User already logged in, redirecting away from recover.');
//         window.location.href = 'inventory-admin.html'; // Adjust path
//     }
// }
// document.addEventListener('DOMContentLoaded', checkSessionAndRedirect);