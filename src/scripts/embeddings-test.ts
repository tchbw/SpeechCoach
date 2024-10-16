import { vectorModel } from "@/server/services/vector/model";

const embedding1 = await vectorModel.getEmbedding({ content: `Hello world` });
const embedding2 = await vectorModel.getEmbedding({
  content: `They're eating the dogs they're eating the cats`,
});

console.log(`Embedding`, { embedding1 });

await vectorModel.saveIndex({ content: `Hello world`, embedding: embedding1 });
await vectorModel.saveIndex({
  content: `They're eating the dogs they're eating the cats`,
  embedding: embedding2,
});

const embedding3 = await vectorModel.getEmbedding({
  content: `Chicken is the best food`,
});
const nearestNeighbors = await vectorModel.nearestNeighbor({
  embedding: embedding3,
  limit: 1,
});

console.log(`Nearest neighbors`, { nearestNeighbors });
