package com.example.finance_service.utility;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import com.example.finance_service.entity.PaymentMethod;
import com.example.finance_service.entity.Transaction;
import com.example.finance_service.entity.TransactionType;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Component
public class ExportUtility {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yy");
    private static final DateTimeFormatter MONTH_YEAR_FMT = DateTimeFormatter.ofPattern("MMMM yyyy", new Locale("id", "ID"));
    private static final DateTimeFormatter SIDE_MONTH_FMT = DateTimeFormatter.ofPattern("MMM-yy", Locale.US);

    private String formatRupiah(BigDecimal amount) {
        if (amount == null) return "Rp0";
        long val = amount.longValue();
        if (val < 0) {
            return String.format(Locale.US, "-Rp%,d", Math.abs(val));
        } else {
            return String.format(Locale.US, "Rp%,d", val);
        }
    }

    private List<Transaction> getSortedTransactions(List<Transaction> transactions) {
        List<Transaction> sorted = new ArrayList<>(transactions != null ? transactions : Collections.emptyList());
        sorted.sort(Comparator.comparing(Transaction::getTransactionDate, Comparator.nullsLast(Comparator.naturalOrder()))
                              .thenComparing(Transaction::getId, Comparator.nullsLast(Comparator.naturalOrder())));
        return sorted;
    }

    private String determinePeriodeLabel(List<Transaction> sorted) {
        if (sorted.isEmpty()) {
            return LocalDate.now().format(MONTH_YEAR_FMT);
        }
        LocalDate minDate = sorted.get(0).getTransactionDate();
        LocalDate maxDate = sorted.get(sorted.size() - 1).getTransactionDate();
        if (minDate == null) minDate = LocalDate.now();
        if (maxDate == null) maxDate = minDate;

        if (minDate.getYear() == maxDate.getYear() && minDate.getMonth() == maxDate.getMonth()) {
            return minDate.format(MONTH_YEAR_FMT);
        } else {
            return minDate.format(MONTH_YEAR_FMT) + " - " + maxDate.format(MONTH_YEAR_FMT);
        }
    }

    private String determineYearLabel(List<Transaction> sorted) {
        if (sorted.isEmpty()) {
            return String.valueOf(LocalDate.now().getYear());
        }
        int minYear = sorted.stream().map(t -> t.getTransactionDate() != null ? t.getTransactionDate().getYear() : LocalDate.now().getYear()).min(Integer::compare).orElse(LocalDate.now().getYear());
        int maxYear = sorted.stream().map(t -> t.getTransactionDate() != null ? t.getTransactionDate().getYear() : LocalDate.now().getYear()).max(Integer::compare).orElse(LocalDate.now().getYear());
        if (minYear == maxYear) {
            return String.valueOf(minYear);
        }
        return minYear + " - " + maxYear;
    }

    private List<String> generateSideMonthsList(List<Transaction> sorted) {
        YearMonth start;
        YearMonth end;
        if (sorted.isEmpty()) {
            start = YearMonth.now().minusMonths(6);
            end = YearMonth.now().plusMonths(5);
        } else {
            LocalDate first = sorted.get(0).getTransactionDate();
            LocalDate last = sorted.get(sorted.size() - 1).getTransactionDate();
            start = first != null ? YearMonth.from(first).minusMonths(1) : YearMonth.now().minusMonths(6);
            end = last != null ? YearMonth.from(last).plusMonths(6) : YearMonth.now().plusMonths(6);
        }

        List<String> months = new ArrayList<>();
        YearMonth cur = start;
        int count = 0;
        while (!cur.isAfter(end) && count < 24) {
            months.add(cur.format(SIDE_MONTH_FMT));
            cur = cur.plusMonths(1);
            count++;
        }
        return months;
    }

