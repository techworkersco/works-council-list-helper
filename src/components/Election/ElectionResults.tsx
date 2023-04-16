import { Tdata } from "../../types";

import { FormattedMessage } from "react-intl";

export function ElectionResults({ data }: { data: Tdata }) {
  const {
    totalWorkers,
    worksCouncilSize,
    minorityGender,
    workplaceGenderQuota,
    totalCandidates,
    notEnoughSeats,
    moreVotesThanWorkers,
    suggestMoreSeats,
    suggestedSeats,
    totalVotes,
  } = data;

  const minorityGenderHasMembers = data[`num${minorityGender}`] > 0;

  const numMinorityWorkers = workplaceGenderQuota[minorityGender];
  const isQuotaDisabled =
    worksCouncilSize > 1 && minorityGenderHasMembers && numMinorityWorkers;

  return (
    <div>
      <h2>Election Stats</h2>
      <div className="input-control">
        <label htmlFor="totalWorkers">
          <FormattedMessage
            id="label.workerCount"
            defaultMessage={"Worker Count"}
          />
        </label>
        <span className="cell" id="totalWorkers">
          {totalWorkers}
        </span>
      </div>
      <div className="input-control">
        <label htmlFor="numSeats">
          <FormattedMessage
            id="label.worksCouncilSeatCount"
            defaultMessage={"Works Council Seats"}
          />
        </label>
        <span className="cell" id="numSeats">
          {worksCouncilSize}
        </span>
      </div>
      {/* TODO: how does minority gender work with single member works councils? */}

      <div className="input-control">
        <label htmlFor="workplaceGenderQuota">
          <a href="https://en.wikipedia.org/wiki/D%27Hondt_method">D'Hondt</a>
          &nbsp;Gender Quota
        </label>
      </div>
      <div
        className={
          !data.isGenderQuotaAchieved && isQuotaDisabled ? "error" : "success"
        }
        id="workplaceGenerQuota"
      >
        {isQuotaDisabled ? (
          <>
            {/* todo: replace with ICU pluralisation */}
            {`There ${
              data.isGenderQuotaAchieved
                ? numMinorityWorkers > 1
                  ? "are"
                  : "is"
                : "should be"
            } at least ${numMinorityWorkers} works council member${
              numMinorityWorkers > 1 ? "s" : ""
            } for the minority gender (${minorityGender})
          `}
          </>
        ) : (
          `Minority gender does not apply ${
            worksCouncilSize < 5
              ? "when the works council has less than 5 seats"
              : "when the minority proportion is so small that they aren't allocated any seats"
          } `
        )}
      </div>
      <div className="input-control">
        <label htmlFor="totalVotes">Total Candidates</label>
        <span className="cell">{totalCandidates}</span>
      </div>
      {!notEnoughSeats && suggestMoreSeats && (
        <div className="warning">
          Note: For a more optimal and fair election, you should have at least{" "}
          {suggestedSeats} candidates between available lists.
        </div>
      )}

      {notEnoughSeats && (
        <div className="error">
          Note: You don't have enough choices (${totalCandidates}) between the
          lists below to form the ${worksCouncilSize} person works council board
        </div>
      )}

      {!!totalVotes && (
        <div className="input-control">
          <label htmlFor="totalVotes">Total Votes</label>
          <span className="cell">{totalVotes}</span>
        </div>
      )}
      {moreVotesThanWorkers && (
        <div className="error">
          You have more votes ({totalVotes}) than workers ({totalWorkers})
        </div>
      )}
    </div>
  );
}
