<?php

class Forum {
    private $db_conn;
 
    public function __construct($db_conn) {
        $this->db_conn = $db_conn;
    }

    //Recupere tous les forums d'un projet et nb de likes et nb de comme  
    public function getForums($projet_id) {
       $result = pg_query_params($this->db_conn,
        "SELECT f.id, f.content, f.create_date, u.prenom, u.nom,
            (SELECT COUNT(*) FROM comments_forum WHERE forum_id = f.id) as nb_posts,
            (SELECT COALESCE(SUM(likes), 0) FROM comments_forum WHERE forum_id = f.id) as likes
         FROM forum f
         INNER JOIN users u ON f.user_id = u.id
         WHERE f.projet_id = $1
         ORDER BY f.create_date DESC",
        [$projet_id]
    );
        
        $forums = [];
        while ($row = pg_fetch_assoc($result)) {
            $forums[] = $row;
        }
        return $forums;;
        }

    //Creatyion d'un forum
    public function createForum($user_id, $projet_id,$content) {
        $result = pg_query_params($this->db_conn,
            "INSERT INTO forum (user_id,projet_id,content) VALUES ($1, $2,$3)",
            [$user_id,$projet_id, $content]
        );
        return (bool) $result; //false si sa na pas marcher
    }

    //Récupérer tous les commentaires d'un forum avec user,nb de commentaires
    public function getForumComm($forum_id) {
          $result = pg_query_params($this->db_conn,
            "SELECT cf.*, u.nom, u.prenom,
                COUNT(DISTINCT c.id) AS nb_comments, cf.likes
             FROM comments_forum cf
             LEFT JOIN users u ON u.id = cf.user_id
             LEFT JOIN comments_forum c ON c.forum_id = cf.id
             WHERE cf.forum_id = $1
             GROUP BY cf.id, u.nom, u.prenom 
             ORDER BY cf.create_date DESC",
            [$forum_id]
        );
        $posts = [];
        while ($row = pg_fetch_assoc($result)) {
            $posts[] = $row;
        }
        return $posts;
    }

    //Ajouter un commentaire
    public function addComment($forum_id, $user_id, $content) {
        $result = pg_query_params($this->db_conn,
            "INSERT INTO comments_forum (forum_id, user_id, content) VALUES ($1, $2, $3)",
            [$forum_id, $user_id, $content]
        );
        return $result !== false;
    }

    //Mettre un like au commentaire
     public function toggleLike($comm_id, $user_id) {
        $res = pg_query_params($this->db_conn,
            "SELECT likes FROM comments_forum WHERE id = $1",
            [$comm_id]
        );
        $post = pg_fetch_assoc($res);
        if (!$post) return null;
 
    
        $newLikes = (int)$post['likes'] + 1;
        $liked    = true;
 
        pg_query_params($this->db_conn,
            "UPDATE comments_forum SET likes = $1 WHERE id = $2",
            [$newLikes, $comm_id]
        );
 
        return ['likes' => $newLikes, 'liked' => $liked];
    }
        
        
}

    


?>