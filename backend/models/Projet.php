<?php
    Class Projet{
        private $db_conn;

         public function __construct($db_conn){
            $this->db_conn = $db_conn;
        }

          //-------------------------------------------------------//
        //   Création d'un projet
        //-------------------------------------------------------//
        public function create_project($nom, $description,$user_id, $start_date, $end_date) {
        $sql = "INSERT INTO projet (nom, description, user_id,start_date, end_date) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id";
    
        $result = pg_query_params($this->db_conn, $sql, [$nom, $description,$user_id, $start_date, $end_date]);

        if ($result) {
            $row = pg_fetch_assoc($result);
            $projet_id = $row['id'];

            //On rajoute l'user qui a crée dans projet_mempbre avec le rôle  chef de projet ou admin
            $sql_membre = "INSERT INTO projet_membre (projet_id, user_id, role) VALUES ($1, $2, $3)";
            pg_query_params($this->db_conn, $sql_membre, [$projet_id, $user_id, 'chef_de_projet']);
            return $projet_id; // On renvoie l'ID du nouveau projet
        }
        return false;
    }

          //-------------------------------------------------------//
        //   Récupérer tous les projets auxquels l'utilisateur participe
        //  (lors du choix du projet par l'user dans le tableau de bord) 
        //-------------------------------------------------------//
       
        public function getProjectsByUser($user_id){
            $result = pg_query_params($this->db_conn,
            "SELECT p.* FROM projet p JOIN projet_membre pm ON pm.projet_id = p.id
             WHERE pm.user_id = $1
             ORDER BY p.start_date ASC",
            [$user_id]);
            return pg_fetch_all($result);
        }

        
          //-------------------------------------------------------//
        //   Afficgher membres d'un prohjet avec leur rôle
        //-------------------------------------------------------//
         public function getMembersByProject($projet_id){
            $result = pg_query_params($this->db_conn,
                "SELECT u.id, u.nom, u.prenom, u.email, pm.role FROM users u INNER JOIN projet_membre pm ON pm.user_id = u.id
                WHERE pm.projet_id = $1
                ORDER BY u.prenom ASC",
                [$projet_id]
            );
    
            $membres = [];
            while ($row = pg_fetch_assoc($result)) {
                $membres[] = $row;
            }
            return $membres;
        }

          //-------------------------------------------------------//
        //  Ajoute une réunion
        //-------------------------------------------------------//
         public function create_meeting($projet_id, $user_id, $titre, $description, $date_reunion, $lieu) {
            $sql = "INSERT INTO reunion (projet_id, user_id, titre, description, date_reunion, lieu) 
                    VALUES ($1, $2, $3, $4, $5, $6)";
            
            $result = pg_query_params($this->db_conn, $sql, [
                $projet_id, $user_id, $titre, $description, $date_reunion, $lieu]);
            return $result ? true : false;
        }
         //-------------------------------------------------------//
        //    //Nombre de réunions associé au projet du mois en cours
        //-------------------------------------------------------//
        public function countMeetings($projet_id) {
            // On compte le nombre de lignes qui correspondent à l'ID du projet
            $result = pg_query_params($this->db_conn,
                "SELECT COUNT(*) as total FROM reunion WHERE projet_id = $1
                AND EXTRACT(MONTH FROM date_reunion) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR  FROM date_reunion) = EXTRACT(YEAR  FROM CURRENT_DATE)", //pour comparer la date 1 mois
                [$projet_id]);
            $row = pg_fetch_assoc($result);
            return $row ? (int)$row['total'] : 0; //0 si ya pas de reunions             
        }                
            

    }

?>