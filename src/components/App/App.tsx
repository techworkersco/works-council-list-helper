
import { useState } from "react";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import useSessionState from "use-session-storage-state";

import { FormattedMessage } from "react-intl";

import { dHondt, getNumSeats } from "../../lib/worksCouncils";
import { Tally, GenderEnum, Items, Tdata } from "../../types";
import { sumValues } from "../../utilities/sumValues";
import { pluck } from "../../utilities/pluck";
import { WorkplaceInfo } from "../WorkplaceInfo";
import { tallyAndValidateLists } from "../../lib/listData";
import { CandidateLists } from "../CandidateLists";
import "./App.css";

enum ListDisplay {
  vertical,
  horizontal,
}

const screenWidth = window.outerWidth;

type Props = {
  setLocale: (locale: "en" | "de") => void;
};

export function App({ setLocale }: Props) {
  const [numWomen, setNumWomen] = useSessionState("numWomen", {
    defaultValue: 0,
  });

  const [numMen, setNumMen] = useSessionState("numNen", { defaultValue: 0 });

  const [numNonBinary, setNumNonBinary] = useSessionState("numNonBinary", {
    defaultValue: 0,
  });

  const [lists, setLists] = useState<Items>({});
  const [listDisplay, setListDisplay] = useState(
    screenWidth > 900 ? ListDisplay.horizontal : ListDisplay.vertical
  );

  const totalWorkers = numWomen + numMen + numNonBinary;
  const worksCouncilSize = getNumSeats(totalWorkers);
  const voteTally = pluck(lists, "votes") as Tally;
  const totalVotes = sumValues(voteTally);
  const seatDistribution = dHondt(voteTally, worksCouncilSize);
  const actions = { setNumMen, setNumWomen, setNumNonBinary };

  const binaryWorkplaceGenderTally: Record<
    GenderEnum.man | GenderEnum.woman,
    number
  > = {
    [GenderEnum.man]: numMen,
    [GenderEnum.woman]: numWomen,
  };

  // undefined by default - important!
  let minorityGender: undefined | GenderEnum;

  // we only track minority gender when the works council is larger than 3 in size
  // https://www.gesetze-im-internet.de/englisch_betrvg/englisch_betrvg.html#p0117
  if (worksCouncilSize > 3) {
    minorityGender = numMen >= numWomen ? GenderEnum.woman : GenderEnum.man;
  }

  const workplaceGenderQuota = dHondt(
    binaryWorkplaceGenderTally,
    worksCouncilSize
  );

  const totalCandidates = Object.values(lists).reduce((total, list) => {
    return total + (list.members.length ?? 0);
  }, 0);

  const notEnoughSeats = totalCandidates < worksCouncilSize;
  const suggestedSeats = worksCouncilSize * 2;
  const suggestMoreSeats = suggestedSeats > totalCandidates;

  const moreVotesThanWorkers = totalVotes > totalWorkers;

  const listData = tallyAndValidateLists(
    lists,
    binaryWorkplaceGenderTally,
    seatDistribution,
    minorityGender
  );

  const numMinorityPopularlyElected = Object.values(listData).reduce(
    (total, list) => (total += list.minorityGenderElectedMembers.length),
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
    totalCandidates,
    notEnoughSeats,
    suggestMoreSeats,
    moreVotesThanWorkers,
    suggestedSeats,
    totalVotes,
  } as Tdata;

  return (
    <div className="App">
      <h1>
        <FormattedMessage id="title" />
        <span>
          <button onClick={() => setLocale("en")}>en</button>
          <button onClick={() => setLocale("de")}>de</button>
        </span>
      </h1>

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
