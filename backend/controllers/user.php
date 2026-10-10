<?php
session_start();
require_once '../config/db.php';
require_once '../models/User.php';

$user = new User($db_conn);
$action = isset($_POST['action']) ? $_POST['action'] : '';

switch ($action){

    //RECUPERER LES INFORMATIONS DE L'TUILISATEUR CONNECTE
    case 'get_user_data':
        //On verifie qu'il est bien connecté 
        if (!isset($_SESSION['id_user'])) {
            echo json_encode(["success" => false, "message" => "Non connecté"]);
            break;
        }
        $data = $user->getUserById($_SESSION['id_user']);
        echo json_encode(["success" => true, "user" => $data]);
        break;


}