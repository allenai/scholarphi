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

If you haven't already, do the [One Time Setup](#one-time-setup).

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

## One Time Setup

The API uses several secrets at runtime to:

- Access a database, where information about the papers and
  the entities we extract from them is stored.
- Query [Semantic Scholar's Public API](https://api.semanticscholar.org/).

The API queries work without an API key, but will get rate
limited if you make more than 100 queries in 5 minutes.
This can happen relatively quickly during normal use of the
application.

The database won't workout without the appropriate
configuration.

You can get these values by getting in touch with an administrator.
At the time of writing this, [andrewhead@berkeley.edu](mailto:andrewhead@berkeley.edu)
is one. Once you have the values, put them in a file called
`config/secret.json`. The result will look something like this:

```json
{
  "database": {
    "password": "<password>",
    "host": "<hostname>",
    "database": "<dbname>",
    "user": "<user>"
  },
  "s2": {
    "apiKey": "<key>"
  }
}
```

After doing this you can start your API server, which should now
have the ability to freely query the database or S2's Public
API.

## Running the Tests

The tests use a local database that's run in [docker](https://www.docker.com/).
If you don't have `docker` installed, you'll need to install
it first.

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

