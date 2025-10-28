let adminToken = localStorage.getItem('adminToken');
let currentFilesPage = 1;
let currentUsersPage = 1;
let filesPerPage = 10;
let usersPerPage = 10;

// Data storage
let allFiles = [];
let allUsers = [];
let filteredFiles = [];
let filteredUsers = [];
let selectedFiles = new Set();
let selectedUsers = new Set();

// Sorting state
let filesSortField = 'uploadedAt';
let filesSortDirection = 'desc';
let usersSortField = 'createdAt';
let usersSortDirection = 'desc';

// Search state
let filesSearchTerm = '';
let usersSearchTerm = '';

// ✅ DECLARED FUNCTIONS FIRST
function applyFilesFiltersAndSort() {
    // Apply search filter
    if (filesSearchTerm) {
        const searchLower = filesSearchTerm.toLowerCase();
        filteredFiles = allFiles.filter(file => 
            file.topic.toLowerCase().includes(searchLower) ||
            file.originalName.toLowerCase().includes(searchLower)
        );
    } else {
        filteredFiles = [...allFiles];
    }

    // Apply sorting
    filteredFiles.sort((a, b) => {
        let aValue = a[filesSortField];
        let bValue = b[filesSortField];
        
        if (filesSortField === 'uploadedAt' || filesSortField === 'createdAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else {
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();
        }
        
        if (aValue < bValue) return filesSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return filesSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    displayFiles(currentFilesPage);
}

function applyUsersFiltersAndSort() {
    // Apply search filter
    if (usersSearchTerm) {
        const searchLower = usersSearchTerm.toLowerCase();
        filteredUsers = allUsers.filter(user => 
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (user.whatsapp && user.whatsapp.toLowerCase().includes(searchLower)) ||
            (user.eduLevel && user.eduLevel.toLowerCase().includes(searchLower)) ||
            (user.knowledgeLevel && user.knowledgeLevel.toLowerCase().includes(searchLower)) ||
            (user.sourcePlatform && user.sourcePlatform.toLowerCase().includes(searchLower)) ||
            (user.registeredForFile && user.registeredForFile.topic && user.registeredForFile.topic.toLowerCase().includes(searchLower))
        );
    } else {
        filteredUsers = [...allUsers];
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
        let aValue = a[usersSortField];
        let bValue = b[usersSortField];
        
        // Handle file topic sorting
        if (usersSortField === 'fileTopic') {
            aValue = a.registeredForFile ? a.registeredForFile.topic : '';
            bValue = b.registeredForFile ? b.registeredForFile.topic : '';
        }
        
        if (usersSortField === 'createdAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else {
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();
        }
        
        if (aValue < bValue) return usersSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return usersSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    displayUsers(currentUsersPage);
}

async function loadAllFiles() {
    if (!checkAdminAuth()) return;

    try {
        console.log('🔄 Loading files...');
        
        const response = await fetch('/api/files', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        console.log('📡 Files API response status:', response.status);

        if (response.status === 401) {
            console.log('❌ Unauthorized - clearing token');
            localStorage.removeItem('adminToken');
            window.location.href = '/admin';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allFiles = await response.json();
        console.log(`✅ Loaded ${allFiles.length} files`);
        
        applyFilesFiltersAndSort();
        
    } catch (error) {
        console.error('❌ Error loading files:', error);
        showMessage('message', 'Error loading files: ' + error.message, 'error');
    }
}

async function loadAllUsers() {
    if (!checkAdminAuth()) return;

    try {
        console.log('🔄 Loading users...');
        
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        console.log('📡 Users API response status:', response.status);

        if (response.status === 401) {
            console.log('❌ Unauthorized - clearing token');
            localStorage.removeItem('adminToken');
            window.location.href = '/admin';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allUsers = await response.json();
        console.log(`✅ Loaded ${allUsers.length} users`);
        
        applyUsersFiltersAndSort();
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        showMessage('message', 'Error loading users: ' + error.message, 'error');
    }
}

// Check admin authentication
function checkAdminAuth() {
    if (!adminToken) {
        window.location.href = '/admin';
        return false;
    }
    return true;
}

// Admin Login
document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('message', data.message, 'success');
            adminToken = data.token;
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('admin', JSON.stringify(data.admin));
            
            setTimeout(() => {
                window.location.href = '/admin-dashboard';
            }, 1000);
        } else {
            showMessage('message', data.message, 'error');
        }
    } catch (error) {
        showMessage('message', 'Login failed. Please try again.', 'error');
    }
});

// File Upload - FIXED AUTO REFRESH ISSUE
document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!checkAdminAuth()) return;

    const formData = new FormData();
    formData.append('topic', document.getElementById('topic').value);
    formData.append('file', document.getElementById('file').files[0]);

    try {
        const response = await fetch('/api/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('message', 'File uploaded successfully! Download link generated.', 'success');
            document.getElementById('uploadForm').reset();
            
            // FIX: Force reload files list after successful upload
            await loadAllFiles();
            
            const linkDiv = document.getElementById('downloadLink');
            const linkInput = document.getElementById('generatedLink');
            
            // Generate links with different sources
            const fileId = data.file.id;
            const baseUrl = window.location.origin;
            
            const links = `
📱 Social Media Links for Sharing:

🔵 Facebook: ${baseUrl}/register?fileId=${fileId}&source=Facebook
🔴 YouTube: ${baseUrl}/register?fileId=${fileId}&source=YouTube
🔵 LinkedIn: ${baseUrl}/register?fileId=${fileId}&source=LinkedIn
🟢 WhatsApp: ${baseUrl}/register?fileId=${fileId}&source=WhatsApp
🟣 Instagram: ${baseUrl}/register?fileId=${fileId}&source=Instagram
🔵 Twitter: ${baseUrl}/register?fileId=${fileId}&source=Twitter
⚪ Direct: ${baseUrl}/register?fileId=${fileId}&source=Direct
            `;
            
            linkInput.value = links;
            linkDiv.style.display = 'block';
            
        } else {
            showMessage('message', data.message, 'error');
        }
    } catch (error) {
        showMessage('message', 'Upload failed. Please try again.', 'error');
    }
});

