#!/bin/bash
sudo apt install postgresql
sudo service postgresql start
sudo -u postgres psql -c "CREATE DATABASE cs348;"
# use "sudo -u postgres psql" to connect to postgres CLI.
# once in CLI use "\c cs348" to connect to the database.
# enter commands (terminated by ";") to query, update, insert, delete.
sudo -u postgres psql -v ON_ERROR_STOP=1 -1 -f schema.sql cs348
sudo -u postgres psql -v ON_ERROR_STOP=1 -1 -f data.sql cs348

