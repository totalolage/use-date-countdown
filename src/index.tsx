import {
  differenceInYears,
  differenceInMonths,
  differenceInWeeks,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInMilliseconds,
  addYears,
  addMonths,
  addWeeks,
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  addMilliseconds,
  subYears,
  subMonths,
  subWeeks,
  subDays,
  subHours,
  subMinutes,
  subSeconds,
  subMilliseconds
} from "date-fns";
import {
  useCallback, useEffect, useRef, useState
} from "react";
import type { MutableRefObject } from "react";
import getEnumValues from "./helpers/getEnumValues";

enum Period {
  years = "years",
  months = "months",
  weeks = "weeks",
  days = "days",
  hours = "hours",
  minutes = "minutes",
  seconds = "seconds",
  milliseconds = "milliseconds",
};

type SmallerPeriod<P extends Omit<Period, Period.milliseconds>> =
  P extends Period.years ? Period.months :
  P extends Period.months ? Period.weeks :
  P extends Period.weeks ? Period.days :
  P extends Period.days ? Period.hours :
  P extends Period.hours ? Period.minutes :
  P extends Period.minutes ? Period.seconds :
  Period.milliseconds;

type SmallerPeriodsInc<P extends Period> = P extends Period.milliseconds ? P : (P | SmallerPeriodsInc<SmallerPeriod<P>>);
type SmallerPeriodsExc<P extends Period> = P extends Period.milliseconds ? never : SmallerPeriodsInc<SmallerPeriod<P>>;

type LargerPeriod<P extends Omit<Period, Period.years>> =
  P extends Period.milliseconds ? Period.seconds :
  P extends Period.seconds ? Period.minutes :
  P extends Period.minutes ? Period.hours :
  P extends Period.hours ? Period.days :
  P extends Period.days ? Period.weeks :
  P extends Period.weeks ? Period.months :
  Period.years;

type LargerPeriodsInc<P extends Period> = P extends Period.years ? P : (P | LargerPeriodsInc<LargerPeriod<P>>);
// type LargerPeriodsExc<P extends Period> = P extends Period.years ? never : LargerPeriodsInc<LargerPeriod<P>>;

const add: Record<Period, (
  date: Date | number,
  amount: number
) => Date> = {
  years: addYears,
  months: addMonths,
  weeks: addWeeks,
  days: addDays,
  hours: addHours,
  minutes: addMinutes,
  seconds: addSeconds,
  milliseconds: addMilliseconds,
};

const sub: Record<Period, (
  date: Date | number,
  amount: number
) => Date> = {
  years: subYears,
  months: subMonths,
  weeks: subWeeks,
  days: subDays,
  hours: subHours,
  minutes: subMinutes,
  seconds: subSeconds,
  milliseconds: subMilliseconds,
};

const differenceIn: Record<Period, (
  dateLeft: Date | number,
  dateRight: Date | number
) => number> = {
  years: differenceInYears,
  months: differenceInMonths,
  weeks: differenceInWeeks,
  days: differenceInDays,
  hours: differenceInHours,
  minutes: differenceInMinutes,
  seconds: differenceInSeconds,
  milliseconds: differenceInMilliseconds,
};

interface UseDateCountdown {
  <P extends Period>(targetDate: Date | number, resolution: P, trim?: false | { trimFront?: false; trimBack?: false }): Record<LargerPeriodsInc<P>, number> & Record<SmallerPeriodsExc<P>, null>;
  <P extends Period>(targetDate: Date | number, resolution: P, trim: true | { trimFront: true; trimBack: true }): Partial<Record<LargerPeriodsInc<P>, number>>;
  <P extends Period>(targetDate: Date | number, resolution: P, trim: { trimFront: true, trimBack?: false }): Partial<Record<LargerPeriodsInc<P>, number>> & Record<SmallerPeriodsExc<P>, null>;
  <P extends Period>(targetDate: Date | number, resolution: P, trim: { trimFront?: false, trimBack: true }): Record<LargerPeriodsInc<P>, number>;
}

const useDateCountdown = ((targetDate: Date | number, resolution: Period, trim: boolean | { trimFront: boolean; trimBack: boolean } = false) => {
  const { trimFront, trimBack } = typeof trim === "boolean" ? { trimFront: trim, trimBack: trim } : trim;

  const generateOutput = useCallback((now: Date | number = new Date()) => {
    const periods = getEnumValues(Period);
    const minPeriodI = periods.indexOf(resolution);
    return periods
      .reduce<{
        target: typeof targetDate;
        output: Partial<Record<Period, number | null>>;
        started: boolean;
      }>(({ target, output, started }, period, periodIndex) => {
        if (periodIndex > minPeriodI) {
          if (trimBack) {
            return { target, output, started };
          }
          return {
            target,
            output: {
              ...output,
              [period]: null,
            },
            started,
          };
        }
        const amount = differenceIn[period](target, now) + (periodIndex === minPeriodI ? 1 : 0);
        if (amount === 0 && trimFront && !started) {
          return { target, output, started };
        }
        return {
          target: sub[period](target, amount),
          output: {
            ...output,
            [period]: amount,
          },
          started: true,
        };
      },
        {
          target: targetDate,
          output: {},
          started: false,
        }).output as Record<Period, number | null>;
  }, [targetDate, resolution, trimBack, trimFront]);

  const [output, setOutput] = useState<ReturnType<typeof generateOutput>>(generateOutput());
  const delayRef = useRef() as MutableRefObject<ReturnType<typeof setTimeout> | undefined>;

  const queueNextPeriod = useCallback(() => {
    const now = new Date();
    delayRef.current = setTimeout(() => {
      setOutput(generateOutput());
      queueNextPeriod();
    }, differenceInMilliseconds(now, add[resolution](now, 1)));
  }, [resolution, setOutput, generateOutput, delayRef]);

  useEffect(() => {
    queueNextPeriod();
    return () => clearTimeout(delayRef.current as Parameters<typeof clearTimeout>[0]);
  }, [queueNextPeriod, delayRef]);

  return output;
}) as UseDateCountdown;

export default useDateCountdown;
