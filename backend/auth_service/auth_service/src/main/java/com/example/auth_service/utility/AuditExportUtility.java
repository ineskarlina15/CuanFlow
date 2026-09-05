package com.example.auth_service.utility;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import com.example.auth_service.entity.AuditLog;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Component
public class AuditExportUtility {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    /**
     * Ekspor Laporan Log Audit ke format Microsoft Excel (.xlsx)
     * Desain tabel akuntansi resmi dengan tata letak rapi, palet warna elegan, dan auto-size kolom.
     */
    public ByteArrayInputStream exportAuditLogsToExcel(List<AuditLog> logs) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Audit Trail Log");
            sheet.setDisplayGridlines(true);

            // Setup Fonts
            XSSFFont titleFont = (XSSFFont) workbook.createFont();
            titleFont.setFontName("Segoe UI");
            titleFont.setFontHeightInPoints((short) 14);
            titleFont.setBold(true);
            titleFont.setColor(new XSSFColor(new Color(15, 23, 42), new DefaultIndexedColorMap())); // Slate 900

            XSSFFont subtitleFont = (XSSFFont) workbook.createFont();
            subtitleFont.setFontName("Segoe UI");
            subtitleFont.setFontHeightInPoints((short) 10);
            subtitleFont.setColor(new XSSFColor(new Color(100, 116, 139), new DefaultIndexedColorMap())); // Slate 500

            XSSFFont headerFont = (XSSFFont) workbook.createFont();
            headerFont.setFontName("Segoe UI");
            headerFont.setFontHeightInPoints((short) 10);
            headerFont.setBold(true);
            headerFont.setColor(new XSSFColor(Color.WHITE, new DefaultIndexedColorMap()));

            XSSFFont bodyFont = (XSSFFont) workbook.createFont();
            bodyFont.setFontName("Segoe UI");
            bodyFont.setFontHeightInPoints((short) 9);

            XSSFFont boldBodyFont = (XSSFFont) workbook.createFont();
            boldBodyFont.setFontName("Segoe UI");
            boldBodyFont.setFontHeightInPoints((short) 9);
            boldBodyFont.setBold(true);

