# Scholar Reader API

The API server for the Scholar Reader application. For a 
given paper, the application needs to know about the 
citations, symbols, and other entities in that paper and 
where they are located. This server provides that data upon 
request.

To run the server, first install the dependencies:

```bash
npm install
```

Then start the server:

```bash
npm start
```

To check that the server is running, call:

```bash
curl 0.0.0.0:3000/api/health
```

And you should see a response of 👍.

Examples of valid API calls can be found by looking at the 
routes in the `api.ts` script, or at the API calls made from 
the `ui` code in the `ScholarReader.tsx` file.

## Configuring the server to access the database

Several of the API endpoints assume the server has access to 
a private database. The server code already includes _some_ 
login information. However, you must get the password from 
one of the database administrators (at the time of writing 
this, andrewhead@berkeley.edu). Once you have this password, 
create a file named `config/secret.json` with these 
contents:

```json
{
  "database": {
    "password": "<password>"
  }
}
```

Once you have, you can relaunch the server, and it should be 
capable of querying for data from the database.

## Running the Tests

The tests use a local database that's ran in in [docker](https://www.docker.com/).
If you don't have `docker` installed, you'll need to install it to
run the tests.

First, start the local database:

```
./bin/start_local_db.sh
```

Then run the tests:

```
npm test
```

After you're done you can stop the database like so:

```
docker stop scholarphi-db
```

