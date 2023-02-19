import { GenderEnum, Items } from "./types"
import { createRange } from "./utilities/createRange"

const itemCount = 3

export const demoData = {
    BR: {
      name: "Brolidarity",
      members: createRange(itemCount, (index) => ({
        id: `BR.${index + 1}`,
        gender: GenderEnum.man,
      })),
      votes: 0,
    },
    SO: {
      name: "Solidarity",
      members: createRange(itemCount, (index) => ({
        id: `SO.${index + 1}`,
        gender: GenderEnum.woman,
      })),
      votes: 0,
    },
  } as Items
