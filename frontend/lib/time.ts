const TIME_UNITS = [
    { unit: 'year', ms: 31536000000 },
    { unit: 'month', ms: 2592000000 },
    { unit: 'week', ms: 604800000 },
    { unit: 'day', ms: 86400000 },
    { unit: 'hour', ms: 3600000 },
    { unit: 'minute', ms: 60000 },
    { unit: 'second', ms: 1000 }
];

type FormatOptions = {
    addSuffix?: boolean;
};

export function formatDistanceToNow(dateInput: Date | string, options: FormatOptions = {}): string {
    // Convert string to Date if necessary
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date provided');
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const absDiff = Math.abs(diff);

    if (diff < 0) {
        return 'in the future';
    }

    // Find the appropriate time unit
    const unit = TIME_UNITS.find(unit => absDiff >= unit.ms) || TIME_UNITS[TIME_UNITS.length - 1];
    const value = Math.floor(absDiff / unit.ms);

    const plural = value !== 1 ? 's' : '';
    const timeString = `${value} ${unit.unit}${plural}`;

    // Add suffix if requested
    return options.addSuffix ? `${timeString} ago` : timeString;
}
