import "./App.css";
import { useState } from "react";
import { CandidateLists } from "./components/CandidateLists";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import useSessionState from "use-session-storage-state";

import { dHondt, getNumSeats } from "./lib/worksCouncils";
import { Tally, GenderEnum, Items, Tdata } from "./types";
import { sumValues, sumValuesByProp } from "./utilities/sumValues";
import { pluck } from "./utilities/pluck";
import { WorkplaceInfo } from "./components/WorkplaceInfo";
import { tallyAndValidateLists } from "./lib/listData";

enum ListDisplay {
  vertical,
  horizontal,
}

function App() {
  const [numWomen, setNumWomen] = useSessionState("numWomen", {
    defaultValue: 0,
  });

  const [numMen, setNumMen] = useSessionState("numNen", { defaultValue: 0 });

  const [numNonBinary, setNumNonBinary] = useSessionState("numNonBinary", {
    defaultValue: 0,
  });

  const [lists, setLists] = useState<Items>({});
  const totalWorkers = numWomen + numMen + numNonBinary;
  const worksCouncilSize = getNumSeats(totalWorkers);
  const voteTally = pluck(lists, "votes") as Tally;
  const totalVotes = sumValues(voteTally);
  const seatDistribution = dHondt(voteTally, worksCouncilSize);
  const actions = { setNumMen, setNumWomen, setNumNonBinary };

  const workplaceGenderTally: Record<GenderEnum, number> = {
    [GenderEnum.man]: numMen,
    [GenderEnum.woman]: numWomen,
    [GenderEnum.nonbinary]: numNonBinary,
  };

  // undefined by default - important!
  let minorityGender: undefined | GenderEnum;

  // we only track minority gender when the works council is larger than 3 in size
  // https://www.gesetze-im-internet.de/englisch_betrvg/englisch_betrvg.html#p0117
  if (worksCouncilSize > 3) {
    minorityGender = numMen > numWomen ? GenderEnum.woman : GenderEnum.man;
  }

  const workplaceGenderQuota = dHondt(workplaceGenderTally, worksCouncilSize);

  const candidateSeatCount = sumValuesByProp(lists, "members.length");

  const notEnoughSeats = candidateSeatCount < worksCouncilSize;
  const suggestedSeats = worksCouncilSize * 2;
  const suggestMoreSeats = suggestedSeats > candidateSeatCount;

  const [listDisplay, setListDisplay] = useState(ListDisplay.horizontal);

  const moreVotesThanWorkers = totalVotes > totalWorkers;

  const listData = tallyAndValidateLists(
    lists,
    workplaceGenderTally,
    seatDistribution,
    minorityGender
  );

  const numMinorityPopularlyElected = Object.values(lists).reduce(
    (total, list) => {
      const numMinority = list.members.filter(
        (m) => m.elected && m.gender === minorityGender
      ).length;
      return (total += numMinority);
    },
    0
  );

  const isGenderQuotaAchieved =
    minorityGender &&
    numMinorityPopularlyElected >= workplaceGenderQuota[minorityGender];

  /**
   * TODO: split the data for the list out for the
   * data for the form and pass them seperately.
   *
   * Otherwise, cyclic updates seem to be thrashing re-renders
   */
  const data = {
    numWomen,
    numMen,
    numNonBinary,
    totalWorkers,
    worksCouncilSize,
    minorityGender,
    workplaceGenderQuota,
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
      <WorkplaceInfo actions={actions} data={data} />
      <h2>
        Candidate Lists{" "}
        <button
          aria-label="toggle horizontal list display"
          onClick={() => setListDisplay(ListDisplay.horizontal)}
          disabled={listDisplay === ListDisplay.horizontal}
        >
          horizontal
        </button>
        <button
          aria-label="Toggle vertical list display"
          onClick={() => setListDisplay(ListDisplay.vertical)}
          disabled={listDisplay === ListDisplay.vertical}
        >
          vertical
        </button>
      </h2>
      <CandidateLists
        columns={1}
        strategy={rectSortingStrategy}
        data={{ totalWorkers }}
        handle
        onChange={setLists}
        minorityGender={minorityGender}
        listData={listData}
        onRemoveColumn={(columnId) => {
          delete lists[columnId];
        }}
        vertical={listDisplay === ListDisplay.vertical}
        wrapperStyle={() => ({
          maxWidth: 400,
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
