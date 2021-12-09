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

export default {
    format(date: Date): string {
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
