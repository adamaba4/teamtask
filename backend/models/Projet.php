<?php
    Class Projet{
        private $db_conn;

         public function __construct($db_conn){
            $this->db_conn = $db_conn;
        }

        //Récupérer tous les projets de l'user (lors du choix du projet par l'user dans le tableau de bord) 
        public function getProjectsByUser($user_id){
            $result = pg_query_params($this->db_conn,
            "SELECT p.* FROM projet p
             JOIN projet_membres pm ON pm.projet_id = p.id
             WHERE pm.user_id = $1
             ORDER BY p.start_date ASC",
            [$user_id]);
            return pg_fetch_all($result);
        }

        //Nombre de réunions associé au projet
        public function countMeetings($projet_id) {
        // On compte le nombre de lignes qui correspondent à l'ID du projet
        $result = pg_query_params($this->db_conn,
            "SELECT COUNT(*) as total FROM reunions WHERE projet_id = $1",
            [$projet_id]
        );

        $row = pg_fetch_assoc($result);
        // On renvoie le chiffre (ou 0 si rien n'est trouvé)
        return $row ? (int)$row['total'] : 0;
}
            

    }

?>