// Copy generated link function
function copyGeneratedLink() {
    const linkInput = document.getElementById('generatedLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    try {
        navigator.clipboard.writeText(linkInput.value).then(() => {
            const copyBtn = event.target;
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = '#28a745';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
        });
    } catch (err) {
        document.execCommand('copy');
        const copyBtn = event.target;
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }
}


// Toggle social links dropdown - UPDATED VERSION
function toggleSocialLinks(fileId) {
    const socialLinks = document.getElementById(`socialLinks-${fileId}`);
    const toggleBtn = event.target.closest('.social-links-toggle');
    
    // Close all other open dropdowns first
    document.querySelectorAll('.social-links-content').forEach(dropdown => {
        if (dropdown.id !== `socialLinks-${fileId}`) {
            dropdown.style.display = 'none';
        }
    });
    
    // Update all toggle buttons
    document.querySelectorAll('.social-links-toggle').forEach(btn => {
        if (btn !== toggleBtn) {
            btn.innerHTML = '<i class="fas fa-share-alt"></i> Show Social Links';
            btn.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    if (socialLinks.style.display === 'block') {
        socialLinks.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-share-alt"></i> Show Social Links';
        toggleBtn.classList.remove('active');
    } else {
        socialLinks.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-times"></i> Hide Links';
        toggleBtn.classList.add('active');
    }
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        const closeOnClickOutside = (e) => {
            if (!socialLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
                socialLinks.style.display = 'none';
                toggleBtn.innerHTML = '<i class="fas fa-share-alt"></i> Show Social Links';
                toggleBtn.classList.remove('active');
                document.removeEventListener('click', closeOnClickOutside);
            }
        };
        
        if (socialLinks.style.display === 'block') {
            setTimeout(() => {
                document.addEventListener('click', closeOnClickOutside);
            }, 100);
        }
    }, 100);
}

// Copy link from table function
function copyTableLink(link) {
    try {
        navigator.clipboard.writeText(link).then(() => {
            showMessage('message', 'Link copied to clipboard!', 'success');
        });
    } catch (err) {
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showMessage('message', 'Link copied to clipboard!', 'success');
    }
}

// Display files with pagination - UPDATED WITH SOCIAL LINKS
function displayFiles(page = 1) {
    const totalFiles = filteredFiles.length;
    const totalPages = Math.ceil(totalFiles / filesPerPage);
    const startIndex = (page - 1) * filesPerPage;
    const endIndex = startIndex + filesPerPage;
    const filesToDisplay = filteredFiles.slice(startIndex, endIndex);

    const filesTableBody = document.getElementById('filesTableBody');
    
    if (filesToDisplay.length === 0) {
        filesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-results">
                    ${filesSearchTerm ? 'No files found matching your search' : 'No files uploaded yet'}
                </td>
            </tr>
        `;
    } else {
        filesTableBody.innerHTML = filesToDisplay.map(file => `
            <tr class="${selectedFiles.has(file._id) ? 'selected' : ''}">
                <td>
                    <input type="checkbox" 
                           ${selectedFiles.has(file._id) ? 'checked' : ''}
                           onchange="toggleFileSelection('${file._id}', this.checked)">
                </td>
                <td>${file.topic}</td>
                <td>${file.originalName}</td>
                <td>
                    <div class="link-display">
                        <div class="social-links-dropdown">
                            <button class="social-links-toggle" onclick="toggleSocialLinks('${file._id}')">
                                <i class="fas fa-share-alt"></i> Show Social Links
                            </button>
<div class="social-links-content" id="socialLinks-${file._id}" style="display: none;">
                                <div class="social-link-item">
                                    <span class="platform">🔵 Facebook:</span>
                                    <span class="link-text">${window.location.origin}/register?fileId=${file._id}&source=Facebook</span>
                                    <button onclick="copyTableLink('${window.location.origin}/register?fileId=${file._id}&source=Facebook')" class="copy-btn-small">
                                        Copy
                                    </button>
                                </div>
                                <div class="social-link-item">
                                    <span class="platform">🔴 YouTube:</span>
                                    <span class="link-text">${window.location.origin}/register?fileId=${file._id}&source=YouTube</span>
                                    <button onclick="copyTableLink('${window.location.origin}/register?fileId=${file._id}&source=YouTube')" class="copy-btn-small">
                                        Copy
                                    </button>
                                </div>
                                <div class="social-link-item">
                                    <span class="platform">🔵 LinkedIn:</span>
                                    <span class="link-text">${window.location.origin}/register?fileId=${file._id}&source=LinkedIn</span>
                                    <button onclick="copyTableLink('${window.location.origin}/register?fileId=${file._id}&source=LinkedIn')" class="copy-btn-small">
                                        Copy
                                    </button>
                                </div>
                                <div class="social-link-item">
                                    <span class="platform">🟢 WhatsApp:</span>
                                    <span class="link-text">${window.location.origin}/register?fileId=${file._id}&source=WhatsApp</span>
                                    <button onclick="copyTableLink('${window.location.origin}/register?fileId=${file._id}&source=WhatsApp')" class="copy-btn-small">
                                        Copy
                                    </button>
                                </div>
                                <div class="social-link-item">
                                    <span class="platform">🟣 Instagram:</span>
                                    <span class="link-text">${window.location.origin}/register?fileId=${file._id}&source=Instagram</span>
                                    <button onclick="copyTableLink('${window.location.origin}/register?fileId=${file._id}&source=Instagram')" class="copy-btn-small">
                                        Copy
                                    </button>
                                </div>
                                <div class="social-link-item">
                                    <span class="platform">🔵 Twitter:</span>
                                    <span class="link-text">${window.location.origin}/register?fileId=${file._id}&source=Twitter</span>
                                    <button onclick="copyTableLink('${window.location.origin}/register?fileId=${file._id}&source=Twitter')" class="copy-btn-small">
                                        Copy
                                    </button>
                                </div>
                                <div class="social-link-item">
                                    <span class="platform">⚪ Direct:</span>
                                    <span class="link-text">${window.location.origin}/register?fileId=${file._id}&source=Direct</span>
                                    <button onclick="copyTableLink('${window.location.origin}/register?fileId=${file._id}&source=Direct')" class="copy-btn-small">
                                        Copy
                                    </button>
                                </div>
                                <div class="social-links-actions">
                                    <button onclick="copyAllSocialLinks('${file._id}')" class="copy-all-btn">
                                        <i class="fas fa-copy"></i> Copy All Links
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
                <td>${new Date(file.uploadedAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }

    // Update sorting indicators
    updateSortIndicators('files');
    
    // Generate pagination
    generatePagination('filesPagination', page, totalPages, 'files');
    
    // Update bulk actions
    updateFilesBulkActions();
}

// Display users with pagination - FIXED UNDEFINED FILE TOPIC
function displayUsers(page = 1) {
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToDisplay = filteredUsers.slice(startIndex, endIndex);

    const usersTableBody = document.getElementById('usersTableBody');
    
    if (usersToDisplay.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="no-results">
                    ${usersSearchTerm ? 'No users found matching your search' : 'No users registered yet'}
                </td>
            </tr>
        `;
    } else {
        usersTableBody.innerHTML = usersToDisplay.map(user => `
            <tr class="${selectedUsers.has(user._id) ? 'selected' : ''}">
                <td>
                    <input type="checkbox" 
                           ${selectedUsers.has(user._id) ? 'checked' : ''}
                           onchange="toggleUserSelection('${user._id}', this.checked)">
                </td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.whatsapp || 'N/A'}</td>
                <td>${user.eduLevel || 'N/A'}</td>
                <td>${user.knowledgeLevel || 'N/A'}</td>
                <td>${user.registeredForFile && user.registeredForFile.topic ? user.registeredForFile.topic : 'N/A'}</td>
                <td>
                    <span class="platform-badge ${user.sourcePlatform?.toLowerCase() || 'direct'}">
                        ${user.sourcePlatform || 'Direct'}
                    </span>
                </td>
                <td>${new Date(user.createdAt).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    // Update sorting indicators
    updateSortIndicators('users');
    
    // Generate pagination
    generatePagination('usersPagination', page, totalPages, 'users');
    
    // Update bulk actions
    updateUsersBulkActions();
}

// Update sorting indicators in table headers
function updateSortIndicators(type) {
    const sortableHeaders = document.querySelectorAll(`#${type}Table .sortable`);
    sortableHeaders.forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
        const icon = header.querySelector('i');
        icon.className = 'fas fa-sort';
        
        const field = header.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (field === (type === 'files' ? filesSortField : usersSortField)) {
            header.classList.add(`sort-${type === 'files' ? filesSortDirection : usersSortDirection}`);
            icon.className = `fas fa-sort-${type === 'files' ? filesSortDirection : usersSortDirection}`;
        }
    });
}

// Search functionality
function handleFilesSearch() {
    filesSearchTerm = document.getElementById('filesSearch').value;
    currentFilesPage = 1;
    applyFilesFiltersAndSort();
}

function handleUsersSearch() {
    usersSearchTerm = document.getElementById('usersSearch').value;
    currentUsersPage = 1;
    applyUsersFiltersAndSort();
}

// Sorting functionality
function sortFiles(field) {
    if (filesSortField === field) {
        filesSortDirection = filesSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        filesSortField = field;
        filesSortDirection = 'asc';
    }
    applyFilesFiltersAndSort();
}

function sortUsers(field) {
    if (usersSortField === field) {
        usersSortDirection = usersSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        usersSortField = field;
        usersSortDirection = 'asc';
    }
    applyUsersFiltersAndSort();
}

// Items per page functionality
function changeFilesPerPage(value) {
    filesPerPage = parseInt(value);
    currentFilesPage = 1;
    displayFiles(currentFilesPage);
}

function changeUsersPerPage(value) {
    usersPerPage = parseInt(value);
    currentUsersPage = 1;
    displayUsers(currentUsersPage);
}

// Selection functionality
function toggleFileSelection(fileId, selected) {
    if (selected) {
        selectedFiles.add(fileId);
    } else {
        selectedFiles.delete(fileId);
    }
    document.getElementById('selectAllFiles').checked = selectedFiles.size === filteredFiles.length;
    updateFilesBulkActions();
}

function toggleUserSelection(userId, selected) {
    if (selected) {
        selectedUsers.add(userId);
    } else {
        selectedUsers.delete(userId);
    }
    document.getElementById('selectAllUsers').checked = selectedUsers.size === filteredUsers.length;
    updateUsersBulkActions();
}

function toggleSelectAllFiles(selected) {
    if (selected) {
        filteredFiles.forEach(file => selectedFiles.add(file._id));
    } else {
        selectedFiles.clear();
    }
    displayFiles(currentFilesPage);
}

function toggleSelectAllUsers(selected) {
    if (selected) {
        filteredUsers.forEach(user => selectedUsers.add(user._id));
    } else {
        selectedUsers.clear();
    }
    displayUsers(currentUsersPage);
}

// Bulk actions
function updateFilesBulkActions() {
    const bulkActions = document.getElementById('filesBulkActions');
    if (bulkActions) {
        bulkActions.disabled = selectedFiles.size === 0;
    }
}

function updateUsersBulkActions() {
    const bulkActions = document.getElementById('usersBulkActions');
    if (bulkActions) {
        bulkActions.disabled = selectedUsers.size === 0;
    }
}

function handleFilesBulkAction(action) {
    if (!action) return;
    
    if (action === 'delete') {
        if (confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)) {
            deleteSelectedFiles();
        }
    }
    
    // Reset select
    document.getElementById('filesBulkActions').selectedIndex = 0;
}

function handleUsersBulkAction(action) {
    if (!action) return;
    
    if (action === 'delete') {
        if (confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)?`)) {
            deleteSelectedUsers();
        }
    } else if (action === 'export') {
        exportSelectedUsers();
    }
    
    // Reset select
    document.getElementById('usersBulkActions').selectedIndex = 0;
}

// Bulk operations
async function deleteSelectedFiles() {
    if (!checkAdminAuth()) return;

    try {
        const deletePromises = Array.from(selectedFiles).map(fileId => 
            fetch(`/api/files/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            })
        );

        await Promise.all(deletePromises);
        showMessage('message', `Successfully deleted ${selectedFiles.size} file(s)`, 'success');
        selectedFiles.clear();
        loadAllFiles(); // Reload files
        
    } catch (error) {
        console.error('Error deleting files:', error);
        showMessage('message', 'Error deleting files', 'error');
    }
}

