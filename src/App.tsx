import "./App.css";
import { useState } from "react";
import { CandidateLists } from "./components/CandidateLists";
import { rectSortingStrategy } from "@dnd-kit/sortable";

import { dHondt, getNumSeats } from "./utilities/worksCouncils";
import { Tally, GenderEnum, Items, ListData, Tdata } from "./types";

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
  gender: GenderEnum;
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

type Tactions = {
  setNumWomen: (num: number) => void;
  setNumMen: (num: number) => void;
  setNumNonBinary: (num: number) => void;
};

function WorkplaceForm({ actions, data }: { data: Tdata; actions: Tactions }) {
  const {
    totalWorkers,
    worksCouncilSize,
    minorityGender,
    genderQuota,
    candidateSeatCount,
    notEnoughSeats,
    moreVotesThanWorkers,
    suggestMoreSeats,
    suggestedSeats,
    totalVotes,
  } = data;
  const minorityGenderHasMembers = data[`num${minorityGender}`] > 0;
  console.log({ genderQuota });
  return (
    <form>
      <NumWorkers
        data={data}
        actions={actions}
        key={GenderEnum.woman}
        gender={GenderEnum.woman}
      />
      <NumWorkers
        data={data}
        actions={actions}
        key={GenderEnum.nonbinary}
        gender={GenderEnum.nonbinary}
      />
      <NumWorkers
        data={data}
        actions={actions}
        key={GenderEnum.man}
        gender={GenderEnum.man}
      />
      <div className="input-control">
        <label htmlFor="totalWorkers">Total workers</label>
        <span className="cell" id="totalWorkers">
          {" "}
          {totalWorkers}
        </span>
      </div>
      <div className="input-control">
        <label htmlFor="numSeats">Works Council Size</label>
        <span className="cell" id="numSeats">
          {" "}
          {worksCouncilSize}
        </span>
      </div>
      {/* TODO: how does minority gender work with single member works councils? */}
      {worksCouncilSize > 1 && minorityGenderHasMembers && (
        <div className="input-control">
          <label htmlFor="genderQuota">Dhondt Gender Quota</label>
          <div
            className={data.isGenderQuotaAchieved ? "cell" : "error"}
            id="numSeats"
          >
            {`There ${
              data.isGenderQuotaAchieved ? "is" : "should be"
            } at least ${
              genderQuota[minorityGender]
            } works council member(s) for the minority gender (${minorityGender})
                `}
          </div>
        </div>
      )}
      <div className="input-control">
        <label htmlFor="totalVotes">Total Candidates</label>
        <span className="cell">{candidateSeatCount}</span>
        {!notEnoughSeats && suggestMoreSeats && (
          <div className="warning">
            Note: For a more optimal and fair election, you should have at least{" "}
            {suggestedSeats} candidates between available lists.
          </div>
        )}
        <div className="error">
          {notEnoughSeats &&
            `Note: You don't have enough choices (${candidateSeatCount}) between the lists above to form the ${worksCouncilSize} person works council board`}
        </div>
      </div>
      {!!totalWorkers && (
        <div className="input-control">
          <label htmlFor="totalVotes">Total Votes</label>
          <span className="cell">{totalVotes}</span>
          {moreVotesThanWorkers && (
            <div className="error">
              You have more votes ({totalVotes}) than workers ({totalWorkers})
            </div>
          )}
        </div>
      )}
    </form>
  );
}

