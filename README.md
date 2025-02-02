## AD-DB: The AcDec Database
Go beyond the wiki to pore through the tribulations of America's best and brightest.

### Setting Up Your Dev Environment
Make sure you have Node.js and MongoDB installed. Clone the repository, cd into its directory, and run `npm install`. Create a file called `.env` in the root directory and add the line `SESSIONS_SECRET=mylittlesecret` (you can replace the value with anything you want).

Also add a line `DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"` with your PostgreSQL connection info.

Start Mongo by running `mongod --dbpath <path to your DB>`

Then, from the AD-DB root directory, run `npm run start-dev`.

And that's it! The website will open on port 3000, with the API listening on 3001. API calls to 3000 will be proxied to 3001 so you can use either to test with Postman or whatever. 
