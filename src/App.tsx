import "./App.css";
import { useState } from "react";
import { ElectionLists } from "./components/ElectionLists";
import { rectSortingStrategy } from "@dnd-kit/sortable";

import { GenderPlurals, Items } from "./components/ElectionLists";

import { getNumSeats } from "./utilities/worksCouncils";
import { UniqueIdentifier } from "@dnd-kit/core";

// const debounce = (fn: Function, delay: number) => {
//   let timeout = -1;

//   return (...args: unknown[]) => {
//     if (timeout !== -1) {
//       clearTimeout(timeout);
//     }

//     timeout = setTimeout(fn, delay, ...args);
//   };
// };

const NumWorkers = ({
  gender,
  actions,
  data,
}: {
  gender: GenderPlurals;
  actions: Tactions;
  data: Tdata;
}) => {
  const label = `num${gender}`;
  const value = data[`num${gender}`];
  return (
    <div className="input-control">
      <label htmlFor={label}># of {gender.toLocaleLowerCase()} employees</label>
      <input
        tabIndex={0}
        min={0}
        type="number"
        defaultValue={value}
        onChange={(e) => {
          const parsedValue = parseInt(e.target.value);

          // e.preventDefault();
          if (e.target.value && e.target.value.length) {
            if (parsedValue !== value) {
              actions[`setNum${gender}`](parsedValue);
            }
          }
          // console.log("focus!");
          // e.target.focus();
        }}
      />
    </div>
  );
};

type Tdata = {
  numWomen: number;
  numMen: number;
  numNonBinary: number;
  totalWorkers: number;
  numElectoralSeats: number;
};
type Tactions = {
  setNumWomen: (num: number) => void;
  setNumMen: (num: number) => void;
  setNumNonBinary: (num: number) => void;
};

function WorkplaceForm({ actions, data }: { data: Tdata; actions: Tactions }) {
  const { totalWorkers, numElectoralSeats } = data;

  return (
    <form>
      <NumWorkers
        data={data}
        actions={actions}
        key={GenderPlurals.woman}
        gender={GenderPlurals.woman}
      />
      <NumWorkers
        data={data}
        actions={actions}
        key={GenderPlurals.nonbinary}
        gender={GenderPlurals.nonbinary}
      />
      <NumWorkers
        data={data}
        actions={actions}
        key={GenderPlurals.man}
        gender={GenderPlurals.man}
      />
      <div className="input-control">
        <label htmlFor="totalWorkers">Total workers</label>
        <span className="cell" id="totalWorkers">
          {" "}
          {totalWorkers}
        </span>
      </div>
      <div className="input-control">
        <label htmlFor="numSeats">Electoral Board Size</label>
        <span className="cell" id="numSeats">
          {" "}
          {numElectoralSeats}
        </span>
      </div>
    </form>
  );
}

function App() {
  const [numWomen, setNumWomen] = useState(0);
  const [numMen, setNumMen] = useState(0);
  const [numNonBinary, setNumNonBinary] = useState(0);
  const [lists, setLists] = useState<Items>({});
  const [votes, setVotes] = useState<Record<string, number>>({});
  const totalWorkers = numWomen + numMen + numNonBinary;
  const numElectoralSeats = getNumSeats(totalWorkers);
  const actions = { setNumMen, setNumWomen, setNumNonBinary };
  const data = {
    numWomen,
    numMen,
    numNonBinary,
    totalWorkers,
    numElectoralSeats,
  };

  // const {
  //   register,
  //   formState: { errors },
  //   getValues,
  //   // getFieldState,
  //   // handleSubmit,
  //   // setError,
  //   // setValue,
  // } = useForm({
  //   mode:  "onSubmit",
  // });
  const seatCount = Object.values(lists).reduce((count, list) => {
    return count + list.members.length;
  }, 0);
  const notEnoughSeats = seatCount < numElectoralSeats;
  const suggestedSeats = numElectoralSeats * 2;
  const suggestMoreSeats = suggestedSeats > seatCount;
  const totalVotes = Object.values(votes).reduce((totalVotes, listVotes) => {
    return totalVotes + listVotes;
  }, 0)

  const moreVotesThanWorkers = totalVotes > totalWorkers;

  return (
    <div className="App">
      <h1>Works Council Election Modeller</h1>

      <h2>Workplace Info</h2>
      <WorkplaceForm actions={actions} data={data} />
      <h2>Candidate Lists</h2>
      <ElectionLists
        columns={1}
        strategy={rectSortingStrategy}
        handle
        onChange={setLists}
        onRemoveColumn={(columnId) => {
          delete votes[columnId]
        }}
        // vertical
        wrapperStyle={() => ({
          // width: 400
        })}
      />
      {totalWorkers > 0 && (
        <>
          <h2>Election Results</h2>
          <div className="error">
            {notEnoughSeats &&
              `Note: You don't have enough choices (${seatCount}) between the lists above to fill the ${numElectoralSeats} person electoral board`}
          </div>
          <form>
            {Object.entries(lists)
              .filter(([, list]) => list.members.length)
              .map(([listId, list]) => {
                return (
                  <div key={`votes-${listId}`} className="input-control">
                    <label htmlFor={`votes-${listId}`}>{list.name} ({list.members.length} candidates)</label>
                    <input
                      onChange={(e) =>
                        setVotes((votes) => {
                          return {
                            ...votes,
                            [listId]: parseInt(e.target.value),
                          };
                        })
                      }
                      aria-describedby=""
                      defaultValue={0}
                    />
                  </div>
                );
              })}
              <div className="input-control">
              <label htmlFor="totalVotes">Total Seats</label>
              <span className="cell">
                {seatCount}
              </span>
            </div>
            <div className="input-control">
              <label htmlFor="totalVotes">Total Votes</label>
              <span className="cell">
                {totalVotes}
              </span>
              {moreVotesThanWorkers && (<div className="error">
              You have more votes ({totalVotes}) than workers ({totalWorkers})
              </div>)}
            </div>
          </form>
          {!notEnoughSeats &&
            suggestMoreSeats &&
            `Note: For a more optimal and fair election, you should have at least ${suggestedSeats} candidates between available lists.`}
        </>
      )}
    </div>
  );
}

export default App;
