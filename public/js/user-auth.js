// User Registration - COMPLETELY FIXED
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    console.log('Registration attempt:', formData); // Debug

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Registration response:', data); // Debug

        if (response.ok) {
            showMessage('message', 'Registration successful! Redirecting to login...', 'success');
            
            // Clear any existing auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'user-login.html';
            }, 2000);
        } else {
            showMessage('message', data.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('message', 'Registration failed. Please try again.', 'error');
    }
});

// User Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('message', data.message, 'success');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Check if there's a file to download from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const fileId = urlParams.get('fileId');
            
            if (fileId) {
                // Redirect to download page with file ID
                setTimeout(() => {
                    window.location.href = `/download/${fileId}`;
                }, 1000);
            } else {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } else {
            showMessage('message', data.message, 'error');
        }
    } catch (error) {
        showMessage('message', 'Login failed. Please try again.', 'error');
    }
});

function showMessage(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
    }
}

// Check authentication for download page
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        const fileId = window.location.pathname.split('/').pop();
        window.location.href = `/user-login.html?fileId=${fileId}`;
        return null;
    }
    return token;
}