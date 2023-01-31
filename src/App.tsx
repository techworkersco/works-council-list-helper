import "./App.css";
import { ElectionLists } from "./components/ElectionLists";
import { rectSortingStrategy } from "@dnd-kit/sortable";
function App() {
  return (
    <div className="App">
      <h1>Works Council Election Modeller</h1>

      <h2>Workplace Info</h2>
      <form>
        <div className="input-control">
          <label htmlFor="number-employees"># of employees</label>
          <input id="number-employees" type="number" />
        </div>
        <div className="input-control">
          <label htmlFor="percent-men">% men employees</label>
          <input id="percent-men" type="number" step="0.1" min="0" max="1000" />
        </div>
        <div className="input-control">
          <label htmlFor="percent-women">% women employees</label>
          <input
            id="percent-women"
            type="number"
            step="0.1"
            min="0"
            max="1000"
          />
        </div>
        <div className="input-control">
          <label htmlFor="percent-women">minority gender</label>
          
        </div>
      </form>
      <h2>Candidate Lists</h2>
      <ElectionLists
        columns={1}
        strategy={rectSortingStrategy}
        handle
        // vertical
        wrapperStyle={() => ({
          // width: 400
        })}
      />
    </div>
  );
}

export default App;
