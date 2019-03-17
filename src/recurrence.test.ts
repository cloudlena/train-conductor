import * as moment from "moment";
import "moment-recur-ts";
import { dropPastOccurrences } from "./recurrence";

describe("dropPastOccurrences", () => {
  it("drops past occurrences", () => {
    const startDate = moment("2015-04-26");
    const recurrence = startDate.recur().every(10, "days");
    const scheduleTime = moment("14:15", "HH:mm");
    const now = moment("2015-05-26");
    const result = dropPastOccurrences(recurrence, scheduleTime, now);
    expect(result.next(1)[0].format("YYYY-MM-DD")).toEqual("2015-05-06");
  });
});
