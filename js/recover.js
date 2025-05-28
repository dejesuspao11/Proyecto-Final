// --- js/recover.js ---
const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

// IMPORTANT: Use window.supabase if you are loading the library via a script tag in HTML
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const recoverForm = document.getElementById('recover-form');
// Corrected variable name to match the HTML element's ID
const mensaje = document.getElementById('mensaje'); // Corrected: Was authMessage

// Helper function for consistent message display (Updated styling and timeout)
function displayMessage(text, type = 'info') {
    mensaje.textContent = text;
    // Added styling based on type, similar to admin panel messages
    mensaje.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
    mensaje.style.backgroundColor = type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#cfe2ff'; // Added light background based on type
    mensaje.style.border = type === 'error' ? '1px solid #f5c6cb' : type === 'success' ? '1px solid #c3e6cb' : '1px solid #b9daff'; // Added border
    mensaje.style.padding = '10px'; // Added padding
    mensaje.style.borderRadius = '4px'; // Added border radius
    mensaje.style.marginBottom = '15px'; // Added margin
    mensaje.style.textAlign = 'center'; // Center text

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

// Event listener for form submission
if (recoverForm) { // Check if form element exists before adding listener
  recoverForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();

    // Basic email validation (optional but recommended)
    if (!email) {
        displayMessage('Por favor, ingresa tu correo electrónico.', 'warning');
        return;
    }
    // Simple regex check (can be improved)
    if (!/\S+@\S+\.\S+/.test(email)) {
         displayMessage('Por favor, ingresa un correo electrónico válido.', 'warning');
         return;
    }


    displayMessage('Enviando enlace de recuperación...'); // Show loading state

    // Supabase recommends setting the redirectTo URL in the Auth -> URL Configuration
    // in your Supabase project dashboard. This is more secure.
    // If you *must* set it in code, ensure it's not hardcoded to localhost for production.
    // Assuming your password update page is `update-password.html` in the same folder.
    // IMPORTANT: Make sure 'http://127.0.0.1:5500/private/update-password.html'
    // or the correct path to your password update page is listed in Supabase Auth -> URL Configuration -> Redirect URLs
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://127.0.0.1:5500/private/update-password.html' // Set the redirect URL explicitly
    });

    if (error) {
      console.error('❌ Error al enviar el correo:', error.message);
       // Supabase security: API returns a generic error message for invalid emails
       // to prevent email enumeration. Use a generic message for the user.
       // If the error is *not* related to the email (e.g., network issue, service down),
       // you might need more sophisticated error handling.
       displayMessage(`❌ Error al enviar la solicitud de recuperación. Por favor, inténtalo de nuevo.`, 'error'); // Generic error message
       // displayMessage(`❌ Error: ${error.message}`, 'error'); // Use this only for debugging, not in production

    } else {
      // Supabase security: API returns success even if the email doesn't exist
      // to prevent email enumeration. Show a generic success message.
      console.log('✅ Solicitud de recuperación procesada.', data);
      displayMessage('📧 Si la cuenta existe, hemos enviado un enlace de recuperación a tu correo electrónico.', 'success');
      // Optionally clear the form immediately after success message is shown
      // recoverForm.reset();
    }
  });
} else {
    console.error("Form with id 'recover-form' not found.");
}


// Optional: Check if the user is already logged in and redirect them away from the recover page
// This prevents authenticated users from trying to recover a password unnecessarily.
async function checkSessionAndRedirect() {
    // getSession returns { data: { session: null }, error: null } if no session
    const { data: { session } } = await client.auth.getSession();

    if (session) {
        console.log('User already logged in, redirecting to admin page.');
        // Redirect to your admin page
        // Assuming inventory-admin.html is in the same 'private' folder as recover.html
        window.location.href = 'inventory-admin.html'; // Adjust path if necessary
    } else {
        console.log('No active session found, showing recover form.');
        // User is not authenticated, do nothing, show the recover form.
    }
}
document.addEventListener('DOMContentLoaded', checkSessionAndRedirect);