import { ListMember } from "../types";

export function getColor(member: ListMember) {
  if (member.elected) {
    return "hsl(135, 98%, 45%)";
  }
  return undefined;
}
