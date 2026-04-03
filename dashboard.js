let user_id = null
let projet_id = null

document.addEventListener("DOMContentLoaded",async ()=> {
    deconnexion();
    await verifierConnexion();
    await recupererProjet();
    chargerMembres();
    chargerCartes();
    nouvelleTache();



});

// on vérifie si l'utilisateur s'est connecté sinon on le redirige vers la page de connexion


async function verifierConnexion() {
    try {
        let data = new FormData();
        data.append("action", "verifier_session");

        const response = await fetch("backend/controllers/auth.php", {
            method: "POST",
            body: data
        });

        const result = await response.json();

        if (!result.success) {
            window.location.href = "connexion.html";
        } else {
            user_id = result.id;
            document.getElementById("header-welcome").textContent = "Bienvenue, " + result.prenom + " !";
            document.getElementById("user-avatar").textContent = result.prenom[0] + result.nom[0];
            document.getElementById("user-name").textContent = result.prenom + " " + result.nom;
        }
    } catch (error) {
        console.error("Erreur :", error);
    }
}
//  on récupère la liste des membres du projet

async function chargerMembres() {
    let data = new FormData();
    data.append("action", "get_all_members")
    data.append("id_projet", projet_id)

    const response = await fetch("backend/controllers/project.php", {
        method: "POST",
        body: data
    })

    const result = await response.json();
    if (result.success) {
        let container = document.getElementById("members-list");

        for( let i = 0; i < result.membres.length; i++) {
            let membre = result.membres[i]
            container.innerHTML += `
            <div class="member-row"> 
                <div class="member-avatar">${membre.prenom[0] + membre.nom[0]}</div>
                <span class = "member-name">${membre.prenom} ${membre.nom }</span>
            
            </div>`
        }

    }
}

async function recupererProjet() {
    let data = new FormData();
    data.append("action", "get_project")

    const response = await fetch("backend/controllers/project.php", {
        method: "POST",
        body: data
    })
    const result = await response.json();
    if (result.success) {
        projet_id = result.id;
        document.getElementById("name-project").textContent = result.nom
    }
}

async function chargerCartes() {
    let data = new FormData();
    data.append("action", "count_tasks")
    data.append("id_projet", projet_id)
    data.append("id_user", user_id)
    const response = await fetch("backend/controllers/task.php", {
        method: "POST",
        body: data
    })
    const result = await response.json();
    if (result.success) {
        document.getElementById("compteur-late").textContent = result.en_retard;
        document.getElementById("compteur-done").textContent = result.terminee;
        document.getElementById("compteur-progress").textContent = result.en_cours;
    }

    let data2 = new FormData();
    data2.append("action", "count_meetings")
    data2.append("id_projet", projet_id)
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
    const form = document.getElementById("form-new-task");
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
             data.append("id_projet", projet_id);
             data.append("id_user", user_id);
             const response = await fetch("backend/controllers/task.php", {
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