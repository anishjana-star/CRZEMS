import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const convertNumberToWords = (amount) => {
    return "Rupees " + amount.toLocaleString() + " Only";
};

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Read Logo proactively to embed as Base64
const getLogoBase64 = () => {
    try {
        const logoPath = path.resolve(__dirname, '../../client/src/logo.svg');
        const logoBuffer = fs.readFileSync(logoPath);
        return `data:image/svg+xml;base64,${logoBuffer.toString('base64')}`;
    } catch (e) {
        console.warn('Logo not found for PDF generation', e);
        return '';
    }
};

const generateSalarySlipPdf = async ({ employee, payroll }) => {
    const logoBase64 = getLogoBase64();

    // CSS content from SalarySlipPrint.css
    const css = `
        @page { size: A4; margin: 0; }
        body { margin: 1cm; font-family: 'Times New Roman', serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
        .salary-slip-container { padding: 2rem 40px 40px 40px; background: white; width: 100%; max-width: 210mm; margin: 0 auto; box-sizing: border-box; }
        .company-header-top { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
        .header-logo-container { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 5px; }
        .company-logo { height: 50px; width: auto; }
        .company-name { margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .slip-header-info { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; width: 100%; }
        .header-left { text-align: left; font-size: 12px; font-weight: bold; line-height: 1.5; }
        .header-right { display: flex; align-items: center; }
        .payslip-box { border: 1px solid #000; padding: 5px 10px; font-weight: bold; font-size: 14px; background: #f8f8f8; white-space: nowrap; }
        .separator-line { border: 0; border-top: 1px solid #000; margin: 1rem 0 2rem 0; }
        .employee-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 40px; margin-bottom: 2rem; font-size: 14px; }
        .detail-row { display: flex; justify-content: space-between; }
        .label-bold { font-weight: bold; }
        .salary-table-container { margin-bottom: 0; }
        .salary-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 14px; }
        .salary-table th, .salary-table td { padding: 8px; border: 1px solid #000; }
        .salary-table th { background: #f0f0f0; text-align: center; }
        .salary-table th.text-left { text-align: left; }
        .salary-table th.text-right { text-align: right; }
        .salary-table td.text-right { text-align: right; }
        .total-row { font-weight: bold; background: #f0f0f0; }
        .footer-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25rem; } /* Adjusted margin for print */
        .director-sign-box { text-align: center; position: relative; width: 200px; }
        .stamp-container { position: absolute; top: -60px; left: 10px; opacity: 0.8; transform: rotate(-10deg); }
        .stamp-placeholder { width: 100px; height: 100px; border: 3px solid blue; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: blue; font-weight: bold; font-size: 10px; text-align: center; }
        .signature-space { margin-bottom: 5px; height: 50px; }
        .director-name { font-size: 14px; font-weight: bold; padding-bottom: 5px; border-bottom: 1px solid #000; }
        .director-title { font-size: 14px; font-weight: bold; padding-top: 5px; }
        .net-pay-box { border: 2px solid #000; padding: 15px; min-width: 300px; }
    `;

    const paidDate = new Date(payroll.paidAt || Date.now()).toLocaleDateString();
    // Helper to format currency
    const fmt = (n) => n.toLocaleString();

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>${css}</style>
    </head>
    <tbody>
        <div class="salary-slip-container">
            <!-- Top Header: Logo & Company Name -->
            <div class="company-header-top">
                <div class="header-logo-container">
                    <img src="${logoBase64}" alt="Company Logo" class="company-logo" />
                    <h1 class="company-name">
                        CRZ Academic Review Pvt Ltd
                    </h1>
                </div>
            </div>

            <!-- Info Strip: GSTIN & Payslip Box -->
            <div class="slip-header-info">
                <!-- Left: GSTIN & CIN -->
                <div class="header-left">
                    <div>GSTIN:--------</div>
                    <div>CIN: -----------</div>
                </div>

                <!-- Right: Payslip Box -->
                <div class="header-right">
                    <div class="payslip-box">
                        Payslip for ${monthNames[payroll.month - 1]} ${payroll.year}
                    </div>
                </div>
            </div>

            <hr class="separator-line" />

            <!-- Employee Details -->
            <div class="employee-details-grid">
                <div class="detail-row">
                    <span class="label-bold">Employee Name:</span>
                    <span>${employee.name}</span>
                </div>
                <div class="detail-row">
                    <span class="label-bold">Employee ID:</span>
                    <span>${employee._id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="label-bold">Designation:</span>
                    <span>${employee.designation || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="label-bold">Employee Type:</span>
                    <span>${employee.employeeType || 'Full Time'}</span>
                </div>
                <div class="detail-row">
                    <span class="label-bold">Payment Date:</span>
                    <span>${paidDate}</span>
                </div>
                <div class="detail-row">
                    <span class="label-bold">Bank Account:</span>
                    <span>XXXX-XXXX-XXXX</span>
                </div>
            </div>

            <!-- Salary Breakdown Table -->
            <div class="salary-table-container">
                <table class="salary-table">
                    <thead>
                        <tr>
                            <th class="text-left" style="width: 35%">Earnings</th>
                            <th class="text-right" style="width: 15%">Amount</th>
                            <th class="text-left" style="width: 35%">Deductions</th>
                            <th class="text-right" style="width: 15%">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Basic Salary</td>
                            <td class="text-right">₹${fmt(payroll.basicSalary)}</td>
                            <td>Tax / Provident Fund</td>
                            <td class="text-right">₹${fmt(payroll.deductions)}</td>
                        </tr>
                        <tr>
                            <td>Allowances (HRA, etc.)</td>
                            <td class="text-right">₹${fmt(payroll.allowances)}</td>
                            <td>Other Deductions</td>
                            <td class="text-right">₹0</td>
                        </tr>
                        <!-- Spacer Rows -->
                        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td>Total Earnings</td>
                            <td class="text-right">₹${fmt(payroll.basicSalary + payroll.allowances)}</td>
                            <td>Total Deductions</td>
                            <td class="text-right">₹${fmt(payroll.deductions)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- Footer Section: Net Pay & Signatures -->
            <div class="footer-section">

                <!-- Director Signature Section -->
                <div class="director-sign-box">
                    <!-- Stamp -->
                    <div class="stamp-container">
                        <div class="stamp-placeholder">
                            CollegeReviewZ<br />Stamp
                        </div>
                    </div>

                    <!-- Signature Placeholder -->
                    <div class="signature-space">
                        <div style="font-family: 'Cursive', serif; font-size: 20px; color: #000;">Krishna Kant Jha</div>
                    </div>

                    <div class="director-name">Krishna Kant Jha</div>
                    <div class="director-title">Managing Director</div>
                </div>

                <!-- Net Pay Box -->
                <div class="net-pay-box">
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">Net Salary Payable:</div>
                    <div style="font-size: 2rem; fontWeight: 800; color: #3b82f6;">₹${fmt(payroll.netSalary)}</div>
                    <div style="font-size: 14px; font-style: italic; margin-top: 5px;">(In words: ${convertNumberToWords(payroll.netSalary)})</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Critical for some server envs
    });
    const page = await browser.newPage();

    // Set content and wait for potential network (images) or idle
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '0px',
            bottom: '0px',
            left: '0px',
            right: '0px'
        }
    });

    await browser.close();
    return pdfBuffer;
};

export { generateSalarySlipPdf };
