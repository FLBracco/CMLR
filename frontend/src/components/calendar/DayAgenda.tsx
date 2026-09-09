import type { AppointmentStatus, IAppointment, IAppointmentPayload } from "../../types/appointment";
import { AppointmentForm } from "./AppointmentForm";
import { AppointmentCard } from "./AppointmentCard";

interface IDayAgendaProps {
  appointments: IAppointment[];
  emptyMessage: string;
  /** Reloj de referencia para habilitar Completar/Ausente en cada tarjeta */
  now: Date;
  editingAppointmentId?: string | null;
  onStartEdit?: (appointment: IAppointment) => void;
  onSubmitEdit?: (id: string, payload: IAppointmentPayload) => Promise<void>;
  onCancelEdit?: () => void;
  onUpdateStatus?: (
    id: string,
    status: AppointmentStatus,
    cancellationReason?: string
  ) => Promise<void>;
}

export const DayAgenda = ({
  appointments,
  emptyMessage,
  now,
  editingAppointmentId,
  onStartEdit,
  onSubmitEdit,
  onCancelEdit,
  onUpdateStatus,
}: IDayAgendaProps) => {
  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm font-medium text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {appointments.map((appointment) => {
        if (appointment.id === editingAppointmentId && onSubmitEdit && onCancelEdit) {
          return (
            <li key={appointment.id}>
              <AppointmentForm
                initialValues={appointment}
                onSubmit={(payload) => onSubmitEdit(appointment.id, payload)}
                onCancel={onCancelEdit}
              />
            </li>
          );
        }

        return (
          <li key={appointment.id}>
            <AppointmentCard
              appointment={appointment}
              now={now}
              onStartEdit={onStartEdit}
              onUpdateStatus={onUpdateStatus}
            />
          </li>
        );
      })}
    </ul>
  );
};
