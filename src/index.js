import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ProvideAuth } from "./hooks/useAuth";

import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import "./index.css";

import App from "./App";

ReactDOM.render(
  <ProvideAuth>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ProvideAuth>,
  document.getElementById("root")
);
