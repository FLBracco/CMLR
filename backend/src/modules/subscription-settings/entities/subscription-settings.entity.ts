import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

// Fila única (singleton): no hay multi-tenant, es la cuenta bancaria/WhatsApp
// del dueño de la app. `id` fijo en 1 en vez de un catálogo de configuración
// genérico — no hay hoy ninguna otra config que justifique esa flexibilidad.
export const SUBSCRIPTION_SETTINGS_ID = 1;

@Entity("subscription_settings")
export class SubscriptionSettings {
  @PrimaryColumn({ type: "smallint" })
  id!: number;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    name: "monthly_amount",
    nullable: true,
  })
  monthlyAmount!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  alias!: string | null;

  @Column({ type: "varchar", length: 30, nullable: true })
  cbu!: string | null;

  @Column({ type: "varchar", length: 100, name: "account_holder_name", nullable: true })
  accountHolderName!: string | null;

  @Column({ type: "varchar", length: 20, name: "whatsapp_number", nullable: true })
  whatsappNumber!: string | null;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date;
}
