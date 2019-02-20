import * as moment from "moment";
import "moment-recur-ts";
import { dropPastOccurrences } from "./recurrence";

describe("dropPastOccurrences", () => {
  it("drops past occurrences", () => {
    const startDate = moment("26/04/2015", "DD/MM/YYYY");
    const recurrence = startDate.recur().every(10, "days");
    const scheduleTime = moment("14:15", "HH:mm");
    const now = moment("26/05/2015");
    expect(
      dropPastOccurrences(recurrence, scheduleTime, now)
        .next(1)[0]
        .format("DD/MM/YYYY"),
    ).toEqual("06/05/2015");
  });
});
