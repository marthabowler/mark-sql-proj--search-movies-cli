import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });

async function execute() {
  let searchTerm = await question(
    `[1] Search
[2] See Favourites
[3] Quit `
  );

  try {
    await client.connect();
    while (searchTerm !== "3") {
      if (searchTerm === "1") {
        let searchMovie = await question(`Search term: `);
        console.log("connected");
        const text =
          "select  id, name, date, runtime, budget, revenue, vote_average, votes_count from movies where LOWER(name) like $1";
        const values = [`%${searchMovie.toLowerCase()}%`];
        const res = await client.query(text, values);
        console.table(res.rows);
        break;
      }
      if (searchTerm === "2") {
        console.log("connected");
        const text = "select  * from favourites";
        const res = await client.query(text);
        console.table(res.rows);
        break;
      }
    }
  } catch (ex) {
    console.log(`something wrong happened ${ex}`);
  } finally {
    await client.end();
    console.log("Client disconnected");
  }
}
execute(); //we need to run it
