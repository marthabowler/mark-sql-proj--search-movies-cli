import { question, keyInSelect } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });

async function execute() {
  let searchTerm = keyInSelect(["Search", "See Favourites"]) + 1;

  try {
    await client.connect();
    while (searchTerm) {
      if (searchTerm === 1) {
        let searchMovie = await question(`Search term: `);
        console.log("connected");
        let text =
          "select DISTINCT movie_id, movie_name, date, runtime, budget, revenue, vote_average, votes_count from casts_view where LOWER(movie_name) LIKE $1 OR LOWER(person_name) LIKE $1 AND job_id = 15 AND position =1 LIMIT 9";
        let values = [`%${searchMovie.toLowerCase()}%`];
        let res = await client.query(text, values);
        console.table(res.rows);

        const searchedMovies = res.rows.map((field) => field.movie_name);
        const addFav = keyInSelect(
          searchedMovies,
          "Choose a movie row number to favourite or press 0"
        );
        if (addFav > 0) {
          text = `insert into favourites values(DEFAULT,$1)`;
          values = [res.rows[addFav].id];
          await client.query(text, values);
          console.log(`Saving favourite movie: ${res.rows[addFav].name}`);
        }
      }
      if (searchTerm === 2) {
        console.log("connected");
        const text =
          "select  name, date, runtime, budget, revenue, vote_average, votes_count from movies join favourites on movies.id = favourites.movie_id";
        const res = await client.query(text);
        console.table(res.rows);
      }
      searchTerm = keyInSelect(["Search", "See Favourites"]) + 1;
    }
  } catch (ex) {
    console.log(`something wrong happened ${ex}`);
  } finally {
    await client.end();
    console.log("Client disconnected");
  }
}
execute(); //we need to run it
