import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
export default [
  { ignores: [".next/**", "node_modules/**", "var/**"] },
  ...compat.extends("next/core-web-vitals").map((c) => ({ ...c, files: ["**/*.{js,jsx,mjs}"] })),
];
