import "./App.css";
import { ElectionLists } from "./components/ElectionLists";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { useForm } from "react-hook-form";
import { getNumSeats } from "./utilities/worksCouncils";

function App() {
  const {
    register,
    formState: { errors },
    // getValues,
    // getFieldState,
    // handleSubmit,
    setError,
    setValue,
  } = useForm({
    mode: "onChange",
  });
  const message = "The combined values should not amount to more than 100%";
  return (
    <div className="App">
      <h1>Works Council Election Modeller</h1>

      <h2>Workplace Info</h2>
      <form>
        <div className="input-control">
          <label htmlFor="numberEmployees"># of employees</label>
          <input
            type="number"
            {...register("numberEmployees", {
              required: true,
              onChange: (e) => {
                setValue("worksCouncilSize", getNumSeats(e.target.value));
              },
            })}
          />
          {errors?.numberEmployees && (
            <div className="error">numerical value required</div>
          )}
        </div>
        <div className="input-control">
          <label htmlFor="worksCouncilSize">works council size</label>
          <input type="number" {...register("worksCouncilSize")} disabled />
        </div>
        <div className="input-control">
          <label htmlFor="percentMen">% men employees</label>
          <input
            type="number"
            {...register("percentMen", {
              required: true,
              valueAsNumber: true,
              validate: (value, formValues) => {
                if(value > 100) {
                  return "Must represent a percentage of 100%, such as 30.1 for 30.1%"
                }
                if (formValues.percentWomen) {
                  return value + formValues.percentWomen <= 100 || message;
                }
                return false;
              },
            })}
            step="0.1"
            min="0"
            max="100"
          />
          {errors?.percentMen && (
            <div className="error">
              {/** @ts-expect-error */}
              {errors?.percentMen?.message}
            </div>
          )}
        </div>
        <div className="input-control">
          <label htmlFor="percent-women">% women employees</label>
          <input
            {...register("percentWomen", {
              required: true,
              valueAsNumber: true,
              validate: (value, formValues) => {
                if (formValues.percentMen) {
                  if (formValues.percentMen + value <= 100) {
                    setError('percentMen', { message: undefined })
                    return true
                  }
                  return message;
                }
                return false;
              },
            })}
            type="number"
            step="0.1"
            min="0"
            max="100"
          />
          {errors?.percentWomen && (
            <div className="error">
              {/** @ts-expect-error */}
              {errors?.percentWomen?.message}
            </div>
          )}
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
