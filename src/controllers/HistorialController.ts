import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import type { Historial } from "@/database/entities/Historial";
import type { GetHistorialReq, ResponseAPI } from "@/typescript/express";

import { readFileSync } from "node:fs";
import path from "node:path";

import Mustache from "mustache";
import puppeteer from "puppeteer";
import {
  Between,
  Equal,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";

import { HistorialAction } from "@/database/entities/Historial";
import { GlobalRepository } from "@/database/repositories/globalRepository";

const HistorialRepository = GlobalRepository.historialRepository;

export const GetHistory = async (req: GetHistorialReq, res: ResponseAPI) => {
  try {
    const {
      limit,
      offset,
      product,
      action,
      productId,
      providerId,
      clientId,
      startDate,
      endDate,
    } = req.query;

    const take = Number(limit) || 10;
    const skip = Number(offset) || 0;

    const whereClause: FindOptionsWhere<Historial> = {};

    if (product && product.length > 0) {
      whereClause.product = { nombre: ILike(`%${product}%`) };
    }

    if (productId) {
      whereClause.product = { id: Equal(Number(productId)) };
    }

    if (providerId) {
      whereClause.provider = { id: Equal(Number(providerId)) };
    }

    if (clientId) {
      whereClause.client = { id: Equal(Number(clientId)) };
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.create_at = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereClause.create_at = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereClause.create_at = LessThanOrEqual(new Date(endDate));
    }

    if (action && action.length > 0) {
      const validActions = Object.keys(HistorialAction);
      if (!validActions.includes(action as HistorialAction)) {
        res.status(422).json({
          status: false,
          message: `HistorialAction inválido. Los valores válidos son: INGRESO, EGRESO, VENTA, VARIOS, ORDENPRODUCCION, GASTODEPRODUCCION, INGRESOPORPRODUCCION, `,
        });
        return;
      }
      const enumAction =
        HistorialAction[action as keyof typeof HistorialAction];
      whereClause.action = Equal(enumAction);
    }

    const options: FindManyOptions<Historial> = {
      take,
      skip,
      where: whereClause,
      order: {
        create_at: "DESC",
      },
      select: {
        id: true,
        action: true,
        cantidad: true,
        client: {
          id: true,
          nombreEmpresa: true,
          ciRif: true,
        },
        product: {
          id: true,
          nombre: true,
          codigo: true,
        },
        description: true,
        provider: {
          id: true,
          enterpriseName: true,
          ciRif: true,
        },
        productionOrder: { id: true },
        create_at: true,
      },
      relations: {
        client: true,
        product: true,
        provider: true,
        productionOrder: true,
      },
    };

    const [history, total] = await HistorialRepository.findAndCount(options);
    res.status(200).json({
      status: true,
      data: { history, total },
      message: "Historial obtenido exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde",
      ],
    });
    return;
  }
};

/**
 * Genera un reporte PDF del historial con los filtros aplicados
 */