    // =========================================================================
    // EXPORT TO EXCEL
    // =========================================================================
    public ByteArrayInputStream exportTransactionsToExcel(List<Transaction> transactions) {
        List<Transaction> sorted = getSortedTransactions(transactions);
        String yearLabel = determineYearLabel(sorted);
        String periodeLabel = determinePeriodeLabel(sorted);
        List<String> sideMonths = generateSideMonthsList(sorted);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Laporan Keuangan Pribadi");
            DefaultIndexedColorMap colorMap = new DefaultIndexedColorMap();

            // Colors
            XSSFColor softBlue = new XSSFColor(new Color(180, 198, 231), colorMap); // #B4C6E7
            XSSFColor softGreen = new XSSFColor(new Color(198, 239, 206), colorMap); // #C6EFCE
            XSSFColor accentGreen = new XSSFColor(new Color(146, 208, 80), colorMap); // #92D050
            XSSFColor softRed = new XSSFColor(new Color(252, 228, 214), colorMap); // #FCE4D6
            XSSFColor darkRedFont = new XSSFColor(new Color(192, 0, 0), colorMap); // #C00000

            // Font definitions
            XSSFFont titleFont = ((XSSFWorkbook) workbook).createFont();
            titleFont.setFontName("Calibri");
            titleFont.setFontHeightInPoints((short) 13);
            titleFont.setBold(true);

            XSSFFont boldFont = ((XSSFWorkbook) workbook).createFont();
            boldFont.setFontName("Calibri");
            boldFont.setFontHeightInPoints((short) 10);
            boldFont.setBold(true);

            XSSFFont regularFont = ((XSSFWorkbook) workbook).createFont();
            regularFont.setFontName("Calibri");
            regularFont.setFontHeightInPoints((short) 10);

            XSSFFont redRegularFont = ((XSSFWorkbook) workbook).createFont();
            redRegularFont.setFontName("Calibri");
            redRegularFont.setFontHeightInPoints((short) 10);
            redRegularFont.setColor(darkRedFont);

            XSSFFont italicFont = ((XSSFWorkbook) workbook).createFont();
            italicFont.setFontName("Calibri");
            italicFont.setFontHeightInPoints((short) 10);
            italicFont.setItalic(true);

            // Cell Styles
            // Header (Soft Blue)
            XSSFCellStyle headerStyle = ((XSSFWorkbook) workbook).createCellStyle();
            headerStyle.setFillForegroundColor(softBlue);
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(boldFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(headerStyle);

            // Data General
            XSSFCellStyle centerDataStyle = ((XSSFWorkbook) workbook).createCellStyle();
            centerDataStyle.setFont(regularFont);
            centerDataStyle.setAlignment(HorizontalAlignment.CENTER);
            centerDataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(centerDataStyle);

            XSSFCellStyle leftDataStyle = ((XSSFWorkbook) workbook).createCellStyle();
            leftDataStyle.setFont(regularFont);
            leftDataStyle.setAlignment(HorizontalAlignment.LEFT);
            leftDataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(leftDataStyle);

            XSSFCellStyle rightDataStyle = ((XSSFWorkbook) workbook).createCellStyle();
            rightDataStyle.setFont(regularFont);
            rightDataStyle.setAlignment(HorizontalAlignment.RIGHT);
            rightDataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(rightDataStyle);

            // Income (Soft Green Fill)
            XSSFCellStyle incomeDataStyle = ((XSSFWorkbook) workbook).createCellStyle();
            incomeDataStyle.setFillForegroundColor(softGreen);
            incomeDataStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            incomeDataStyle.setFont(boldFont);
            incomeDataStyle.setAlignment(HorizontalAlignment.RIGHT);
            incomeDataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(incomeDataStyle);

            // Negative Balance (Soft Red Fill + Red Font)
            XSSFCellStyle negativeBalanceStyle = ((XSSFWorkbook) workbook).createCellStyle();
            negativeBalanceStyle.setFillForegroundColor(softRed);
            negativeBalanceStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            negativeBalanceStyle.setFont(redRegularFont);
            negativeBalanceStyle.setAlignment(HorizontalAlignment.RIGHT);
            negativeBalanceStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(negativeBalanceStyle);

            // Total Row Style (Accent Green Fill + Bold)
            XSSFCellStyle totalStyle = ((XSSFWorkbook) workbook).createCellStyle();
            totalStyle.setFillForegroundColor(accentGreen);
            totalStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            totalStyle.setFont(boldFont);
            totalStyle.setAlignment(HorizontalAlignment.RIGHT);
            totalStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(totalStyle);

            XSSFCellStyle totalLabelStyle = ((XSSFWorkbook) workbook).createCellStyle();
            totalLabelStyle.setFillForegroundColor(accentGreen);
            totalLabelStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            totalLabelStyle.setFont(boldFont);
            totalLabelStyle.setAlignment(HorizontalAlignment.CENTER);
            totalLabelStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setThinBorders(totalLabelStyle);

            // Title Rows
            Row r0 = sheet.createRow(1);
            Cell cTitle = r0.createCell(1);
            cTitle.setCellValue("LAPORAN KEUANGAN PRIBADI");
            XSSFCellStyle titleStyle = ((XSSFWorkbook) workbook).createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            cTitle.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 4));

