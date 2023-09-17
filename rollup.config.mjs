/**
 * Rollup 설정 모듈
 * @author Innodep. TMS Development Division, Development Team 2 <jsj@innodep.com>
 * @since 2023.03.15
 */
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";

import pkg from "./package.json" assert { type: "json" };

const extensions = ["js", "jsx", "ts", "tsx", "mjs"];
const config = [
    {
        external: [/node_modules/],
        input: "./src/index.ts",
        output: [
            {
                file: pkg.module,
                format: "esm",
                globals: {
                    react: "React",
                },
                exports: "named",
            },
            {
                dir: "./dist",
                format: "cjs",
                preserveModules: true,
                preserveModulesRoot: "src",
                globals: {
                    react: "React",
                },
                exports: "named",
            },
            /* {
                name: pkg.name,
                file: pkg.browser,
                format: "umd",
                globals: {
                    react: "React",
                },
            }, */
        ],
        plugins: [
            nodeResolve({ extensions }),
            typescript({ tsconfig: "./tsconfig.json" }),
            babel({
                babelHelpers: "bundled",
                exclude: "node_modules/**",
                extensions,
                include: ["src/**/*"],
            }),
            commonjs({ include: "node_modules/**" }),
            peerDepsExternal(),
            postcss({
                extract: false,
                modules: true,
                sourceMap: false,
                use: ["sass"],
            }),
        ],
    },
];
export default config;
