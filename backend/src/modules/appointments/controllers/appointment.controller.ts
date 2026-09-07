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
