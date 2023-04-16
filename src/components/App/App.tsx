import { lazy, useState } from "react";

import useSessionState from "use-session-storage-state";

import { FormattedMessage } from "react-intl";

import { dHondt, getNumSeats } from "../../lib/worksCouncils";
import { Tally, GenderEnum, Items, Tdata } from "../../types";
import { sumValues } from "../../utilities/sumValues";
import { pluck } from "../../utilities/pluck";
import { WorkplaceInfo } from "../WorkplaceInfo";
import { tallyAndValidateLists } from "../../lib/listData";

import "./App.css";
import { getColor } from "src/utilities/getColor";
import { ElectionResults } from "../Election/ElectionResults";

const CandidateLists = lazy(() =>
  import("../CandidateLists").then(({ CandidateLists }) => ({
    default: CandidateLists,
  }))
);

enum ListDisplay {
  vertical,
  horizontal,
}

const screenWidth = window.outerWidth;

type Props = {
  setLocale: (locale: "en" | "de" | "ar") => void;
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
      <div id="tray">
        <div id="workplace-info">
          <h1>
            <FormattedMessage id="title" />
          </h1>
          <div>
            <button onClick={() => setLocale("en")}>en</button>
            <button onClick={() => setLocale("de")}>de</button>
            <button onClick={() => setLocale("ar")}>ar</button>
          </div>
          <h2>
            <FormattedMessage id="workplaceInfo.header" />
          </h2>
          <WorkplaceInfo
            actions={actions}
            data={{
              numMen: data.numMen,
              numNonBinary: data.numNonBinary,
              numWomen: data.numWomen,
            }}
          />
          <ElectionResults data={data} />
        </div>
        <div id="candidate-lists">
          <header>
            <span
              style={{
                display: "inline-block",
                fontSize: "28.8px",
                margin: "16px 0px",
                padding: "4px 0px",
              }}
            >
            <FormattedMessage id="candidateLists.header" />
            </span>

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
            <span id="legend">
              <span
                className="legend-block"
                style={{
                  backgroundColor: getColor({ isPopularlyElected: true }),
                }}
              />
              <span className="legend-label">Popularly Elected </span>
              <span
                className="legend-block"
                style={{
                  backgroundColor: getColor({ isOverflowElected: true }),
                }}
              />
              <span className="legend-label">List Overflow</span>
              <span
                className="legend-block"
                style={{
                  backgroundColor: getColor({ isGenderQuotaElected: true }),
                }}
              />
              <span className="legend-label">Gender Quota</span>
            </span>
          </header>
          <CandidateLists
            columns={1}
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
              maxWidth: 360,
            })}
          />
        </div>
      </div>
    </div>
  );
}
