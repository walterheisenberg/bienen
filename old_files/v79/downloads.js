/* ===== DOWNLOAD FUNKTIONEN v0.78 ===== */

/* ===== EMOJI HELPER ===== */
function getScheduleEmoji() {
    const scheduleType = DOM.scheduleType.value;
    return window.emojiMap && window.emojiMap[scheduleType] ? window.emojiMap[scheduleType] + ' ' : '';
}

/* ===== ICS DOWNLOAD ===== */
function downloadICS() {
  // ===== DEBUG START =====
    console.log('=== ICS DOWNLOAD DEBUG ===');
    console.log('1. window.reminderStates:', window.reminderStates);
    console.log('2. typeof window.reminderStates:', typeof window.reminderStates);
    
    const reminders = getSelectedReminders();
    console.log('3. getSelectedReminders() Ergebnis:', reminders);
    console.log('4. reminders.length:', reminders.length);
    // ===== DEBUG ENDE =====
  
    const prefix = DOM.prefix.value.trim();
    
    let icsContent = "BEGIN:VCALENDAR\r\n";
    icsContent += "VERSION:2.0\r\n";
    icsContent += "PRODID:-//Kalender Generator Bienen//DE\r\n";
    icsContent += "CALSCALE:GREGORIAN\r\n";
    icsContent += "METHOD:PUBLISH\r\n";

    const checkboxes = DOM.scheduleList.querySelectorAll('.checkbox');
    
    scheduleData.forEach((item, index) => {
        if (checkboxes[index] && checkboxes[index].checked) {
            const uid = `${formatDateISO(item.taskDate)}-${index}@kalender-generator-bienen.de`;
            const summary = item.task;
      const emoji = getScheduleEmoji();
const description = prefix ? `${emoji}${prefix} - ${item.task}` : `${emoji}${item.task}`;
      
   icsContent += "BEGIN:VEVENT\r\n";
     icsContent += "UID:" + uid + "\r\n";
            icsContent += "DTSTAMP:" + formatDateISO(new Date()) + "T120000Z\r\n";
            icsContent += "DTSTART;VALUE=DATE:" + formatDateISO(item.taskDate) + "\r\n";
            icsContent += "SUMMARY:" + summary + "\r\n";
            icsContent += "DESCRIPTION:" + description + "\r\n";

      // VALARM direkt NACH DESCRIPTION einfügen (vor END:VEVENT)
    const alarms = createICSAlarms(reminders, prefix);
  icsContent += alarms;
      
            icsContent += "END:VEVENT\r\n";
        }
    });

    icsContent += "END:VCALENDAR\r\n";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadFileName + '.ics';
    link.click();
}

function getSelectedReminders() {
    // Erinnerungen aus globaler Variable holen (nicht aus DOM!)
  const reminders = [];
    if (window.reminderStates) {
      const labels = ['-PT1H', '-PT3H', '-P1D', '-P2D', '-P1W'];
        window.reminderStates.forEach((checked, index) => {
   if (checked) reminders.push(labels[index]);
      });
    }
  return reminders;
}

function createICSAlarms(reminders, prefix) {
    if (reminders.length === 0) return '';
    
    const emoji = getScheduleEmoji();
    const description = prefix ? `${emoji}${prefix} - Erinnerung` : `${emoji}Erinnerung`;
    
    return reminders.map(trigger => 
        "BEGIN:VALARM\r\n" +
        "ACTION:DISPLAY\r\n" +
        "DESCRIPTION:" + description + "\r\n" +
        "TRIGGER:" + trigger + "\r\n" +
  "END:VALARM\r\n"
    ).join('');
}

/* ===== PDF DOWNLOAD ===== */
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const checkboxes = DOM.scheduleList.querySelectorAll('.checkbox');
    const selectedTasks = scheduleData.filter((_, index) => 
        checkboxes[index] && checkboxes[index].checked
);

    if (selectedTasks.length === 0) {
 alert('Bitte wählen Sie mindestens einen Termin aus.');
        return;
    }

    doc.setFontSize(PDF_CONFIG.titleFontSize);
    doc.text(title, PDF_CONFIG.margin, PDF_CONFIG.margin);

    let yPosition = PDF_CONFIG.taskOffset;

    selectedTasks.forEach(item => {
        if (yPosition > PDF_CONFIG.pageHeight - PDF_CONFIG.margin) {
    doc.addPage();
  yPosition = PDF_CONFIG.margin;
   }

        doc.setFontSize(PDF_CONFIG.textFontSize);
      doc.setFont(undefined, 'bold');
    doc.text(item.dateFormatted, PDF_CONFIG.margin, yPosition);
        yPosition += PDF_CONFIG.lineSpacing;

        doc.setFont(undefined, 'normal');
    const taskLines = doc.splitTextToSize(
     item.task, 
      doc.internal.pageSize.width - 2 * PDF_CONFIG.margin
);
    
        taskLines.forEach(line => {
if (yPosition > PDF_CONFIG.pageHeight - PDF_CONFIG.margin) {
doc.addPage();
  yPosition = PDF_CONFIG.margin;
            }
            doc.text(line, PDF_CONFIG.margin, yPosition);
 yPosition += PDF_CONFIG.lineSpacing;
 });

        if (item.additionalText) {
      doc.setFont(undefined, 'italic');
  const additionalLines = doc.splitTextToSize(
      item.additionalText, 
      doc.internal.pageSize.width - 2 * PDF_CONFIG.margin
     );
            
     additionalLines.forEach(line => {
        if (yPosition > PDF_CONFIG.pageHeight - PDF_CONFIG.margin) {
          doc.addPage();
          yPosition = PDF_CONFIG.margin;
    }
                doc.text(line, PDF_CONFIG.margin, yPosition);
     yPosition += PDF_CONFIG.lineSpacing;
            });
        }

        yPosition += PDF_CONFIG.lineSpacing * PDF_CONFIG.sectionSpacing;
    });

    doc.save(downloadFileName + '.pdf');
}
