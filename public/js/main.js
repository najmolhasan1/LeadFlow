// Main JavaScript file for common functionality

// Check if user is logged in
function checkUserAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        return JSON.parse(user);
    }
    return null;
}

// Display user info if logged in
function displayUserInfo() {
    const user = checkUserAuth();
    const userInfoElement = document.getElementById('userInfo');
    
    if (user && userInfoElement) {
        userInfoElement.innerHTML = `
            <p>Welcome, ${user.name}!</p>
            <button onclick="logout()" class="btn btn-secondary">Logout</button>
        `;
    }
}

// Common logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Common message display function
function showMessage(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();
});
