<?php
session_start();
require_once '../config/db.php';
require_once '../models/Task.php';

$tache = new Task($db_conn);
$action = isset($_POST['action']) ? $_POST['action'] : '';

switch ($action)
{
    //CREER UNE TACHE
    case 'create_task':
        //Récupère les informations de la tâche
        $user_id    =  $_SESSION['id_user'];
        $nom         = $_POST['nom'];
        $description = $_POST['description'];
        $is_public   = $_POST['is_public'];
        $start_date  = $_POST['start_date'];
        $end_date    = $_POST['end_date'];
        $category    = $_POST['category'];
        $projet_id = $_POST['projet_id'];
        $priority    = $_POST['priority'];
        $color       = $_POST['color'];

         // Vérification des dates
        if ($end_date < $start_date) {
            echo json_encode(["success" => false, "message" => "La date de fin ne peut pas être avant la date de début"]);
            break;
        }

        //On appelle la fonction qui permet de créer la tâche avec les information données
        $result = $tache->createTask($user_id, $nom, $description, $is_public, $start_date, $end_date, $category,$projet_id, $priority, $color);

        //Et on envoie la réponse au js
        if ($result) {
            echo json_encode(["success" => true, "message" => "Tâche ajoutée avec succès"]);
        } else {
                echo json_encode([
                    "success" => false,
                    "message" => pg_last_error($db_conn) //on peut voir exactement quel est l'erreur
                ]);
            }
        
        break;
    

    //NOMBRE DE TACHE TERMINEES D'UN UTILISATEUR
    case 'count_task_finished':
        $user_id = $_SESSION['id_user'];
        $total = $tache->countTasksFinished($user_id);
        echo json_encode(["success" => true, "total" => $total]);
        break;

    // NOMBRE DE TÂCHES À FAIRE D'UN UTILISATEUR
    case 'count_a_faire':
        $user_id = $_SESSION['id_user'];
        $total = $tache->countTasksTodo($user_id);
        echo json_encode(["success" => true, "total" => $total]);
        break;
    
}