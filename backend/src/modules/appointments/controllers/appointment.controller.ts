import type { Request, Response } from "express";
import { AppointmentService } from "../services/appointment.service.js";
import type { IAuthenticatedRequest } from "../../../shared/middlewares/authenticate.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { APPOINTMENT_STATUSES } from "../entities/appointment-status.js";
import type { AppointmentStatus } from "../entities/appointment-status.js";

interface IListQuery {
  from: Date;
  to: Date;
  status?: AppointmentStatus;
}

export class AppointmentController {
  constructor(
    private readonly appointmentService = new AppointmentService()
  ) {}

  async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.appointmentService.create(
      professionalId,
      req.body
    );
    res.status(201).json(result);
  }

  async list(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const { from, to, status } = this.parseListQuery(req.query);

    const result = await this.appointmentService.listByRange(
      professionalId,
      from,
      to,
      status
    );
    res.status(200).json(result);
  }

  async getById(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.appointmentService.getById(
      professionalId,
      req.params.id as string
    );
    res.status(200).json(result);
  }

  async update(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.appointmentService.update(
      professionalId,
      req.params.id as string,
      req.body
    );
    res.status(200).json(result);
  }

  async updateStatus(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const result = await this.appointmentService.updateStatus(
      professionalId,
      req.params.id as string,
      req.body
    );
    res.status(200).json(result);
  }

  async listByPatient(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const upcomingOnly = req.query.upcoming === "true";

    const result = await this.appointmentService.listByPatient(
      professionalId,
      req.params.patientId as string,
      upcomingOnly
    );
    res.status(200).json(result);
  }

  async getStats(req: IAuthenticatedRequest, res: Response): Promise<void> {
    const professionalId = this.getProfessionalId(req);
    const dateRaw = typeof req.query.date === "string" ? req.query.date : undefined;
    const referenceDate = dateRaw ? this.parseReferenceDate(dateRaw) : new Date();

    if (Number.isNaN(referenceDate.getTime())) {
      throw AppError.badRequest("El parámetro 'date' no es una fecha válida.");
    }

    const result = await this.appointmentService.getStats(
      professionalId,
      referenceDate
    );
    res.status(200).json(result);
  }

  // "YYYY-MM-DD" se interpreta como fecha calendario LOCAL (igual que el
  // default `new Date()`), no como medianoche UTC: `new Date("2026-09-10")`
  // nativo de JS la toma como UTC, y en un server con TZ negativa (Argentina,
  // UTC-3) eso cae en "2026-09-09" local — el mismo desfasaje de un día que
  // la Fase 2 marcó como riesgo. Un datetime completo con offset sigue
  // parseándose de forma nativa sin este atajo.
  private parseReferenceDate(dateRaw: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateRaw);

    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    return new Date(dateRaw);
  }

  private parseListQuery(query: Request["query"]): IListQuery {
    const fromRaw = typeof query.from === "string" ? query.from : undefined;
    const toRaw = typeof query.to === "string" ? query.to : undefined;
    const statusRaw =
      typeof query.status === "string" ? query.status : undefined;

    if (!fromRaw || !toRaw) {
      throw AppError.badRequest(
        "Los parámetros 'from' y 'to' son obligatorios."
      );
    }

    const from = new Date(fromRaw);
    const to = new Date(toRaw);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw AppError.badRequest(
        "Los parámetros 'from' y 'to' deben ser fechas válidas."
      );
    }

    if (
      statusRaw !== undefined &&
      !APPOINTMENT_STATUSES.includes(statusRaw as AppointmentStatus)
    ) {
      throw AppError.badRequest(
        `El estado debe ser uno de: ${APPOINTMENT_STATUSES.join(", ")}.`
      );
    }

    return {
      from,
      to,
      ...(statusRaw !== undefined && {
        status: statusRaw as AppointmentStatus,
      }),
    };
  }

  private getProfessionalId(req: IAuthenticatedRequest): string {
    if (!req.auth?.professionalId) {
      throw AppError.unauthorized("Token inválido.");
    }
    return req.auth.professionalId;
  }
}
