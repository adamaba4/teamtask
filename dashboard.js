let user_id = null
let projet_id = 1  /* JE N'AI PAS ENCORE GÉRER L'AFFICHAGE DU NOM DE PROJET CHOISI*/
let moisCourrant = 3
let anneeCourrante = 2026
let jourSelectionne = null
const MOIS =["janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ]
const COULEURS_AVATAR = ["#6c5ce7", "#00b894", "#fd79a8", "#fdcb6e", "#e17055", "#0984e3"];
document.addEventListener("DOMContentLoaded",async ()=> {



    await verifierConnexion();
    chargerMembres();
    nouvelleTache();
    chargerCartes();

    afficherCalendrier();
    navigationCalendrier();

    deconnexion();


});

// on vérifie si l'utilisateur s'est connecté sinon on le redirige vers la page de connexion


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
//  on récupère la liste des membres du projet

async function chargerMembres() {
    let data = new FormData();
    data.append("action", "get_members_of_project")
    data.append("projet_id", projet_id)


    const response = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data
    })

    const result = await response.json();
    console.log(result)

    if (result.success) {
        let container = document.getElementById("members-list");

        for( let i = 0; i < result.members.length; i++) {
            let membre = result.members[i]
            if(result.members[i].id !== user_id) {
                let couleur = COULEURS_AVATAR[i % COULEURS_AVATAR.length];

                container.innerHTML += `
            <div class="member-row"> 
                <div class="member-avatar" style="background: ${couleur};">${membre.prenom[0].toUpperCase()+ membre.nom[0].toUpperCase()}</div>
                <span class = "member-name">${membre.prenom} ${membre.nom[0].toUpperCase()}</span>
            
            </div>`
            }

        }

    }

}

async function chargerCartes() {
    let data = new FormData();
    data.append("action", "count_tasks")
    data.append("projet_id", projet_id)
    data.append("user_id", user_id)
    const response = await fetch("backend/controllers/taches.php", {
        method: "POST",
        body: data
    })
    const result = await response.json();
    console.log(result)
    if (result.success) {
        document.getElementById("compteur-late").textContent = result.en_retard;
        document.getElementById("compteur-done").textContent = result.terminee;
        document.getElementById("compteur-progress").textContent = result.en_cours;
    }

    let data2 = new FormData();
    data2.append("action", "count_meetings")
    data2.append("projet_id", projet_id)
    const response2 = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data2
    })

    const result2  = await response2.json();

    if (result2.success) {
        document.getElementById("compteur-meetings").textContent = result2.count;
    }

}




function nouvelleTache() {
    const overlay = document.getElementById("modal-overlay");
    const modalClose = document.getElementById("modal-close");
    const bntNewTask = document.getElementById("btn-new-task");
    const form = document.getElementById("new-task-form");
    const msgError = document.getElementById("task-msg");

    bntNewTask.addEventListener("click", () => {
        overlay.classList.add("show");
    })

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("show");
        }
    })

    modalClose.addEventListener("click", () => {
        overlay.classList.remove("show");
    })

     form.addEventListener("submit", async (e) => {
         e.preventDefault();
         try {
             let data = new FormData(form);
             data.append("action", "create_task");
             data.append("projet_id", projet_id);
             data.append("user_id", user_id);
             const response = await fetch("backend/controllers/taches.php", {
                 method: "POST",
                 body: data
             })

             const result = await response.json();
             if (result.success) {
                 msgError.textContent = "Tâche créée"
                 msgError.className = "task-msg success";
                 setTimeout(() => {
                     form.reset();
                     overlay.classList.remove("show");
                     msgError.textContent = "";
                     chargerCartes();
                 }, 1000)
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
function deconnexion() {
    const bntDeconnexion = document.getElementById("btn-deconnexion");
     bntDeconnexion.addEventListener("click", async (e) => {
         e.preventDefault();
        let data = new FormData();
        data.append("action", "deconnexion");

        const reponse = await fetch ("backend/controllers/auth.php",{
            method: "POST",
            body: data
        })

         const result = await reponse.json();
        if (result.success) {
             window.location.href = "connexion.html";
         } else {
             alert("Erreur de connexion au serveur.");
         }

     })
}

function afficherCalendrier(){
    let nbJours = new Date(anneeCourrante, moisCourrant + 1, 0).getDate();
    let premierJour = new Date(anneeCourrante, moisCourrant,1).getDay();
    let offset = (premierJour === 0) ? 6 : premierJour - 1;

    let aujourdhui = new Date();
    let estMoisCourrant = (aujourdhui.getFullYear() === anneeCourrante && aujourdhui.getMonth() === moisCourrant);
    let container = document.getElementById("calendrier_jours");
    let html = "";

    // les cases vides avant le premier jour
    for (let i = 0; i < offset; i++) {
        html += '<div class="calendrier_jour vide"></div>';
    }

    //les jours du mois
    for(let jour= 1; jour<= nbJours; jour++) {
        let estAujourdhui = jour === aujourdhui.getDate() && estMoisCourrant;
        html += `<div class="calendrier_jour ${estAujourdhui ? 'aujourdhui' : ''}" onclick="selectionnerJour(${jour})">
            <span>${jour}</span>
         </div>`;
    }
    container.innerHTML = html;
}
function selectionnerJour(jour) {
    jourSelectionne = jour;
    afficherCalendrier()
    document.getElementById("detail-jour-titre").textContent = jour + " " + MOIS[moisCourrant] + " " + anneeCourrante;
}
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
        calTitre.textContent = MOIS[moisCourrant] + " " + anneeCourrante;
        afficherCalendrier();
    })
    btnNext.addEventListener("click", () => {
        moisCourrant++;
        if (moisCourrant > 11) {
            moisCourrant = 0;
            anneeCourrante++;
        }
        calTitre.textContent = MOIS[moisCourrant] + " " + anneeCourrante;
        afficherCalendrier();
    })
}

