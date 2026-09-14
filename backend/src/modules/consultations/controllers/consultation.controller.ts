import type { Request, Response } from "express";
import { ConsultationService } from "../services/consultation.service.js";
import type { IAuthenticatedRequest } from "../../../shared/middlewares/authenticate.js";
import { AppError } from "../../../shared/errors/AppError.js";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Exportada como función pura para poder testear el parseo de fecha en
// aislamiento: exige "YYYY-MM-DD" exacto y rechaza cualquier timestamp ISO
// completo. `consultation_date` es `date` en la DB (sin hora); si acá se
// aceptara un instante completo, un mismo día podría interpretarse distinto
// según a qué hora del día se genere el ISO, desfasando el filtro.
export function parseDateOnlyParam(raw: unknown, paramName: string): string {
  if (typeof raw !== "string" || !DATE_ONLY_PATTERN.test(raw)) {
    throw AppError.badRequest(
      `El parámetro '${paramName}' debe tener el formato YYYY-MM-DD.`
    );
  }

  // El regex valida el patrón de dígitos, no el calendario: "2026-13-45"
  // pasaría el test anterior. `Date.UTC` normaliza overflows en silencio en
  // vez de fallar, así que se compara contra los componentes reconstruidos
  // para detectar cualquier desborde (mes/día fuera de rango, 30 de febrero, etc.)
  // antes de que el valor crudo llegue a la query SQL.
  const [year, month, day] = raw.split("-").map(Number);
  const parsed = new Date(Date.UTC(year!, month! - 1, day!));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month! - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw AppError.badRequest(
      `El parámetro '${paramName}' no es una fecha calendario válida.`
    );
  }

  return raw;
}

export class ConsultationController {
  constructor(
    private readonly consultationService = new ConsultationService()
  ) {}

  async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.consultationService.create(
      professionalId,
      req.params.patientId as string,
      req.body
    );
    res.status(201).json(result);
  }

  async list(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const { from, to } = this.parseListQuery(req.query);

    const result = await this.consultationService.listByDateRange(
      professionalId,
      from,
      to
    );
    res.status(200).json(result);
  }

  async listByPatient(
    req: IAuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.consultationService.listByPatient(
      professionalId,
      req.params.patientId as string
    );
    res.status(200).json(result);
  }

  async getStats(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.consultationService.getStats(professionalId);
    res.status(200).json(result);
  }

  async update(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.consultationService.update(
      professionalId,
      req.params.id as string,
      req.body
    );
    res.status(200).json(result);
  }

  private parseListQuery(query: Request["query"]): {
    from: string;
    to: string;
  } {
    const from = parseDateOnlyParam(query.from, "from");
    const to = parseDateOnlyParam(query.to, "to");

    return { from, to };
  }

  private getProfessionalId(req: IAuthenticatedRequest): string {
    if (!req.auth?.professionalId) {
      throw AppError.unauthorized("Token inválido.");
    }
    return req.auth.professionalId;
  }
}
