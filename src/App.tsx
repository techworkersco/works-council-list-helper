import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { MultipleContainers } from "./components/MultipleContainers";
import {rectSortingStrategy} from '@dnd-kit/sortable';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Works Council Helper</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <MultipleContainers
          columns={2}
          strategy={rectSortingStrategy}
          wrapperStyle={() => ({
            width: 150,
            height: 150,
          })}
        />
      </header>
    </div>
  );
}

export default App;
