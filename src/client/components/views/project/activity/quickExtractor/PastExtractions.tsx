import type { ParsedDocument } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/client/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";

import PastParsedDocument from "./PastParsedDocument";

type PastExtractionsProps = {
  pastExtractions: ParsedDocument[] | undefined;
  companyId: string;
};

export default function PastExtractions({
  pastExtractions,
  companyId,
}: PastExtractionsProps) {
  const [selectedParsedDocument, setSelectedParsedDocument] =
    useState<ParsedDocument | null>(null);

  if (!pastExtractions) {
    return <div>Loading past extractions...</div>;
  }

  if (pastExtractions.length === 0) {
    return (
      <div className="text-slate-500">
        No past extractions found! Try out your first extraction.
      </div>
    );
  }

  if (selectedParsedDocument) {
    return (
      <div>
        <Button
          onClick={() => setSelectedParsedDocument(null)}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
        </Button>
        <PastParsedDocument
          companyId={companyId}
          parsedDocument={selectedParsedDocument}
        />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Extraction date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pastExtractions.map((extraction) => (
          <TableRow
            key={extraction.id}
            onClick={() => setSelectedParsedDocument(extraction)}
            style={{ cursor: `pointer` }}
          >
            <TableCell>{extraction.documentName}</TableCell>
            <TableCell>{extraction.documentType}</TableCell>
            <TableCell>
              {new Date(extraction.createdAt).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