            Row r1 = sheet.createRow(2);
            Cell cYear = r1.createCell(0);
            cYear.setCellValue(yearLabel);
            XSSFCellStyle yearStyle = ((XSSFWorkbook) workbook).createCellStyle();
            yearStyle.setFont(boldFont);
            yearStyle.setAlignment(HorizontalAlignment.CENTER);
            cYear.setCellStyle(yearStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 4));

            Row r3 = sheet.createRow(4);
            Cell cPeriode = r3.createCell(0);
            cPeriode.setCellValue("Periode: " + periodeLabel);
            XSSFCellStyle periodeStyle = ((XSSFWorkbook) workbook).createCellStyle();
            periodeStyle.setFont(italicFont);
            cPeriode.setCellStyle(periodeStyle);

            // Table Headers (Row 5)
            Row hRow = sheet.createRow(5);
            String[] headers = { "Tanggal", "Deskripsi", "Uang Masuk", "Uang Keluar", "Saldo Akhir" };
            for (int col = 0; col < headers.length; col++) {
                Cell c = hRow.createCell(col);
                c.setCellValue(headers[col]);
                c.setCellStyle(headerStyle);
            }

            // Side Table Header (Column 6 / G)
            Cell cSideH = hRow.createCell(6);
            cSideH.setCellValue("Bulan");
            cSideH.setCellStyle(headerStyle);

            // Populate Main Table & Side Table
            BigDecimal runningBalance = BigDecimal.ZERO;
            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;
            BigDecimal cashExpense = BigDecimal.ZERO;

            int startRow = 6;
            int maxRows = Math.max(sorted.size(), sideMonths.size());

            for (int i = 0; i < maxRows; i++) {
                Row row = sheet.createRow(startRow + i);

                // Main Table Columns (0..4)
                if (i < sorted.size()) {
                    Transaction t = sorted.get(i);
                    boolean isIncome = t.getType() == TransactionType.INCOME;
                    BigDecimal amt = t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO;

                    if (isIncome) {
                        totalIncome = totalIncome.add(amt);
                        runningBalance = runningBalance.add(amt);
                    } else {
                        totalExpense = totalExpense.add(amt);
                        runningBalance = runningBalance.subtract(amt);
                        if (t.getPaymentMethod() == PaymentMethod.CASH) {
                            cashExpense = cashExpense.add(amt);
                        }
                    }

                    // Col 0: Tanggal
                    Cell cDate = row.createCell(0);
                    cDate.setCellValue(t.getTransactionDate() != null ? t.getTransactionDate().format(DATE_FMT) : "");
                    cDate.setCellStyle(centerDataStyle);

                    // Col 1: Deskripsi
                    Cell cDesc = row.createCell(1);
                    cDesc.setCellValue(t.getTitle() != null ? t.getTitle() : "");
                    cDesc.setCellStyle(leftDataStyle);

                    // Col 2: Uang Masuk
                    Cell cIn = row.createCell(2);
                    if (isIncome) {
                        cIn.setCellValue(formatRupiah(amt));
                        cIn.setCellStyle(incomeDataStyle);
                    } else {
                        cIn.setCellValue("");
                        cIn.setCellStyle(rightDataStyle);
                    }

                    // Col 3: Uang Keluar
                    Cell cOut = row.createCell(3);
                    if (!isIncome) {
                        cOut.setCellValue(formatRupiah(amt));
                        cOut.setCellStyle(rightDataStyle);
                    } else {
                        cOut.setCellValue("");
                        cOut.setCellStyle(rightDataStyle);
                    }

                    // Col 4: Saldo Akhir
                    Cell cBal = row.createCell(4);
                    cBal.setCellValue(formatRupiah(runningBalance));
                    if (runningBalance.compareTo(BigDecimal.ZERO) < 0) {
                        cBal.setCellStyle(negativeBalanceStyle);
                    } else {
                        cBal.setCellStyle(rightDataStyle);
                    }
                } else if (i >= sorted.size() && sorted.size() > 0) {
                    // Empty cells with borders for alignment
                    for (int c = 0; c <= 4; c++) {
                        Cell emptyCell = row.createCell(c);
                        emptyCell.setCellValue("");
                        emptyCell.setCellStyle(rightDataStyle);
                    }
                }

                // Side Table (Col 6: Bulan)
                if (i < sideMonths.size()) {
                    Cell cMonth = row.createCell(6);
                    cMonth.setCellValue(sideMonths.get(i));
                    cMonth.setCellStyle(centerDataStyle);
                }
            }

            // TOTAL Row
            int totalRowIndex = startRow + sorted.size();
            Row totRow = sheet.getRow(totalRowIndex);
            if (totRow == null) {
                totRow = sheet.createRow(totalRowIndex);
            }

            Cell cTotLabel = totRow.createCell(0);
            cTotLabel.setCellValue("TOTAL");
            cTotLabel.setCellStyle(totalLabelStyle);

            Cell cTotEmpty = totRow.createCell(1);
            cTotEmpty.setCellValue("");
            cTotEmpty.setCellStyle(totalLabelStyle);

            Cell cTotIn = totRow.createCell(2);
            cTotIn.setCellValue(formatRupiah(totalIncome));
            cTotIn.setCellStyle(totalStyle);

            Cell cTotOut = totRow.createCell(3);
            cTotOut.setCellValue(formatRupiah(totalExpense));
            cTotOut.setCellStyle(totalStyle);

            Cell cTotBal = totRow.createCell(4);
            cTotBal.setCellValue(formatRupiah(runningBalance));
            cTotBal.setCellStyle(totalStyle);

            // Note below table
            int noteRowIndex = Math.max(totalRowIndex + 2, startRow + sideMonths.size() + 1);
            Row noteRow = sheet.createRow(noteRowIndex);
            Cell cNote = noteRow.createCell(1);
            BigDecimal cashShow = cashExpense.compareTo(BigDecimal.ZERO) > 0 ? cashExpense : totalExpense;
            cNote.setCellValue("Uang yang di ambil kes bulan " + periodeLabel + " " + formatRupiah(cashShow));
            XSSFCellStyle noteStyle = ((XSSFWorkbook) workbook).createCellStyle();
            noteStyle.setFont(boldFont);
            cNote.setCellStyle(noteStyle);

            // Column Widths
            sheet.setColumnWidth(0, 13 * 256);
            sheet.setColumnWidth(1, 30 * 256);
            sheet.setColumnWidth(2, 18 * 256);
            sheet.setColumnWidth(3, 18 * 256);
            sheet.setColumnWidth(4, 18 * 256);
            sheet.setColumnWidth(5, 4 * 256);  // spacer
            sheet.setColumnWidth(6, 14 * 256); // bulan side table

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Gagal meng-export data ke Excel: " + e.getMessage());
        }
    }

    private void setThinBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    // =========================================================================
    // EXPORT TO PDF
    // =========================================================================
    public ByteArrayInputStream exportTransactionsToPdf(List<Transaction> transactions) {
        List<Transaction> sorted = getSortedTransactions(transactions);
        String yearLabel = determineYearLabel(sorted);
        String periodeLabel = determinePeriodeLabel(sorted);
        List<String> sideMonths = generateSideMonthsList(sorted);

        Document document = new Document(PageSize.A4, 25, 25, 30, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Colors matching the photo
            Color softBlueColor = new Color(180, 198, 231); // #B4C6E7
            Color softGreenColor = new Color(198, 239, 206); // #C6EFCE
            Color accentGreenColor = new Color(146, 208, 80); // #92D050
            Color softRedColor = new Color(252, 228, 214); // #FCE4D6
            Color darkRedTextColor = new Color(192, 0, 0); // #C00000

            // Title
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.BLACK);
            Paragraph title = new Paragraph("LAPORAN KEUANGAN PRIBADI", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            com.lowagie.text.Font yearFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Paragraph yearPara = new Paragraph(yearLabel, yearFont);
            yearPara.setAlignment(Element.ALIGN_CENTER);
            yearPara.setSpacingAfter(15);
            document.add(yearPara);

            // Periode
            com.lowagie.text.Font periodeFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.DARK_GRAY);
            Paragraph periodePara = new Paragraph("Periode: " + periodeLabel, periodeFont);
            periodePara.setAlignment(Element.ALIGN_LEFT);
            periodePara.setSpacingAfter(6);
            document.add(periodePara);

            // Outer Master Table (Main Table on Left, Spacer, Bulan Table on Right)
            PdfPTable masterTable = new PdfPTable(3);
            masterTable.setWidthPercentage(100);
            masterTable.setWidths(new float[] { 83f, 2f, 15f });

            // ----------------------------------------------------
            // Main Table (5 columns)
            // ----------------------------------------------------
            PdfPTable mainTable = new PdfPTable(5);
            mainTable.setWidthPercentage(100);
            mainTable.setWidths(new float[] { 14f, 32f, 18f, 18f, 18f });

            com.lowagie.text.Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.BLACK);
            String[] headers = { "Tanggal", "Deskripsi", "Uang Masuk", "Uang Keluar", "Saldo Akhir" };
            for (String h : headers) {
                PdfPCell hcell = new PdfPCell(new Phrase(h, headFont));
                hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
                hcell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                hcell.setBackgroundColor(softBlueColor);
                hcell.setPadding(5);
                mainTable.addCell(hcell);
            }

            com.lowagie.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, Color.BLACK);
            com.lowagie.text.Font incomeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, Color.BLACK);
            com.lowagie.text.Font redFont = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, darkRedTextColor);

            BigDecimal runningBalance = BigDecimal.ZERO;
            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;
            BigDecimal cashExpense = BigDecimal.ZERO;

            for (Transaction t : sorted) {
                boolean isIncome = t.getType() == TransactionType.INCOME;
                BigDecimal amt = t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO;

                if (isIncome) {
                    totalIncome = totalIncome.add(amt);
                    runningBalance = runningBalance.add(amt);
                } else {
                    totalExpense = totalExpense.add(amt);
                    runningBalance = runningBalance.subtract(amt);
                    if (t.getPaymentMethod() == PaymentMethod.CASH) {
                        cashExpense = cashExpense.add(amt);
                    }
                }

                // Tanggal
                PdfPCell c0 = new PdfPCell(new Phrase(t.getTransactionDate() != null ? t.getTransactionDate().format(DATE_FMT) : "", dataFont));
                c0.setHorizontalAlignment(Element.ALIGN_CENTER);
                c0.setVerticalAlignment(Element.ALIGN_MIDDLE);
                c0.setPadding(4);
                mainTable.addCell(c0);

                // Deskripsi
                PdfPCell c1 = new PdfPCell(new Phrase(t.getTitle() != null ? t.getTitle() : "", dataFont));
                c1.setHorizontalAlignment(Element.ALIGN_LEFT);
                c1.setVerticalAlignment(Element.ALIGN_MIDDLE);
                c1.setPadding(4);
                mainTable.addCell(c1);

                // Uang Masuk
                PdfPCell c2 = new PdfPCell(new Phrase(isIncome ? formatRupiah(amt) : "", isIncome ? incomeFont : dataFont));
                c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
                c2.setVerticalAlignment(Element.ALIGN_MIDDLE);
                if (isIncome) {
                    c2.setBackgroundColor(softGreenColor);
                }
                c2.setPadding(4);
                mainTable.addCell(c2);

                // Uang Keluar
                PdfPCell c3 = new PdfPCell(new Phrase(!isIncome ? formatRupiah(amt) : "", dataFont));
                c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
                c3.setVerticalAlignment(Element.ALIGN_MIDDLE);
                c3.setPadding(4);
                mainTable.addCell(c3);

                // Saldo Akhir
                PdfPCell c4 = new PdfPCell(new Phrase(formatRupiah(runningBalance), runningBalance.compareTo(BigDecimal.ZERO) < 0 ? redFont : dataFont));
                c4.setHorizontalAlignment(Element.ALIGN_RIGHT);
                c4.setVerticalAlignment(Element.ALIGN_MIDDLE);
                if (runningBalance.compareTo(BigDecimal.ZERO) < 0) {
                    c4.setBackgroundColor(softRedColor);
                }
                c4.setPadding(4);
                mainTable.addCell(c4);
            }

            // TOTAL Row
            com.lowagie.text.Font totFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.BLACK);

            PdfPCell totCell0 = new PdfPCell(new Phrase("TOTAL", totFont));
            totCell0.setColspan(2);
            totCell0.setHorizontalAlignment(Element.ALIGN_CENTER);
            totCell0.setVerticalAlignment(Element.ALIGN_MIDDLE);
            totCell0.setBackgroundColor(accentGreenColor);
            totCell0.setPadding(5);
            mainTable.addCell(totCell0);

            PdfPCell totCellIn = new PdfPCell(new Phrase(formatRupiah(totalIncome), totFont));
            totCellIn.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totCellIn.setVerticalAlignment(Element.ALIGN_MIDDLE);
            totCellIn.setBackgroundColor(accentGreenColor);
            totCellIn.setPadding(5);
            mainTable.addCell(totCellIn);

            PdfPCell totCellOut = new PdfPCell(new Phrase(formatRupiah(totalExpense), totFont));
            totCellOut.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totCellOut.setVerticalAlignment(Element.ALIGN_MIDDLE);
            totCellOut.setBackgroundColor(accentGreenColor);
            totCellOut.setPadding(5);
            mainTable.addCell(totCellOut);

            PdfPCell totCellBal = new PdfPCell(new Phrase(formatRupiah(runningBalance), totFont));
            totCellBal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totCellBal.setVerticalAlignment(Element.ALIGN_MIDDLE);
            totCellBal.setBackgroundColor(accentGreenColor);
            totCellBal.setPadding(5);
            mainTable.addCell(totCellBal);

            // ----------------------------------------------------
            // Side Table (Bulan)
            // ----------------------------------------------------
            PdfPTable sideTable = new PdfPTable(1);
            sideTable.setWidthPercentage(100);

            PdfPCell sideH = new PdfPCell(new Phrase("Bulan", headFont));
            sideH.setHorizontalAlignment(Element.ALIGN_CENTER);
            sideH.setVerticalAlignment(Element.ALIGN_MIDDLE);
            sideH.setBackgroundColor(softBlueColor);
            sideH.setPadding(5);
            sideTable.addCell(sideH);

            com.lowagie.text.Font sideFont = FontFactory.getFont(FontFactory.HELVETICA, 7f, Color.BLACK);
            for (String mStr : sideMonths) {
                PdfPCell mCell = new PdfPCell(new Phrase(mStr, sideFont));
                mCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                mCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                mCell.setPadding(3);
                sideTable.addCell(mCell);
            }

            // Put Main Table, Spacer, and Side Table into Master Table
            PdfPCell leftContainer = new PdfPCell(mainTable);
            leftContainer.setBorder(PdfPCell.NO_BORDER);
            leftContainer.setPadding(0);
            masterTable.addCell(leftContainer);

            PdfPCell spacerCell = new PdfPCell();
            spacerCell.setBorder(PdfPCell.NO_BORDER);
            masterTable.addCell(spacerCell);

            PdfPCell rightContainer = new PdfPCell(sideTable);
            rightContainer.setBorder(PdfPCell.NO_BORDER);
            rightContainer.setPadding(0);
            masterTable.addCell(rightContainer);

            document.add(masterTable);

            // Note below table
            BigDecimal cashShow = cashExpense.compareTo(BigDecimal.ZERO) > 0 ? cashExpense : totalExpense;
            com.lowagie.text.Font noteFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, Color.BLACK);
            Paragraph notePara = new Paragraph("Uang yang di ambil kes bulan " + periodeLabel + " " + formatRupiah(cashShow), noteFont);
            notePara.setAlignment(Element.ALIGN_CENTER);
            notePara.setSpacingBefore(12);
            document.add(notePara);

            document.close();

        } catch (DocumentException ex) {
            throw new RuntimeException("Gagal meng-export data ke PDF: " + ex.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
