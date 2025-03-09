/*
  # Initial Schema Setup for Sonatel Academy Presence Management

  1. New Tables
    - users
      - Basic user information (id, email, password, names)
      - Role-specific fields (matricule, referentiel, qrCode)
      - Timestamps
    - presences
      - Presence records linking to users
      - Status tracking
      - Scan timestamps
  
  2. Security
    - Password hashing implemented in application layer
    - Email uniqueness constraint
    - Matricule uniqueness constraint for students
*/

-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIGIL', 'APPRENANT');

-- Create PresenceStatus enum
CREATE TYPE "PresenceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT');

-- Create users table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "matricule" TEXT UNIQUE,
    "photoUrl" TEXT,
    "referentiel" TEXT,
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create presences table
CREATE TABLE "presences" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "status" "PresenceStatus" NOT NULL,
    "scanTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_matricule_idx" ON "users"("matricule");
CREATE INDEX "presences_userId_idx" ON "presences"("userId");
CREATE INDEX "presences_scanTime_idx" ON "presences"("scanTime");