async function deleteSelectedUsers() {
    if (!checkAdminAuth()) return;

    try {
        const deletePromises = Array.from(selectedUsers).map(userId => 
            fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            })
        );

        await Promise.all(deletePromises);
        showMessage('message', `Successfully deleted ${selectedUsers.size} user(s)`, 'success');
        selectedUsers.clear();
        loadAllUsers(); // Reload users
        
    } catch (error) {
        console.error('Error deleting users:', error);
        showMessage('message', 'Error deleting users', 'error');
    }
}

function exportSelectedUsers() {
    if (selectedUsers.size === 0) return;

    const selectedUsersData = allUsers.filter(user => selectedUsers.has(user._id));
    const csvContent = convertToCSV(selectedUsersData);
    downloadCSV(csvContent, 'selected_users.csv');
    showMessage('message', `Exported ${selectedUsers.size} user(s)`, 'success');
}

// CSV export utilities - UPDATED WITH NEW FIELDS
function convertToCSV(data) {
    const headers = ['Name', 'Email', 'WhatsApp Number', 'Edu Level', 'Knowledge Level', 'Source Platform', 'File Topic', 'Registration Date'];
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
        const row = [
            `"${item.name}"`,
            `"${item.email}"`,
            `"${item.whatsapp || 'N/A'}"`,
            `"${item.eduLevel || 'N/A'}"`,
            `"${item.knowledgeLevel || 'N/A'}"`,
            `"${item.sourcePlatform || 'Direct'}"`,
            `"${(item.registeredForFile && item.registeredForFile.topic) ? item.registeredForFile.topic : 'N/A'}"`,
            `"${new Date(item.createdAt).toLocaleString()}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Generate pagination buttons
function generatePagination(containerId, currentPage, totalPages, type) {
    const container = document.getElementById(containerId);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage('${type}', ${currentPage - 1})">Previous</button>`;
    } else {
        paginationHTML += `<button class="pagination-btn disabled" disabled>Previous</button>`;
    }

    // Page numbers
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage('${type}', 1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-btn disabled">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="pagination-btn" onclick="changePage('${type}', ${i})">${i}</button>`;
        }
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-btn disabled">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage('${type}', ${totalPages})">${totalPages}</button>`;
    }

    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage('${type}', ${currentPage + 1})">Next</button>`;
    } else {
        paginationHTML += `<button class="pagination-btn disabled" disabled>Next</button>`;
    }

    const totalItems = type === 'files' ? filteredFiles.length : filteredUsers.length;
    const itemsPerPage = type === 'files' ? filesPerPage : usersPerPage;
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    paginationHTML += `<span class="pagination-info">Showing ${startItem}-${endItem} of ${totalItems}</span>`;

    container.innerHTML = paginationHTML;
}

