// --- js/update-password.js ---

const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const updatePasswordForm = document.getElementById('update-form'); // Assuming your form has id="update-form"
const newPasswordInput = document.getElementById('new-password'); // Assuming input has id="new-password"
const confirmPasswordInput = document.getElementById('confirm-password'); // Assuming you add an input with id="confirm-password"
const authMessage = document.getElementById('auth-message'); // Assuming element with id="auth-message"


// Helper function for consistent message display
function displayMessage(text, type = 'info') {
    authMessage.textContent = text;
    authMessage.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
}


updatePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim(); // Get confirm password value

  // Client-side validation
  if (newPassword !== confirmPassword) {
      displayMessage('Las contraseñas no coinciden.', 'error');
      return; // Stop the function if passwords don't match
  }

  if (newPassword.length < 6) {
       displayMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
       return;
  }

  displayMessage('Actualizando contraseña...'); // Show loading state

  try {
      // Supabase client should automatically detect the PKCE code/token from the URL
      // when this page loads after clicking the reset email link.
      const { data, error } = await client.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Contraseña actualizada:', data);
      displayMessage('✅ Contraseña actualizada correctamente. Ahora puedes iniciar sesión.', 'success');
      updatePasswordForm.reset();

      // Redirect to login page after a short delay
      setTimeout(() => {
          // Assuming update-password.html and login.html are in the same 'private' folder
          window.location.href = 'login.html';
      }, 3000); // Redirect after 3 seconds

  } catch (error) {
    console.error('❌ Error al actualizar la contraseña:', error.message);
     displayMessage(`❌ Error al actualizar: ${error.message}`, 'error');
  }
});

// Optional: You might want to check the session on load to see if the user
// successfully arrived via a valid reset link, or if the token has expired.
// Supabase usually handles this implicitly on the update call, but you could add
// a check here to hide the form or show a different message if no session/token is found.
// document.addEventListener('DOMContentLoaded', async () => {
//    const { data: { session } } = await client.auth.getSession();
//    if (!session) {
//        displayMessage('Enlace de recuperación inválido o expirado.', 'error');
//        // Potentially disable the form fields or hide the form
//        newPasswordInput.disabled = true;
//        confirmPasswordInput.disabled = true;
//        updatePasswordForm.querySelector('button').disabled = true;
//    }
// });