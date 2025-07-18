/*
 * @Description: 对webpack编译流程、结果进行干预，改造__webpack_require__.e，支持传入url及moduleId 2个参数，实现动态加载下发url的ISV楼层jsBundle代码。
 */
const { ConcatSource } = require("webpack-sources");

class ModuleLoadPlugin {
  constructor() {
    console.log("===================> IsvModuleLoadPlugin被创建了~");
  }

  apply(compiler) {
    compiler.hooks.compilation.tap("IsvModuleLoadPlugin", (compilation) => {
      // namedModuleId，将数字形式的 moduleId 修改为模块路径。例如 "./src/modules/isvModule/index.tsx"。
      // 因 webpack5 废弃了 NamedModulesPlugin()，这里在 beforeModuleIds hooks 中自定义实现
      compilation.hooks.beforeModuleIds.tap(
        "IsvModuleLoadPlugin-namedModuleId",
        (modules) => {
          modules.forEach((module) => {
            if (module.id === null && module.libIdent) {
              // 通过module.libIdent获取模块的路径
              module.id = module.libIdent({
                context: compiler.options.context,
              });
            }
          });
        }
      );

      // 修改floorItem关于ISV楼层的渲染实现，由普通import变成动态import，并且增加url入参
      compilation.hooks.optimizeChunkAssets.tap(
        "IsvModuleLoadLogic-useDynamicUrl",
        (chunks) => {
          chunks.forEach((chunk) => {
            chunk.files.forEach((fileName) => {
              const source = compilation.assets[fileName].source();
              let newSource = source;

              // 修改打包后，floorItem中引入isv模块部分的代码，改为使用__webpack_require__.e 动态加载
              if (source.indexOf("(bundleFileName + '@@@@@@' + bundleUrl)")) {
                const matchResult = source.match(
                  /return __webpack_require__\(\\?"\.\/(node_modules\/@conecli\/cone-render\/dist|src)\/components lazy recursive\\?"\)\((\w+)\s\+\s'@@@@@@'\s\+\s(\w+)\)/
                );
                if (matchResult) {
                  newSource = newSource.replace(
                    /return __webpack_require__\(\\?"\.\/(node_modules\/@conecli\/cone-render\/dist|src)\/components lazy recursive\\?"\)\((\w+)\s\+\s'@@@@@@'\s\+\s(\w+)\)/,
                    `const _jsIndexModuleId = $2 + '_js';return __webpack_require__.e(/* import() | IsvModule */ $2,$3).then( __webpack_require__.bind(null,_jsIndexModuleId) ).catch(e => console.log($2, '加载isv模块依赖JS报错了:', e))`
                  );
                }
              }

              // 修改打包后app.js 中的webpack源码，__webpack_require__.e 传入第2个参数 chunkUrl，即 isv模块打包后 jsBundle 文件上传云存储后的url。一共要修改以下4处代码。
              if (source.indexOf("__webpack_require__.e = function(chunkId)")) {
                newSource = newSource.replace(
                  "__webpack_require__.e = function(chunkId)",
                  "__webpack_require__.e = function(chunkId, chunkUrl)"
                );
              }
              if (
                source.indexOf("__webpack_require__.f[key](chunkId, promises)")
              ) {
                newSource = newSource.replace(
                  "__webpack_require__.f[key](chunkId, promises)",
                  "__webpack_require__.f[key](chunkId, promises, chunkUrl)"
                );
              }
              if (
                source.indexOf(
                  "__webpack_require__.f.j = function(chunkId, promises)"
                )
              ) {
                newSource = newSource.replace(
                  "__webpack_require__.f.j = function(chunkId, promises)",
                  "__webpack_require__.f.j = function(chunkId, promises, chunkUrl)"
                );
              }

              if (
                source.indexOf(
                  "var url = __webpack_require__.p + __webpack_require__.u(chunkId);"
                )
              ) {
                newSource = newSource.replace(
                  "var url = __webpack_require__.p + __webpack_require__.u(chunkId);",
                  `var url = chunkUrl ? chunkUrl : __webpack_require__.p + __webpack_require__.u(chunkId);`
                );
              }

              // 当往head中append script标签时，表示是由h5自己加载jsBundle文件，打印日志。
              // 客户端ios逻辑是，ios加载jsBundle后，注入页面，在script标签中直接插入文件内容，因此不需要h5自己再加载
              if (
                source.indexOf(
                  "needAttach && document.head.appendChild(script);"
                )
              ) {
                newSource = newSource.replace(
                  "needAttach && document.head.appendChild(script);",
                  `needAttach && document.head.appendChild(script);
									if(url.indexOf('isvmodule') != -1)console.log('1.1|加载isv模块==========h5加载isv模块的jsBundle文件=======往head中append script标签', script)
									`
                );
              }

              if (source.indexOf("script.onerror = script.onload = null;")) {
                newSource = newSource.replace(
                  "script.onerror = script.onload = null;",
                  `if(url.indexOf('isvmodule') != -1)console.log('1.2|加载isv模块==========isv模块对应的jsBundle文件script标签onload完成', event)
									script.onerror = script.onload = null;`
                );
              }
              // eslint-disable-next-line eqeqeq
              if (newSource != source) {
                compilation.assets[fileName] = new ConcatSource(newSource);
              }
            });
          });
        }
      );
    });
  }
}
module.exports = ModuleLoadPlugin;
