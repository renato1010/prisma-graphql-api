# Prisma, GraphQL Typescript

This project is the hands-on training for the course: [Modern GraphQL Databases with Prisma](https://leveluptutorials.com/tutorials/modern-graphql-databases-with-prisma)  
Author: [Ryan Elainska](https://github.com/glassblowerscat)

project coolest features:

1. Prisma Schema, and Prisma queries: found at `prisma/schema.prisma` and services files from `directory, file, and fileVersion` folders
2. The GraphQL API is built on modules using lib: [graphql-modules](https://www.npmjs.com/package/graphql-modules), so we have a directory for each **Model** and within that directory a specific file for the type definitions and schema, and another file for the services where the prisma queries live.
3. The seeding of the database was also great. is based on script at: `seed.ts`. Will need to download a ZIP folder with a lot of files and name it: **seed-files** and place it at the same level of this project **root** folder level  
   Author provides a Github repo for download those files at: [seed-files](https://github.com/glassblowerscat/seed-files)