export const GenerateHistorialReportPDF = async (
  req: GetHistorialReq,
  res: ResponseAPI,
) => {
  try {
    const {
      limit,
      product,
      action,
      productId,
      providerId,
      clientId,
      startDate,
      endDate,
    } = req.query;

    // Por defecto, obtener los últimos 20 registros
    const take = Number(limit) || 20;
    const skip = 0;

    const whereClause: FindOptionsWhere<Historial> = {};

    // Aplicar filtros
    if (product && product.length > 0) {
      whereClause.product = { nombre: ILike(`%${product}%`) };
    }

    if (productId) {
      whereClause.product = { id: Equal(Number(productId)) };
    }

    if (providerId) {
      whereClause.provider = { id: Equal(Number(providerId)) };
    }

    if (clientId) {
      whereClause.client = { id: Equal(Number(clientId)) };
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.create_at = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereClause.create_at = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereClause.create_at = LessThanOrEqual(new Date(endDate));
    }

    if (action && action.length > 0) {
      const validActions = Object.keys(HistorialAction);
      if (!validActions.includes(action as HistorialAction)) {
        res.status(422).json({
          status: false,
          message: `HistorialAction inválido. Los valores válidos son: INGRESO, EGRESO, VENTA, VARIOS, ORDENPRODUCCION, GASTODEPRODUCCION, INGRESOPORPRODUCCION`,
        });
        return;
      }
      const enumAction =
        HistorialAction[action as keyof typeof HistorialAction];
      whereClause.action = Equal(enumAction);
    }

    const options: FindManyOptions<Historial> = {
      take,
      skip,
      where: whereClause,
      order: {
        create_at: "DESC",
      },
      select: {
        id: true,
        action: true,
        cantidad: true,
        client: {
          id: true,
          nombreEmpresa: true,
          ciRif: true,
        },
        product: {
          id: true,
          nombre: true,
          codigo: true,
        },
        description: true,
        provider: {
          id: true,
          enterpriseName: true,
          ciRif: true,
        },
        productionOrder: { id: true },
        create_at: true,
      },
      relations: {
        client: true,
        product: true,
        provider: true,
        productionOrder: true,
      },
    };

    const [history, total] = await HistorialRepository.findAndCount(options);

    // Formatear datos para el template
    const historyRecords = history.map((record) => {
      // Determinar la clase CSS para el badge de acción
      let actionClass = "";
      switch (record.action) {
        case HistorialAction.INGRESO: {
          actionClass = "ingreso";
          break;
        }
        case HistorialAction.EGRESO: {
          actionClass = "egreso";
          break;
        }
        case HistorialAction.VENTA: {
          actionClass = "venta";
          break;
        }
        case HistorialAction.ORDENPRODUCCION: {
          actionClass = "ordenproduccion";
          break;
        }
        case HistorialAction.VARIOS: {
          actionClass = "varios";
          break;
        }
        case HistorialAction.GASTODEPRODUCCION: {
          actionClass = "gastodeproduccion";
          break;
        }
        case HistorialAction.INGRESOPORPRODUCCION: {
          actionClass = "ingresoporproduccion";
          break;
        }
      }

      return {
        productionOrderId: record.productionOrder?.id
          ? record.productionOrder.id.toString()
          : "-",
        formattedDate: new Date(record.create_at).toLocaleString("es-VE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        productName: record.product?.nombre ?? "-",
        providerName: record.provider?.enterpriseName ?? "-",
        clientName: record.client?.nombreEmpresa ?? "-",
        description: record.description.length > 0 ? record.description : "-",
        cantidad: record.cantidad,
        action: record.action,
        actionClass,
      };
    });

    // Preparar información de filtros
    const filterInfo: {
      filterStartDate?: string;
      filterEndDate?: string;
      filterAction?: string;
      filterProduct?: string;
      filterProvider?: string;
      filterClient?: string;
    } = {};
    let hasFilters = false;

    if (startDate) {
      filterInfo.filterStartDate = new Date(startDate).toLocaleDateString(
        "es-VE",
      );
      hasFilters = true;
    }

    if (endDate) {
      filterInfo.filterEndDate = new Date(endDate).toLocaleDateString("es-VE");
      hasFilters = true;
    }

    if (action) {
      const enumAction =
        HistorialAction[action as keyof typeof HistorialAction];
      filterInfo.filterAction = enumAction;
      hasFilters = true;
    }

    if (productId && history.length > 0 && history[0].product) {
      filterInfo.filterProduct = history[0].product.nombre;
      hasFilters = true;
    }

    if (providerId && history.length > 0 && history[0].provider) {
      filterInfo.filterProvider = history[0].provider.enterpriseName;
      hasFilters = true;
    }

    if (clientId && history.length > 0 && history[0].client) {
      filterInfo.filterClient = history[0].client.nombreEmpresa;
      hasFilters = true;
    }

    // Preparar datos para el template
    const templateData = {
      generatedDate: new Date().toLocaleDateString("es-VE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      currentYear: new Date().getFullYear(),
      totalRecords: total,
      hasData: historyRecords.length > 0,
      historyRecords,
      hasFilters,
      ...filterInfo,
    };

    // Leer el template HTML
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "historialReportTemplate.html",
    );
    const template = readFileSync(templatePath, "utf8");

    // Renderizar el template con Mustache
    const html = Mustache.render(template, templateData);

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    // Esperar un poco más para asegurar que todo esté renderizado

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

    // Enviar el PDF como respuesta
    const fileName = `reporte_historial_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generando reporte PDF:", error);
    res.status(500).json({
      status: false,
      message: [
        "Ocurrió un error al generar el reporte. Por favor, inténtelo de nuevo más tarde",
      ],
    });
    return;
  }
};
