import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pkg from '@prisma/client';

const rootEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env');
dotenv.config({ path: rootEnv });

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export default prisma;
