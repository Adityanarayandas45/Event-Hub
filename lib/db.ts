import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "db.json");

export type DB = {
  users: any[];
  categories: any[];
  events: any[];
  registrations: any[]
};

export function readDB(): DB {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
}

export function writeDB(db: DB) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}
