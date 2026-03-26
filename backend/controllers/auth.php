<?php
session_start();
require_once '../config/db.php';
require_once '../models/User.php';

$user = new User($db_conn);
$action = isset($_POST['action']) ? $_POST['action'] : '';

switch ($action)
{
    case 'connexion':
        $email = $_POST['email'];
        $password = $_POST['password'];

        if ( !$email || !$password)
            echo json_encode(["success" => false, "message" => "champs obligatoires manquants"]);
        else
            {
                $result = pg_fetch_assoc($user->getUserByEmail($email));
                if (!$result)
                    echo json_encode(["success" => false, "message" => "Email ou mot de pass incorrect"]);
                else if (!password_verify($password, $result['password']))
                    echo json_encode(["success" => false, "message" => "Email ou mot de pass incorrect"]);
                else {
                    $_SESSION['est_connecte']= true ;
                    $_SESSION['id_user'] = $result['id'];
                    $_SESSION['nom'] = $result['nom'];
                    $_SESSION['prenom'] = $result['prenom'];

                    echo json_encode(["success" => true, "message" => "Connexion réussie"]);
                }
            }
        break;


    case 'deconnexion':
        $_SESSION = array();
        session_destroy();
        echo json_encode(["success" => true, "message" => "Deconnexion réussie"]);
        break;


    case 'inscription':
        $nom = $_POST['nom'];
        $prenom = $_POST['prenom'];
        $email = $_POST['email'];
        $password = $_POST['password'];
        $dob = isset($_POST['dob']) ? $_POST['dob'] : null;
        if (! $nom || !$prenom || !$email || ! $password)
            echo json_encode(["success" => false, "message" => "champs obligatoires manquants"]);
        else if ($user->emailExiste($email)) {
            echo json_encode(["success" => false, "message" => "email invalide"]);
        }
        else
        {
            $result = $user->createUser($nom, $prenom, $email, $password, $dob);
            if ($result)
                echo json_encode(["success" => true, "message" => "Inscription réussie"]);
            else
                echo json_encode(["success" => false, "message" => "Erreur lors de l'inscription"]);

        }
        break;
}
