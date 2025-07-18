/*
 * @Descripttion:
 * @Author: xiaoyufei.5@jd.com
 * @version:
 * @Date: 2025-07-18 14:05:15
 * @LastEditors: xiaoyufei.5@jd.com
 * @LastEditTime: 2025-07-18 14:22:16
 */
import logo from "./logo.svg";
import "./App.css";
import { lazy } from "react";

function App() {
  const RenderResult = (() => {
    const bundleFileName = "isv-28349-265166-4836fe7710677115";
    const bundleUrl =
      "https://s3.cn-north-1.jdcloud-oss.com/isv-bundle-340118326465/isv-28349-265166-4836fe7710677115.js";
    const ISVModule = lazy(() => import(bundleFileName + "@@@@@@" + bundleUrl));

    return ISVModule;
  })();

  if (RenderResult) {
    return RenderResult;
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
