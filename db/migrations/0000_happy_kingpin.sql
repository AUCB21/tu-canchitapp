CREATE TYPE "public"."estado_reserva" AS ENUM('confirmada', 'pendiente_pago', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."metodo_pago" AS ENUM('efectivo', 'transferencia');--> statement-breakpoint
CREATE TYPE "public"."rol_usuario" AS ENUM('admin', 'staff');--> statement-breakpoint
CREATE TYPE "public"."tipo_cancha" AS ENUM('futbol5', 'futbol7');--> statement-breakpoint
CREATE TABLE "canchas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"tipo" "tipo_cancha" NOT NULL,
	"capacidad" integer DEFAULT 10 NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pagos" (
	"id" serial PRIMARY KEY NOT NULL,
	"reserva_id" integer NOT NULL,
	"monto" numeric(10, 2) NOT NULL,
	"metodo" "metodo_pago" NOT NULL,
	"pagado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"notas" text
);
--> statement-breakpoint
CREATE TABLE "reservas" (
	"id" serial PRIMARY KEY NOT NULL,
	"cancha_id" integer NOT NULL,
	"cliente_id" integer NOT NULL,
	"inicio" timestamp with time zone NOT NULL,
	"fin" timestamp with time zone NOT NULL,
	"estado" "estado_reserva" DEFAULT 'confirmada' NOT NULL,
	"precio" numeric(10, 2) NOT NULL,
	"notas" text,
	"serie_id" integer,
	"es_recurrente" boolean DEFAULT false NOT NULL,
	"creado_por" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series_recurrentes" (
	"id" serial PRIMARY KEY NOT NULL,
	"cancha_id" integer NOT NULL,
	"cliente_id" integer NOT NULL,
	"dia_semana" integer NOT NULL,
	"hora_inicio" text NOT NULL,
	"hora_fin" text NOT NULL,
	"precio" numeric(10, 2) NOT NULL,
	"fecha_inicio" timestamp with time zone NOT NULL,
	"fecha_fin" timestamp with time zone,
	"activa" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"rol" "rol_usuario" DEFAULT 'staff' NOT NULL,
	"hashed_password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_reserva_id_reservas_id_fk" FOREIGN KEY ("reserva_id") REFERENCES "public"."reservas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_cancha_id_canchas_id_fk" FOREIGN KEY ("cancha_id") REFERENCES "public"."canchas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_serie_id_series_recurrentes_id_fk" FOREIGN KEY ("serie_id") REFERENCES "public"."series_recurrentes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_creado_por_usuarios_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_recurrentes" ADD CONSTRAINT "series_recurrentes_cancha_id_canchas_id_fk" FOREIGN KEY ("cancha_id") REFERENCES "public"."canchas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_recurrentes" ADD CONSTRAINT "series_recurrentes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reservas_cancha_inicio" ON "reservas" USING btree ("cancha_id","inicio");--> statement-breakpoint
CREATE INDEX "idx_reservas_serie" ON "reservas" USING btree ("serie_id");