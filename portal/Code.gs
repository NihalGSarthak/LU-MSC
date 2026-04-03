/**
 * Google Apps Script for LU MSC Grievance & Suggestion Portal
 * Frontend: HTML5 with Tailwind CSS
 * Backend: Google Sheets + Gmail
 */

/**
 * Serves the HTML file 'Index.html' to the web
 * Configured with responsive viewport and unrestricted frame options
 * @return {HtmlOutput} Rendered HTML page
 */
function doGet() {
  // Request Drive permissions for future storage operations
  DriveApp.getFiles();
  
  return HtmlService.createTemplateFromFile('Index').evaluate()
      .setTitle("LU MSC Grievances Portal")
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Backend handler for form submissions
 * Processes grievance data and logs to Google Sheet
 * Optionally sends confirmation email to user
 * @param {Object} data - Form submission data from frontend
 * @return {string} Success/error message
 */
function saveResponse(data) {
  try {
    // Replace with your actual Sheet URL
    const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1uoweGtZUF3P-0rSuBOA6Z9cXEhbsY5qywnDiAtdkv2w/edit");
    const sheet = ss.getSheetByName("Responses");
    
    // Captures the verified Gmail of the student
    const email = Session.getActiveUser().getEmail(); 
    
    // Ensure 'area' is an array for the loop
    const selectedAreas = Array.isArray(data.area) ? data.area : [data.area];
    const results = [];

    // Loop through each selected area to create a unique row
    selectedAreas.forEach(val => {
      let topic = val.toUpperCase();
      let pShort = "", pDesc = "", pSol = "", pSug = "", pArea = "", pRes = "", pHos = "";

      // Logic to map the specific category data to the generic headers
      if (val === 'academic') {
        pShort = data.acad_short; pDesc = data.acad_long; pSol = data.acad_solution; pSug = data.acad_suggest;
      } else if (val === 'campus') {
        pShort = data.camp_short; pDesc = data.camp_long; pSol = data.camp_solution; pSug = data.camp_suggest;
      } else if (val === 'admin') {
        pShort = data.adm_short; pDesc = data.adm_long; pSol = data.adm_solution; pSug = data.adm_suggest;
      } else if (val === 'it') {
        pShort = data.it_short; pDesc = data.it_long; pSol = data.it_solution; pSug = data.it_suggest; pArea = data.it_areas;
      } else if (val === 'hostel') {
        pShort = data.hos_short; pDesc = data.hos_long; pSol = data.hos_solution; pSug = data.hos_suggest; pRes = data.is_resident; pHos = data.hostel_name;
      } else if (val === 'other') {
        pShort = data.oth_topic; pDesc = data.oth_long; pSol = data.oth_solution; pSug = data.oth_suggest;
      }

      // Headers: Timestamp, Email, Name, Roll No, Branch, Year, DOB, Topic, Short, Desc, Solution, Suggestion, Area, Resident, HostelName
      const row = [
        new Date(), 
        email, 
        data.studentName, 
        data.rollNo, 
        data.dept, 
        data.year, 
        data.dob,
        topic, 
        pShort, 
        pDesc, 
        pSol, 
        pSug, 
        pArea, 
        pRes, 
        pHos
      ];
      
      sheet.appendRow(row);
      results.push(row);
    });

    // Send confirmation email if user requested a copy
    if (data.sendCopy === "on" || data.sendCopy === "true" || data.sendCopy === true) {
      let emailBody = "Hello " + data.studentName + ",\n\nYour grievance has been submitted to Meritorious Students Council - LU and we will look into it as soon as possible. Summary of Grievances Submitted:\n";
      results.forEach(r => emailBody += "\nTopic: " + r[7] + "\nIssue: " + r[8]);
      
      // Send email (requires send_mail permission in appscript.json)
      MailApp.sendEmail(email, "Grievance Copy - MSC Portal", emailBody);
    }
    return "Response recorded successfully for " + email;
  } catch (e) {
    return "Backend Error: " + e.toString();
  }
}