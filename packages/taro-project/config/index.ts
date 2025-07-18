/*
 * @Descripttion:
 * @Author: xiaoyufei.5@jd.com
 * @version:
 * @Date: 2025-07-18 16:40:46
 * @LastEditors: xiaoyufei.5@jd.com
 * @LastEditTime: 2025-07-18 17:11:49
 */
import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import devConfig from "./dev";
import prodConfig from "./prod";
import Webpack from "webpack";

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<"webpack5">(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<"webpack5"> = {
    projectName: "taro-project",
    date: "2025-7-18",
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: "dist",
    plugins: ["@tarojs/plugin-generator"],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: "react",
    compiler: "webpack5",
    cache: {
      enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",
      output: {
        filename: "js/[name].[hash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].js",
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: "css/[name].[hash].css",
        chunkFilename: "css/[name].[chunkhash].css",
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
        // 设置输出配置
        // chain.output
        //   .filename("[name].[contenthash].js")
        //   .chunkFilename("[name].[contenthash].js")
        //   .publicPath("auto")
        //   // 修改JSONP函数名称 - Webpack 5兼容写法
        //   .set("chunkLoadingGlobal", "taroJshopH5WebpackJsonp");

        // chain
        //   .plugin("ModuleFederationPlugin")
        //   .use(Webpack.container.ModuleFederationPlugin, [
        //     {
        //       name: "isv_28349_265166",
        //       filename: "remoteEntry.js",
        //       exposes: {
        //         "./BasicModuleJoint": "./src/isvmodule/index.js",
        //       },
        //       shared: {
        //         react: { singleton: true, requiredVersion: "^17.0.0" },
        //         "react-dom": { singleton: true, requiredVersion: "^17.0.0" },
        //         "@tarojs/components": {
        //           singleton: true,
        //           requiredVersion: "^3.5.4",
        //         },
        //       },
        //     },
        //   ]);
      },
    },
    rn: {
      appName: "taroDemo",
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        },
      },
    },
  };

  if (process.env.NODE_ENV === "development") {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
