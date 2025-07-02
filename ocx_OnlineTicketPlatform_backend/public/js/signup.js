// Supabase Configuration - Direct configuration
const SUPABASE_URL = 'https://nbzxuwrnvxbjzdspxfaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ienh1d3Judnhianpkc3B4ZmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDI4MjYsImV4cCI6MjA2NjY3ODgyNn0.Ive93K213H91ccQUry1PqgU6507gbzs48NObhoNt8Ng';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const signupForm = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const signupBtn = document.getElementById('signupBtn');
const signupBtnText = document.getElementById('signupBtnText');
const signupBtnSpinner = document.getElementById('signupBtnSpinner');
const alertContainer = document.getElementById('alertContainer');
const googleSignupBtn = document.getElementById('googleSignupBtn');
const facebookSignupBtn = document.getElementById('facebookSignupBtn');

// Utility Functions
function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `p-4 rounded-lg mb-4 ${
        type === 'error' 
            ? 'bg-red-900/50 border border-red-700 text-red-200' 
            : 'bg-green-900/50 border border-green-700 text-green-200'
    }`;
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${
                    type === 'error' 
                        ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                }"></path>
            </svg>
            ${message}
        </div>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function setLoading(isLoading) {
    if (isLoading) {
        signupBtn.disabled = true;
        signupBtnText.textContent = 'Creating Account...';
        signupBtnSpinner.classList.remove('hidden');
    } else {
        signupBtn.disabled = false;
        signupBtnText.textContent = 'Create Account';
        signupBtnSpinner.classList.add('hidden');
    }
}

// Toggle Password Visibility
function setupPasswordToggle(inputElement, toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const type = inputElement.type === 'password' ? 'text' : 'password';
        inputElement.type = type;
        
        // Update icon
        const icon = toggleBtn.querySelector('svg');
        if (type === 'text') {
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
            `;
        } else {
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            `;
        }
    });
}

// Handle Form Submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields');
        return;
    }
    
    if (!email.includes('@')) {
        showAlert('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match');
        return;
    }
    
    setLoading(true);
    
    try {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    full_name: name
                }
            }
        });
        
        if (error) {
            throw error;
        }
        
        // Success
        showAlert('Account created successfully! Please check your email to confirm your account.', 'success');
        
        // Clear form
        signupForm.reset();
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
        
    } catch (error) {
        console.error('Signup error:', error);
        
        let errorMessage = 'An error occurred during registration';
        
        if (error.message) {
            if (error.message.includes('User already registered')) {
                errorMessage = 'An account with this email already exists';
            } else if (error.message.includes('Password should be at least')) {
                errorMessage = 'Password is too weak';
            } else {
                errorMessage = error.message;
            }
        }
        
        showAlert(errorMessage);
    } finally {
        setLoading(false);
    }
});

// Social Sign Up Functions
async function signUpWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/admin_dashboard'
            }
        });
        
        if (error) throw error;
        
    } catch (error) {
        console.error('Google sign up error:', error);
        showAlert('Failed to sign up with Google: ' + error.message);
    }
}

async function signUpWithFacebook() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: window.location.origin + '/admin_dashboard'
            }
        });
        
        if (error) throw error;
        
    } catch (error) {
        console.error('Facebook sign up error:', error);
        showAlert('Failed to sign up with Facebook: ' + error.message);
    }
}

// Check if user is already logged in
async function checkAuthStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        // User is already logged in, redirect to dashboard
        window.location.href = '/admin_dashboard';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth status
    await checkAuthStatus();
    
    // Setup password toggles
    setupPasswordToggle(passwordInput, togglePasswordBtn);
    setupPasswordToggle(confirmPasswordInput, toggleConfirmPasswordBtn);
    
    // Add social signup event listeners
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            signUpWithGoogle();
        });
    }
    
    if (facebookSignupBtn) {
        facebookSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            signUpWithFacebook();
        });
    }
});

// Handle auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('user', JSON.stringify(session.user));
        localStorage.setItem('session', JSON.stringify(session));
    } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('user');
        localStorage.removeItem('session');
    }
}); 