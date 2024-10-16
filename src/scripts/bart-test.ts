import bartApi from "@/server/services/transit/bart/api";

await bartApi.getRealtimeDepartures({
  orig: `19TH`,
});
