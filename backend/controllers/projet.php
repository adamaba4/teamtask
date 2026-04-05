<?php
session_start();
require_once '../config/db.php';
require_once '../models/Projet.php';

$projet = new Projet($db_conn);
$action = isset($_POST['action']) ? $_POST['action'] : '';
$user_id = $_SESSION['id_user'];

switch ($action) {
        //-------------------------------------------------------//
        //CREER UN NOUVEAU PROJET
         //-------------------------------------------------------//
        case 'create_project':
            $nom         = $_POST['nom'];
            $description = $_POST['description'];
            $start_date  = $_POST['start_date'];
            $end_date    = $_POST['end_date'];

              // Vérification des dates
        if ($end_date < $start_date) {
            echo json_encode(["success" => false, "message" => "La date de fin ne peut pas être avant la date de début"]);
            break;
        }

            $result = $projet->create_project($nom, $description,$user_id, $start_date, $end_date);
            

            if ($result) {
                echo json_encode(["success" => true, "message" => "Projet crée avec succès"]);
            } else {
                echo json_encode(["success" => false, "message" => "Erreur lors de la création"]);
            }
            break;


        //-------------------------------------------------------//         
        //RECUPERER TOUS LES PROEJTS DE L'USER 
        //-------------------------------------------------------//
        case 'get_projects_of_user':
            $result= $projet->getProjectsByUser($user_id);
            echo json_encode(["success" => true, "projects" => $result ]);  
        break;

        //-------------------------------------------------------//
        //Récuperer les membres d'un projets avec leur rôle
        //-------------------------------------------------------//
        case 'get_members_of_project':
            $projet_id = isset($_POST['projet_id']) ? (int)$_POST['projet_id'] : null;
            $result = $projet->getMembersByProject($projet_id);
            echo json_encode(["success" => true, "members" => $result]);
            break;

        //-------------------------------------------------------//
        //CREER UNE REUNION
        //-------------------------------------------------------//
        case 'create_reunion' : 
            $projet_id =isset($_POST['projet_id']) ? (int)$_POST['projet_id'] : null;
            $titre = isset($_POST['titre']) ? $_POST['titre'] : null;
            $description = isset($_POST['description']) ? $_POST['description'] : null;
            $date = isset($_POST['date_reunion']) ? $_POST['date_reunion'] : null;
            $lieu = isset($_POST['lieu']) ? $_POST['lieu'] : null;

            $result = $projet->create_meeting($projet_id, $user_id, $titre, $description, $date, $lieu);
            if ($result) {
                echo json_encode(["success" => true, "message" => "Réunion ajoutée avec succès"]);
            } else {
                    echo json_encode([
                        "success" => false, "message" => "Erreur lors de la création"]);

                }
        
            break;

        //-------------------------------------------------------//
        //Compte du nombre de meeting/reunions
        //-------------------------------------------------------/
        case 'count_meetings':
            $projet_id = isset($_POST['projet_id']) ? (int)$_POST['projet_id'] : null;
            $result = $projet->countMeetings($projet_id);
            echo json_encode(["success" => true, "count" => $result]);
            break;

        case 'get_meetings_by_month':
            $projet_id = isset($_POST['projet_id']) ? (int)$_POST['projet_id'] : null;
            $mois = isset($_POST['mois']) ? (int)$_POST['mois'] : null;
            $annee = isset($_POST['annee']) ? (int)$_POST['annee'] : null;
            $result = $projet->getMeetingsByMonth($projet_id, $mois, $annee);
            echo json_encode(["success" => true, "meetingsByMonth" => $result]);
            break;
    }



?>