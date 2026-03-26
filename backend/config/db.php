<?php
    /*
    Nasifa, c'est le fichier de connexion à la base.
    pense à mettre en commentaire mes identifiants, et tu peux compléter ici tes identifiant.
    avant de compiler le fichier, si c'est pas fait installe l'extension ph pour postgresql, avec cette commande.
     sudo apt install php-pgsql

    $hostname = 'localhost';
    $db_name = '';
    $user = '';
    $password = '';
    $port = '5432';
    */

    $hostname = 'localhost';
    $db_name = 'teamtask';
    $user = 'dandelion';
    $password = 'pETITLAPINÀ&@';
    $port = '5432';


    $db_conn = pg_connect("host=$hostname port=$port dbname=$db_name user=$user password=$password");
    if(! $db_conn)
    {
        die("Échec de la connexion");
    }
    echo "Connexion établie avec succes !";
