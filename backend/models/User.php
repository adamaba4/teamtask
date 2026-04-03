<?php

class User
{
    private $db_conn;

    public function __construct($db_conn)
    {
        $this->db_conn = $db_conn;
    }

    /*  cette fonction vérifie si un email existe dèja dans la base.
     utiliser lors de l'inscription.
    */

    public function emailExiste($email)
    {
        $result = pg_query_params($this->db_conn,
        "SELECT id FROM users WHERE email = $1",
        [$email]);
        return pg_num_rows($result) > 0;
    }


    /* cette fonction permet de créer un user.
    utiliser lors de l'inscription*/

    public function createUser($nom, $prenom, $email, $motDePass, $dod )
    {
        $motDePassHach = password_hash($motDePass, PASSWORD_BCRYPT);
        $result = pg_query_params($this->db_conn,
        "INSERT INTO users (nom, prenom, email, password, dob) VALUES ($1,$2,$3,$4,$5)",
        [$nom, $prenom, $email, $motDePassHach, $dod]);

        return $result;
    }
    /*
        rècuperer un user par son email. utiliser lors de la connexion
    */
    public function getUserByEmail($email)
    {
        $result = pg_query_params($this->db_conn,
        "SELECT id, nom, prenom, email, password, dob  FROM users WHERE email = $1", [$email]);

        return $result;
    }

    // Récupérer les infos de l'utilisateur connecté
    public function getUserById($user_id){
        $result = pg_query_params($this->db_conn,
            "SELECT id, nom, prenom, email, dob FROM users WHERE id = $1",
            [$user_id]);
        return pg_fetch_assoc($result);
    }

}