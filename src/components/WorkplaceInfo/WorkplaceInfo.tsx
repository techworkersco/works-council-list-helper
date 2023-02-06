import { Tdata, Tactions, GenderEnum } from "../../types";

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
        name={label}
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
    candidateSeatCount,
    notEnoughSeats,
    moreVotesThanWorkers,
    suggestMoreSeats,
    suggestedSeats,
    totalVotes,
  } = data;
  const minorityGenderHasMembers = data[`num${minorityGender}`] > 0;

  const numMinorityWorkers = workplaceGenderQuota[minorityGender];
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
          className={data.isGenderQuotaAchieved ? "cell" : "error"}
          id="numSeats"
        >
          {worksCouncilSize > 1 &&
            minorityGenderHasMembers &&
            numMinorityWorkers ? (
              <>
                {`There ${
                  data.isGenderQuotaAchieved ? "is" : "should be"
                } at least ${
                  numMinorityWorkers
                } works council member(s) for the minority gender (${minorityGender})
                  `}
              </>
            ): 'Minority gender does not apply with less than 5 candidates or when the minority proporition is so small that they receive 0 seats'}
        </div>
      </div>

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
            `Note: You don't have enough choices (${candidateSeatCount}) between the lists below to form the ${worksCouncilSize} person works council board`}
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
