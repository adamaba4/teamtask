<?php
    Class Projet
    {
        private $db_conn;

        public function __construct($db_conn)
        {
            $this->db_conn = $db_conn;
        }

        //-------------------------------------------------------//
        //   Création d'un projet
        //-------------------------------------------------------//
        public function create_project($nom, $description, $user_id, $start_date, $end_date)
        {
            $sql = "INSERT INTO projet (nom, description, user_id,start_date, end_date) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id";

            $result = pg_query_params($this->db_conn, $sql, [$nom, $description, $user_id, $start_date, $end_date]);

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

        public function getProjectsByUser($user_id)
        {
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
        public function getMembersByProject($projet_id)
        {
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
        public function create_meeting($projet_id, $user_id, $titre, $description, $date_reunion, $lieu, $participants) {
            $sql = "INSERT INTO reunion (projet_id, user_id, titre, description, date_reunion, lieu) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";

            $result = pg_query_params($this->db_conn, $sql, [
                $projet_id, $user_id, $titre, $description, $date_reunion, $lieu]);

            if ($result) {
                $row = pg_fetch_assoc($result);
                $reunion_id = $row['id'];

                // Ajouter chaque participant dans reunion_membre
                foreach ($participants as $participant_id) {
                    pg_query_params($this->db_conn,
                        "INSERT INTO reunion_membre (reunion_id, user_id) VALUES ($1, $2)",
                        [$reunion_id, $participant_id]);
                }
                return true;
            }
            return false;
        }
        //-------------------------------------------------------//
        //    //Nombre de réunions associé au projet du mois en cours
        //-------------------------------------------------------//
        public function countMeetings($projet_id, $user_id) {
            $result = pg_query_params($this->db_conn,
                "SELECT COUNT(*) as total FROM reunion r
         JOIN reunion_membre rm ON rm.reunion_id = r.id
         WHERE r.projet_id = $1
         AND rm.user_id = $2
         AND EXTRACT(MONTH FROM r.date_reunion) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM r.date_reunion) = EXTRACT(YEAR FROM CURRENT_DATE)",
                [$projet_id, $user_id]);
            $row = pg_fetch_assoc($result);
            return $row ? (int)$row['total'] : 0;
        }
        

        public function getMeetingsByMonth($projet_id, $mois, $annee)
        {
            $result = pg_query_params($this->db_conn, "
        SELECT * 
        FROM reunion
        WHERE projet_id = $1 
        AND EXTRACT(MONTH FROM date_reunion) = $2 
        AND EXTRACT(YEAR FROM date_reunion) = $3", [$projet_id, $mois, $annee]);
            $rows = pg_fetch_all($result);
            return $rows ?: [];
        }

        public function addMember($projet_id, $email) {
            $result = pg_query_params($this->db_conn,
                "SELECT id FROM users WHERE email = $1", [$email]);
            $user = pg_fetch_assoc($result);

            if (!$user) return "not_found";

            $result1 = pg_query_params($this->db_conn,
                "SELECT * FROM projet_membre WHERE projet_id = $1 AND user_id = $2", [$projet_id, $user['id']]);
            $reponse = pg_fetch_assoc($result1);
            if ($reponse) return "already_member";

            $insert = pg_query_params($this->db_conn,
                "INSERT INTO projet_membre (projet_id, user_id, role) VALUES ($1, $2, 'membre')",
                [$projet_id, $user['id']]);

            return $insert ? "success" : "error";
        }
        public function getCurrentProjet($projet_id){
            $result = pg_query_params($this->db_conn,
                "SELECT * FROM projet WHERE id = $1", [$projet_id]);
            return pg_fetch_assoc($result);

        }

    }


?>