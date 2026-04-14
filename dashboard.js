let user_id = null;
let moisCourrant = new Date().getMonth() ;
let anneeCourrante = new Date().getFullYear();
let jourSelectionne = null;
let tachesDuMois = [];
let reunionsDuMois = [];
const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const COULEURS_AVATAR = ["#6c5ce7", "#00b894", "#fd79a8", "#fdcb6e", "#e17055", "#0984e3"];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await verifierConnexion();

    } catch (error) {
        console.error("Erreur :", error);
    }
    recupererProjet();
    chargerMembres();
    ajouterMembre();
    chargerCartes();
    chargerDeadlines();
    nouvelleTache();
    organiserReunion()
    setupMenuMobile()
    chargerDonneesMois();
    navigationCalendrier();
    deconnexion();


});

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
            document.getElementById("header-welcome").textContent = "Bienvenue, " + result.user.prenom + " !";
            document.getElementById("user-avatar").textContent = result.user.prenom[0].toUpperCase() + result.user.nom[0].toUpperCase();
            document.getElementById("user-name").textContent = result.user.prenom + " " + result.user.nom;
        }
    } catch (error) {
        console.error("Erreur :", error);
    }
}

// Récupérer le projet
async function recupererProjet() {
    let data = new FormData();
    data.append("action", "get_project_current");

    const response = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data
    });
    const result = await response.json();
    if (result.success) {

        document.getElementById("name-project").textContent = result.projet.nom;
    }
}

// Charger les membres du projet
async function chargerMembres() {
    let estChefProjet = false;
    let data = new FormData();
    data.append("action", "get_members_of_project");


    const response = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data
    });

    const result = await response.json();
    if (result.success) {
        let container = document.getElementById("members-list");

        for (let i = 0; i < result.members.length; i++) {
            let membre = result.members[i];
            console.log("membre:", membre.id, "role:", membre.role, "user_id:", user_id);
            if ( membre.id === user_id && membre.role === "chef_de_projet")
            {
                estChefProjet = true;
            }

            couleur = COULEURS_AVATAR[i % COULEURS_AVATAR.length];

            container.innerHTML += `
            <div class="member-row"> 
                <div class="member-avatar" style="background: ${couleur};">
                    ${membre.prenom[0].toUpperCase()}${membre.nom[0].toUpperCase()}
                </div>
                <span class="member-name">${membre.prenom} ${membre.nom}</span>
            </div>`;}

    }

    if (estChefProjet) {
        document.getElementById("btn-add-membre").style.display = "block";
    } else {
        document.getElementById("btn-add-membre").style.display = "none";
    }



}