// Change page function
function changePage(type, page) {
    if (type === 'files') {
        currentFilesPage = page;
        displayFiles(page);
    } else if (type === 'users') {
        currentUsersPage = page;
        displayUsers(page);
    }
}

// Export all users
async function exportUsers() {
    if (!checkAdminAuth()) return;

    try {
        const response = await fetch('/api/admin/users/export', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showMessage('message', 'Users exported successfully!', 'success');
        } else {
            showMessage('message', 'Error exporting users', 'error');
        }
    } catch (error) {
        console.error('Error exporting users:', error);
        showMessage('message', 'Error exporting users', 'error');
    }
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = '/admin';
}

function showMessage(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'message';
            }, 5000);
        }
    }
}

// Initialize dashboard - FIXED VERSION
if (window.location.pathname.includes('admin-dashboard') || window.location.pathname === '/admin-dashboard') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔄 Initializing admin dashboard...');
        
        if (checkAdminAuth()) {
            console.log('✅ Admin authenticated, loading data...');
            
            // Load data with small delay to ensure DOM is ready
            setTimeout(() => {
                loadAllFiles();
                loadAllUsers();
                startAutoRefresh();
            }, 100);
        }
    });
}

// Auto refresh users every 30 seconds
function startAutoRefresh() {
    setInterval(() => {
        if (window.location.pathname.includes('admin-dashboard') || window.location.pathname === '/admin-dashboard') {
            loadAllUsers();
            console.log('Auto-refreshed users list');
        }
    }, 30000); // 30 seconds
}

// Copy button style fix
function fixCopyButtonStyle() {
    const copyButton = document.querySelector('#downloadLink .btn-primary');
    if (copyButton) {
        copyButton.style.cssText = `
            background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%) !important;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3) !important;
            padding: 10px 16px !important;
            font-size: 14px !important;
            border: none !important;
            border-radius: 8px !important;
            color: white !important;
            cursor: pointer !important;
            min-width: 80px !important;
        `;
        
        // Hover effect
        copyButton.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(90deg, #45a049 0%, #4CAF50 100%) !important';
            this.style.transform = 'translateY(-2px) !important';
        });
        
        copyButton.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%) !important';
            this.style.transform = 'translateY(0) !important';
        });
    }
}

// Call this function when page loads and when download link is generated
document.addEventListener('DOMContentLoaded', function() {
    fixCopyButtonStyle();
});
