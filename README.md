# Running the app

Install pnpm and have Docker running.

Install dependencies:

```
pnpm install
```

Start up development database:

```
pnpm run dev:services:up
```

Run Prisma Migrate if needed:

```
pnpm prisma migrate dev
```

Start the app:

```
pnpm run dev
```

Go to http://localhost:3000/ to see the app.

# Committing changes

Run this command to cleanup the codebase or your commit will be rejected:

```
pnpm run format
```
