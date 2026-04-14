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

        case 'choisir_projet':
            $projet_id = $_POST['projet_id'];
            $_SESSION['projet_id'] = $projet_id;
            echo json_encode(["success" => true]);
            break;


        case 'add_member':
            $email = trim($_POST['email']);
            $projet_id = $_SESSION['projet_id'];
            $result = $projet->addMember($projet_id, $email);

            if ($result === "success") {
                echo json_encode(["success" => true, "message" => "Membre ajouté !"]);
            } else if ($result === "not_found") {
                echo json_encode(["success" => false, "message" => "Utilisateur non trouvé. Il doit d'abord s'inscrire."]);
            } else if ($result === "already_member") {
                echo json_encode(["success" => false, "message" => "Cette personne est déjà membre du projet."]);
            } else {
                echo json_encode(["success" => false, "message" => "Erreur lors de l'ajout."]);
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
            $projet_id = isset($_SESSION['projet_id']) ? (int)$_SESSION['projet_id'] : null;
            $result = $projet->getMembersByProject($projet_id);
            echo json_encode(["success" => true, "members" => $result]);
            break;

        //-------------------------------------------------------//
        //CREER UNE REUNION
        //-------------------------------------------------------//

        case 'create_reunion':
            $projet_id = $_SESSION['projet_id'];
            $titre = isset($_POST['titre']) ? $_POST['titre'] : null;
            $description = isset($_POST['description']) ? $_POST['description'] : null;
            $date = isset($_POST['date_reunion']) ? $_POST['date_reunion'] : null;
            $lieu = isset($_POST['lieu']) ? $_POST['lieu'] : null;
            $participants = isset($_POST['participants']) ? $_POST['participants'] : [];

            $result = $projet->create_meeting($projet_id, $user_id, $titre, $description, $date, $lieu, $participants);
            if ($result) {
                echo json_encode(["success" => true, "message" => "Réunion créée avec succès"]);
            } else {
                echo json_encode(["success" => false, "message" => "Erreur lors de la création"]);
            }
            break;

        //-------------------------------------------------------//
        //Compte du nombre de meeting/reunions
        //-------------------------------------------------------/

        case 'count_meetings':
            $projet_id = $_SESSION['projet_id'];
            $result = $projet->countMeetings($projet_id, $user_id);
            echo json_encode(["success" => true, "count" => $result]);
            break;
        case 'get_meetings_by_month':
            $projet_id = isset($_SESSION['projet_id']) ? (int)$_SESSION['projet_id'] : null;
            $mois = isset($_POST['mois']) ? (int)$_POST['mois'] : null;
            $annee = isset($_POST['annee']) ? (int)$_POST['annee'] : null;
            $result = $projet->getMeetingsByMonth($projet_id, $mois, $annee);
            echo json_encode(["success" => true, "meetingsByMonth" => $result]);
            break;

        case 'get_project_current':
            $projet_id = $_SESSION['projet_id'];
            $result = $projet->getCurrentProjet($projet_id);
            echo json_encode(["success" => true, "projet" => $result]);
            break;



    }



?>