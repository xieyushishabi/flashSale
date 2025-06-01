import { defineConfig } from "@rsbuild/core";
    import { pluginReact } from "@rsbuild/plugin-react";

    export default defineConfig({
      plugins: [pluginReact()],
      source: {
        entry: {
          index: './src/entry.tsx',
        },
        // 添加以下 define 配置
        define: {
          'process.env.RSBUILD_APP_API_URL': JSON.stringify(process.env.RSBUILD_APP_API_URL)
        }
      },
      server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
      