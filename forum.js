const COULEURS_AVATAR = ["#6c5ce7", "#00b894", "#fd79a8", "#fdcb6e", "#e17055", "#0984e3"];
let forum_id_courant = null;
let user_id=null;

function escHtml(text) {
    if (!text) return "";
    const temp = document.createElement('div');
    temp.textContent = text;
    return temp.innerHTML;
}

//on creer une focntion pour l'utiliser pour chaque commentaires
function buildPost(p) {
    // On récupère les initiales pour l'avatar (ex: Nasifa Zabalm -> NZ)
    const initiales = `${p.prenom?.[0] || ''}${p.nom?.[0] || ''}`.toUpperCase();
     const liked     = p.user_liked ? 'liked' : '';
    
    return `
        <div class="post-card">
            <div class="post-top">
                <div class="post-avatar">${initiales}</div>
                <div>
                    <div class="post-author">${p.prenom} ${p.nom}</div>
                </div>
            </div>
            
            <div class="post-content">
                ${p.content || "Pas de texte."}
            </div>
            
            <div class="post-footer">
                <button class="btn-like ${liked}" onclick="toggleLike(${p.id}, this)">
                ❤️ <span class="like-count">${p.likes || 0}</span>
            </button>
            </div>
        </div>
    `;
}


async function toggleLike(comm_id, btn) {
    try {
        let data = new FormData();
        data.append("action",  "like_comment");
        data.append("comment_id", comm_id);
        const res    = await fetch("backend/controllers/forum.php", { method: "POST", body: data });
        const result = await res.json();
        if (result.success) {
            const count = btn.querySelector('.like-count');
            count.textContent = result.likes;
            btn.classList.toggle('liked', result.liked);
        }
        chargerForums();
    } catch(e) { console.error(e); }
}




// Vérifier si l'utilisateur est connecté
async function verifierConnexion() {
    try {
        let data = new FormData();
        data.append("action", "get_user_data");

        const response = await fetch("backend/controllers/user.php", {
            method: "POST",
            body: data
        });

        const result = await response.json();

        if (!result.success) {
            window.location.href = "connexion.html";
        } else {
            user_id = result.user.id;
            console.log("Mon ID utilisateur est :", user_id);
            document.getElementById("header-welcome").textContent = "Bienvenue, " + result.user.prenom + " !";
            document.getElementById("user-avatar").textContent = result.user.prenom[0].toUpperCase() + result.user.nom[0].toUpperCase();
            document.getElementById("user-name").textContent = result.user.prenom + " " + result.user.nom;
        }
    } catch (error) {
        console.error("Erreur :", error);
    }
}



// Charger les membres du projet
async function chargerMembres() {
    let estChefProjet = false;
    let data = new FormData();
    data.append("action", "get_members_of_project");
    //data.append("projet_id", projet_id);

    const response = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data
    });

    const result = await response.json();
    if (result.success) {
        let container = document.getElementById("members-list");

        for (let i = 0; i < result.members.length; i++) {
            let membre = result.members[i];
            if (membre.id === user_id && membre.role === "chef_de_projet")
            {
                estChefProjet = true;
            }
            else
            {   couleur = COULEURS_AVATAR[i % COULEURS_AVATAR.length];

            container.innerHTML += `
            <div class="member-row"> 
                <div class="member-avatar" style="background: ${couleur};">
                    ${membre.prenom[0].toUpperCase()}${membre.nom[0].toUpperCase()}
                </div>
                <span class="member-name">${membre.prenom} ${membre.nom}</span>
            </div>`;}
        }
    }

    if (estChefProjet) {
        document.getElementById("btn-add-membre").style.display = "block";
    } else {
        document.getElementById("btn-add-membre").style.display = "none";
    }
}


