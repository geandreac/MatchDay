import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: "postgresql://postgres:sH4wymMiQIC1gOFi@db.jyhmhumvlcltuzqadblf.supabase.co:6543/postgres?sslmode=require&pgbouncer=true",
});

const p = new PrismaClient({ adapter });
await p.$connect();
console.log("Conectado com sucesso!");
const users = await p.user.count();
console.log("Usuários:", users);
await p.$disconnect();
