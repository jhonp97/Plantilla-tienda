import type { GenerateReportDto, ReportType } from '../../dto/GenerateReportDto';
import { GenerateInvoicesReportUseCase } from './GenerateInvoicesReportUseCase';
import { ExportSalesReportUseCase } from './ExportSalesReportUseCase';
import { ExportProductsReportUseCase } from './ExportProductsReportUseCase';

export class GenerateCSVReportUseCase {
  constructor(
    private invoicesUseCase: GenerateInvoicesReportUseCase,
    private salesUseCase: ExportSalesReportUseCase,
    private productsUseCase: ExportProductsReportUseCase
  ) {}

  async execute(dto: GenerateReportDto): Promise<Buffer> {
    // Route to appropriate report generator based on type
    switch (dto.reportType) {
      case 'TAX_REPORT':
      case 'EXPORT_ORDERS':
        // Invoice report for Hacienda
        return await this.invoicesUseCase.execute(dto);

      case 'SALES_SUMMARY':
        // Sales summary report
        return await this.salesUseCase.execute(dto);

      case 'PRODUCT_PERFORMANCE':
      case 'INVENTORY_REPORT':
        // Product performance report
        return await this.productsUseCase.execute(dto);

      default:
        throw new Error(`Unsupported report type for CSV: ${dto.reportType}`);
    }
  }
}