enum ListDisplay {
  vertical,
  horizontal,
}
function App() {
  const [numWomen, setNumWomen] = useState(0);
  const [numMen, setNumMen] = useState(0);
  const [numNonBinary, setNumNonBinary] = useState(0);
  const [lists, setLists] = useState<Items>({});
  const totalWorkers = numWomen + numMen + numNonBinary;
  const worksCouncilSize = getNumSeats(totalWorkers);
  const voteTally = Object.entries(lists).reduce<Tally>(
    (votes, [key, list]) => {
      votes[key] = list.votes;
      return votes;
    },
    {}
  );
  const totalVotes = Object.values(voteTally).reduce(
    (totalVotes, listVotes) => {
      return totalVotes + listVotes ?? 0;
    },
    0
  );
  const seatDistribution = dHondt(voteTally, worksCouncilSize);
  const actions = { setNumMen, setNumWomen, setNumNonBinary };
  let minorityGender: undefined | GenderEnum;

  const workplaceGenderTally: Record<GenderEnum, number> = {
    [GenderEnum.man]: numMen,
    [GenderEnum.woman]: numWomen,
    [GenderEnum.nonbinary]: numNonBinary,
  };

  if (totalWorkers > 3) {
    let greatestCount = 0;
    Object.entries(workplaceGenderTally)
      .filter(([_, count]) => count > 0)
      .forEach(([gender, count]) => {
        if (count > greatestCount) {
          greatestCount = count;
        } else {
          minorityGender = gender as GenderEnum;
        }
      });
  }

  console.log({ minorityGender })

  const genderQuota = dHondt(workplaceGenderTally, worksCouncilSize);

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
  const candidateSeatCount = Object.values(lists).reduce((count, list) => {
    return count + list.members.length;
  }, 0);
  const notEnoughSeats = candidateSeatCount < worksCouncilSize;
  const suggestedSeats = worksCouncilSize * 2;
  const suggestMoreSeats = suggestedSeats > candidateSeatCount;

  const [listDisplay, setListDisplay] = useState(ListDisplay.horizontal);

  const moreVotesThanWorkers = totalVotes > totalWorkers;

  const listData: ListData = Object.entries(lists).reduce(
    (listData, [listId, list]) => {
      const electedListGenderTally: Record<GenderEnum, number> = list.members
        .filter((m) => m.elected)
        .reduce(
          (tally, member, index) => {
            if (tally[member.gender] === undefined) {
              tally[member.gender] = 0;
            }
            tally[member.gender]++;
            return tally;
          },
          {
            [GenderEnum.man]: 0,
            [GenderEnum.woman]: 0,
            [GenderEnum.nonbinary]: 0,
          } as Record<GenderEnum, number>
        );

      const listDistribution = seatDistribution && seatDistribution[listId];
      const listSizeGenderRatio =
        workplaceGenderTally &&
        listDistribution &&
        dHondt(workplaceGenderTally, listDistribution);

      let isGenderRatioValid = null;

      if (listSizeGenderRatio && minorityGender) {
        isGenderRatioValid = Boolean(
          electedListGenderTally[minorityGender] >=
            listSizeGenderRatio[minorityGender]
        );
      }
      listData[listId] = {
        electedListGenderTally,
        listDistribution,
        listSizeGenderRatio,
        isGenderRatioValid,
      };

      return listData;
    },
    {} as ListData
  );

  const numMinorityElected = Object.values(lists).reduce((total, list) => {
    const numMinority = list.members.filter(
      (m) => m.elected && m.gender === minorityGender
    ).length;
    return (total += numMinority);
  }, 0);

  const isGenderQuotaAchieved =
    minorityGender && numMinorityElected >= genderQuota[minorityGender];

  const data = {
    numWomen,
    numMen,
    numNonBinary,
    totalWorkers,
    worksCouncilSize,
    minorityGender,
    genderQuota,
    isGenderQuotaAchieved,
    candidateSeatCount,
    notEnoughSeats,
    suggestMoreSeats,
    moreVotesThanWorkers,
    suggestedSeats,
    totalVotes,
  } as Tdata;

  return (
    <div className="App">
      <h1>Works Council Election Modeller</h1>

      <h2>Workplace Info</h2>
      <WorkplaceForm actions={actions} data={data} />
      <h2>
        Candidate Lists{" "}
        <button
          onClick={() => setListDisplay(ListDisplay.horizontal)}
          disabled={listDisplay === ListDisplay.horizontal}
        >
          horizontal
        </button>
        <button
          onClick={() => setListDisplay(ListDisplay.vertical)}
          disabled={listDisplay === ListDisplay.vertical}
        >
          vertical
        </button>
      </h2>
      <CandidateLists
        columns={1}
        strategy={rectSortingStrategy}
        data={data}
        handle
        onChange={setLists}
        minorityGender={minorityGender}
        listData={listData}
        onRemoveColumn={(columnId) => {
          delete lists[columnId];
        }}
        vertical={listDisplay === ListDisplay.vertical}
        wrapperStyle={() => ({
          // width: 400
        })}
      />
      {totalWorkers > 0 && (
        <>
          <div className="form"></div>
        </>
      )}
    </div>
  );
}

export default App;
