const PocketBase = require("pocketbase");

const pb = new PocketBase(
  process.env.POCKETBASE_URL ||
    "https://tugas-akhir-sbd-pocketbase-1aa788-34-50-95-184.traefik.me"
);

module.exports = pb;
