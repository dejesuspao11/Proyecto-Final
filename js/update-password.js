// --- js/update-password.js ---

const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos del DOM - Correcting IDs to match HTML
const updatePasswordForm = document.getElementById('update-form'); // Correct ID from HTML
const newPasswordInput = document.getElementById('new-password'); // Correct ID from HTML
const confirmPasswordInput = document.getElementById('confirm-password'); // Correct ID from HTML
const mensaje = document.getElementById('mensaje'); // Correct ID from HTML


// Helper function for consistent message display (Updated with styling and timeout)
function displayMessage(text, type = 'info') {
    // Ensure the message element exists
    if (!mensaje) {
        console.error("Message element with ID 'mensaje' not found!");
        return;
    }

    mensaje.textContent = text;
    // Added styling based on type, similar to other pages
    mensaje.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
    mensaje.style.backgroundColor = type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#cfe2ff';
    mensaje.style.border = type === 'error' ? '1px solid #f5c6cb' : type === 'success' ? '1px solid #c3e6cb' : '1px solid #b9daff';
    mensaje.style.padding = '10px';
    mensaje.style.borderRadius = '4px';
    mensaje.style.marginBottom = '15px';
    mensaje.style.textAlign = 'center';

    // Clear the message after a few seconds
    setTimeout(() => {
        mensaje.textContent = '';
        mensaje.style.backgroundColor = ''; // Clear background
        mensaje.style.border = 'none'; // Remove border
        mensaje.style.padding = '';
        mensaje.style.borderRadius = '';
        mensaje.style.marginBottom = '';
        mensaje.style.textAlign = '';
    }, 5000); // Message disappears after 5 seconds
}

// Function to handle password update
async function handlePasswordUpdate(e) {
  e.preventDefault();

  // Ensure input elements exist before accessing value
  if (!newPasswordInput || !confirmPasswordInput) {
      console.error("Password input elements not found!");
      displayMessage("Error interno: Campos de contraseña no encontrados.", 'error');
      return;
  }

  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Client-side validation
  if (!newPassword || !confirmPassword) {
      displayMessage('Por favor, ingresa y confirma tu nueva contraseña.', 'warning');
      return;
  }
  if (newPassword !== confirmPassword) {
      displayMessage('Las contraseñas no coinciden.', 'error');
      return;
  }
  if (newPassword.length < 6) { // Assuming Supabase default min length is 6
       displayMessage('La contraseña debe tener al menos 6 caracteres.', 'warning');
       return;
  }


  displayMessage('Actualizando contraseña...'); // Show loading state

  try {
      // Supabase client automatically processes the PKCE code/token from the URL hash
      // when this page loads via the redirect link.
      // The updateUser function uses this temporary state.
      const { data, error } = await client.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error; // Throw to be caught by the catch block below
      }

      console.log('✅ Contraseña actualizada exitosamente.', data);
      displayMessage('✅ Tu contraseña ha sido actualizada.', 'success');

      // Clear the form after successful update
      if (updatePasswordForm) {
          updatePasswordForm.reset();
      }

      // Redirect to login page after a short delay
      setTimeout(() => {
          // Assuming update-password.html and login.html are in the same 'private' folder
          window.location.href = 'login.html'; // Adjust path if necessary
      }, 3000); // Redirect after 3 seconds

  } catch (error) {
    console.error('❌ Error al actualizar la contraseña:', error.message);

    // --- Handle specific Supabase Auth errors ---
    let userMessage = '❌ Error al actualizar la contraseña. Por favor, inténtalo de nuevo.'; // Generic default message

    if (error.message.includes('Invalid Refresh Token') || // Common error if token is used/invalid
        error.message.includes('Invalid token') ||       // Another potential token error
        error.message.includes('Token has expired')) {   // Explicit expired token message
        userMessage = 'Enlace de recuperación inválido o expirado. Por favor, solicita uno nuevo.';
        // Optionally hide the form if the link is invalid/expired
         if (updatePasswordForm) {
             updatePasswordForm.style.display = 'none';
         }
         // Optionally redirect back to the recover page after this specific error
         setTimeout(() => {
            window.location.href = 'recover.html'; // Adjust path
         }, 5000); // Redirect after delay
    } else {
        // For other errors (e.g., network issues, server errors), you might show a different message
        console.error("Other update password error:", error.message); // Log the specific error for debugging
        userMessage = 'Ocurrió un error inesperado al actualizar la contraseña. Intenta más tarde.';
    }

    displayMessage(userMessage, 'error'); // Display the determined user message
  }
}

// Add event listener to the form
// Ensure the form element exists before adding the listener
if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', handlePasswordUpdate);
} else {
    console.error("Form element with id 'update-form' not found!");
}


// --- Remove the immediate session check on DOMContentLoaded ---
// We will rely on the updateUser call to validate the token instead.
document.addEventListener('DOMContentLoaded', () => {
    console.log("Update password page loaded.");
    // The form submit listener is already attached if the form exists.
    // No immediate session check needed here.
    // The form will be visible initially unless hidden by error handling in handlePasswordUpdate.
});