// eslint.config.mjs
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "coverage/**", "node_modules/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // El SDK expone tipos al consumidor: un `any` implícito se le escapa
      // fuera del paquete, así que aquí es error y no aviso.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["test/**/*.ts", "e2e/**/*.ts"],
    rules: {
      // Los tests afirman sobre cuerpos de petición cuyo tipo estático es
      // BodyInit; los casts son deliberados.
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },
  {
    // eslint.config.mjs no está cubierto por el tsconfig.json del proyecto
    // (su "include" es src/test/e2e/vitest configs), así que projectService
    // no puede tipar este fichero. Se lintea sin reglas basadas en tipos.
    files: ["eslint.config.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
);
