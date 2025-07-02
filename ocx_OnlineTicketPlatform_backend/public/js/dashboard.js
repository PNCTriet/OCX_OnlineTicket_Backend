// Supabase Configuration - Direct configuration
const SUPABASE_URL = 'https://nbzxuwrnvxbjzdspxfaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ienh1d3Judnhianpkc3B4ZmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDI4MjYsImV4cCI6MjA2NjY3ODgyNn0.Ive93K213H91ccQUry1PqgU6507gbzs48NObhoNt8Ng';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const userEmail = document.getElementById('userEmail');
const welcomeTitle = document.getElementById('welcomeTitle');
const welcomeSubtitle = document.getElementById('welcomeSubtitle');
const loginTime = document.getElementById('loginTime');
const logoutBtn = document.getElementById('logoutBtn');

// Get user info from localStorage or session
function getUserInfo() {
    const userStr = localStorage.getItem('user');
    const sessionStr = localStorage.getItem('session');
    
    if (userStr) {
        return JSON.parse(userStr);
    } else if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return session.user;
    }
    
    return null;
}

// Update welcome message
function updateWelcomeMessage(user) {
    const name = user.user_metadata?.name || user.user_metadata?.full_name || 'User';
    const email = user.email;
    
    // Update welcome title
    welcomeTitle.textContent = `Welcome, ${name}!`;
    
    // Update user email in nav
    userEmail.textContent = email;
    
    // Update login time
    const now = new Date();
    loginTime.textContent = now.toLocaleString();
    
    // Update welcome subtitle based on login method
    if (user.app_metadata?.provider === 'google') {
        welcomeSubtitle.textContent = `You have successfully logged in with Google to your admin dashboard.`;
    } else if (user.app_metadata?.provider === 'twitter') {
        welcomeSubtitle.textContent = `You have successfully logged in with Twitter to your admin dashboard.`;
    } else {
        welcomeSubtitle.textContent = `You have successfully logged in to your admin dashboard.`;
    }
}

// Check authentication status
async function checkAuthStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // No session, redirect to login
        window.location.href = '/index.html';
        return;
    }
    
    // Update welcome message
    updateWelcomeMessage(session.user);
}

// Logout function
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Logout error:', error);
            alert('Error during logout: ' + error.message);
            return;
        }
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        
        // Redirect to login page
        window.location.href = '/index.html';
        
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error during logout: ' + error.message);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth status first
    await checkAuthStatus();
    
    // Add logout event listener
    logoutBtn.addEventListener('click', logout);
    
    // Add auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            // User signed out, redirect to login
            window.location.href = '/index.html';
        } else if (event === 'TOKEN_REFRESHED' && session) {
            // Token refreshed, update user info
            updateWelcomeMessage(session.user);
        }
    });
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers for quick action buttons
    const quickActionButtons = document.querySelectorAll('.glass-effect button');
    
    quickActionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            
            // Show a simple alert for now (you can implement actual functionality later)
            alert(`Feature "${buttonText}" is coming soon!`);
        });
    });
    
    // Add hover effects for stats cards
    const statCards = document.querySelectorAll('.glass-effect.rounded-xl');
    
    statCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.transition = 'transform 0.2s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

// Auto-refresh session every 5 minutes
setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // Session is still valid, update login time
        const now = new Date();
        loginTime.textContent = now.toLocaleString();
    }
}, 300000); // 5 minutes 