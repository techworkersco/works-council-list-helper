
import "./App.css";
import { MultipleContainers } from "./components/MultipleContainers";
import { rectSortingStrategy } from "@dnd-kit/sortable";
function App() {
  return (
    <div className="App">
      <h1>Works Council Election Modeller</h1>
      <h2>Candidate Lists</h2>
      <MultipleContainers
        columns={1}
        strategy={rectSortingStrategy}
        handle
        vertical
        wrapperStyle={() => ({
          // width: 400
        })}
      />
    </div>
  );
}

export default App;
