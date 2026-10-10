let user_id = null
let receiver_id = null

document.addEventListener('DOMContentLoaded', async () => {
    await verifierConnexion();
    chargerContacts();


    document.getElementById("send-button").addEventListener("click", envoyerMessage);

    document.getElementById("message-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            envoyerMessage();
        }
    });
    document.getElementById("btn-retour-liste").addEventListener("click", () => {
        document.getElementById("conversation").style.display = "none";
        document.getElementById("liste-contacts").style.display = "block";
    });


})

/* On vérifie bien si l'utilisateur est bein connecté, sinon on le redirige vers la page de connexion*/

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
        }
        else{
            user_id = result.user.id;
        }
    } catch (error) {
        console.error("Erreur :", error);
    }
}

async function chargerContacts() {
    let data = new FormData();
    data.append("action", "get_contact");
    const reponse = await fetch("backend/controllers/message.php", {
        method: "POST",
        body: data
    });
    const result = await reponse.json();

    // Récupérer les derniers messages
    let data2 = new FormData();
    data2.append("action", "last_message");
    const reponse2 = await fetch("backend/controllers/message.php", {
        method: "POST",
        body: data2
    });
    const result2 = await reponse2.json();

    if (result.success) {
        let container = document.getElementById("contacts-list");

        for (let i = 0; i < result.contacts.length; i++) {
            let contact = result.contacts[i];
            let couleur = "#41655e";

            // Chercher le dernier message avec ce contact
            let lastMsg = "";
            let heure = "";
            if (result2.success) {
                let msg = result2.last_message.find(m =>
                    m.sender_id == contact.id || m.receiver_id == contact.id
                );
                if (msg) {
                    lastMsg = msg.content;
                    // Couper le message s'il est trop long
                    if (lastMsg.length > 30) {
                        lastMsg = lastMsg.substring(0, 30) + "...";
                    }
                    heure = msg.send_date.substring(11, 16)
                }
            }

            container.innerHTML += `
            <div class="contact-row" onclick="ouvrirConversation(${contact.id}, '${contact.prenom} ${contact.nom}')"> 
                <div class="contact-avatar" style="background: ${couleur};">
                    ${contact.prenom[0].toUpperCase()}${contact.nom[0].toUpperCase()}
                </div>
                <div class="contact-info">
                    <span class="contact-name">${contact.prenom} ${contact.nom}</span>
                    <span class="contact-last-msg">${lastMsg}</span>
                    <span class="heure">${heure}</span>
                </div>
            </div>`;
        }
    }
}
async function envoyerMessage() {
    let message = document.getElementById("message-input").value;
    if (message.trim() !== "") {
        let data = new FormData();
        data.append("action", "send_message");
        data.append("receiver_id", receiver_id);
        data.append("message_content", message);
        const reponse = await fetch("backend/controllers/message.php",{method: "POST", body: data})

        const result = await reponse.json()
        if (result.success) {
            document.getElementById("message-input").value = "";
            ouvrirConversation(receiver_id, document.getElementById("conversation-name").textContent);
        }
        else
        {
            console.error("Message non envoyé");
        }
    }
}

async function ouvrirConversation(contact_id, contact_nom) {

    // on stocke l'id du contact dans la variable globale'
    receiver_id = contact_id;
    // on cache la liste des contacts
    document.getElementById("liste-contacts").style.display = "none";
    document.getElementById("conversation").style.display = "flex";

    // on affiche le nom dans le header
    document.getElementById("conversation-name").textContent = contact_nom;

    // on fait un fetch pour récuperer les messages de la conversation

    let data = new FormData();
    data.append("action", "get_conversation");
    data.append("receiver_id", receiver_id);
    const reponse = await fetch("backend/controllers/message.php", {
        method: "POST",
        body: data
    })
    const result = await reponse.json()
    console.log(result.conversation)

    // on boucle sur result pour afficher les bulles

    if (result.success) {
        let container = document.getElementById("conversation-messages");
        container.innerHTML = ''
        for (let i = 0; i < result.conversation.length; i++) {
            let message = result.conversation[i];
            if (message.sender_id === user_id) {
                //bulle à droite c'est moi
                container.innerHTML += `
                <span class="message-bubble me">
                    ${message.content}
                    <span class="heure">
                    ${message.send_date.substring(11, 16)}
                </span>
                </span>
                
                `
            }
            else {
                // bulle à gauche c'est l'autre utilisateur
                container.innerHTML += `
                <span class="message-bubble other">
                    ${message.content}
                    <span class="heure">
                    ${message.send_date.substring(11, 16)}
                </span>
                </span>
                
                `
            }
        }

    }
}

