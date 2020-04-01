# Ticket tracker
This is an application aimed at allowing users create tickets/stories on a tracker board then allow admin users assigned to each ticket manage the tickets by either rejecting or approving them as necessary.

# Setting up the project locally
To run this project on your local machine you need to have the following installed.
- [ Nodejs](https://nodejs.org/en/)
- [git](https://git-scm.com/downloads)
- [Postgres DB](https://www.postgresql.org/download/)

# Checkout the Postman Documentation here
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/3ce78bbcd83082801f57)

## Installing
* **Open a terminal/command prompt** on your computer and cd into your preferred path/location. 
* **Clone repo:** to do this, run the following command on your **terminal/command prompt.**
```
git clone https://github.com/justega247/ticket_board.git
```

## Navigate to the cloned directory

* **Add the required environment variables:** Locate a file with the filename `.sample.env` in the root directory and copy its content into a new file you will create in the root directory of the cloned repo and give it a filename of `.env`. In the `.env` file specify the environmental variables.
```
HOST='database host'
USERNAME='database username'
PASSWORD='database password'
DATABASE='database type'
ADMINPASSWORD='password for admin'
SECRET='token secret'
EXPIRES='token expiration time'
```
Steps to run this project:

1. Run `npm i` command to install the dependencies
2. Setup database settings inside `ormconfig.json` file, replace the appropriate details with yours for the development database
3. Run `npm start` or `npm run start:dev` command
4. Run `npm test` to run the tests

## API Endpoints
| Request type | Endpoint | Actions |
| ------------ | -------- | ------- |
| POST         | /auth/signup | Register a new user |
| POST         | /auth/login | Login a registered user |
| POST         | /ticket | Create a new ticket |
| PUT          | /ticket/:id/assign | Assign a ticket to an admin |
| GET          | /ticket/admin | Retrieve all tickets assigned to an admin|
| PUT          | /ticket/:id/manage?action= | Admin can manage a ticket|

## N.B
- You'll need two database, one for test and one for development
- On starting the app the first time two admin users will be seeded into the database you have specified in the `ormconfig.json` file
- If you run into issues with dropping the test database automatically after the tests are done, you can run `npm run post:test` to drop it manually.

# Built With
1. NodeJS
2. TypeScript
3. Postgres
4. Express

# Author(s)
- Okeremeta Tega