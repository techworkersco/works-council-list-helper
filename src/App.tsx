import "./App.css";
import { ElectionLists } from "./components/ElectionLists";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { useForm } from "react-hook-form";
import { getNumSeats } from "./utilities/worksCouncils";

function App() {
  const {
    register,
    formState: { errors },
    getValues,
    getFieldState,
    handleSubmit,
    setValue
  } = useForm({
    mode: "onChange",
  });
  return (
    <div className="App">
      <h1>Works Council Election Modeller</h1>

      <h2>Workplace Info</h2>
      <form>
        <div className="input-control">
          <label htmlFor="numberEmployees"># of employees</label>
          <input
            type="number"
            {...register("numberEmployees", { required: true, onChange: (e) => {
                setValue('worksCouncilSize', getNumSeats(e.target.value))
            } })}
          />
          {errors.numberEmployees && "This is required"}
        </div>
        <div className="input-control">
          <label htmlFor="worksCouncilSize">works council size</label>
          <input
            type="number"
            {...register("worksCouncilSize")}
            disabled
          />
        </div>
        <div className="input-control">
          <label htmlFor="percentMen">% men employees</label>
          <input
            type="number"
            {...register("percentMen", { required: true })}
            step="0.1"
            min="0"
            max="1000"
          />
        </div>
        <div className="input-control">
          <label htmlFor="percent-women">% women employees</label>
          <input
            {...register("percentWomen", { required: true })}
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
