<?php
session_start();
require_once '../config/db.php';
require_once '../models/Message.php';


$message = new Message($db_conn);
$action = isset($_POST['action']) ? $_POST['action'] : '';

if (!isset($_SESSION['est_connecte']) || $_SESSION['est_connecte'] !== true) {
    echo json_encode(["success" => false, "message" => "Non connecté"]);
    exit;
}

$user_id = $_SESSION['id_user'];

switch ($action){
    case 'get_contact':
        $resultat = $message->getContacts($user_id);
        echo json_encode(["success" => true, "contacts" => $resultat]);
        break;


    case 'send_message':
        $receiver_id = $_POST['receiver_id'];
        $message_content = trim($_POST['message_content']);
        if ( !$receiver_id || !$message_content) {
            echo json_encode(["success" => false, "message" => "Tous les champs sont obligatoires"]);
        }
        else{
            $resultat = $message->sendMessage($user_id, $receiver_id, $message_content);
            if ($resultat) {
                echo json_encode(["success" => true, "message" => "message envoyé !"]);
            }
            else{
                echo json_encode(["success" => false, "message" => "Erreur lors de l'envoie du message"]);
            }

        }
        break;

    case 'get_conversation':
        $receiver_id = $_POST['receiver_id'];
        $resultat = $message->getConversation($user_id, $receiver_id);
        echo json_encode(["success" => true, "conversation" => $resultat]);
        break;

    case 'last_message':
        $resultat = $message->getLastMessages($user_id);
        echo json_encode(["success" => true, "last_message" => $resultat]);
        break;

    case 'delete_message':
        $message_id = $_POST['message_id'];
        $resultat = $message->deleteMessage($user_id, $message_id);
        if ($resultat) {
            echo json_encode(["success" => true, "message" => $resultat]);
        }
        else{
            echo json_encode(["success" => false, "message" => "Erreur lors de la suppression du message"]);
        }

}

