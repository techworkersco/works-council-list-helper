import { ListItem } from "../../types";

type ListVotesFormProps = {
  list: ListItem;
  onChange?: (name: number) => void | undefined;
};

export function ListVotesForm({ list, onChange }: ListVotesFormProps) {
  return (
    <div className="input-control">
      <label htmlFor="votes">Votes</label>

      <input
        name="votes"
        type="number"
        min={0}
        defaultValue={list.votes}
        tabIndex={0}
        style={{ width: 60 }}
        onChange={(e) =>
          onChange &&
          e.target.value?.length &&
          onChange(parseInt(e.target.value))
        }
      />
    </div>
  );
}
