import { Tdata, Tactions, GenderEnum } from "../../types";

import { FormattedMessage, useIntl } from "react-intl";

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

  const intl = useIntl();

  const localizedGender = intl.formatMessage({
    id: `gender.${gender.toLowerCase()}`,
  });
  return (
    <div className="input-control">
      <label htmlFor={label}>
        <FormattedMessage
          id="label.numGendered"
          values={{ gender: localizedGender }}
        />
      </label>
      <input
        tabIndex={0}
        min={0}
        id={label}
        type="number"
        defaultValue={value}
        onChange={(e) => {
          const parsedValue = parseInt(e.target.value);

          if (e.target.value && e.target.value.length) {
            if (parsedValue !== value) {
              actions[`setNum${gender}`](parsedValue);
            }
          }
        }}
      />
    </div>
  );
};

export function WorkplaceInfo({
  actions,
  data,
}: {
  data: Tdata;
  actions: Tactions;
}) {
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

      <div className="input-control">
        <label htmlFor="workplaceGenderQuota">Dhondt Gender Quota</label>
        <div
          className={
            !data.isGenderQuotaAchieved && isQuotaDisabled ? "error" : "cell"
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
                ? "with less than 5 candidates"
                : "when the minority proportion is so small that they aren't allocated any seats"
            } `
          )}
        </div>
      </div>

      <div className="input-control">
        <label htmlFor="totalVotes">Total Candidates</label>
        <span className="cell">{totalCandidates}</span>
        {!notEnoughSeats && suggestMoreSeats && (
          <div className="warning">
            Note: For a more optimal and fair election, you should have at least{" "}
            {suggestedSeats} candidates between available lists.
          </div>
        )}
        <div className="error">
          {notEnoughSeats &&
            `Note: You don't have enough choices (${totalCandidates}) between the lists below to form the ${worksCouncilSize} person works council board`}
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
