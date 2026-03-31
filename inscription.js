// Je n'ai pas utilisé la version avec then, j'ai utilisé async/await

async function envoyerdata(form, nomAction) {
    const formu = document.getElementById(form);
    const msgerror= document.getElementById("msg-erreur");
    
    formu.addEventListener('submit', async (e) => {
        e.preventDefault(); // Pour ne pas recharger la page

        //Récuperation des données
        const data = new FormData(formu);
        data.append('action',nomAction); // Ajoute l'action pour ton switch PHP

        //Envoie des données
        try {
            const response = await fetch('backend/controllers/auth.php', { 
                method: 'POST',
                body: data
            });

             //Récupération des réponses
            const result = await response.json();

            //verfier les données
                 if (result.success) {
                    setTimeout(() => {
                        window.location.href = "accueil.html"; // Change vers ta page d'accueil
                    }, 1500);
                } else {
                    msgerror.textContent=result.message;
                    msgerror.className = "error-msg show-error";  
                } 
         
              
        } catch (error) {
            console.error("Erreur technique :", error);
        }
});
};

// On active 
envoyerdata('inscription', 'inscription');
