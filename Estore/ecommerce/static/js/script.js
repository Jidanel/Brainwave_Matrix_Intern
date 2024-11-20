// Fonction de recherche d'articles par mot-clé
function searchArticles() {
    const query = document.getElementById('search').value.toLowerCase();
    const articles = document.querySelectorAll('.article-card');
    
    articles.forEach(article => {
        const title = article.querySelector('h2').textContent.toLowerCase();
        if (title.includes(query)) {
            article.style.display = "block";
        } else {
            article.style.display = "none";
        }
    });
}

// script.js
function logout() {
    fetch('/users/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()  // Assurez-vous de gérer le CSRF
        }
    })
    .then(response => {
        if (response.ok) {
            window.location.href = "/users/login/";
        } else {
            console.error("Logout failed.");
        }
    })
    .catch(error => console.error("Error logging out:", error));
}

// Fonction pour obtenir le CSRF token
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

