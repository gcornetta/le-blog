# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
````

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command | Action |
| :--- | :--- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts local dev server at `localhost:4321` |
| `npm run build` | Build your production site to `./dist/` |
| `npm run preview` | Preview your build locally, before deploying |
| `npm run astro ...` | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI |

-----

## 🔌 Using Turso as a Database

This section outlines how to set up and use Turso as your database, both for development and production.

### Installing the Turso CLI on a Mac

To install the Turso CLI on macOS, you can use Homebrew:

```sh
brew install tursodatabase/tap/turso
```

After installation, sign up for a Turso account by running the following command, which will open a browser to complete the process:

```sh
turso auth signup
```

### Deploying Your First Database

Once the CLI is installed and you're authenticated, you can create a new database. Turso will automatically detect the nearest region and create a database group for you.

```sh
turso db create my-db
```

To inspect your new database group, you can use:

```sh
turso db show my-db
```

### Connecting to the Database

You can connect to your database and execute SQL commands directly from your terminal using the Turso shell:

```sh
turso db shell my-db
```

Inside the shell, you can create tables and insert data. Here are some examples:

```sql
-- Create a new table
CREATE TABLE users ( ID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT );

-- Insert a new user
INSERT INTO users (name) VALUES ("Iku");

-- View all users
SELECT * FROM users;
```

To exit the shell, type `.quit`.

```
```
