const graphql = require("graphql");
const dbConnection = require("../db");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const Book = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: Author,
      async resolve(parent) {
        return await getAuthor(parent.authorId);
      },
    },
  }),
});

const Author = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    books: {
      type: new GraphQLList(Book),
      resolve(parent, args) {
        return fetchBooksByAuthor(parent.id);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    book: {
      type: Book,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      async resolve(parent, args) {
        return await getBook(args.id);
      },
    },
    author: {
      type: Author,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        return await getAuthor(args.id);
      },
    },
    books: {
      type: new GraphQLList(Book),
      async resolve() {
        const books = await fetchAllBooks();
        return books;
      },
    },
    authors: {
      type: new GraphQLList(Author),
      async resolve() {
        return await fetchAllAuthors();
      },
    },
  },
});

const Mutations = new GraphQLObjectType({
  name: "Mutations",
  fields: {
    addBook: {
      type: Book,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        author: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const { title, genre, author } = args;
        const authorId = await getAuthorId(author);
        if (authorId === "not found") {
          await addAuthor(author);
          const newAuthorId = await getAuthorId(author);
          return addBook({
            title,
            genre,
            authorId: newAuthorId,
          });
        }
        return addBook({
          title,
          genre,
          authorId,
        });
      },
    },
    addAuthor: {
      type: Author,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        const { name } = args;
        addAuthor(name);
      },
    },
    deleteBook: {
      type: Book,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_, args) {
        const data = await deleteBook(args.id);
        return data;
      },
    },
    updateBook: {
      type: Book,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        author: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, args) {
        const { id, title, genre, author } = args;
        const authorId = await getAuthorId(author);
        if (authorId === "not found") {
          await addAuthor(author);
          const authorId = await getAuthorId(author);
          const data = await updateBook(title, genre, id, authorId);
          return data;
        } else {
          const data = await updateBook(title, genre, id, authorId);
          return data;
        }
      },
    },
  },
});

const getAuthorId = (author) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(
      "SELECT id FROM authors WHERE name = ?",
      [author.toLowerCase()],
      (err, result) => {
        if (err) return reject(err);
        if (result.length < 1) {
          return resolve("not found");
        }
        return resolve(result[0].id);
      }
    );
  });
};

const getAuthor = (id) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(
      "SELECT * FROM authors WHERE id = ?",
      [id],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result[0]);
      }
    );
  });
};

const getBook = (id) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(
      "SELECT * FROM books WHERE id = ?",
      [Number(id)],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result[0]);
      }
    );
  });
};

const addBook = ({ title, genre, authorId }) => {
  dbConnection.query(
    "INSERT INTO books(title, genre, authorId) VALUES(?, ?, ?)",
    [title, genre, authorId],
    (err) => {
      if (err) throw err;
    }
  );
  return {
    title,
    genre,
    authorId,
  };
};

const deleteBook = (id) => {
  return new Promise((resolve, reject) => {
    dbConnection.query("DELETE FROM books WHERE id = ?", [id], (err) => {
      if (err) return reject(err);
      return resolve({
        id,
        title: "",
        genre: "",
        authorId: -1,
      });
    });
  });
};

const updateBook = (title, genre, id, authorId) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(
      "UPDATE books SET title = ? , genre = ? , authorId = ? WHERE id = ?",
      [title, genre, authorId, Number(id)],
      (err) => {
        if (err) return reject(err);
        return resolve({
          title,
          id,
          genre,
          authorId,
        });
      }
    );
  });
};

const addAuthor = (name) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(
      "INSERT INTO authors (name) VALUES (?)",
      [name],
      (err) => {
        if (err) return reject(err);
        return resolve();
      }
    );
  });
};

const fetchAllBooks = () => {
  return new Promise((resolve, reject) => {
    dbConnection.query("SELECT * FROM books", (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

const fetchAllAuthors = () => {
  return new Promise((resolve, reject) => {
    dbConnection.query("SELECT * FROM authors", (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

const fetchBooksByAuthor = (id) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(
      "SELECT * FROM books WHERE authorId = ?",
      [id],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations,
});
