# Prisma, GraphQL Typescript

This project is the hands-on training for the course: [Modern GraphQL Databases with Prisma](https://leveluptutorials.com/tutorials/modern-graphql-databases-with-prisma)  
Author: [Ryan Elainska](https://github.com/glassblowerscat)

project coolest features:

1. Prisma Schema, and Prisma queries: found at `prisma/schema.prisma` and services files from `directory, file, and fileVersion` folders
2. The GraphQL API is built on modules using lib: [graphql-modules](https://www.npmjs.com/package/graphql-modules), so we have a directory for each **Model** and within that directory a specific file for the type definitions and schema, and another file for the services where the prisma queries live.
3. The seeding of the database was also great. is based on script at: `seed.ts`. Will need to download a ZIP folder with a lot of files and name it: **seed-files** and place it at the same level of this project **root** folder level  
   Author provides a Github repo for download those files at: [seed-files](https://github.com/glassblowerscat/seed-files)

For Database project uses Docker Postgresql image  
First: set `.env` var **DATABASE_URI**

```bash
npx prisma init
```

set provider of **datasource** block `prisma/schema.prisma` to match your db(postgresql)

```bash
npx prisma db pull
```

to turn your db schema into a Prisma Schema

```bash
npx prisma generate
```

generate prisma client

```bash
docker run --name postgresql-container -p 5432:5432 -e POSTGRES_PASSWORD=dbpass -d postgres
```

```bash
docker ps -a
```

get the container id for "postgresql-container"

```bash
docker exec  -it <docker-id> bash
```

to run bash commands inside container console

```bash
:/# psql -h localhost -p 5432 -U postgres -W
```

When **Password : ** promps write "dbPass" (same as env var)

```bash
postgres=# CREATE DATABASE file_manager;
```

```bash
postgres=# \l
```

list databases

```bash
postgres=# \q
```