// Charger les cartes statistiques
async function chargerCartes() {
    let data = new FormData();
    data.append("action", "count_tasks");
    //data.append("projet_id", projet_id);
    data.append("user_id", user_id);

    const response = await fetch("backend/controllers/taches.php", {
        method: "POST",
        body: data
    });
    const result = await response.json();
    if (result.success) {
        document.getElementById("compteur-late").textContent = result.en_retard;
        document.getElementById("compteur-done").textContent = result.terminee;
        document.getElementById("compteur-progress").textContent = result.en_cours;
    }

    let data2 = new FormData();
    data2.append("action", "count_meetings");
    //data2.append("projet_id", projet_id);

    const response2 = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data2
    });

    const result2 = await response2.json();
    if (result2.success) {
        document.getElementById("compteur-meetings").textContent = result2.count;
    }
}
async function organiserReunion() {
    const overlay = document.getElementById("modal-reunion-overlay");
    const modalClose = document.getElementById("modal-reunion-close");
    const bntOrganiserReunion = document.getElementById("btn-new-reunion");
    const form = document.getElementById("form-add-reunion");
    const msgError = document.getElementById("reunion-msg");
    const listeMembresId = document.getElementById("reunion-membres-list");
    bntOrganiserReunion.addEventListener("click", async () => {
        overlay.classList.add("show");
        let data = new FormData();
        data.append("action", "get_members_of_project");


        const response = await fetch("backend/controllers/projet.php", {
            method: "POST",
            body: data
        });
        const result = await response.json();
        if(result.success)
        {
            listeMembresId.innerHTML = "";
            if(result.members.length === 0){
                listeMembresId.innerHTML = "<p>Aucun membre dans le projet</p>";
            }
            else {
                for (let i = 0; i < result.members.length; i++) {
                    let membre = result.members[i]
                    listeMembresId.innerHTML += `
                    <label>
                    <input type="checkbox" name="participants[]" value=${membre.id}> ${membre.prenom} ${membre.nom}
                    </label>
                    `;


                }
            }

        }

    });
    modalClose.addEventListener("click", () => {
        overlay.classList.remove("show");
    });
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("show");
        }
    })

    form.addEventListener("submit", async (e )=>{
        e.preventDefault();
        try {
            let data = new FormData(form)
            data.append("action", "create_reunion")
            const response = await fetch("backend/controllers/projet.php", {
                method: "POST",
                body: data
            })
            const result = await response.json();
            if(result.success)
            {
                msgError.textContent = result.message;
                msgError.className = "task-msg success";
                setTimeout(() => {
                    form.reset();
                    overlay.classList.remove("show");
                    msgError.textContent = "";
                }, 1000);
            }
            else {
                msgError.textContent = result.message;
                msgError.className = "task-msg error";
            }
        }
        catch (error) {
            msgError.textContent = "Erreur de connexion au serveur.";
            msgError.className = "task-msg error";
        }
        });


}

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

            const response = await fetch("backend/controllers/taches.php", {
                method: "POST",
                body: data
            });
            const result = await response.json();
            if (result.success) {
                
                msgError.textContent = "tâche créée !";
                msgError.className = "task-msg success";
                setTimeout(() => {
                    form.reset();
                    overlay.classList.remove("show");
                    msgError.textContent = "";
                    chargerCartes();
                    chargerDonneesMois();
                }, 1000);
            } else {
                msgError.textContent = result.message;
                msgError.className = "task-msg error";
            }
        } catch (error) {
            msgError.textContent = "Erreur de connexion au serveur.";
            msgError.className = "task-msg error";
        }
    });
}
async function ajouterMembre() {
    const overlay = document.getElementById("modal-membre-overlay");
    const modalClose = document.getElementById("modal-membre-close");
    const bntAddMember = document.getElementById("btn-add-membre");
    const form = document.getElementById("form-add-membre");
    const msgError = document.getElementById("membre-msg");

    bntAddMember.addEventListener("click", () => {
        overlay.classList.add("show");
    });
    modalClose.addEventListener("click", () => {
        overlay.classList.remove("show");
    });
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("show");
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            let data = new FormData(form);
            data.append("action", "add_member");
            const response = await fetch("backend/controllers/projet.php", {
                method: "POST",
                body: data
            });
            const result = await response.json();
            if (result.success) {
                msgError.textContent = result.message;
                msgError.className = "task-msg success";
                setTimeout(() => {
                    form.reset();
                    overlay.classList.remove("show");
                    msgError.textContent = "";
                    chargerMembres();
                }, 1000);
            } else {
                msgError.textContent = result.message;
                msgError.className = "task-msg error";
            }
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

// Afficher le calendrier
function afficherCalendrier() {
    let nbJours = new Date(anneeCourrante, moisCourrant + 1, 0).getDate();
    let premierJour = new Date(anneeCourrante, moisCourrant, 1).getDay();
    let offset = (premierJour === 0) ? 6 : premierJour - 1;

    let aujourdhui = new Date();
    let estMoisActuel = (aujourdhui.getFullYear() === anneeCourrante && aujourdhui.getMonth() === moisCourrant);

    let container = document.getElementById("calendrier_jours");
    let html = "";

    // Cases vides avant le premier jour
    for (let i = 0; i < offset; i++) {
        html += '<div class="calendrier_jour vide"></div>';
    }

    // Les jours du mois

    for (let jour = 1; jour <= nbJours; jour++) {
        let estAujourdhui = estMoisActuel && aujourdhui.getDate() === jour;
        let estSelectionne = (jourSelectionne === jour);

        // Construire la date au format YYYY-MM-DD pour comparer avec la base
        let dateStr = anneeCourrante + "-" + String(moisCourrant + 1).padStart(2, '0') + "-" + String(jour).padStart(2, '0');

        // Vérifier s'il y a des deadlines ou réunions ce jour
        let hasDeadline = tachesDuMois.some(t => t.end_date === dateStr);
        let hasReunion = reunionsDuMois.some(r => r.date_reunion && r.date_reunion.startsWith(dateStr));

        //console.log("jour:", jour, "dateStr:", dateStr, "hasDeadline:", hasDeadline, "hasReunion:", hasReunion);
        html += `<div class="calendrier_jour ${estAujourdhui ? 'aujourdhui' : ''} ${estSelectionne ? 'selectionne' : ''}" onclick="selectionnerJour(${jour})">
                    <span>${jour}</span>
                    <div class="cal-dots">
                        ${hasReunion ? '<span class="dot meeting"></span>' : ''}
                        ${hasDeadline ? '<span class="dot deadline"></span>' : ''}
                    </div>
                 </div>`;
    }

    container.innerHTML = html;
}
// Charger les tâches et réunions du mois

async function chargerDonneesMois() {
    let data1 = new FormData();
    data1.append("action", "get_tasks_by_month");
    //data1.append("projet_id", projet_id);
    data1.append("mois", moisCourrant + 1);
    data1.append("annee", anneeCourrante);

    const response1 = await fetch("backend/controllers/taches.php", {
        method: "POST",
        body: data1
    });
    const result1 = await response1.json()

    if (result1.success) {
        tachesDuMois = result1.tasksByMonth

    }

    let data2 = new FormData();
    data2.append("action", "get_meetings_by_month");
    //data2.append("projet_id", projet_id);
    data2.append("mois", moisCourrant  +1);
    data2.append("annee", anneeCourrante);

    const response2 = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data2
    });
    const result2 = await response2.json();

    if (result2.success) {
        reunionsDuMois = result2.meetingsByMonth;

    }

    afficherCalendrier();
}

