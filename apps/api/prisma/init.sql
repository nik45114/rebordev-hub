-- Create tables with camelCase columns for Railway PostgreSQL

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT,
  name TEXT NOT NULL,
  "avatarUrl" TEXT,
  "telegramId" TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'DEVELOPER',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"(email);
CREATE INDEX IF NOT EXISTS "idx_user_telegram" ON "User"("telegramId");
CREATE INDEX IF NOT EXISTS "idx_session_user" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "Session"(token);

-- Insert admin user
INSERT INTO "User" (id, email, "passwordHash", name, role)
VALUES (
  'admin123456789',
  'admin@rebordev.ru',
  '$2a$10$w5RV3gUt0rwRireC9zGkROimky/Xy5REMFU29yCiZy/ExYZeMg0B.',
  'Admin',
  'OWNER'
)
ON CONFLICT (email) DO NOTHING;
