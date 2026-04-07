ALTER TABLE "reservas" ALTER COLUMN "creado_por" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "usuarios" DROP COLUMN "hashed_password";