// Sélectionner un jour
function selectionnerJour(jour) {
    jourSelectionne = jour;
    afficherCalendrier();
    document.getElementById("detail-jour-titre").textContent = jour + " " + MOIS[moisCourrant] + " " + anneeCourrante;

    let dateStr = anneeCourrante + "-" + String(moisCourrant + 1).padStart(2, '0') + "-" + String(jour).padStart(2, '0');
    let container = document.getElementById("detail-jour-list");

    let tachesJour = tachesDuMois.filter(t => t.end_date === dateStr || t.start_date === dateStr);
    let reunionsJour = reunionsDuMois.filter(r => r.date_reunion && r.date_reunion.startsWith(dateStr));

    let html = "";

    for (let i = 0; i < tachesJour.length; i++) {
        let tache = tachesJour[i];
        html += `
        <div class="jour-event">
            <div class="event-bar deadline"></div>
            <div>
                <div class="event-nom">${tache.nom}</div>
                <div class="event-sub">Deadline · ${tache.prenom} ${tache.username}</div>
            </div>
        </div>`;
    }

    for (let i = 0; i < reunionsJour.length; i++) {
        let reunion = reunionsJour[i];
        html += `
        <div class="jour-event">
            <div class="event-bar meeting"></div>
            <div>
                <div class="event-nom">${reunion.titre}</div>
                <div class="event-sub">Réunion${reunion.lieu ? ' · ' + reunion.lieu : ''}</div>
            </div>
        </div>`;
    }

    if (tachesJour.length === 0 && reunionsJour.length === 0) {
        html = '<p class="empty-msg">Rien de prévu ce jour</p>';
    }

    container.innerHTML = html;
}


// Navigation du calendrier
function navigationCalendrier() {
    let btnPrev = document.getElementById("calendrier_prev");
    let btnNext = document.getElementById("calendrier_next");
    let calTitre = document.getElementById("calendrier_titre");

    btnPrev.addEventListener("click", () => {
        moisCourrant--;
        if (moisCourrant < 0) {
            moisCourrant = 11;
            anneeCourrante--;
        }
        jourSelectionne = null;
        calTitre.textContent = MOIS[moisCourrant] + " " + anneeCourrante;
        chargerDonneesMois();
    });

    btnNext.addEventListener("click", () => {
        moisCourrant++;
        if (moisCourrant > 11) {
            moisCourrant = 0;
            anneeCourrante++;
        }
        jourSelectionne = null;
        calTitre.textContent = MOIS[moisCourrant] + " " + anneeCourrante;
        chargerDonneesMois();
    });
}

async function chargerDeadlines() {
    const data = new FormData();
    data.append("action", "get_deadlines");
    //data.append("projet_id", projet_id);
    data.append("user_id", user_id);
    const response = await fetch("backend/controllers/taches.php", {
        method: "POST",
        body: data
    });
    const result = await response.json();
    if (result.success) {
        let container = document.getElementById("deadlines-list");
        let aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);

        for (let i = 0; i < result.deadlines.length; i++) {
            let tache = result.deadlines[i];
            let deadline = new Date(tache.end_date);
            let diff = Math.ceil((deadline - aujourdhui) / (1000 * 60 * 60 * 24));
            let joursTexte = "";
            if (diff < 0) joursTexte = "En retard";
            else if (diff === 0) joursTexte = "Aujourd'hui";
            else joursTexte = diff + "j";

            container.innerHTML += `
            <div class="deadline-row">
                <span class="deadline-nom">${tache.nom}</span>
                <span class="deadline-jours ${diff <= 1 ? 'urgent' : ''}">${joursTexte}</span>
            </div>`;
        }
    }
}
function setupMenuMobile() {
    const toggle = document.getElementById("menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    if (toggle) {
        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }
}
