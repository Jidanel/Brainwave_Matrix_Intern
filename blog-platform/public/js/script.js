// Vérifie si l'utilisateur est connecté
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Redirige vers la page de connexion si l'utilisateur n'est pas connecté
function checkAuthentication() {
    if (!isAuthenticated()) {
        console.log("User is not authenticated, redirecting to login.");
        window.location.href = "login.html";
    }
}

// Fonction pour actualiser le token d'accès
function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.error("No refresh token available, redirecting to login.");
        logout();
        return Promise.reject("No refresh token");
    }

    return fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    })
    .then(response => response.json())
    .then(data => {
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            console.log("Access token refreshed");
            return data.accessToken;
        } else {
            console.error("Failed to refresh token, redirecting to login.");
            logout();
            return Promise.reject("Failed to refresh token");
        }
    });
}

// Fonction pour obtenir un token avec gestion du rafraîchissement
function getAccessToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) return Promise.reject("No access token found");

    // Vérification de l'expiration du token (optionnel)
    // Appeler refreshAccessToken en cas de réponse 401
    return Promise.resolve(token);
}

// Fonction de connexion
function login(event) {
    event.preventDefault();
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-password').value;

    console.log("Attempting login with email:", email);

    fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Login response data:", data);
        if (data.accessToken && data.refreshToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            window.location.href = "index.html";
        } else {
            console.error("Login failed:", data.message);
            alert("Login failed");
        }
    });
}

// Fonction de déconnexion
function logout() {
    console.log("User logged out");
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = "login.html";
}

// Fonction d'inscription
function register(event) {
    event.preventDefault();
    const name = document.querySelector('#register-name').value;
    const email = document.querySelector('#register-email').value;
    const password = document.querySelector('#register-password').value;

    console.log("Attempting registration with name:", name);

    fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Registration response data:", data);
        if (data.message) {
            alert('Account created successfully');
            window.location.href = "login.html";
        } else {
            console.error("Registration failed:", data.error);
        }
    });
}

// Fonction générique pour gérer les requêtes API
function fetchWithAuth(url, options = {}) {
    return getAccessToken()
        .then(token => {
            options.headers = options.headers || {};
            options.headers['Authorization'] = `Bearer ${token}`;
            return fetch(url, options);
        })
        .then(response => {
            if (response.status === 401) {
                // Token expiré, tenter un rafraîchissement
                console.log("Access token expired, refreshing...");
                return refreshAccessToken().then(newToken => {
                    options.headers['Authorization'] = `Bearer ${newToken}`;
                    return fetch(url, options);
                });
            }
            return response;
        });
}

// Fonction de création d'article
// Exemple de fonction pour créer un article avec fetchWithAuth
function createArticle(event) {
    event.preventDefault();
    const title = document.getElementById('article-title').value;
    const content = document.getElementById('article-content').value;

    console.log("Creating article with title:", title);

    fetchWithAuth('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Create article response data:", data);
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert("Article created successfully!");
            loadUserArticles();
        }
    })
    .catch(error => console.error("Error creating article:", error));
}


// Charger tous les articles
function loadArticles() {
    console.log("Loading all articles");

    fetchWithAuth('http://localhost:5000/api/posts')
    .then(response => response.json())
    .then(articles => {
        console.log("Articles loaded:", articles);
        const container = document.querySelector('.articles-container');
        container.innerHTML = '';
        articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.classList.add('article-card');
            articleCard.innerHTML = `
                <h2>${article.title}</h2>
                <p>By ${article.author.name}</p>
                <p>${article.content.substring(0, 100)}...</p>
                <button onclick="viewArticle('${article._id}')">Read More</button>
            `;
            container.appendChild(articleCard);
        });
    })
    .catch(error => console.error("Error loading articles:", error));
}

