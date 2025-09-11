import type { UserConfig } from "@commitlint/types";

const expectedTypes = [
  "feat",
  "fix",
  "chore",
  "ci",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "revert",
  "WIP",
];

const PROJECT_KEY = "SCRUM";
const headerPattern = new RegExp(
  `^(${PROJECT_KEY}-\\d+)\\s\\|\\s(${expectedTypes.join("|")}):\\s(.+)`,
);

const config: UserConfig = {
  parserPreset: {
    parserOpts: {
      headerPattern,
      headerCorrespondence: ["scope", "type", "subject"],
    },
  },
  plugins: [
    {
      rules: {
        "header-match-custom-pattern": (parsed) => {
          const { scope, type, subject } = parsed;
          if (!scope || !type || !subject) {
            return [
              false,
              `Header must match pattern: ${PROJECT_KEY}-<id-task> | <type>: <description>` +
                `\nType must be one of: ${expectedTypes.join(", ")}`,
            ];
          }
          return [true, ""];
        },
        "type-enum": (parsed) => {
          const { type } = parsed;
          if (type && !expectedTypes.includes(type)) {
            return [false, `Type must be one of: ${expectedTypes.join(", ")}`];
          }
          return [true, ""];
        },
      },
    },
  ],
  rules: {
    "header-match-custom-pattern": [2, "always"], // Usa la regla personalizada
    "type-enum": [2, "always", expectedTypes],
  },
};

export default config;
