// ui.js

/* =========================
 * UI CONTROLLER
 * ========================= */

window.DOM = window.DOM || {};

/* ===== DOM CACHE (falls noch nicht ausgelagert) ===== */
window.cacheDOMElements = function () {
    DOM.prefix = document.getElementById('prefix');
    DOM.scheduleType = document.getElementById('scheduleType');
    DOM.steps = document.getElementById('steps');
    DOM.startDate = document.getElementById('startDate');

    DOM.dateSelectionToggle = document.getElementById('dateSelectionToggle');
    DOM.calendarMode = document.getElementById('calendarMode');
    DOM.wheelMode = document.getElementById('wheelMode');
    DOM.btnCalendar = document.getElementById('btnCalendar');
    DOM.btnWheel = document.getElementById('btnWheel');

    DOM.previewSection = document.getElementById('previewSection');
    DOM.zeitplan = document.getElementById('zeitplan');

    DOM.zeitplanTitle = document.getElementById('zeitplanTitle');
    DOM.zeitplanTitle2 = document.getElementById('zeitplanTitle2');

    DOM.previewList = document.getElementById('previewList');
    DOM.scheduleList = document.getElementById('scheduleList');

    DOM.generalForm = document.getElementById('generalForm');

    DOM.noPrefixWarning = document.getElementById('noPrefixWarning');
    DOM.expertModeBtn = document.getElementById('expertModeBtn');
    DOM.expertModeHint = document.getElementById('expertModeHint');
    DOM.dateChangedWarning = document.getElementById('dateChangedWarning');
    DOM.reminderSection = document.getElementById('reminderSection');
};

/* =========================
 * FORM / STEPS
 * ========================= */

window.populateScheduleTypes = function () {
    if (!window.schedules) return;

    Object.keys(window.schedules).forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        DOM.scheduleType.appendChild(option);
    });
};

window.populateSteps = function () {
    const scheduleType = DOM.scheduleType.value;

    DOM.steps.innerHTML = '';
    DOM.steps.disabled = !scheduleType;

    if (!scheduleType) {
        DOM.steps.innerHTML = '<option value="">Bitte zuerst einen Typ wählen</option>';

        DOM.dateSelectionToggle.classList.add('hidden');
        DOM.calendarMode.classList.add('hidden');
        DOM.wheelMode.classList.add('hidden');

        DOM.previewSection.classList.add('hidden');
        DOM.zeitplan.classList.add('hidden');
        return;
    }

    window.schedules[scheduleType]
    .filter(item => item.selectable)
    .forEach(item => {
        const option = document.createElement('option');
        option.value = item.offset;
        option.textContent = item.task;
        DOM.steps.appendChild(option);
    });

    if (DOM.steps.options.length > 0) {
        DOM.steps.selectedIndex = 0;
        window.onStepSelected?.();
    }
};

window.onStepSelected = function () {
    if (!DOM.steps.value) return;

    DOM.dateSelectionToggle.classList.remove('hidden');

    // Default: Kalender
    DOM.calendarMode.classList.remove('hidden');
    DOM.wheelMode.classList.add('hidden');

    DOM.btnCalendar.classList.add('active');
    DOM.btnWheel.classList.remove('active');

    if (!DOM.startDate.value) {
        DOM.startDate.valueAsDate = new Date();
    }

    window.generateSchedule?.();
};

/* =========================
 * DATE MODE SWITCH
 * ========================= */

window.switchDateMode = function (mode) {
    if (mode === 'calendar') {
        DOM.calendarMode.classList.remove('hidden');
        DOM.wheelMode.classList.add('hidden');

        DOM.btnCalendar.classList.add('active');
        DOM.btnWheel.classList.remove('active');
    } else {
        DOM.calendarMode.classList.add('hidden');
        DOM.wheelMode.classList.remove('hidden');

        DOM.btnCalendar.classList.remove('active');
        DOM.btnWheel.classList.add('active');

        window.drawWheel?.();
        window.updateWheelCalculation?.();
    }

    window.generateSchedule?.();
};

/* =========================
 * LIST RENDERING
 * ========================= */

window.renderList = function (listId, scheduleData, withCheckboxes, taskCheckboxStates) {
    const isExpert = expertModeActive;
    const list = document.getElementById(listId);
    list.innerHTML = '';

    const isPreview = (listId === 'previewList');

    scheduleData.forEach((item, index) => {

        const li = document.createElement('li');

        // =========================
        // PREVIEW (EINFACHE LISTE)
        // =========================
        if (isPreview) {

            const date = document.createElement('strong');
            date.textContent = item.dateFormatted;

            const text = document.createElement('span');
            text.textContent = ' ' + item.task;

            li.appendChild(date);
            li.appendChild(text);

            list.appendChild(li);
            return;
        }

        // =========================
        // FINAL VIEW (CHECKBOX + BLOCK)
        // =========================

        const block = document.createElement('div');
        block.className = 'schedule-block';

        // ===== ZEILE 1: CHECKBOX + DATUM + TASK =====
        const main = document.createElement('div');
        main.className = 'schedule-main';

        if (withCheckboxes) {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'checkbox';
            cb.checked = taskCheckboxStates?.[index] || false;

            cb.addEventListener('change', () => {
                if (taskCheckboxStates) {
                    taskCheckboxStates[index] = cb.checked;
                }
            });

            main.appendChild(cb);
        }

        const strong = document.createElement('strong');
        strong.textContent = item.dateFormatted;

        if (expertModeActive) {
            strong.style.cursor = 'pointer';
            strong.onclick = () => makeDateEditable(strong, index);
        }

        const span = document.createElement('span');
        span.textContent = item.task;

        if (expertModeActive) {
            span.style.cursor = 'pointer';
            span.onclick = () => makeTaskEditable(span, index);
        }

        main.appendChild(strong);
        main.appendChild(span);

        block.appendChild(main);

        // ===== ZEILE 2: BESCHREIBUNG =====
        if (descriptionsVisible && item.additionalText) {

            const divider = document.createElement('div');
            divider.className = 'schedule-divider';

            const desc = document.createElement('div');
            desc.className = 'schedule-desc';
            desc.textContent = item.additionalText;

            if (expertModeActive) {
                desc.style.cursor = 'pointer';
                desc.onclick = () => makeDescriptionEditable(desc, index);
            }

            block.appendChild(divider);
            block.appendChild(desc);
        }

        li.appendChild(block);
        list.appendChild(li);
    });
};

/* =========================
 * PREFIX WARNING
 * ========================= */

window.updatePrefixWarning = function () {
    if (!DOM.noPrefixWarning) return;

    if (!DOM.prefix.value.trim()) {
        DOM.noPrefixWarning.classList.remove('hidden');
    } else {
        DOM.noPrefixWarning.classList.add('hidden');
    }
};

/* =========================
 * REMINDERS
 * ========================= */

window.updateReminderSectionVisibility = function (reminderStates, expertModeActive) {
    const section = DOM.reminderSection;
    if (!section) return;

    const hasActive = reminderStates?.some(Boolean);

    if (!hasActive && !expertModeActive) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
};
