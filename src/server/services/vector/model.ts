import type { Prisma, VectorizedItem } from "@prisma/client";
import pgvector from "pgvector";
import { VoyageAIClient } from "voyageai";

import { prisma } from "@/server/init/db";
export const userModelDefaultInclude = {
  Companies: {
    include: {
      company: true,
    },
  },
};

const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

export type UserWithDefaults = Prisma.UserGetPayload<{
  include: typeof userModelDefaultInclude;
}>;

class VectorModel {
  async getEmbedding({ content }: { content: string }): Promise<number[]> {
    const response = await client.embed({
      input: [content],
      model: `voyage-3-lite`,
    });

    const embedding = response.data?.[0]?.embedding;

    if (!embedding) {
      throw new Error(`No embedding for ${content}`);
    }

    return embedding;
  }

  async getEmbeddings(contents: string[]): Promise<number[][]> {
    const response = await client.embed({
      input: contents,
      model: `voyage-3-lite`,
    });

    const embeddings = response.data?.map((item) => item.embedding);

    if (!embeddings || embeddings.length !== contents.length) {
      throw new Error(`Failed to get embeddings for all input contents`);
    }

    return embeddings.filter(
      (embedding): embedding is number[] => embedding !== undefined
    );
  }

  async saveIndex({
    content,
    embedding,
  }: {
    content: string;
    embedding: number[];
  }): Promise<VectorizedItem> {
    const embeddingSql = pgvector.toSql(embedding) as unknown as string;

    const item: VectorizedItem = await prisma.$queryRaw`
      INSERT INTO "VectorizedItem" (content, embedding)
      VALUES (${content}, ${embeddingSql}::vector)
      RETURNING id, content, embedding::text
    `;

    return item;
  }

  async updateEmbedding(id: number, embedding: number[]): Promise<void> {
    const embeddingSql = pgvector.toSql(embedding) as unknown as string;

    await prisma.$queryRaw`
      UPDATE "VectorizedItem"
      SET embedding_512 = ${embeddingSql}::vector
      WHERE id = ${id}
    `;
  }

  async updateEmbeddings(ids: number[], embeddings: number[][]): Promise<void> {
    if (ids.length !== embeddings.length) {
      throw new Error(`The number of IDs must match the number of embeddings`);
    }

    const updatePromises = ids.map((id, index) => {
      const embedding = embeddings[index];
      if (!embedding) {
        throw new Error(`No embedding for ${id}`);
      }

      return this.updateEmbedding(id, embedding);
    });

    await Promise.all(updatePromises);
  }

  async nearestNeighbor({
    embedding,
    limit = 5,
  }: {
    embedding: number[];
    limit?: number;
  }): Promise<VectorizedItem[]> {
    const embeddingSql = pgvector.toSql(embedding) as unknown as string;

    const items: VectorizedItem[] = await prisma.$queryRaw`
      SELECT id, content, embedding_512::text,
      collection, book, verse, translation
      FROM "VectorizedItem"
      ORDER BY embedding_512 <-> ${embeddingSql}::vector
      LIMIT ${limit}
    `;
    return items;
  }

  async search({
    content,
    limit = 5,
  }: {
    content: string;
    limit?: number;
  }): Promise<VectorizedItem[]> {
    const embedding = await this.getEmbedding({
      content,
    });

    const nearest = await this.nearestNeighbor({
      embedding,
      limit,
    });

    return nearest;
  }
}

const vectorModel = new VectorModel();
export { vectorModel };
