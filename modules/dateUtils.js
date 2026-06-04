// ===== DATUM FORMATIERUNG (ohne Module, kompatibel mit deinem Setup) =====

window.WEEKDAYS = [
    "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"
];

window.MONTHS = [
    "Januar",
"Februar",
"März",
"April",
"Mai",
"Juni",
"Juli",
"August",
"September",
"Oktober",
"November",
"Dezember"
];

window.formatDateLong = function(date) {
    const dayName = window.WEEKDAYS[date.getDay()];
    const day = date.getDate();
    const monthName = window.MONTHS[date.getMonth()];

    return `${dayName} ${day}. ${monthName}:`;
};

window.formatDateShort = function(date) {
    const dayName = window.WEEKDAYS[date.getDay()];
    return date.toLocaleDateString('de-DE') + " (" + dayName + ")";
};

window.formatDateISO = function(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
};
