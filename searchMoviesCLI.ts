import { question, keyInSelect } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });

async function execute() {
  let searchTerm = await keyInSelect(["Search", "See Favourites", "Quit"]);

  try {
    await client.connect();
    while (searchTerm !== 2) {
      if (searchTerm === 0) {
        let searchMovie = await question(`Search term: `);
        console.log("connected");
        let text =
          "select  id, name, date, runtime, budget, revenue, vote_average, votes_count from movies where LOWER(name) like $1 LIMIT 9";
        let values = [`%${searchMovie.toLowerCase()}%`];
        let res = await client.query(text, values);
        console.table(res.rows);

        const searchedMovies = res.rows.map((field) => field.name);
        const addFav = await keyInSelect(
          searchedMovies,
          "Choose a movie row number to favourite or press 0"
        );
        if (addFav > -1) {
          let text = `insert into favourites values(DEFAULT,$1)`;
          let values = [res.rows[addFav].id];
          console.log(`Saving favourite movie: ${res.rows[addFav].name}`);
          res = await client.query(text, values);
        }
      }
      if (searchTerm === 1) {
        console.log("connected");
        const text =
          "select  name, date, runtime, budget, revenue, vote_average, votes_count from movies join favourites on movies.id = favourites.movie_id";
        const res = await client.query(text);
        console.table(res.rows);
      }
      searchTerm = await keyInSelect(["Search", "See Favourites", "Quit"]);
    }
  } catch (ex) {
    console.log(`something wrong happened ${ex}`);
  } finally {
    await client.end();
    console.log("Client disconnected");
  }
}
execute(); //we need to run it
