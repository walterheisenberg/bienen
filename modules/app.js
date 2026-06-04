// app.js

document.addEventListener("DOMContentLoaded", () => {
    // Version setzen
    const versionTag = document.getElementById("versionTag");
    if (versionTag && typeof Version !== "undefined") {
        versionTag.textContent = "v" + Version;
    }

    // Abhängigkeiten prüfen
    if (typeof validateDependencies === "function") {
        const ok = validateDependencies();
        if (!ok) return;
    }

    // DOM initialisieren
    if (typeof cacheDOMElements === "function") {
        cacheDOMElements();
    }

    // Schedule Types laden
    if (typeof populateScheduleTypes === "function") {
        populateScheduleTypes();
    }

    // Wheel initialisieren
    if (typeof initWheel === "function") {
        initWheel();
    }

    // Restore State
    if (typeof restoreFormState === "function") {
        restoreFormState();
    }

    // Testwerte (optional)
    if (typeof setTestValues === "function") {
        setTestValues();
    }
});
