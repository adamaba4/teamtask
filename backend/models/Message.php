<?php

class Message
{
    private $db_conn;

    public function __construct($db_conn){
        $this->db_conn = $db_conn;
    }
    /* cette fonction permet de creer un message */
    public function sendMessage($sender_id, $receiver_id, $content){
        $sql = pg_query_params($this->db_conn, "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)", [$sender_id, $receiver_id, $content]);
        return $sql;
    }

    /* cette fonction permet de recuperer les messages entre deux utilisateurs */

    public function getConversation($user1_id, $user2_id){
        $sql = pg_query_params($this->db_conn, "SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY send_date ASC", [$user1_id, $user2_id]);
        return pg_fetch_all($sql);
    }
    /* cette fonction recupere tous la liste des utilisatuers avec qui $user_id travaille*/

    public function getContacts($user_id) {
        $result = pg_query_params($this->db_conn,
            "SELECT DISTINCT u.id, u.nom, u.prenom 
         FROM users u
         JOIN projet_membre pm ON pm.user_id = u.id
         WHERE pm.projet_id IN (
             SELECT projet_id FROM projet_membre WHERE user_id = $1
         )
         AND u.id != $1", [$user_id]);
        $rows = pg_fetch_all($result);
        return $rows ?: [];
    }
    /* POur afficher les dernier message */

    public function getLastMessages($user_id) {
        $result = pg_query_params($this->db_conn,
            "SELECT DISTINCT ON (
            LEAST(sender_id, receiver_id), 
            GREATEST(sender_id, receiver_id)
         ) 
         sender_id, receiver_id, content, send_date
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
         ORDER BY LEAST(sender_id, receiver_id), 
                  GREATEST(sender_id, receiver_id), 
                  send_date DESC", [$user_id]);
        $rows = pg_fetch_all($result);
        return $rows ?: [];
    }

    public function deleteMessage($user_id,  $message_id) {
        $result = pg_query_params($this->db_conn,
            "DELETE FROM messages WHERE sender_id = $1 AND id = $2", [$user_id, $message_id]);
        return $result;
    }


}

