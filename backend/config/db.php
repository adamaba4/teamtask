<?php
    /*

    $hostname = 'localhost';
    $db_name = '';
    $user = '';
    $password = '';
    $port = '5432';
    */
    $hostname = 'localhost';
    $db_name = 'teamtask';
    $user = '';
    $password = '';
    $port = '5432';



    $db_conn = pg_connect("host=$hostname port=$port dbname=$db_name user=$user password=$password");
    if(! $db_conn)
    {
        die("Échec de la connexion");
    }
    
