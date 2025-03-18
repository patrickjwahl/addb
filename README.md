## AD-DB: The AcDec Database
Go beyond the wiki to pore through the tribulations of America's best and brightest.

### Setting Up Your Dev Environment
Make sure you have Node.js and Postgres installed and Postgres running. Create a new database in Postgres. Clone the repository, cd into its directory, and run `npm install`. Create a file called `.env` in the root directory, copy the .sample-env provided, and replace the values with ones which will work in your development environment. If you wish to send emails through a service other than Gmail, you may have to modify the code. 

Run `npx prisma migrate dev` to set up your database. 

Then, from the AD-DB root directory, run `npm run dev`.

And that's it! The website will open on port 5173, with the API listening on 3001. API calls to 5173 will be proxied to 3001 so you can use either to test with Postman or whatever. 
