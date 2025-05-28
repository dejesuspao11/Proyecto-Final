// --- js/register.js ---
const SUPABASE_URL = 'https://kfyxacgqpnfnsqickgar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeXhhY2dxcG5mbnNxaWNrZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Njg1MzMsImV4cCI6MjA2MTQ0NDUzM30.kw0wOUvyxffTkCNgpeTgqFC7tRyNuBlTdoLTPVXFNR0';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const registerForm = document.getElementById('register-form'); // Renamed variable
const authMessage = document.getElementById('auth-message'); // Assuming element with id="auth-message"

// Helper function for consistent message display
function displayMessage(text, type = 'info') {
    authMessage.textContent = text;
    authMessage.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
}

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  displayMessage('Registrando...'); // Show loading state

// Assuming you have variables 'email' and 'password' containing the user's input
const userEmail = email; // Or however you get the email value
const userPassword = password; // Or however you get the password value

const { data, error } = await client.auth.signUp({
  email: userEmail,
  password: userPassword,
  options: {
    // This is the URL the user will be redirected to *after* clicking the confirmation link in the email.
    // You should point this to the page you want the user to land on post-confirmation,
    // which is typically your login page or a confirmation success page.
    // Make sure this exact URL is added to your "Redirect URLs" in your Supabase project settings
    // (Auth -> URL Configuration). If it's not listed there, Supabase might ignore it
    // or redirect to your Site URL instead.
    emailRedirectTo: 'YOUR_LOGIN_PAGE_URL_HERE' // Example: 'http://127.0.0.1:5500/private/login.html'
  }
});

if (error) {
  console.error('Error signing up:', error.message);
  // Handle the error (e.g., display an error message to the user)
} else {
  console.log('Sign up successful. Please check your email for a confirmation link.');
  // Inform the user that they need to check their email
}

  if (error) {
    console.error('❌ Error al registrar:', error.message);
    // Provide more specific error messages
     if (error.message.includes('User already registered')) {
         displayMessage('El correo electrónico ya está registrado.', 'error');
    } else if (error.message.includes('Password should be at least 6 characters')) {
        displayMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
    }
     else {
       displayMessage(`❌ Error al registrar: ${error.message}`, 'error');
    }
  } else {
    console.log('✅ Registro:', data);
    // Check if email confirmation is required
    if (data.user && data.user.identities && data.user.identities.length > 0 && data.user.email_confirmed_at === null) {
        displayMessage('✅ ¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.', 'success');
        registerForm.reset(); // Clear the form after success
    } else if (data.user) {
        // User created and auto-confirmed (if email confirmation is off) or they were already signed in/registered
         displayMessage('Registro o inicio de sesión exitoso. Redirigiendo...', 'success');
         // Redirect directly if email confirmation is NOT required or if user was already signed in
          window.location.href = 'inventory-admin.html'; // Adjust path
    }
     else {
         // This case might occur if data.user is null but error is also null (less common)
         displayMessage('Registro procesado. Revisa tu correo para confirmación.', 'info');
         registerForm.reset(); // Clear the form
     }
  }
});


// Check if the user is already logged in on page load and redirect them
async function checkSessionAndRedirect() {
    const { data: { session }, error } = await client.auth.getSession();

     if (error) {
         console.error('Error checking session:', error.message);
         // Still allow them to register if there's a session check error
         return;
    }

    if (session) {
        console.log('User already logged in, redirecting to admin.');
        // Redirect to the admin panel
        // Assuming register.html and inventory-admin.html are in the same 'private' folder
        window.location.href = 'inventory-admin.html';
    }
}

// Execute the session check when the page finishes loading
document.addEventListener('DOMContentLoaded', checkSessionAndRedirect);