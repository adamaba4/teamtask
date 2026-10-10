let user_id = null;
document.addEventListener("DOMContentLoaded", async () =>{

    try {
        await verifierConnexion();

    } catch (error) {
        console.error("Erreur :", error);
    }
    chargerProjets()
    nouvelleProjet()
    deconnexion()
})

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
            document.getElementById("user-prenom").textContent = result.user.prenom ;
            document.getElementById("user-avatar").textContent = result.user.prenom[0].toUpperCase() + result.user.nom[0].toUpperCase();

        }
    } catch (error) {
        console.error("Erreur :", error);
    }
}
// se déconnecter

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

// récupérer la liste de tous les projets auxquels l'utilisateur est membre
async function chargerProjets() {
    let data = new FormData();
    data.append("action", "get_projects_of_user");

    const result = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data
    })
    const resultat = await result.json();

    let container = document.getElementById("liste_projet");
    if (!resultat.projects || resultat.projects.length === 0) {
        container.innerHTML = '<p class="empty-msg">Aucun projet. Créez-en un !</p>';
        return;
    }
    else
    {
        for (let i=0; i < resultat.projects.length; i++) {
            let projet = resultat.projects[i]
            container.innerHTML += `
    <div class="projet-row" onclick="choisirProjet(${projet.id})"> 
        <div class="projet-name">${projet.nom.toUpperCase()}</div>
        <div class="projet-desc">${projet.description || ''}</div>
        <div class="projet-dates">${projet.start_date || ''} → ${projet.end_date || ''}</div>
    </div>`;
        }
    }

}
async function choisirProjet(projet_id) {
    let data = new FormData();
    data.append("action", "choisir_projet");
    data.append("projet_id", projet_id);
    const reponse = await fetch("backend/controllers/projet.php", {
        method: "POST",
        body: data
    })
    const result = await reponse.json()
    if (result.success) {
        window.location.href = "dashboard.html";
    }
}
async function nouvelleProjet() {
    const overlay = document.getElementById("modal-overlay");
    const modalClose = document.getElementById("modal-close");
    const bntNewProjet = document.getElementById("btn_ajout_projet");
    const form = document.getElementById("new-projet-form");
    const msgError = document.getElementById("projet-msg");

    bntNewProjet.addEventListener("click", () => {
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
            data.append("action", "create_project");
            const response = await fetch("backend/controllers/projet.php", {
                method: "POST",
                body: data
            })
            const result = await response.json()
            if (result.success){
                msgError.textContent = "Projet créé"
                msgError.className = "projet-msg success"
                setTimeout(() => {
                    form.reset();
                    overlay.classList.remove("show");
                    msgError.textContent = "";
                    chargerProjets();
                }, 1000);
            }
            else {
                msgError.textContent = result.message;
                msgError.className = "projet-msg error";
            }

        }
        catch (error) {
            msgError.textContent = "Erreur de connexion au serveur.";
            msgError.className = "projet-msg error";
        }

    })
}
