<?php
session_start();
require_once '../config/db.php';
require_once '../models/Task.php';

$tache = new Task($db_conn);
$action = isset($_POST['action']) ? $_POST['action'] : '';
$user_id = $_SESSION['id_user'];

switch ($action)
{
    //-------------------------------------------------------------------------------------------------------------
    // Récupérer toutes les tâche d'un utilisateur
    case 'my_tasks':
        $projet_id = (int)$_POST['projet_id'];
        $result = $tache->getTasksByUser($user_id, $projet_id);
        echo json_encode(["success" => true, "tasks" => $result]); //on renvoie le tableau des taches

        break;

    
    //-------------------------------------------------------------------------------------------------------------
    //CREER UNE TACHE
    case 'create_task':
        //Récupère les informations de la tâche
        $nom         = $_POST['nom'];
        $description = $_POST['description'];
        $is_public   = $_POST['is_public'];
        $start_date  = !empty($_POST['start_date'])  ? $_POST['start_date']  : null;
        $end_date    = !empty($_POST['end_date'])     ? $_POST['end_date']    : null;
        $category    = !empty($_POST['category'])    ? $_POST['category']    : null;
        $description = !empty($_POST['description']) ? $_POST['description'] : null;
        $color       = !empty($_POST['color'])       ? $_POST['color']       : null;
        $projet_id = $_POST['projet_id'];
        $priority    = $_POST['priority'];

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
                    "success" => false, "message" => "Erreur lors de la création"]);
                     error_log(pg_last_error($db_conn));
            }
        
        break;
    
     //-------------------------------------------------------------------------------------------------------------
    //NOMBRE DE TACHES SELON LE STATUT
    case 'count_tasks':
        $projet_id = isset($_POST['projet_id']) ? (int)$_POST['projet_id'] : null;
        $counts = $tache->countTasksByStatus($user_id, $projet_id);
        echo json_encode(array_merge(['success' => true], $counts)); //pour avoir un seul tableau
        break;       

     //-------------------------------------------------------------------------------------------------------------
    //La liste complete des taches d'un projet avec la personne qui s'en occupe
    case 'get_tasks':
        $projet_id = isset($_POST['id_projet']) ? (int)$_POST['id_projet'] : null;
        if (!$projet_id) {
            echo json_encode(["success" => false, "message" => "projet manquant"]);
            break;
        }
 
        $result = $tache->getTasksByProject($projet_id);
        echo json_encode(["success" => true, "taches" => $result]);
        break;

     //-------------------------------------------------------------------------------------------------------------
    //La liste des taches de l'user qui se finit dans 3 jours
    case 'get_deadlines':
        $projet_id = isset($_POST['projet_id']) ? (int)$_POST['projet_id'] : null;
        $deadlines = $tache->getUpcomingDeadlines($projet_id, $user_id);
        echo json_encode(["success" => true, "deadlines" => $deadlines]);
        break;

    //-------------------------------------------------------------------------------------------------------------
    //Mettre à jour le statut de la tache ( en verifiant les autorisations)
     case 'update_statustask':
        $task_id   = isset($_POST['task_id']) ? (int)$_POST['task_id'] : null;
        $newStatus = isset($_POST['status'])  ? $_POST['status'] : null;
 
        $status = ['en_cours', 'terminee', 'en_retard'];
        if (!$task_id || !in_array($newStatus, $status)) {
            echo json_encode(["success" => false, "message" => "Paramètres invalides"]);
            break;
        }
 
        $result = $tache->updateStatus($task_id, $newStatus, $user_id);
        if ($result) {
            echo json_encode(["success" => true, "message" => "Statut mis à jour"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erreur ou accès refusé"]);
        }
        break;

    case 'get_tasks_by_month':
        $projet_id = isset($_POST['projet_id']) ? (int)$_POST['projet_id'] : null;
        $mois = isset($_POST['mois']) ? (int)$_POST['mois'] : null;
        $annee = isset($_POST['annee']) ? (int)$_POST['annee'] : null;
        $result = $tache->getTaskByMonth($projet_id, $user_id, $mois, $annee);
        echo json_encode(["success" => true, "tasksByMonth" => $result]);
        break;

}

?>