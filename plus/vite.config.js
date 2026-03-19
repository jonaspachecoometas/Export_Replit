import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/sass/app.scss", "resources/js/app.js"],
            refresh: true,
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // Oculta avisos de dependências como Bootstrap
                quietDeps: true,

                // (Opcional) Oculta avisos específicos
                silenceDeprecations: [
                    "legacy-js-api",
                    "import",
                    "color-functions",
                    "global-builtin",
                ],
            },
        },
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
        hmr: {
            host: "localhost",
        },
    },
});
