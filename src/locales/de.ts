/* eslint-disable import/no-anonymous-default-export */
const de: Record<string, string> = {
 title: "Betriebrat Wahlmodellierer",
  // using dot notated keys so we can seamlessly switch to a nested
  // object literal syntax if we want to, i.e.
  // { gender: { men: "Männer", women: "Frauen" } }
  "label.numGendered": "# {gender} als Mitarbeiter",
  "gender.men": "Männer",
  "gender.men.singular": "Mann",
  "gender.women": "Frauen",
  "gender.women.singular": "Frau",
  "gender.nonbinary": "Diversen",
  "gender.nonbinary.singular": "Divers",
};

export default de
