const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

enum DateType {
    SHORT_DATE_TIME = 'f',
    LONG_DATE_TIME = 'F',
    SHORT_DATE = 'd',
    LONG_DATE = 'D',
    SHORT_TIME = 't',
    LONG_TIME = 'T',
    RELATIVE_TIME = 'R',
}

/**
 * <t:1624855717> 		short date time: 	June 27, 2021 9:48 PM
 * <t:1624855717:f> 	short date time 	June 27, 2021 9:48 PM
 * <t:1624855717:F> 	long date time: 	Sunday, June 27, 2021 9:48 PM
 * <t:1624855717:d> 	short date: 		06/27/2021
 * <t:1624855717:D> 	long date: 		June 27, 2021
 * <t:1624855717:t> 	short time: 		9:48 PM
 * <t:1624855717:T> 	long time: 		9:48:37 PM
 * <t:1624855717:R> 	relative time: 		2 days ago
 */
export default {
    format(date: Date, format: DateType = DateType.RELATIVE_TIME): string {
        return `<t:${Math.floor(date.valueOf() / 1000)}:${format}>`;
    },
    format_legacy(date: Date): string {
        let dateSuffix = '';
        switch (date.getDate()) {
            case 1:
                dateSuffix = 'st';
                break;
            case 2:
                dateSuffix = 'nd';
                break;
            case 3:
                dateSuffix = 'rd';
                break;
            default:
                dateSuffix = 'th';
                break;
        }
        let hours: string | number = date.getHours();
        if (hours < 10) hours = `0${hours}`;
        let minutes: string | number = date.getMinutes();
        if (minutes < 10) minutes = `0${minutes}`;
        let seconds: string | number = date.getSeconds();
        if (seconds < 10) seconds = `0${seconds}`;

        const timezoneOffset = date.getTimezoneOffset();
        let timezoneOffsetString = '';
        if (timezoneOffset < 0) timezoneOffsetString += '+';
        else if (timezoneOffset > 0) timezoneOffsetString += '-';
        let timezoneOffsetHours: string | number = Math.floor(
            Math.abs(date.getTimezoneOffset()) / 60
        );
        if (timezoneOffsetHours < 10)
            timezoneOffsetHours = `0${timezoneOffsetHours}`;
        let timezoneOffsetMinutes: string | number =
            Math.abs(date.getTimezoneOffset()) % 60;
        if (timezoneOffsetMinutes < 10)
            timezoneOffsetMinutes = `0${timezoneOffsetMinutes}`;
        timezoneOffsetString += `${timezoneOffsetHours}:${timezoneOffsetMinutes}`;

        return `${weekdays[date.getDay()]}, ${
            months[date.getMonth()]
        } ${date.getDate()}${dateSuffix} ${date.getFullYear()} @ ${hours}:${minutes}:${seconds} (UTC${timezoneOffsetString})`;
    },
};
