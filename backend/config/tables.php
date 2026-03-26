<?php
require_once 'db.php';

 $queries = [

     "CREATE TABLE  users (
        id          SERIAL PRIMARY KEY,
        nom         VARCHAR(50) NOT NULL,
        prenom      VARCHAR(50) NOT NULL,
        email       VARCHAR(100) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        dob         DATE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

     "CREATE TABLE  taches (
        id          SERIAL PRIMARY KEY,
        user_id     INT NOT NULL,
        nom         VARCHAR(150) NOT NULL,
        description TEXT,
        is_public   BOOLEAN DEFAULT FALSE,
        start_date  DATE,
        end_date    DATE,
        category    VARCHAR(50),
        status      VARCHAR(20) DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'terminee', 'en_retard')),
        priority    VARCHAR(10) DEFAULT 'normale' CHECK (priority IN ('basse', 'normale', 'haute')),
        color       VARCHAR(7) DEFAULT '#3498db',
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )",
    "CREATE TABLE messages (
        id          SERIAL PRIMARY KEY,
        sender_id   INT NOT NULL,
        receiver_id INT NOT NULL,
        content        TEXT NOT NULL,
        send_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
    )",

    "CREATE TABLE  forum (
        id          SERIAL PRIMARY KEY,
        user_id     INT NOT NULL,
        content     TEXT NOT NULL,
        likes       INT DEFAULT 0,
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )",

    "CREATE TABLE  comments_forum (
        id          SERIAL PRIMARY KEY,
        forum_id    INT NOT NULL,
        user_id     INT NOT NULL,
        content        TEXT NOT NULL,
        likes       INT DEFAULT 0,
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (forum_id) REFERENCES forum(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )",

    "CREATE TABLE  notifications (
        id          SERIAL PRIMARY KEY,
        user_id     INT NOT NULL,
        content        VARCHAR(255) NOT NULL,
        is_read     BOOLEAN DEFAULT FALSE,
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )"

 ];
 foreach ($queries as $query) {
     $result = pg_query( $db_conn, $query);
     if (!$result)
     {
         die("Erreur: " . pg_last_error($db_conn));
     }
 }
 echo " Tables crées avec succès !";
 
