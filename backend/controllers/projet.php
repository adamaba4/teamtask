<?php
session_start();
require_once '../config/db.php';
require_once '../models/Projet.php';

$tache = new Projet($db_conn);
$action = isset($_POST['action']) ? $_POST['action'] : '';

switch ($action) {
        
        //RECUPERER TOUS LES PROEJTS DE L'USER 
        case 'get_projects_of_user':
            $user_id = $_POST['id_user'] ?? $_SESSION['id_user']; //id de l'user
            $projects = $tache->getProjectsByUser($user_id);
            if ($projects) {
                echo json_encode([
                "success" => true, 
                "projects" => $projects
                ]);
            } else {
                // On renvoie un tableau vide si aucun projet n'est trouvé
                echo json_encode(["success" => true, "projects" => []]);
            }
        break;

}

?>