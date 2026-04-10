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

    
        "CREATE TABLE projet (
        id          SERIAL PRIMARY KEY,
        nom         VARCHAR(150) NOT NULL,
        description TEXT,
        user_id     INT NOT NULL,  
        start_date  DATE,
        end_date    DATE,
        status      VARCHAR(20) DEFAULT 'en_cours',
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
        )",

        "CREATE TABLE projet_membre (
            id         SERIAL PRIMARY KEY,
            projet_id  INT NOT NULL,
            user_id    INT NOT NULL,
            role       VARCHAR(50) DEFAULT 'membre', 
            FOREIGN KEY (projet_id) REFERENCES projet(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )",

    " CREATE TABLE reunion (
        id          SERIAL PRIMARY KEY,
        projet_id   INT,
        user_id     INT NOT NULL,  
        titre       VARCHAR(150) NOT NULL,
        description TEXT,
        date_reunion TIMESTAMP NOT NULL,
        lieu        VARCHAR(255),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projet_id) REFERENCES projet(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
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
        projet_id    INT NOT NULL,
        status      VARCHAR(20) DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'terminee', 'en_retard')),
        priority    VARCHAR(10) DEFAULT 'normale' CHECK (priority IN ('basse', 'normale', 'haute')),
        color       VARCHAR(7) DEFAULT '#3498db',
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (projet_id) REFERENCES projet(id)
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
        projet_id   INT NOT NULL,
        content     TEXT NOT NULL,
        likes       INT DEFAULT 0,
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
        FOREIGN KEY (projet_id) REFERENCES projet(id) ON DELETE CASCADE
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
    )",
     "CREATE TABLE reunion_membre (
        id SERIAL PRIMARY KEY,
        reunion_id INT NOT NULL,
        user_id INT NOT NULL,
        foreign key (reunion_id) references reunion(id),
        foreign key (user_id) references users(id)
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
 
