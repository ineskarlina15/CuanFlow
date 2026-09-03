package com.example.finance_service.utility;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import com.example.finance_service.entity.Transaction;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Component
public class ExportUtility {

    public ByteArrayInputStream exportTransactionsToExcel(List<Transaction> transactions) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream();) {
            Sheet sheet = workbook.createSheet("Transaksi");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            Font font = workbook.createFont();
            font.setColor(IndexedColors.WHITE.getIndex());
            font.setBold(true);
            headerStyle.setFont(font);

            // Row for Header
            Row headerRow = sheet.createRow(0);
            String[] headers = { "ID", "Tanggal", "Judul", "Tipe", "Kategori", "Nominal", "Metode Pembayaran", "Deskripsi" };
            
            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerStyle);
            }

            // Data Style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            int rowIdx = 1;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(t.getId() != null ? String.valueOf(t.getId()) : "");
                row.createCell(1).setCellValue(t.getTransactionDate() != null ? t.getTransactionDate().toString() : "");
                row.createCell(2).setCellValue(t.getTitle() != null ? t.getTitle() : "");
                row.createCell(3).setCellValue(t.getType() != null ? t.getType().name() : "");
                
                String catName = (t.getCategory() != null && t.getCategory().getName() != null) ? t.getCategory().getName() : "";
                row.createCell(4).setCellValue(catName);
                
                row.createCell(5).setCellValue(t.getAmount() != null ? t.getAmount().doubleValue() : 0.0);
                row.createCell(6).setCellValue(t.getPaymentMethod() != null ? t.getPaymentMethod().name() : "");
                row.createCell(7).setCellValue(t.getDescription() != null ? t.getDescription() : "");

                for (int i = 0; i < headers.length; i++) {
                    row.getCell(i).setCellStyle(dataStyle);
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Gagal meng-export data ke Excel: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportTransactionsToPdf(List<Transaction> transactions) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Laporan Transaksi Keuangan", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Table
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 2, 3, 2, 3, 3, 3, 4 });

            // Table Header
            com.lowagie.text.Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            headFont.setColor(java.awt.Color.WHITE);
            String[] headers = { "Tanggal", "Judul", "Tipe", "Kategori", "Nominal", "Metode", "Deskripsi" };
            for (String header : headers) {
                PdfPCell hcell = new PdfPCell(new Phrase(header, headFont));
                hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
                hcell.setBackgroundColor(new java.awt.Color(59, 130, 246)); // blue-500
                hcell.setPadding(5);
                table.addCell(hcell);
            }

            // Table Data
            for (Transaction t : transactions) {
                PdfPCell cell;
                
                cell = new PdfPCell(new Phrase(t.getTransactionDate() != null ? t.getTransactionDate().toString() : ""));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(t.getTitle() != null ? t.getTitle() : ""));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(t.getType() != null ? t.getType().name() : ""));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);

                String catName = (t.getCategory() != null && t.getCategory().getName() != null) ? t.getCategory().getName() : "";
                cell = new PdfPCell(new Phrase(catName));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(t.getAmount() != null ? "Rp " + t.getAmount().toString() : "0"));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(cell);
                
                cell = new PdfPCell(new Phrase(t.getPaymentMethod() != null ? t.getPaymentMethod().name() : ""));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(t.getDescription() != null ? t.getDescription() : ""));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                table.addCell(cell);
            }

            document.add(table);
            document.close();

        } catch (DocumentException ex) {
            throw new RuntimeException("Gagal meng-export data ke PDF: " + ex.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
