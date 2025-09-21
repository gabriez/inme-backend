# 🚀 Express + TypeScript API Template

Welcome! This repository is your starting point for creating modern APIs with Express, TypeScript, and a polished workflow thanks to Husky. Put on your helmet, because we're going to do awesome things. 🌐🔗

---

## 📋 Table of Contents

- [Requirements](#-requirements)
- [Installation](#-installation)
- [Available Scripts](#-available-scripts)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🤖 Requirements

- **Node.js** >= 22.15.0
- **yarn** ≥ 4.9.1 (or **npm** ≥ 6)
- Willingness to learn cool stuff

---

## ⚙️ Installation

1. Clone this repository

   ```bash
   git clone git@gitlab.com:template-gagzu/api-express.git
   cd api-express.git
   ```

2. Install dependencies

   ```bash
   yarn install
   ```

3. Prepare Husky (runs only once when the repo is cloned for the first time)

   ```bash
   yarn prepare
   ```

4. Start in development mode

   ```bash
   yarn dev
   ```

---

## 🛠️ Available Scripts

All useful commands are ready in the `package.json` to automate your workflow:

| Script       | Description                                                 |
| ------------ | ----------------------------------------------------------- |
| `build`      | Compiles TypeScript (`tsc`).                                |
| `start`      | Runs the compiled app (`node dist/index.js`).               |
| `dev`        | Starts the server in watch mode (`tsx watch src/index.ts`). |
| `lint`       | Runs ESLint to check the code.                              |
| `lint:fix`   | Runs ESLint and automatically fixes errors.                 |
| `format`     | Applies Prettier to the entire project.                     |
| `doc`        | Generates documentation with JSDoc (`jsdoc -c jsdoc.json`). |
| `migrate`    | Runs migrations with TypeScript (`tsx scripts/migrate.ts`). |
| `typeorm`    | TypeORM CLI (`tsx ./node_modules/typeorm/cli.js`).          |
| `prepare`    | Husky hook: installs Git hooks.                             |
| `test`       | Runs all tests inside **tests** folder                      |
| `dev:docker` | Runs the backend inside a docker container                  |

---

## 🚀 Quick Start

1. **Development**:

   ```bash
   yarn dev
   ```

   Edit your code and see live changes.

2. **Build and run**:

   ```bash
   yarn build
   yarn start
   ```

3. **Verify linters before committing**:

   ```bash
   git add . && git commit -m "your message"
   ```

   Thanks to Husky, ESLint and Prettier run automatically before the commit.

---

## 📁 Project Structure

```plaintext
├─ src/
|  |─ __tests__/      # Tests for controllers and middlewares
│  ├─ controllers/    # Controllers and business logic
│  ├─ database/       # Configuration, data access, entity and schema definitions
│  ├─ libs/           # Shared libraries and utilities
│  ├─ middlewares/    # Express middlewares for requests
│  ├─ routes/         # Express routers
│  ├─ typescript/     # Additional typings for external and internal libraries
│  └─ index.ts        # Application entry point
├─ scripts/
│  └─ migrate.ts      # Migration script
├─ .husky/            # Git hooks (Husky)
├─ package.json       # Dependencies and scripts
└─ tsconfig.json      # TypeScript configuration
```