// Fonction de recherche d'articles
function searchArticles() {
    const token = localStorage.getItem('token');
    const query = document.getElementById('search').value;
    console.log("Searching articles with query:", query);

    fetch(`http://localhost:5000/api/posts/search?query=${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(articles => {
        console.log("Search results:", articles);
        const container = document.querySelector('.articles-container');
        container.innerHTML = '';
        articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.classList.add('article-card');
            articleCard.innerHTML = `
                <h2>${article.title}</h2>
                <p>By ${article.author.name}</p>
                <p>${article.content.substring(0, 100)}...</p>
                <button onclick="viewArticle('${article._id}')">Read More</button>
            `;
            container.appendChild(articleCard);
        });
    })
    .catch(error => console.error("Error searching articles:", error));
}

// Afficher un article en détail
function viewArticle(articleId) {
    console.log("Viewing article with ID:", articleId);
    window.location.href = `article.html?articleId=${articleId}`;
}

// Charger un article spécifique et ses commentaires
function loadArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('articleId');

    console.log("Loading article with ID:", articleId);

    fetch(`http://localhost:5000/api/posts/${articleId}`)
    .then(response => response.json())
    .then(article => {
        console.log("Article loaded:", article);
        document.getElementById('article-title').textContent = article.title;
        document.getElementById('article-body').textContent = article.content;
        loadComments(articleId);
    })
    .catch(error => console.error("Error loading article:", error));
}

// Ajouter un commentaire
function addComment() {
    const token = localStorage.getItem('token');
    const commentText = document.getElementById('comment-text').value;
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('articleId');

    console.log("Adding comment to article with ID:", articleId);

    fetch(`http://localhost:5000/api/posts/${articleId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Add comment response data:", data);
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert("Comment added successfully!");
            loadComments(articleId);
            document.getElementById('comment-text').value = '';
        }
    })
    .catch(error => console.error("Error adding comment:", error));
}

// Charger les commentaires d'un article
function loadComments(articleId) {
    console.log("Loading comments for article ID:", articleId);

    fetch(`http://localhost:5000/api/posts/${articleId}/comments`)
    .then(response => response.json())
    .then(comments => {
        console.log("Comments loaded:", comments);
        const commentsContainer = document.querySelector('.comments-container');
        commentsContainer.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `
                <p>${comment.author.name} (Last edited on ${new Date(comment.updatedAt).toLocaleDateString()}): ${comment.content}</p>
                <button class="button-edit" onclick="editComment('${comment._id}')">Edit</button>
                <button class="button-delete" onclick="confirmDeleteComment('${comment._id}')">Delete</button>
            `;
            commentsContainer.appendChild(commentElement);
        });
    })
    .catch(error => console.error("Error loading comments:", error));
}

// Supprimer un commentaire avec confirmation
function confirmDeleteComment(commentId) {
    console.log("Confirm delete comment with ID:", commentId);
    if (confirm("Are you sure you want to delete this comment?")) {
        deleteComment(commentId);
    }
}

// Supprimer un commentaire
function deleteComment(commentId) {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('articleId');

    console.log("Deleting comment with ID:", commentId, "from article with ID:", articleId);

    fetch(`http://localhost:5000/api/posts/${articleId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Delete comment response data:", data);
        alert(data.message || "Comment deleted");
        loadComments(articleId);
    })
    .catch(error => console.error("Error deleting comment:", error));
}

// Confirmer la suppression d'un article
function confirmDeleteArticle(articleId) {
    console.log("Confirm delete article with ID:", articleId);
    if (confirm("Are you sure you want to delete this article?")) {
        deleteArticle(articleId);
    }
}

// Supprimer un article
function deleteArticle(articleId) {
    const token = localStorage.getItem('token');
    console.log("Deleting article with ID:", articleId);

    fetch(`http://localhost:5000/api/posts/${articleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Delete article response data:", data);
        alert(data.message || "Article deleted");
        loadUserArticles();
    })
    .catch(error => console.error("Error deleting article:", error));
}

// Redirection pour la modification d'un article
function editArticle(articleId) {
    console.log("Redirecting to edit article page with ID:", articleId);
    window.location.href = `edit-article.html?articleId=${articleId}`;
}

// Charger l'article pour la modification
function loadArticleForEditing() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('articleId');

    console.log("Loading article for editing with ID:", articleId);

    fetch(`http://localhost:5000/api/posts/${articleId}`)
    .then(response => response.json())
    .then(article => {
        console.log("Article loaded for editing:", article);
        document.getElementById('edit-title').value = article.title;
        document.getElementById('edit-content').value = article.content;
    })
    .catch(error => console.error("Error loading article for editing:", error));
}

// Mettre à jour un article
function updateArticle() {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('articleId');

    const title = document.getElementById('edit-title').value;
    const content = document.getElementById('edit-content').value;

    console.log("Updating article with ID:", articleId);

    fetch(`http://localhost:5000/api/posts/${articleId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Update article response data:", data);
        alert("Article updated successfully!");
        window.location.href = "dashboard.html";
    })
    .catch(error => console.error("Error updating article:", error));
}

// Charger les articles de l'utilisateur
function loadUserArticles() {
    const token = localStorage.getItem('token');
    console.log("Loading user articles");

    fetch('http://localhost:5000/api/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(articles => {
        console.log("User articles loaded:", articles);
        const container = document.querySelector('.user-articles');
        container.innerHTML = '';
        articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.classList.add('article-card');
            articleCard.innerHTML = `
                <h2>${article.title}</h2>
                <p>${article.content.substring(0, 100)}...</p>
                <button class="button-edit" onclick="editArticle('${article._id}')">Edit</button>
                <button class="button-delete" onclick="confirmDeleteArticle('${article._id}')">Delete</button>
            `;
            container.appendChild(articleCard);
        });
    })
    .catch(error => console.error("Error loading user articles:", error));
}
