import { Tactions, GenderEnum } from "../../types";

import { FormattedMessage, useIntl } from "react-intl";

const NumWorkers = ({
  gender,
  actions,
  data,
}: {
  gender: GenderEnum;
  actions: Tactions;
  data: {
    numMen: number;
    numWomen: number;
    numNonBinary: number;
  };
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
  data: {
    numMen: number;
    numWomen: number;
    numNonBinary: number;
  };
  actions: Tactions;
}) {
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
    </form>
  );
}
