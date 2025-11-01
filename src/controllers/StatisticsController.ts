import type { Request } from "express";
import type { ResponseAPI } from "@/typescript/express";

import { readFileSync } from "node:fs";
import nodePath from "node:path";

import Mustache from "mustache";
import puppeteer from "puppeteer";

import { HistorialAction } from "@/database/entities/Historial";
import { OrderState } from "@/database/entities/ProductionOrders";
import { getProductWithRelations } from "@/database/helpers/productsHelpers";
import { GlobalRepository } from "@/database/repositories/globalRepository";

const ProductionOrdersRepository = GlobalRepository.productionOrderRepository;
const HistorialRepository = GlobalRepository.historialRepository;

interface MonthlyOrderStats {
  month: string;
  value: number;
}

interface ProductUsageStats {
  nombre: string;
  productos: number;
}

interface ProductSalesStats {
  nombre: string;
  productos: number;
}

interface StatisticsData {
  monthlyOrders: MonthlyOrderStats[];
  mostUsedProducts: ProductUsageStats[];
  topSalesProducts: ProductSalesStats[];
}

/**
 * Get statistics for dashboard
 * - Monthly finished orders (last 12 months)
 * - Most used products/materials
 * - Products with most sales
 */
export const GetStatistics = async (req: Request, res: ResponseAPI) => {
  try {
    // Get current year for filtering
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // 1. Get monthly finished orders (Ejecutada state)
    const finishedOrders = await ProductionOrdersRepository.find({
      where: {
        orderState: OrderState.Ejecutada,
      },
      relations: ["product"],
    });

    // Group by month
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const monthlyOrdersMap = new Map<number, number>();
    for (let i = 0; i < 12; i++) {
      monthlyOrdersMap.set(i, 0);
    }

    for (const order of finishedOrders) {
      if (order.realEndDate) {
        const orderDate = new Date(order.realEndDate);
        if (orderDate >= startOfYear && orderDate <= endOfYear) {
          const month = orderDate.getMonth();
          monthlyOrdersMap.set(month, (monthlyOrdersMap.get(month) ?? 0) + 1);
        }
      }
    }

    const monthlyOrders: MonthlyOrderStats[] = [
      ...monthlyOrdersMap.entries(),
    ].map(([monthIndex, count]) => ({
      month: monthNames[monthIndex],
      value: count,
    }));

    // 2. Get most used products/materials (insumos)
    // This is based on products used in production orders
    const productUsageMap = new Map<number, { name: string; count: number }>();

    for (const order of finishedOrders) {
      const product = await getProductWithRelations(order.product.id);
      if (!product) continue;
      for (const material of product.materialsList) {
        const materialId = material.idProdComponenteId;
        const materialName = material.componentProduct.nombre;
        const quantity = material.quantity * order.cantidadProductoFabricado;

        const existing = productUsageMap.get(materialId);
        if (existing) {
          existing.count += quantity;
        } else {
          productUsageMap.set(materialId, {
            name: materialName,
            count: quantity,
          });
        }
      }
    }

    // Sort by usage and get top 6
    const mostUsedProducts: ProductUsageStats[] = [...productUsageMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((item) => ({
        nombre: item.name,
        productos: Math.round(item.count),
      }));

    // 3. Get products with most sales from historial (VENTA action)
    const salesHistory = await HistorialRepository.find({
      where: {
        action: HistorialAction.VENTA,
      },
      relations: ["product"],
    });

    const productSalesMap = new Map<number, { name: string; count: number }>();

    for (const sale of salesHistory) {
      if (sale.product) {
        const productId = sale.product.id;
        const productName = sale.product.nombre;
        const quantity = sale.cantidad;

        const existing = productSalesMap.get(productId);
        if (existing) {
          existing.count += quantity;
        } else {
          productSalesMap.set(productId, {
            name: productName,
            count: quantity,
          });
        }
      }
    }

    // Sort by sales and get top 6
    const topSalesProducts: ProductSalesStats[] = [...productSalesMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((item) => ({
        nombre: item.name,
        productos: item.count,
      }));

    const statistics: StatisticsData = {
      monthlyOrders,
      mostUsedProducts,
      topSalesProducts,
    };

    res.status(200).json({
      status: true,
      message: "Estadísticas obtenidas exitosamente",
      data: statistics,
    });
  } catch (error) {
    console.error("Error getting statistics:", error);
    res.status(500).json({
      status: false,
      message: "Ocurrió un error inesperado al obtener las estadísticas",
      data: null,
    });
  }
};

/**
 * Generate PDF report with statistics
 */
export const GenerateReportPDF = async (req: Request, res: ResponseAPI) => {
  try {
    // Get current year for filtering
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // 1. Get monthly finished orders
    const finishedOrders = await ProductionOrdersRepository.find({
      where: {
        orderState: OrderState.Ejecutada,
      },
      relations: ["product"],
    });

    // Group by month
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const monthlyOrdersMap = new Map<number, number>();
    for (let i = 0; i < 12; i++) {
      monthlyOrdersMap.set(i, 0);
    }

    let totalCompletedOrders = 0;
    for (const order of finishedOrders) {
      if (order.realEndDate) {
        const orderDate = new Date(order.realEndDate);
        if (orderDate >= startOfYear && orderDate <= endOfYear) {
          const month = orderDate.getMonth();
          monthlyOrdersMap.set(month, (monthlyOrdersMap.get(month) ?? 0) + 1);
          totalCompletedOrders++;
        }
      }
    }

    // Calculate max value for percentage calculation
    const maxMonthlyOrders = Math.max(...monthlyOrdersMap.values(), 1);

    const monthlyOrders = [...monthlyOrdersMap.entries()].map(
      ([monthIndex, count]) => ({
        month: monthNames[monthIndex],
        value: count,
        percentage: (count / maxMonthlyOrders) * 100,
      }),
    );

    // 2. Get most used products/materials
    const productUsageMap = new Map<
      number,
      { name: string; count: number; codigo: string }
    >();

    for (const order of finishedOrders) {
      const product = await getProductWithRelations(order.product.id);
      if (!product) continue;
      for (const material of product.materialsList) {
        const materialId = material.idProdComponenteId;
        const materialName = material.componentProduct.nombre;
        const quantity = material.quantity * order.cantidadProductoFabricado;

        const existing = productUsageMap.get(materialId);
        if (existing) {
          existing.count += quantity;
        } else {
          productUsageMap.set(materialId, {
            name: materialName,
            count: quantity,
            codigo: material.componentProduct.codigo,
          });
        }
      }
    }

    const mostUsedProducts = [...productUsageMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item, index) => {
        let rankClass = "";
        switch (index) {
          case 0: {
            rankClass = "gold";

            break;
          }
          case 1: {
            rankClass = "silver";

            break;
          }
          case 2: {
            rankClass = "bronze";

            break;
          }
          // No default
        }

        return {
          rank: index + 1,
          rankClass,
          nombre: item.name,
          codigo: item.codigo,
          productos: Math.round(item.count),
        };
      });

    // 3. Get products with most sales
    const salesHistory = await HistorialRepository.find({
      where: {
        action: HistorialAction.VENTA,
      },
      relations: ["product"],
    });

    const productSalesMap = new Map<number, { name: string; count: number }>();

    for (const sale of salesHistory) {
      if (sale.product) {
        const productId = sale.product.id;
        const productName = sale.product.nombre;
        const quantity = sale.cantidad;

        const existing = productSalesMap.get(productId);
        if (existing) {
          existing.count += quantity;
        } else {
          productSalesMap.set(productId, {
            name: productName,
            count: quantity,
          });
        }
      }
    }

    const topSalesProducts = [...productSalesMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item, index) => {
        let rankClass = "";
        switch (index) {
          case 0: {
            rankClass = "gold";

            break;
          }
          case 1: {
            rankClass = "silver";

            break;
          }
          case 2: {
            rankClass = "bronze";

            break;
          }
          // No default
        }
        return {
          rank: index + 1,
          rankClass,
          nombre: item.name,
          productos: item.count,
        };
      });

    // Prepare data for template
    const templateData = {
      generatedDate: new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      currentYear,
      totalCompletedOrders,
      monthlyOrders,
      mostUsedProducts,
      topSalesProducts,
      hasMonthlyData: monthlyOrders.some((m) => m.value > 0),
      hasUsageData: mostUsedProducts.length > 0,
      hasSalesData: topSalesProducts.length > 0,
    };

    // Read and render template
    const templatePath = nodePath.join(
      process.cwd(),
      "src",
      "templates",
      "reportTemplate.html",
    );
    const template = readFileSync(templatePath, "utf8");
    const html = Mustache.render(template, templateData);

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    // Send PDF as response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte_estadisticas_${currentYear}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF report:", error);
    res.status(500).json({
      status: false,
      message: "Ocurrió un error inesperado al generar el reporte PDF",
      data: null,
    });
  }
};
