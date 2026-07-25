// Google Apps Script template for CM3105 Mutabaah Yaumiyah

export function getGoogleAppsScriptCode(): string {
  return `/**
 * GOOGLE APPS SCRIPT - MUTABAAH YAUMIYAH CM3105
 * -------------------------------------------------------------
 * Panduan Pemasangan:
 * 1. Buka Google Sheet Anda.
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'.
 * 3. Hapus kode lama dan tempel (paste) seluruh kode di bawah ini.
 * 4. Klik tombol 'Save' (ikon disket / Ctrl+S).
 * 5. Klik 'Deploy' > 'New deployment'.
 * 6. Pilih Jenis (Select type): 'Web app'.
 * 7. Pada 'Execute as': Pilih 'Me (email anda)'.
 * 8. Pada 'Who has access': Pilih 'Anyone' (Siapa saja).
 * 9. Klik 'Deploy', lalu 'Authorize access' dan izinkan.
 * 10. Salin 'Web App URL' yang dihasilkan, lalu tempelkan ke kolom
 *     'Google Sheet Webhook URL' pada aplikasi Mutabaah CM3105.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var entry = data.entry;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "Mutabaah CM3105";
    var sheet = ss.getSheetByName(sheetName);
    
    // Buat Sheet jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Header Kolom
      var headers = [
        "Tanggal",
        "ID Anggota",
        "Nama Anggota",
        "Tilawah (Lembar)",
        "Tilawah (Juz)",
        "Catatan Tilawah",
        "Qiyamulail",
        "Rakaat",
        "Jam Qiyamulail",
        "Catatan Evaluasi",
        "Waktu Update"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#dcfce7");
    }
    
    if (entry) {
      // Cek apakah data tanggal & memberId sudah ada untuk di-update
      var lastRow = sheet.getLastRow();
      var updated = false;
      
      if (lastRow > 1) {
        var range = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
        for (var i = 0; i < range.length; i++) {
          var rowDate = range[i][0];
          var rowMemberId = range[i][1];
          
          if (rowDate === entry.date && rowMemberId === entry.memberId) {
            var rowNum = i + 2;
            sheet.getRange(rowNum, 1, 1, 11).setValues([[
              entry.date,
              entry.memberId,
              entry.memberName,
              entry.tilawahSheets,
              entry.tilawahJuz,
              entry.tilawahNotes,
              entry.qiyamulailPerformed,
              entry.qiyamulailRakaat,
              entry.qiyamulailTime,
              entry.notes,
              new Date().toLocaleString("id-ID")
            ]]);
            updated = true;
            break;
          }
        }
      }
      
      if (!updated) {
        sheet.appendRow([
          entry.date,
          entry.memberId,
          entry.memberName,
          entry.tilawahSheets,
          entry.tilawahJuz,
          entry.tilawahNotes,
          entry.qiyamulailPerformed,
          entry.qiyamulailRakaat,
          entry.qiyamulailTime,
          entry.notes,
          new Date().toLocaleString("id-ID")
        ]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data berhasil disimpan di Google Sheet" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook Mutabaah CM3105 aktif!");
}
`;
}
