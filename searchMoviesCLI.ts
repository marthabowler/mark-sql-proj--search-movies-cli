import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });

async function execute() {
  let searchTerm = await question(
    'Please enter a value to search or "q" to quit '
  );

  try {
    await client.connect();
    while (searchTerm !== "q") {
      console.log("connected");
      const text =
        "select id, name, date, runtime, budget, revenue, vote_average, votes_count from movies where LOWER(name) like $1";
      const values = [`%${searchTerm.toLowerCase()}%`];
      const res = await client.query(text, values);
      console.table(res.rows);
      searchTerm = await question(
        'Please enter another value to search or "q" to quit '
      );
    }
  } catch (ex) {
    console.log(`something wrong happened ${ex}`);
  } finally {
    await client.end();
    console.log("Client disconnected");
  }
}
execute(); //we need to run it
