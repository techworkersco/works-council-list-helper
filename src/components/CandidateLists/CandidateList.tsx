import { SortableContext } from "@dnd-kit/sortable";
import classNames from "classnames";
import { genderArray, GenderEnum, Items, ListDataItem, ListItem } from "../../types";
import { Container } from "../Container";
import { SortableItem } from "../SortableItem/SortableItem";
import { DroppableContainer } from "../DroppableContainer";

import { UniqueIdentifier } from "@dnd-kit/core";

import { SortingStrategy  } from "@dnd-kit/sortable";

import styles from './CandidateList.module.css'
import { ListVotesForm } from "./ListVotesForm";

type CandidateListProps = {
  list: ListItem;
  listData: ListDataItem;
  listId: UniqueIdentifier;
  minorityGender?: GenderEnum;
  isSortingContainer?: boolean;
  listStyle?: React.CSSProperties;
  strategy?: SortingStrategy;
  setItems: React.Dispatch<React.SetStateAction<Items>>;
  totalWorkers: number;
  getMemberIndex: (id: UniqueIdentifier) => number;
  handleAddItem: (listId: UniqueIdentifier) => void;
  handleRemoveColumn: (listId: UniqueIdentifier) => void
  handleRemoveItem: (index: number, listId: UniqueIdentifier) => void
  handleRenameList: (listId: UniqueIdentifier, name: string) => void
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
  scrollable?: boolean,
  columns?: number
};

export function CandidateList({
  list,
  listId,
  listData,
  minorityGender,
  isSortingContainer,
  listStyle,
  scrollable,
  columns,
  strategy,
  setItems,
  totalWorkers,
  handleAddItem,
  handleRemoveColumn,
  handleRemoveItem,
  handleRenameList,
  getMemberIndex,
  wrapperStyle
}: CandidateListProps) {
  let data: ListDataItem | null = listData;
  return (
    <DroppableContainer
      key={listId}
      id={listId}
      label={list.name}
      columns={columns}
      items={list.members}
      scrollable={scrollable}
      style={listStyle}
      onRemove={() => handleRemoveColumn(listId)}
      onRenameList={(name) => handleRenameList(listId, name)}
    >
      <SortableContext items={list.members} strategy={strategy}>
        {list.members.map((member, index) => {
          const status = {
            isPopularlyElected: data?.popularlyElectedMembers.includes(index),
            isOverflowElected: data?.overflowElectedMembers.includes(index),
          };

          return (
            <SortableItem
              disabled={isSortingContainer}
              member={member}
              index={index}
              handle
              key={member.id}
              status={status}
              onRemove={() => handleRemoveItem(index, listId)}
              wrapperStyle={wrapperStyle}
              listId={listId}
              getIndex={getMemberIndex}
              onChangeItem={(member) =>
                setItems((lists) => {
                  lists[listId].members[index].gender = member.gender;
                  return lists;
                })
              }
            />
          );
        })}
        <li key={listId + "-add-member"}>
          <Container
            placeholder
            style={{
              minWidth: "inherit",
              width: "100%",
              minHeight: 100,
            }}
            onClick={() => handleAddItem(listId)}
          >
            + Add Member
          </Container>
        </li>
        {list.members.length ? (
          <li key={listId + "-summary"}>
            <div className={classNames("form", styles.ListFooter)}>
              {minorityGender && (
                <div className="input-control">
                  <label>Gender Distribution</label>
                  <div className={classNames(styles.ListStats, "cell")}>
                    {genderArray.map((gender) => {
                      return (
                        <span key={listId + gender}>
                          {gender[0].toLocaleLowerCase()}:&nbsp;
                          {
                            list.members.filter((m) => m.gender === gender)
                              .length
                          }
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {totalWorkers > 0 && (
                <ListVotesForm
                  onChange={(value) => {
                    setItems((lists) => {
                      lists[listId].votes = value;
                      // just copying the object here is enough to
                      // bind the change
                      return { ...lists };
                    });
                  }}
                  list={list}
                />
              )}
              {data && data.listDistribution ? (
                <>
                  <div className="input-control">
                    <label>Seat Distribution (raw)</label>
                    <span className="cell">{data.listDistribution}</span>
                  </div>
                  {minorityGender && (
                    <div className="input-control">
                      <label htmlFor="listGenderQuota">Gender Quota</label>
                      <span id="listGenderQuota" className="cell">
                        {data.isGenderRatioValid === true && "valid"}
                        {data.isGenderRatioValid === false && "invalid"}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                ""
              )}
            </div>
          </li>
        ) : (
          ""
        )}
      </SortableContext>
    </DroppableContainer>
  );
}
