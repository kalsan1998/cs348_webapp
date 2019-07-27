# cs348_webapp
Must be ran on Linux.

Must install **npm**, **nodejs**, and **postgres** using the operating system package manager.
Must also install **express** and **node-posgres** node module using **npm**.

To initialize the database go into the `setup` directory and run `bash setup.sh`
This script will create all schemas in the database and prepopulate the database with some entries.

The database schema is defined in `setup/schema.sql` and initial data can be inserted through `setup/data.sql`

To start the server go into the `server` directory and run `node server.js`
The server connects to the PostgreSQL database on port 5433 using 'postgres' username and 'password' password.
The database must be configured so that the user 'postgres' exist with 'password' as the password, and also
so that it listens on port 5433.
