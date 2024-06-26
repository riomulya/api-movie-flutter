const {
  getDatabase,
  ref,
  push,
  set,
  get,
  child,
  update,
  remove,
} = require('firebase/database');
const db = getDatabase();

class MovieController {
  async getAllMovies(req, res) {
    const dbRef = ref(getDatabase());

    try {
      get(child(dbRef, `movies/`)).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          res.status(200).json({ ...snapshot.val() });
        } else {
          res.status(404).json({ message: 'Movie not found' });
        }
      });
      // const snapshot = await ref(db, 'movies').get();
      // if (snapshot.exists()) {
      //   const movies = [];
      //   snapshot.forEach((childSnapshot) => {
      //     movies.push({
      //       id: childSnapshot.key,
      //       ...childSnapshot.val(),
      //     });
      //   });
      //   res.json(movies);
      // } else {
      //   res.status(404).json({ message: 'No movies found' });
      // }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async searchMovie(req, res) {
    const { title } = req.params;

    try {
      const snapshot = await get(child(ref(db), 'movies'));
      // const snapshot = await ref(db, `movies/${id}`).once('value');
      // get(child(dbRef, `movies/${title}`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        // Membuat array kosong untuk menyimpan hasil pencarian
        const results = [];

        // Iterasi melalui setiap film dalam snapshot
        snapshot.forEach((childSnapshot) => {
          const movie = childSnapshot.val();

          // Memeriksa apakah judul film cocok dengan kueri
          if (movie.title.toLowerCase().includes(title.toLowerCase())) {
            results.push({ ...movie, id: childSnapshot.key });
          }
        });

        // Mengirimkan hasil pencarian sebagai respons
        if (results.length > 0) {
          res.status(200).json(results);
        } else {
          res.status(404).json({ message: 'Movie not found' });
        }
        // res.status(200).json({ id: snapshot.key, ...snapshot.val() });
      } else {
        res.status(404).json({ message: 'Movie not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createMovie(req, res) {
    try {
      const { imgUrl, title, description, dateMovie, genre } = req.body;
      const newMovieRef = await push(ref(db, 'movies'), {
        imgUrl,
        title,
        description,
        dateMovie,
        genre,
        price,
      });
      res
        .status(201)
        .json({ message: 'Movie created successfully', id: newMovieRef.key });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMovieById(req, res) {
    const dbRef = ref(getDatabase());

    try {
      const { id } = req.params;
      // const snapshot = await ref(db, `movies/${id}`).once('value');
      get(child(dbRef, `movies/${id}`)).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          res.status(200).json({ id: snapshot.key, ...snapshot.val() });
        } else {
          res.status(404).json({ message: 'Movie not found' });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateMovie(req, res) {
    try {
      const { id } = req.params;
      const { imgUrl, title, description, dateMovie, genre } = req.body;
      await update(ref(db, `movies/${id}`), {
        imgUrl,
        title,
        description,
        dateMovie,
        genre,
        price,
      });
      res.status(200).json({ message: 'Movie updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteMovie(req, res) {
    try {
      const { id } = req.params;
      await remove(ref(db, `movies/${id}`));
      res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MovieController();
