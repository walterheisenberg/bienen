// ===== ZEITPLAN BERECHNUNG =====

window.createScheduleData = function(
    scheduleType,
    startDate,
    selectedStep
) {

    if (!window.schedules || !window.schedules[scheduleType]) {
        console.error("❌ schedules nicht gefunden oder ungültiger Typ:", scheduleType);
        return [];
    }

    const baseDate = new Date(startDate);

    baseDate.setDate(
        baseDate.getDate() - selectedStep
    );

    return window.schedules[scheduleType].map(item => {

        const taskDate = new Date(baseDate);

        taskDate.setDate(
            taskDate.getDate() + item.offset
        );

        return {
            taskDate,
            task: item.task,
            additionalText: item.additionalText || "",
            dateFormatted: window.formatDateLong(taskDate),
                                              dateShort: window.formatDateShort(taskDate)
        };
    });
};
