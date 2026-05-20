// ═══════════════════════════════════════════════════════════════
// services/loto.validation.js - Zod input validation schemas
// ═══════════════════════════════════════════════════════════════

const { z } = require('zod');

const createRoomSchema = z.object({
  gameMode: z.enum(['solo', 'multiplayer']).default('multiplayer'),
  winPattern: z.enum(['line', 'column', 'diagonal', 'blackout']).default('line'),
  maxPlayers: z.number().int().min(1).max(8).default(8),
  drawIntervalSeconds: z.number().int().min(1).max(60).default(5)
});

const joinRoomSchema = z.object({
  roomCode: z.string().min(4).max(8).transform(v => v.toUpperCase())
});

const markNumberSchema = z.object({
  number: z.number().int().min(0).max(75)
});

const roomCodeParamSchema = z.string().min(4).max(8);
const uuidParamSchema = z.string().uuid();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Validation failed: ${messages}`);
  }
  return result.data;
}

module.exports = {
  createRoomSchema,
  joinRoomSchema,
  markNumberSchema,
  roomCodeParamSchema,
  uuidParamSchema,
  paginationSchema,
  validate
};
