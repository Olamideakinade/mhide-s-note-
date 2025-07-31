class NotesApp {
    constructor() {
        this.currentUser = null;
        this.notes = [];
        this.isEditing = false;
        this.editingNoteId = null;
        
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.setupEventListeners();
        this.showLoadingScreen();
        
        // Hide loading screen after 1.5 seconds
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 1500);
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('check_auth.php');
            const data = await response.json();
            
            if (data.success && data.user) {
                this.currentUser = data.user;
                this.showDashboard();
                await this.loadNotes();
            } else {
                this.showAuth();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showAuth();
        }
    }

    setupEventListeners() {
        // Auth form toggles
        document.getElementById('show-register').addEventListener('click', () => this.showRegisterForm());
        document.getElementById('show-login').addEventListener('click', () => this.showLoginForm());
        
        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        
        // Dashboard actions
        document.getElementById('add-note-btn').addEventListener('click', () => this.showAddNoteModal());
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
        // Modal actions
        document.getElementById('close-modal').addEventListener('click', () => this.hideNoteModal());
        document.getElementById('cancel-note').addEventListener('click', () => this.hideNoteModal());
        document.getElementById('note-form').addEventListener('submit', (e) => this.handleNoteSave(e));
        
        // Close modal on overlay click
        document.getElementById('note-modal').addEventListener('click', (e) => {
            if (e.target.id === 'note-modal') {
                this.hideNoteModal();
            }
        });

        // Input animations
        this.setupInputAnimations();
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                gsap.to(e.target.nextElementSibling, {
                    width: '100%',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            input.addEventListener('blur', (e) => {
                if (!e.target.value) {
                    gsap.to(e.target.nextElementSibling, {
                        width: '0%',
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        gsap.set(loadingScreen, { display: 'flex' });
        
        gsap.fromTo('.loading-spinner', 
            { rotation: 0 },
            { rotation: 360, duration: 1, repeat: -1, ease: 'none' }
        );
        
        gsap.fromTo(loadingScreen.querySelector('p'),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.3 }
        );
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                loadingScreen.style.display = 'none';
            }
        });
    }

    showAuth() {
        const authContainer = document.getElementById('auth-container');
        const dashboardContainer = document.getElementById('dashboard-container');
        
        authContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
        
        // Animate auth card entrance
        gsap.fromTo('.auth-card', 
            { opacity: 0, y: 50, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
        );
    }

    showDashboard() {
        const authContainer = document.getElementById('auth-container');
        const dashboardContainer = document.getElementById('dashboard-container');
        
        authContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        
        // Animate dashboard entrance
        gsap.fromTo('.dashboard-header', 
            { opacity: 0, y: -50 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
    }

    showRegisterForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const title = document.getElementById('auth-title');
        const subtitle = document.getElementById('auth-subtitle');
        
        gsap.to(loginForm, {
            opacity: 0,
            x: -30,
            duration: 0.3,
            onComplete: () => {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                
                title.textContent = 'Create Account';
                subtitle.textContent = 'Join us today';
                
                gsap.fromTo(registerForm, 
                    { opacity: 0, x: 30 },
                    { opacity: 1, x: 0, duration: 0.3 }
                );
            }
        });
    }

    showLoginForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const title = document.getElementById('auth-title');
        const subtitle = document.getElementById('auth-subtitle');
        
        gsap.to(registerForm, {
            opacity: 0,
            x: 30,
            duration: 0.3,
            onComplete: () => {
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                
                title.textContent = 'Welcome Back';
                subtitle.textContent = 'Sign in to continue';
                
                gsap.fromTo(loginForm, 
                    { opacity: 0, x: -30 },
                    { opacity: 1, x: 0, duration: 0.3 }
                );
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        this.setButtonLoading(submitBtn, true);
        
        try {
            const response = await fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.showToast('Welcome back!', 'success');
                
                // Animate transition to dashboard
                gsap.to('.auth-card', {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        this.showDashboard();
                        this.loadNotes();
                    }
                });
            } else {
                this.showToast(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        this.setButtonLoading(submitBtn, true);
        
        try {
            const response = await fetch('register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Account created successfully!', 'success');
                setTimeout(() => this.showLoginForm(), 1000);
            } else {
                this.showToast(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleLogout() {
        try {
            await fetch('logout.php', { method: 'POST' });
            this.currentUser = null;
            this.notes = [];
            
            this.showToast('Logged out successfully', 'success');
            
            // Animate transition to auth
            gsap.to('.dashboard-container', {
                opacity: 0,
                y: -30,
                duration: 0.5,
                onComplete: () => {
                    this.showAuth();
                }
            });
        } catch (error) {
            this.showToast('Logout failed', 'error');
        }
    }

    async loadNotes() {
        try {
            const response = await fetch('notes.php');
            const data = await response.json();
            
            if (data.success) {
                this.notes = data.notes;
                this.renderNotes();
            } else {
                this.showToast('Failed to load notes', 'error');
            }
        } catch (error) {
            this.showToast('Network error while loading notes', 'error');
        }
    }

    renderNotes() {
        const notesGrid = document.getElementById('notes-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (this.notes.length === 0) {
            notesGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
            
            // Animate empty state
            gsap.fromTo('.empty-state', 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6 }
            );
            return;
        }
        
        emptyState.classList.add('hidden');
        
        notesGrid.innerHTML = this.notes.map(note => `
            <div class="note-card" data-note-id="${note.id}">
                <div class="note-header">
                    <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                    <div class="note-actions">
                        <button class="note-action-btn edit-btn" onclick="app.editNote(${note.id})" title="Edit">
                            ✏️
                        </button>
                        <button class="note-action-btn delete-btn" onclick="app.deleteNote(${note.id})" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="note-content">${this.escapeHtml(note.content)}</div>
                <div class="note-date">${this.formatDate(note.created_at)}</div>
            </div>
        `).join('');
        
        // Animate notes entrance
        gsap.fromTo('.note-card', 
            { opacity: 0, y: 30, scale: 0.9 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: 0.6, 
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }
        );
    }

    showAddNoteModal() {
        this.isEditing = false;
        this.editingNoteId = null;
        
        document.getElementById('modal-title').textContent = 'Add Note';
        document.getElementById('note-id').value = '';
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
        
        this.showNoteModal();
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.isEditing = true;
        this.editingNoteId = noteId;
        
        document.getElementById('modal-title').textContent = 'Edit Note';
        document.getElementById('note-id').value = note.id;
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        
        this.showNoteModal();
    }

    showNoteModal() {
        const modal = document.getElementById('note-modal');
        modal.classList.remove('hidden');
        
        // Focus on title input
        setTimeout(() => {
            document.getElementById('note-title').focus();
        }, 100);
        
        // Animate modal entrance
        gsap.fromTo('.modal', 
            { opacity: 0, scale: 0.8, y: 50 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
        );
        
        gsap.fromTo('.modal-overlay', 
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
        );
    }

    hideNoteModal() {
        const modal = document.getElementById('note-modal');
        
        gsap.to('.modal', {
            opacity: 0,
            scale: 0.8,
            y: 50,
            duration: 0.3,
            ease: 'power2.in'
        });
        
        gsap.to('.modal-overlay', {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                modal.classList.add('hidden');
            }
        });
    }

    async handleNoteSave(e) {
        e.preventDefault();
        
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value.trim();
        const noteId = document.getElementById('note-id').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        if (!title || !content) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }
        
        this.setButtonLoading(submitBtn, true);
        
        try {
            const url = this.isEditing ? 'edit_note.php' : 'add_note.php';
            const payload = this.isEditing ? { id: noteId, title, content } : { title, content };
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(
                    this.isEditing ? 'Note updated successfully!' : 'Note created successfully!', 
                    'success'
                );
                this.hideNoteModal();
                await this.loadNotes();
            } else {
                this.showToast(data.message || 'Failed to save note', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }
        
        try {
            const response = await fetch('delete_note.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: noteId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Note deleted successfully', 'success');
                
                // Animate note removal
                const noteCard = document.querySelector(`[data-note-id="${noteId}"]`);
                if (noteCard) {
                    gsap.to(noteCard, {
                        opacity: 0,
                        scale: 0.8,
                        height: 0,
                        marginBottom: 0,
                        duration: 0.4,
                        ease: 'power2.in',
                        onComplete: () => {
                            this.loadNotes();
                        }
                    });
                } else {
                    await this.loadNotes();
                }
            } else {
                this.showToast(data.message || 'Failed to delete note', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        }
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toastId = 'toast-' + Date.now();
        
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Animate toast entrance
        gsap.to(toast, {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: 'back.out(1.7)'
        });
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            this.removeToast(toastId);
        }, 4000);
    }

    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            gsap.to(toast, {
                opacity: 0,
                x: 400,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    toast.remove();
                }
            });
        }
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.closest('form').id.includes('login') ? 'Sign In' : 
                               button.closest('form').id.includes('register') ? 'Create Account' : 'Save Note';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NotesApp();
});

// Global functions for inline event handlers
function showAddNoteModal() {
    window.app.showAddNoteModal();
}

