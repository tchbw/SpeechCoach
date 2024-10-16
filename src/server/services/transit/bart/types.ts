import { z } from "zod";

import { isNumber } from "@/utils/strings";

export const stationAbbreviations = [
  `12TH`,
  `16TH`,
  `19TH`,
  `24TH`,
  `ASHB`,
  `ANTC`,
  `BALB`,
  `BAYF`,
  `BERY`,
  `CAST`,
  `CIVC`,
  `COLS`,
  `COLM`,
  `CONC`,
  `DALY`,
  `DBRK`,
  `DUBL`,
  `DELN`,
  `PLZA`,
  `EMBR`,
  `FRMT`,
  `FTVL`,
  `GLEN`,
  `HAYW`,
  `LAFY`,
  `LAKE`,
  `MCAR`,
  `MLBR`,
  `MLPT`,
  `MONT`,
  `NBRK`,
  `NCON`,
  `OAKL`,
  `ORIN`,
  `PITT`,
  `PCTR`,
  `PHIL`,
  `POWL`,
  `RICH`,
  `ROCK`,
  `SBRN`,
  `SFIA`,
  `SANL`,
  `SHAY`,
  `SSAN`,
  `UCTY`,
  `WARM`,
  `WCRK`,
  `WDUB`,
  `WOAK`,
] as const;

export type StationAbbreviation = (typeof stationAbbreviations)[number];

export const stationToAbbreviations: { [key: string]: StationAbbreviation } = {
  "12th St. Oakland City Center": `12TH`,
  "16th St. Mission (SF)": `16TH`,
  "19th St. Oakland": `19TH`,
  "24th St. Mission (SF)": `24TH`,
  "Ashby (Berkeley)": `ASHB`,
  Antioch: `ANTC`,
  "Balboa Park (SF)": `BALB`,
  "Bay Fair (San Leandro)": `BAYF`,
  "Berryessa / North San Jose": `BERY`,
  "Castro Valley": `CAST`,
  "Civic Center (SF)": `CIVC`,
  Coliseum: `COLS`,
  Colma: `COLM`,
  Concord: `CONC`,
  "Daly City": `DALY`,
  "Downtown Berkeley": `DBRK`,
  "Dublin/Pleasanton": `DUBL`,
  "El Cerrito del Norte": `DELN`,
  "El Cerrito Plaza": `PLZA`,
  "Embarcadero (SF)": `EMBR`,
  Fremont: `FRMT`,
  "Fruitvale (Oakland)": `FTVL`,
  "Glen Park (SF)": `GLEN`,
  Hayward: `HAYW`,
  Lafayette: `LAFY`,
  "Lake Merritt (Oakland)": `LAKE`,
  "MacArthur (Oakland)": `MCAR`,
  Millbrae: `MLBR`,
  Milpitas: `MLPT`,
  "Montgomery St. (SF)": `MONT`,
  "North Berkeley": `NBRK`,
  "North Concord/Martinez": `NCON`,
  "Oakland Int'l Airport": `OAKL`,
  Orinda: `ORIN`,
  "Pittsburg/Bay Point": `PITT`,
  "Pittsburg Center": `PCTR`,
  "Pleasant Hill": `PHIL`,
  "Powell St. (SF)": `POWL`,
  Richmond: `RICH`,
  "Rockridge (Oakland)": `ROCK`,
  "San Bruno": `SBRN`,
  "San Francisco Int'l Airport": `SFIA`,
  "San Leandro": `SANL`,
  "South Hayward": `SHAY`,
  "South San Francisco": `SSAN`,
  "Union City": `UCTY`,
  "Warm Springs/South Fremont": `WARM`,
  "Walnut Creek": `WCRK`,
  "West Dublin": `WDUB`,
  "West Oakland": `WOAK`,
} as const;

export enum BartDirection {
  North = `n`,
  South = `s`,
}

// Weird bart api paramters expect 1 and 0 to indicate how to sort results
export enum BartDepartureSortType {
  Line = `1`,
  Destination = `0`,
}

const BartTimeEstimateByDirectionSchema = z.object({
  minutes: z.string(),
  platform: z.string().refine(isNumber),
  direction: z.enum([`North`, `South`]),
  length: z.string(),
  color: z.string(),
  hexcolor: z.string(),
  bikeflag: z.string(),
  delay: z.string(),
  cancelflag: z.string(),
  dynamicflag: z.string(),
});
export type BartTimeEstimateByDirection = z.infer<
  typeof BartTimeEstimateByDirectionSchema
>;

const BartEtdByDestinationSchema = z.object({
  destination: z.string(),
  abbreviation: z.enum(stationAbbreviations),
  limited: z.string(),
  estimate: z.array(BartTimeEstimateByDirectionSchema),
});
export type BartEtdByDestination = z.infer<typeof BartEtdByDestinationSchema>;

const bartStationEtdSchema = z.object({
  name: z.string(),
  abbr: z.enum(stationAbbreviations),
  etd: z.array(BartEtdByDestinationSchema),
});
export type BartStationEtd = z.infer<typeof bartStationEtdSchema>;

export const bartApiResponseSchema = z.object({
  root: z.object({
    date: z.string(),
    time: z.string(),
    station: z.array(bartStationEtdSchema),
    message: z.string(),
  }),
});

export type BartApiResponse = z.infer<typeof bartApiResponseSchema>;
