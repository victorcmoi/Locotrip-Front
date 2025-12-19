import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import fr from 'dayjs/locale/fr';
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from 'dayjs/plugin/isToday'
import weekday from 'dayjs/plugin/weekday'
import isBetween from 'dayjs/plugin/isBetween';

dayjs.locale(fr);
dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(weekday);
dayjs.extend(isBetween)

export default dayjs.utc;
