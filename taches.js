
const COULEURS_AVATAR = ["#6c5ce7", "#00b894", "#fd79a8", "#fdcb6e", "#e17055", "#0984e3"];


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
            document.getElementById("header-welcome").textContent = "Bienvenue, " + result.user.prenom + " !";
            document.getElementById("user-avatar").textContent = result.user.prenom[0].toUpperCase() + result.user.nom[0].toUpperCase();
            document.getElementById("user-name").textContent = result.user.prenom + " " + result.user.nom;
        }
    } catch (error) {
        console.error("Erreur :", error);
    }
}

// Charger les cartes statistiques
async function chargerCartes() {
    let data = new FormData();
    data.append("action", "count_tasks");

    const response = await fetch("backend/controllers/taches.php", {
        method: "POST",
        body: data
    });
    const result = await response.json();
    console.log("Données reçues du PHP :", result); // Ajoute cette ligne
    if (result.success) {
        document.getElementById("compteur-late").textContent = result.en_retard;
        document.getElementById("compteur-done").textContent = result.terminee;
        document.getElementById("compteur-progress").textContent = result.en_cours;
    }

    let data2 = new FormData();
    data2.append("action", "count_meetings");


    const response2 = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data2
    });

    const result2 = await response2.json();
    if (result2.success) {
        document.getElementById("compteur-meetings").textContent = result2.count;
    }
}

// Charger les membres du projet
async function chargerMembres() {
    let data = new FormData();
    data.append("action", "get_members_of_project");


    const response = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data
    });

    const result = await response.json();
    if (result.success) {
        let container = document.getElementById("members-list");
        container.innerHTML = "";

        for (let i = 0; i < result.members.length; i++) {
            let membre = result.members[i];
            if (parseInt(membre.id) === parseInt(user_id)) continue;
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
}

//Quand on change de projet, les taches de ce projet vont se remplir, 
// et il faut aussi savoir si on clique sur mestaches ou tout
let modeAffichage = 'mes'; // Par défaut

// Fonction pour les boutons "Mes tâches" / "Toutes"
function switchTab(mode,event) {
    modeAffichage = mode;
  // On retire la classe 'active' de tous les boutons
    document.querySelectorAll('.filtre-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // On ajoute la classe 'active' au bouton cliqué (si l'event existe)
    if (event && event.target) {
        event.target.classList.add('active');
    }
    changerProjet();
}

async function changerProjet() {

    const tableBody = document.getElementById('tableau-taches');





    let data = new FormData();
    // On choisit l'action selon le bouton cliqué
    if (modeAffichage === 'mes') {
        data.append("action", "my_tasks");
    } else if (modeAffichage === 'perso') {
        data.append("action", "my_private_tasks");
    } else {
        data.append("action", "get_tasks");
    }


    try {
        const response = await fetch("backend/controllers/taches.php", {
            method: "POST",
            body: data
        });
        const result = await response.json();
        if (!result.taches || result.taches.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7">Aucune tâche pour le moment.</td></tr>';
                return;
            }

        if (result.success) {
            tableBody.innerHTML = "";
            result.taches.forEach(tache => {
                const tr = document.createElement('tr');
                
                // Ici on utilise tache.prenom et tache.nom que ton SQL récupère !
                const assigneA = tache.username ? ` ${tache.prenom} ${tache.username}` : "Non assigné";

                tr.innerHTML = `
                      <td>
                        ${tache.status !== 'terminee' 
                            ? `<button class="btn-terminer" onclick="changerStatut(${tache.id}, 'terminee')">✓</button>` 
                            : `<span style="color:#00b894">✓ Fait</span>`
                        }
                    </td>
                    <td>${tache.nom}</td>
                    <td><strong>${assigneA}</strong></td>
                    <td><span class="status-${tache.status}">${tache.status}</span></td>
                    <td><span class="priority-${tache.priority}">${tache.priority}</span></td>
                    <td>${tache.end_date || 'N/A'}</td>
                  
                `;
                tableBody.appendChild(tr);
            });
            filtrerStatut();
            chargerCartes();
        }
    } catch (e) {
        console.error("Erreur de chargement", e);
    }
}

//FILTRER LES TACHES PAR STATUT
function filtrerStatut() {
    const statutSelectionne = document.getElementById('filtre-statut').value;
    
    // 2. Récupérer toutes les lignes de ton tableau
    const lignes = document.querySelectorAll('#tableau-taches tr');

    lignes.forEach(ligne => {
        // On récupère le scpan qui a une classe contentant statyus
        const stat = ligne.querySelector('[class*="status-"]');
        
        if (!stat) return; //si ligne vide

        const statutLigne = stat.textContent.trim();

        // 3. Logique d'affichage
        //si le tex de la ligne est egal au filtre ou si c'est "tous"
        if (statutSelectionne === "" || statutLigne === statutSelectionne) {
            
            ligne.style.display = ""; // On affiche
        } else {
            ligne.style.display = "none"; // On cache
        }
    });
}

//changer le statut de la tache (pour dire que c terminée)
async function changerStatut(task_id, newStatus) {
    let data = new FormData();
    data.append("action",   "update_statustask");
    data.append("task_id",  task_id);
    data.append("status",   newStatus);

    try {
        const response = await fetch("backend/controllers/taches.php", { method: "POST", body: data });
        const result   = await response.json();

        if (result.success) {
            changerProjet(); // recharge le tableau
        } else {
            alert(result.message);
        }
    } catch(e) {
        console.error(e);
    }
}
// Modal nouvelle tâche
function nouvelleTache() {
    const overlay = document.getElementById("modal-overlay");
    const modalClose = document.getElementById("modal-close");
    const bntNewTask = document.getElementById("btn-new-task");
    const form = document.getElementById("new-task-form");
    const msgError = document.getElementById("task-msg");

    bntNewTask.addEventListener("click", () => {
        overlay.classList.add("show");
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("show");
        }
    });

    modalClose.addEventListener("click", () => {
        overlay.classList.remove("show");
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            let data = new FormData(form);
            data.append("action", "create_task");
            data.append("projet_id", projetId);
            data.append("user_id", user_id);

            const response = await fetch("backend/controllers/taches.php", {
                method: "POST",
                body: data
            });

            const result = await response.json();
            if (result.success) {
                msgError.textContent = "Tâche créée";
                msgError.className = "task-msg success";
                setTimeout(() => {
                    form.reset();
                    overlay.classList.remove("show");
                    msgError.textContent = "";
                    chargerCartes();
                }, 1000);
            } else {
                msgError.textContent = result.message;
                msgError.className = "task-msg error";
            }
            changerProjet();
        } catch (error) {
            msgError.textContent = "Erreur de connexion au serveur.";
            msgError.className = "task-msg error";
        }
    });
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

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await verifierConnexion();
        /*await recupererProjet();*/
    } catch (error) {
        console.error("Erreur :", error);
    }
    await changerProjet();
    chargerCartes();
    chargerMembres();
    nouvelleTache();
    deconnexion();
});


