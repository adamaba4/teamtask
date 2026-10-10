<?php
    Class Task{
        private $db_conn;

         public function __construct($db_conn){
            $this->db_conn = $db_conn;
        }

        //-------------------------------------------------------//
        // Récupérer toutes les tâche d'un utilisateur
        //-------------------------------------------------------//
        public function getTasksByUser($user_id,$projet_id){
            $result = pg_query_params($this->db_conn,
            "SELECT t.*, u.prenom, u.nom AS username FROM taches t LEFT JOIN users u ON u.id = t.user_id WHERE t.user_id = $1 AND t.projet_id = $2 AND is_public=TRUE  ORDER BY t.start_date ASC",
            [$user_id,$projet_id]);
            return pg_fetch_all($result);
        }


         //-------------------------------------------------------//
        // Récupérer toutes les tâches d'un projet avec le nom de la personne qui s'en occupe
        //-------------------------------------------------------//
        public function getTasksByProject($projet_id){
            $result = pg_query_params($this->db_conn,
                "SELECT t.*, u.prenom, u.nom AS username FROM taches t LEFT JOIN users u ON u.id = t.user_id
                WHERE t.projet_id = $1 AND is_public=TRUE ORDER BY t.end_date ASC NULLS LAST", //pr mettre a la fin si la date est null
                [$projet_id]
            );
    
            $tasks = []; //on initialise un tableau vide
            while ($row = pg_fetch_assoc($result)) {
                $tasks[] = $row; //on ajoute chaque ligne des taches au tableau 
            }
            return $tasks;
        }

         //-------------------------------------------------------//
        //  Créer une nouvelle tâche
        //-------------------------------------------------------//
        public function createTask($user_id, $nom, $description, $is_public, $start_date, $end_date, $category,$projet_id, $priority, $color) {
            $result = pg_query_params($this->db_conn,
            "INSERT INTO taches (user_id, nom, description, is_public, start_date, end_date, category, projet_id,priority, color, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7,$8, $9, $10, $11)",
            [$user_id, $nom, $description, $is_public, $start_date, $end_date, $category,$projet_id, $priority, $color, 'en_cours']
            );

            return $result;
        }

         //-------------------------------------------------------//
        //NOMBRE DE TACHES SELON LE STATUT DE LA TACHE
         //-------------------------------------------------------//
        public function countTasksByStatus($user_id, $projet_id) {
            // pour les tâches dont la date de fin est dépassée
            pg_query_params($this->db_conn,
                "UPDATE taches
                SET status = 'en_retard'
                WHERE projet_id = $1
                AND status ='en_cours'
                AND end_date<CURRENT_DATE",
                [$projet_id]
            );

            $result = pg_query_params($this->db_conn,
                "SELECT status, COUNT(*) as total FROM taches WHERE user_id = $1 AND projet_id = $2 GROUP BY status",
                [$user_id, $projet_id]
            );
            $counts = ['terminee' => 0, 'en_cours' => 0, 'en_retard' => 0]; //on initialise
            while ($row = pg_fetch_assoc($result)) {
                $counts[$row['status']] = (int)$row['total']; //on remplace par la valeur dans le tableau
            }

            return $counts; //on retourne le tableau
        }

        //-------------------------------------------------------//
        // DEADLINES 3 prochains jours
         //-------------------------------------------------------//

         public function getUpcomingDeadlines($projet_id, $user_id){
            $params = [$user_id];
            $sql = "SELECT t.id, t.nom, t.end_date, t.status, t.priority,
                        p.nom AS nom_projet
                    FROM taches t
                    INNER JOIN projet p ON p.id = t.projet_id
                    INNER JOIN projet_membre pm ON pm.projet_id = t.projet_id
                    WHERE pm.user_id = $1
                    AND t.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
                    AND t.status != 'terminee'
                    AND (t.is_public = TRUE OR t.user_id = $1)";
    
            if ($projet_id) {
                $sql .= " AND t.projet_id = $2";
                $params[] = $projet_id;
            }
    
            $sql .= " ORDER BY t.end_date ASC";
    
            $result = pg_query_params($this->db_conn, $sql, $params);
            $deadlines = [];
            while ($row = pg_fetch_assoc($result)) {
                $deadlines[] = $row; // on retourn les taches qui se finit sous moins de 3 jours
            }
            return $deadlines;
        }

        
        //-------------------------------------------------------//
        // Mettre a jour le statut de la tache
         //-------------------------------------------------------//
         public function updateStatus($task_id, $new_status, $user_id) {
            //on verifie bien si l'user est bien celui qui s'occupe de la tache 
            $result = pg_query_params($this->db_conn,
                "UPDATE taches t SET status = $1
                WHERE t.id = $2 AND EXISTS (
                    SELECT 1 FROM projet_membre pm 
                    WHERE pm.projet_id = t.projet_id
                        AND pm.user_id   = $3        
                )",
                [$new_status, $task_id, $user_id]
            );
            return pg_affected_rows($result) > 0;
        }

        public function getTaskByMonth($projet_id, $user_id, $month, $year) {
            $result = pg_query_params($this->db_conn, "
        SELECT t.*, u.nom AS username, u.prenom
        FROM taches t
        JOIN users u ON u.id = t.user_id
        WHERE t.projet_id = $1
        AND (t.is_public = TRUE OR t.user_id = $2)
        AND (
            (EXTRACT(MONTH FROM t.end_date) = $3 AND EXTRACT(YEAR FROM t.end_date) = $4)
            OR 
            (EXTRACT(MONTH FROM t.start_date) = $3 AND EXTRACT(YEAR FROM t.start_date) = $4)
        )", [$projet_id, $user_id, $month, $year]);
            $rows = pg_fetch_all($result);
            return $rows ?: [];
        }

        
        //-------------------------------------------------------//
        // Tâches privées de l'utilisateur connecté
         //-------------------------------------------------------//
        public function getPrivateTasks($user_id,$projet_id) {
            $result = pg_query_params($this->db_conn,
                "SELECT t.*, u.prenom, u.nom AS username FROM taches t LEFT JOIN users u ON u.id = t.user_id
                WHERE user_id = $1 AND t.projet_id=$2 AND is_public = false
                ORDER BY end_date ASC NULLS LAST",
                [$user_id,$projet_id]
            );
            $tasks = [];
            while ($row = pg_fetch_assoc($result)) {
                $tasks[] = $row;
            }
            return $tasks;
        }
}

?>
