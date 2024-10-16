import dayjs from "@/init/dayjs";

export function daysFromNow(days: number) {
  return dayjs().add(days, `d`).toDate();
}
