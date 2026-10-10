<?php
session_start();
require_once '../config/db.php';
require_once '../models/Forum.php';

 
if (!isset($_SESSION['est_connecte']) || !$_SESSION['est_connecte']) {
    echo json_encode(["success" => false, "message" => "Non autorisé"]);
    exit;
}
 $projet_id = isset($_SESSION['projet_id']) ? (int)$_SESSION['projet_id'] : null;
$user_id = $_SESSION['id_user'];
$action  = isset($_POST['action']) ? $_POST['action'] : '';
$forum   = new Forum($db_conn);
 
switch ($action) {

    //Récupérer tous les forums du projet
    case 'get_forums':
        if (!$projet_id) {
            echo json_encode(["success" => false, "message" => "projet_id manquant"]);
            break;
        }
        $forums = $forum->getForums($projet_id);
        echo json_encode(["success" => true, "forums" => $forums]);
        break;

    //creation d'un forum
    case 'create_forum':
        //on recup les données
        $content    = isset($_POST['content']) ? trim($_POST['content']) : null;

        if (!$content ) {
            echo json_encode(['success' => false, 'message' => 'Contenu ou Projet manquant']);
            break;
        }

        $result = $forum->createForum($user_id, $projet_id, $content);

        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Forum créé avec succès !']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la création']);
        }
        break;

    case 'get_forum_comm':
        $forum_id = isset($_POST['forum_id']) ? (int)$_POST['forum_id'] : null;
        if (!$forum_id) {
            echo json_encode(["success" => false, "message" => "forum_id manquant"]);
            break;
        }
        $posts = $forum->getForumComm($forum_id, $user_id);
        echo json_encode(["success" => true, "posts" => $posts]);
        break;

    //ajouter un commentaire
    case 'add_comment':
        $forum_id = isset($_POST['forum_id']) ? (int)$_POST['forum_id'] : null;
        $content = isset($_POST['content']) ? trim($_POST['content']) : '';
        if (!$forum_id || !$content) {
            echo json_encode(["success" => false, "message" => "Champs obligatoires manquants"]);
            break;
        }
        $result = $forum->addComment($forum_id, $user_id, $content);
        if ($result) {
            echo json_encode(["success" => true, "message" => "Votre commentaire a étésq ajouté."]);
        } else {
            echo json_encode(["success" => false, "message" => "Erreur lors de l'ajout"]);
        }
        break;

    //Mettre un like au commentaire
    case 'like_comment':
        $comment_id = isset($_POST['comment_id']) ? (int)$_POST['comment_id'] : null;
    
        if (!$comment_id) {
            echo json_encode(["success" => false, "message" => "Données manquantes"]);
            break;
        }

        $result = $forum->toggleLike($comment_id, $user_id);

       if ($result) {
            echo json_encode(["success" => true, "likes" => $result['likes'], "liked" => $result['liked']]);
        } else {
            echo json_encode(["success" => false, "message" => "Post introuvable"]);
        }
        break;
    }



?>