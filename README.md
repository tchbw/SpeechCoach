# AI speaking coach

A concept using AI as a speaking coach. Record your answer to a query, and get back an analysis comparing yourself to another speaker.

> [!NOTE]  
> This concept POC uses Senator Vance as the reference speaker. I picked him randomly because I just saw an interview from him. No political opinions involved in that 

## Running the app

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