async function chargerForums() {
    const list = document.getElementById("forums-list");
    list.innerHTML = "Chargement...";

    try {
        let data = new FormData();
        data.append("action", "get_forums"); 
  

        const response = await fetch("backend/controllers/forum.php", {
            method: "POST",
            body: data
        });

        const result = await response.json();

        //on affiche les detais
        if (result.success && result.forums.length > 0) {
            list.innerHTML = result.forums.map(f => `
                <div class="forum-card" onclick='ouvrirForum(${f.id}, ${JSON.stringify(f.content).replace(/'/g, "&apos;")})'>
   
                    <div class="forum-icon">💬</div>
                    <div class="forum-nom">${escHtml(f.prenom)} ${escHtml(f.nom)}</div>
                    <div class="forum-desc">${escHtml(f.content || 'Pas de description')}</div>
                    <div class="forum-meta">
                        <span><strong>${f.nb_posts || 0}</strong> posts</span>
                        <span><strong>${f.likes || 0}</strong> likes</span>
                    </div>
                </div>`).join('');
        } else {
            list.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <div class="icon">💬</div>
                    <p>Aucun forum pour l'instant. Crée le premier !</p>
                </div>`;
        }
        } catch(e) {
        list.innerHTML = '<div class="empty-state"><p>Erreur de chargement</p></div>';
        console.error(e);
    }
}

function ouvrirForum(id, content) {
    console.log("haha");
    forum_id_courant = id;
    document.getElementById("forum-desc-page").textContent = content;
    document.getElementById("vue-forums").style.display = "none";
    document.getElementById("vue-posts").style.display  = "block";
    chargerPosts();
}

function retourForums() {
    forum_id_courant = null;
    document.getElementById("vue-posts").style.display  = "none";
    document.getElementById("vue-forums").style.display = "block";
    chargerForums();
}

// Fermer en cliquant fermer
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
});

function fermerModal(id)    { document.getElementById(id).classList.remove("show"); }

async function chargerPosts() {
    const liste = document.getElementById("posts-liste");
    liste.innerHTML = '<div class="loading">Chargement...</div>';
    try {
        let data = new FormData();
        data.append("action",   "get_forum_comm");
        data.append("forum_id", forum_id_courant);
        const res    = await fetch("backend/controllers/forum.php", { method: "POST", body: data });
        const result = await res.json();

        if (result.success && result.posts.length > 0) {
            liste.innerHTML = result.posts.map(p => buildPost(p)).join('');
        } else {
            liste.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📝</div>
                    <p>Aucun post pour l'instant. Sois le premier !</p>
                </div>`;
        }
    } catch(e) { console.error(e); }
}
// Déconnexion
function deconnexion() {
    const bntDeconnexion = document.getElementById("btn-deconnexion");
    bntDeconnexion.addEventListener("click", async () => {
        let data = new FormData();
        data.append("action", "deconnexion");

        const reponse = await fetch("backend/controllers/auth.php", {
            method: "POST",
            body: data
        });

        const result = await reponse.json();
        if (result.success) {
            window.location.href = "connexion.html";
        } else {
            alert("Erreur de connexion au serveur.");
        }
    });
}


// Créer un forum
document.getElementById("form-forum").addEventListener("submit", async e => {
    e.preventDefault();
    const msg  = document.getElementById("msg-forum");
    const form = e.target;
    try {
        let data = new FormData(form);
        data.append("action",    "create_forum");
    
        const res    = await fetch("backend/controllers/forum.php", { method: "POST", body: data });
        const result = await res.json();
        if (result.success) {
            msg.textContent = result.message;
            msg.className   = "modal-msg success";
            setTimeout(() => { form.reset(); fermerModal('modal-forum'); msg.textContent = ''; chargerForums(); }, 800);
        } else {
            msg.textContent = result.message;
            msg.className   = "modal-msg error";
        }
        
    } catch(e) { console.error(e); }
});

function ouvrirModalForum() { document.getElementById("modal-forum").classList.add("show"); }

// ajouter un commentaire
document.getElementById("form-post").addEventListener("submit", async e => {
    e.preventDefault();
    const msg  = document.getElementById("msg-post");
    const form = e.target;
    try {
        let data = new FormData(form);
        data.append("action",   "add_comment");
        data.append("forum_id", forum_id_courant);
        const res    = await fetch("backend/controllers/forum.php", { method: "POST", body: data });
        const result = await res.json();
        if (result.success) {
            msg.textContent = result.message;
            msg.className   = "modal-msg success";
            setTimeout(() => { form.reset(); fermerModal('modal-post'); msg.textContent = ''; chargerPosts(); }, 800);
        } else {
            msg.textContent = result.message;
            msg.className   = "modal-msg error";
        }
        chargerPosts()
    } catch(e) { console.error(e); }
});

function ouvrirModalPost()  { document.getElementById("modal-post").classList.add("show"); }
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await verifierConnexion();
        /*await recupererProjet();*/
    } catch (error) {
        console.error("Erreur :", error);
    }
chargerForums();
     chargerMembres();
     deconnexion();

    
});
