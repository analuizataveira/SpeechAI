-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DOCTOR', 'PATIENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_profile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_doctor" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diff_types" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diff_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "difficulties" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "diff_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "difficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "diff_type_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises_lists" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "diff_type_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty_level" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises_lists_items" (
    "id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "exercise_list_id" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "exercises_lists_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "exercise_list_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "correctItems" INTEGER,
    "error_log" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profile_user_id_key" ON "doctor_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_profile_user_id_key" ON "patient_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_doctor_doctor_id_patient_id_key" ON "user_doctor"("doctor_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "difficulties_patient_id_diff_type_id_key" ON "difficulties"("patient_id", "diff_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_lists_items_exercise_list_id_exercise_id_key" ON "exercises_lists_items"("exercise_list_id", "exercise_id");

-- AddForeignKey
ALTER TABLE "doctor_profile" ADD CONSTRAINT "doctor_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_profile" ADD CONSTRAINT "patient_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_doctor" ADD CONSTRAINT "user_doctor_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_doctor" ADD CONSTRAINT "user_doctor_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "difficulties" ADD CONSTRAINT "difficulties_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "difficulties" ADD CONSTRAINT "difficulties_diff_type_id_fkey" FOREIGN KEY ("diff_type_id") REFERENCES "diff_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_diff_type_id_fkey" FOREIGN KEY ("diff_type_id") REFERENCES "diff_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises_lists" ADD CONSTRAINT "exercises_lists_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises_lists" ADD CONSTRAINT "exercises_lists_diff_type_id_fkey" FOREIGN KEY ("diff_type_id") REFERENCES "diff_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises_lists_items" ADD CONSTRAINT "exercises_lists_items_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises_lists_items" ADD CONSTRAINT "exercises_lists_items_exercise_list_id_fkey" FOREIGN KEY ("exercise_list_id") REFERENCES "exercises_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_exercise_list_id_fkey" FOREIGN KEY ("exercise_list_id") REFERENCES "exercises_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
