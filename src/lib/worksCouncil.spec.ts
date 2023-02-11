import { getNumSeats, dHondt } from "./worksCouncils";

describe("getNumSeats", () => {
  it("should compute seats properly", () => {
    expect(getNumSeats(20)).toEqual(1);
    expect(getNumSeats(21)).toEqual(3);
    expect(getNumSeats(50)).toEqual(3);
    expect(getNumSeats(51)).toEqual(5);
  });
});

describe("dHondt", () => {
  it("should return empty object when there are no votes", () => {
    expect(
      dHondt(
        {
          cats: 0,
          dogs: 0,
          zebras: 0,
        },
        10
      )
    ).toEqual({});
  });
  it("should ignore candidates with 0 votes", () => {
    expect(
      dHondt(
        {
          cats: 0,
          dogs: 4,
          zebras: 5,
        },
        10
      )
    ).toEqual({
      dogs: 4,
      zebras: 6,
    });
  });

  it("should hande a tie with odd available seats favoring the first candidate", () => {
    expect(
      dHondt(
        {
          dogs: 1,
          zebras: 1,
        },
        11
      )
    ).toEqual({
      dogs: 6,
      zebras: 5,
    });
  });

  it("should distribute seats evenly with ties with even candidates", () => {
    expect(
      dHondt(
        {
          dogs: 1,
          zebras: 1,
        },
        10
      )
    ).toEqual({
      dogs: 5,
      zebras: 5,
    });
  });

  it("should not grant a tie with even seats and slightly imbalanced votes", () => {
    expect(
      dHondt(
        {
          cats: 0,
          dogs: 4,
          zebras: 5,
        },
        10
      )
    ).toEqual({
      dogs: 4,
      zebras: 6,
    });
  });

  it("distribute votes properly when there are single votes for lists", () => {
    expect(
      dHondt(
        {
          cats: 18,
          dogs: 1,
          zebras: 1,
        },
        3
      )
    ).toEqual({
      cats: 3,
    });
  });
});
