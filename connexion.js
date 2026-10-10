
let form;
let email;
let password;


window.addEventListener("load", () => {
    //Récupération du formulaire
    form = document.getElementById("connexion");

    const msgerror= document.getElementById("msg-erreur");


    form.addEventListener("submit", function (e) {
        e.preventDefault(); //la page ne se recharge pas


        email = document.getElementById("email").value;
        password = document.getElementById("password").value;


        //Récupération des données du formulaire
        let data = new FormData();
        data.append("action", "connexion"); //php attend action=connexion
        data.append("email", email);
        data.append("password", password);

        //Envoie des données au php
        fetch("backend/controllers/auth.php", {
            method: "POST",
            body: data
        })
            //Récupération des réponses
            .then(response => response.json())

            //Vérification des données
            .then(result => {
                if (result.success) {
                    setTimeout(() => {
                        window.location.href = "projet.html"; 
                    }, 1500);
                } else {
                    msgerror.textContent=result.message;
                    msgerror.className = "error-msg show-error";  
                }
            })
            /*
            .catch(error => {
                console.error('Erreur:', error);
                errorDiv.innerText = "Erreur de connexion au serveur.";
            });
*/
    })

});