            // Setup Styles
            XSSFCellStyle headerStyle = (XSSFCellStyle) workbook.createCellStyle();
            headerStyle.setFillForegroundColor(new XSSFColor(new Color(30, 41, 59), new DefaultIndexedColorMap())); // Navy Dark Slate 800
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.MEDIUM);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            XSSFCellStyle regularStyle = (XSSFCellStyle) workbook.createCellStyle();
            regularStyle.setFont(bodyFont);
            regularStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            regularStyle.setBorderTop(BorderStyle.THIN);
            regularStyle.setBorderBottom(BorderStyle.THIN);
            regularStyle.setBorderLeft(BorderStyle.THIN);
            regularStyle.setBorderRight(BorderStyle.THIN);

            XSSFCellStyle centerStyle = (XSSFCellStyle) workbook.createCellStyle();
            centerStyle.cloneStyleFrom(regularStyle);
            centerStyle.setAlignment(HorizontalAlignment.CENTER);

            XSSFCellStyle zebraStyle = (XSSFCellStyle) workbook.createCellStyle();
            zebraStyle.cloneStyleFrom(regularStyle);
            zebraStyle.setFillForegroundColor(new XSSFColor(new Color(248, 250, 252), new DefaultIndexedColorMap())); // Slate 50
            zebraStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            XSSFCellStyle zebraCenterStyle = (XSSFCellStyle) workbook.createCellStyle();
            zebraCenterStyle.cloneStyleFrom(centerStyle);
            zebraCenterStyle.setFillForegroundColor(new XSSFColor(new Color(248, 250, 252), new DefaultIndexedColorMap()));
            zebraCenterStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Row 0 - Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("CUANFLOW — SISTEM INFORMASI AKUNTANSI & MANAJEMEN KEUANGAN");
            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            // Row 1 - Subtitle
            Row subRow = sheet.createRow(1);
            Cell subCell = subRow.createCell(0);
            subCell.setCellValue("LAPORAN RESMI REKAM JEJAK AUDIT SISTEM (AUDIT TRAIL LOG)");
            CellStyle subStyle = workbook.createCellStyle();
            subStyle.setFont(subtitleFont);
            subCell.setCellStyle(subStyle);

            // Row 2 - Metadata
            Row metaRow = sheet.createRow(2);
            Cell metaCell = metaRow.createCell(0);
            String printedAt = LocalDateTime.now().format(TIME_FMT);
            metaCell.setCellValue("Waktu Cetak: " + printedAt + " WIB | Auditor: Administrator Sistem | Kerangka Kerja: COSO Internal Control");
            metaCell.setCellStyle(subStyle);

            // Row 4 - Table Headers
            String[] headers = {
                    "No", "ID Log", "Waktu (WIB)", "User ID", "Modul Sistem",
                    "Aksi / Tindakan", "Entitas Target", "Keterangan Aktivitas",
                    "Alamat IP", "Status Operasi", "Tingkat Risiko"
            };

            Row headerRow = sheet.createRow(4);
            headerRow.setHeightInPoints(26);
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 5;
            int counter = 1;
            for (AuditLog l : logs) {
                Row r = sheet.createRow(rowIdx);
                r.setHeightInPoints(20);
                boolean isZebra = (counter % 2 == 0);
                CellStyle curRegular = isZebra ? zebraStyle : regularStyle;
                CellStyle curCenter = isZebra ? zebraCenterStyle : centerStyle;

                // 0: No
                Cell c0 = r.createCell(0);
                c0.setCellValue(counter++);
                c0.setCellStyle(curCenter);

                // 1: ID Log
                Cell c1 = r.createCell(1);
                c1.setCellValue("LOG-" + String.format("%04d", l.getId() != null ? l.getId() : 0));
                c1.setCellStyle(curCenter);

                // 2: Waktu
                Cell c2 = r.createCell(2);
                c2.setCellValue(l.getCreatedAt() != null ? l.getCreatedAt().format(TIME_FMT) : "-");
                c2.setCellStyle(curCenter);

                // 3: User ID
                Cell c3 = r.createCell(3);
                c3.setCellValue(l.getUserId() != null ? "User #" + l.getUserId() : "Sistem");
                c3.setCellStyle(curCenter);

                // 4: Modul
                Cell c4 = r.createCell(4);
                c4.setCellValue(l.getModule() != null ? l.getModule() : "-");
                c4.setCellStyle(curCenter);

                // 5: Aksi
                Cell c5 = r.createCell(5);
                c5.setCellValue(l.getAction() != null ? l.getAction() : "-");
                c5.setCellStyle(curCenter);

                // 6: Entitas
                Cell c6 = r.createCell(6);
                c6.setCellValue(l.getEntity() != null ? l.getEntity() : "-");
                c6.setCellStyle(curRegular);

                // 7: Keterangan
                Cell c7 = r.createCell(7);
                c7.setCellValue(l.getDescription() != null ? l.getDescription() : "-");
                c7.setCellStyle(curRegular);

                // 8: IP Address
                Cell c8 = r.createCell(8);
                c8.setCellValue(l.getIpAddress() != null ? l.getIpAddress() : "-");
                c8.setCellStyle(curCenter);

                // 9: Status
                Cell c9 = r.createCell(9);
                c9.setCellValue(l.getStatus() != null ? l.getStatus() : "SUCCESS");
                c9.setCellStyle(curCenter);

                // 10: Severity
                Cell c10 = r.createCell(10);
                c10.setCellValue(l.getSeverity() != null ? l.getSeverity() : "LOW");
                c10.setCellStyle(curCenter);

                rowIdx++;
            }

            // Auto-fit Column Widths with padding
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                int curWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.max(curWidth + 1200, 3200));
            }
            sheet.setColumnWidth(6, 6000); // Entitas Target
            sheet.setColumnWidth(7, 10000); // Keterangan Aktivitas

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat dokumen Excel Log Audit: " + e.getMessage(), e);
        }
    }

    /**
     * Ekspor Laporan Log Audit ke format Adobe PDF (Landscape A4)
     * Desain formal berstandar audit akuntansi COSO dengan header institusi, tabel rapi, dan footer.
     */
    public ByteArrayInputStream exportAuditLogsToPdf(List<AuditLog> logs) {
        Document document = new Document(PageSize.A4.rotate(), 25, 25, 30, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, new Color(15, 23, 42));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(37, 99, 235));
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(100, 116, 139));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, new Color(30, 41, 59));
            Font bodyBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, new Color(15, 23, 42));

            // Header Section
            Paragraph title = new Paragraph("CUANFLOW — SISTEM INFORMASI AKUNTANSI KEUANGAN PRIBADI", titleFont);
            title.setAlignment(Element.ALIGN_LEFT);
            document.add(title);

            Paragraph subtitle = new Paragraph("LAPORAN REKAM JEJAK AUDIT SISTEM (SYSTEM AUDIT TRAIL LOG)", subTitleFont);
            subtitle.setSpacingBefore(2);
            document.add(subtitle);

            String timeNow = LocalDateTime.now().format(TIME_FMT);
            Paragraph meta = new Paragraph("Waktu Cetak: " + timeNow + " WIB | Otoritas: Administrator Sistem | Kepatuhan: COSO Internal Control Framework | Total Entri: " + logs.size() + " Rekaman", metaFont);
            meta.setSpacingBefore(3);
            meta.setSpacingAfter(12);
            document.add(meta);

            // Table Setup (11 Columns)
            float[] columnWidths = { 25f, 50f, 65f, 45f, 75f, 75f, 100f, 160f, 65f, 50f, 45f };
            PdfPTable table = new PdfPTable(columnWidths);
            table.setWidthPercentage(100);

            // Header Cells
            String[] headers = {
                    "No", "ID Log", "Waktu", "User", "Modul",
                    "Aksi", "Entitas Target", "Keterangan Aktivitas", "Alamat IP", "Status", "Risiko"
            };

            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(30, 41, 59)); // Slate 800 Navy
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPaddingTop(5);
                cell.setPaddingBottom(5);
                table.addCell(cell);
            }

            // Data Cells
            int counter = 1;
            for (AuditLog l : logs) {
                boolean isZebra = (counter % 2 == 0);
                Color rowBg = isZebra ? new Color(248, 250, 252) : Color.WHITE;

                // 0: No
                addCell(table, String.valueOf(counter++), bodyFont, Element.ALIGN_CENTER, rowBg);

                // 1: ID Log
                addCell(table, "LOG-" + String.format("%04d", l.getId() != null ? l.getId() : 0), bodyBoldFont, Element.ALIGN_CENTER, rowBg);

                // 2: Waktu
                String dt = l.getCreatedAt() != null ? l.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yy HH:mm")) : "-";
                addCell(table, dt, bodyFont, Element.ALIGN_CENTER, rowBg);

                // 3: User ID
                String userStr = l.getUserId() != null ? "#" + l.getUserId() : "Sistem";
                addCell(table, userStr, bodyBoldFont, Element.ALIGN_CENTER, rowBg);

                // 4: Modul
                addCell(table, l.getModule() != null ? l.getModule() : "-", bodyFont, Element.ALIGN_CENTER, rowBg);

                // 5: Aksi
                addCell(table, l.getAction() != null ? l.getAction() : "-", bodyBoldFont, Element.ALIGN_CENTER, rowBg);

                // 6: Entitas
                addCell(table, l.getEntity() != null ? l.getEntity() : "-", bodyFont, Element.ALIGN_LEFT, rowBg);

                // 7: Keterangan
                addCell(table, l.getDescription() != null ? l.getDescription() : "-", bodyFont, Element.ALIGN_LEFT, rowBg);

                // 8: IP Address
                addCell(table, l.getIpAddress() != null ? l.getIpAddress() : "-", bodyFont, Element.ALIGN_CENTER, rowBg);

                // 9: Status
                String st = l.getStatus() != null ? l.getStatus() : "SUCCESS";
                Font statusFont = "FAILED".equalsIgnoreCase(st) 
                        ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, new Color(220, 38, 38))
                        : ("WARNING".equalsIgnoreCase(st)
                        ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, new Color(217, 119, 6))
                        : FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, new Color(16, 185, 129)));
                addCell(table, st, statusFont, Element.ALIGN_CENTER, rowBg);

                // 10: Severity
                String sev = l.getSeverity() != null ? l.getSeverity() : "LOW";
                Font sevFont = "HIGH".equalsIgnoreCase(sev) 
                        ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, new Color(220, 38, 38))
                        : ("MEDIUM".equalsIgnoreCase(sev)
                        ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, new Color(217, 119, 6))
                        : FontFactory.getFont(FontFactory.HELVETICA, 7.5f, new Color(71, 85, 105)));
                addCell(table, sev, sevFont, Element.ALIGN_CENTER, rowBg);
            }

            document.add(table);

            // Footer note
            Paragraph footer = new Paragraph(
                    "Dokumen ini diterbitkan secara otomatis oleh modul Tata Kelola Sistem CuanFlow sebagai bukti otentik jejak audit (Audit Trail) untuk keperluan audit internal & eksternal.",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, new Color(148, 163, 184))
            );
            footer.setSpacingBefore(12);
            document.add(footer);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat dokumen PDF Log Audit: " + e.getMessage(), e);
        }
    }

    private void addCell(PdfPTable table, String text, Font font, int alignment, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(bg);
        cell.setPaddingTop(4);
        cell.setPaddingBottom(4);
        cell.setPaddingLeft(3);
        cell.setPaddingRight(3);
        cell.setBorderColor(new Color(226, 232, 240)); // Slate 200 border
        table.addCell(cell);
    }
}
