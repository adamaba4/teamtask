<?php
    Class Task{
        private $db_conn;

         public function __construct($db_conn){
            $this->db_conn = $db_conn;
        }

        //Récupérer toutes les tâche d'un utilisateur
        public function getTaskByUser($user_id){
            $result = pg_query_params($this->db_conn,
            "SELECT * FROM taches WHERE user_id = $1 ORDER BY start_date ASC",
            [$user_id]);
            return pg_fetch_all($result);
        }


        //Créer une nouvelle tâche
        public function createTask($user_id, $nom, $description, $is_public, $start_date, $end_date, $category,$projet_id, $priority, $color) {
            $result = pg_query_params($this->db_conn,
            "INSERT INTO taches (user_id, nom, description, is_public, start_date, end_date, category, projet_id,priority, color, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7,$8, $9, $10, $11)",
            [$user_id, $nom, $description, $is_public, $start_date, $end_date, $category,$projet_id, $priority, $color, 'en_cours']
            );

            return $result;
        }

        // Récupère le nombre de tâches terminées d'un utilisateur
        public function countTasksFinished($user_id)
        {
            $result = pg_query_params(
                $this->db_conn,
                "SELECT COUNT(*) as total FROM taches WHERE user_id = $1 AND status = 'terminee'",
                [$user_id]
            );

            $row = pg_fetch_assoc($result); //recupere 
            return (int)$row['total']; //on renvoie le nombre total
        }
            }

?>
