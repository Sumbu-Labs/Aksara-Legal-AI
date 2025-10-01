<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Overview

This backend powers the Aksara Legal AI experience. It exposes REST endpoints for:

- Authentication and user management
- Business profile onboarding
- Document intake and checklist management
- AI assistant and workspace summaries fed by the `ai-service`

The service is built with [NestJS](https://nestjs.com) and Postgres via Prisma.

## Quick start

```bash
pnpm install
pnpm dev
```

The default `pnpm dev` script runs the application in watch mode on port `7600`.

## Configuration

Create a `.env` file in the `backend/` directory. Key variables:

| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_URL` | Postgres connection string | – |
| `AI_SERVICE_BASE_URL` | URL to the AI microservice | `http://localhost:7700` |
| `AI_SERVICE_TOKEN` | Optional bearer token for the AI service | – |
| `AUTH_BYPASS_ENABLED` | Enables demo-mode auth bypass when set to `true`/`1` | `true` |
| `DEMO_USER_ID` | Static user id injected when bypassing auth | `demo-user` |
| `DEMO_USER_EMAIL` | Email for the demo user | `demo@aksara.id` |
| `DEMO_USER_NAME` | Display name for the demo user | `Aksara Demo` |
| `DEMO_USER_PASSWORD_HASH` | Optional password hash stored for the demo user | SHA-256 digest of `aksara-demo:<id>:<email>` |

When `AUTH_BYPASS_ENABLED` is active the system automatically provisions the demo
user (if missing) and injects it into guarded requests. This keeps business profile
flows, workspace summaries, and the chatbot usable without running the full auth
stack.

To test with real authentication later, set `AUTH_BYPASS_ENABLED=false` and provide
your own users via the signup flow or seed scripts.

## Compile and run the project

```bash
# development
pnpm dev

# production mode
pnpm start
```
