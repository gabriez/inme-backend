const config = {
  "**/*.{ts?(x),mts}": () => "tsc -p tsconfig.json --noEmit",
  "*.{js,jsx,mjs,cjs,ts,tsx,mts}": [
    "yarn format",
    "yarn lint:fix",
    "git add .",
    // TODO: uncomment when tests are implemented
    // "vitest related --run"
  ],
};

export default config;
