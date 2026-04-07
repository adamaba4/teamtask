//REMPLIR LE MENU DEROULANT DES PROJETS
async function chargerProjets() {
    const selectProjet = document.getElementById('select-projet');
    
    // On prépare l'envoi vers le contrôleur
    let data = new FormData();
    data.append("action", "get_projects_of_user");

    try {
        const response = await fetch("backend/controllers/projet.php", {
            method: "POST",
            body: data
        });

        const result = await response.json();

        if (result.success && result.projects) {
            selectProjet.innerHTML = '<option value="">Tous les projets</option>';

            // On boucle sur le tableau de projets et on créer chaque option 
            result.projects.forEach(projet => {
                let option = document.createElement('option');
                option.value = projet.id;
                option.textContent = projet.nom;
                selectProjet.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération :", error);
        selectProjet.innerHTML = '<option>Erreur de chargement</option>';
    }
}

//Quand on change de projet, les taches de ce projet vont se remplir, 
// et il faut aussi savoir si on clique sur mestaches ou tout
let modeAffichage = 'mes_taches'; // Par défaut

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

    // On relance le chargement des données
    changerProjet();
}

async function changerProjet() {
    const projetId = document.getElementById('select-projet').value;
    const tableBody = document.getElementById('tableau-taches');

    if (!projetId) return;

    let data = new FormData();
    // On choisit l'action selon le bouton cliqué
    data.append("action", modeAffichage === 'mes' ? "my_tasks" : "get_tasks");
    data.append("projet_id", projetId); // Pour le case 'my_tasks'


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
                    <td><input type="checkbox"></td>
                    <td>${tache.nom}</td>
                    <td><strong>${assigneA}</strong></td>
                    <td><span class="badge status-${tache.status}">${tache.status}</span></td>
                    <td><span class="priority-${tache.priority}">${tache.priority}</span></td>
                    <td>${tache.end_date || 'N/A'}</td>
                    <td><button>✏️</button></td>
                `;
                tableBody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error("Erreur de chargement", e);
    }
}




window.addEventListener("load", () => {
    chargerProjets();

});