<?php
    Class Projet{
        private $db_conn;

         public function __construct($db_conn){
            $this->db_conn = $db_conn;
        }

        //Récupérer tous les projets de l'user (lors du choix du projet par l'user dans le tableau de bord) 
        public function getProjectsByUser($user_id){
            $result = pg_query_params($this->db_conn,
            "SELECT id, nom, description, start_date, end_date, status FROM projet  WHERE user_id = $1 ORDER BY created_at DESC",
            [$user_id]
            );
            return pg_fetch_all($result);
        }
            

    }

?>