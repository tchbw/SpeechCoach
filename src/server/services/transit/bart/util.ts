import type {
  BartApiResponse,
  BartEtdByDestination,
  BartStationEtd,
  BartTimeEstimateByDirection,
  StationAbbreviation,
} from "@/server/services/transit/bart/types";

export const BartUtil = {
  filterBartEtdApiResponse(
    response: BartApiResponse,
    origin?: StationAbbreviation,
    destination?: StationAbbreviation,
    direction?: `North` | `South`,
    lineColor?: string
  ): BartStationEtd[] {
    let filteredEtdInfo: BartStationEtd[] = response.root.station;

    if (origin) {
      filteredEtdInfo = filteredEtdInfo.filter(
        (stationEtdInfo) => stationEtdInfo.abbr === origin
      );
    }

    if (destination) {
      filteredEtdInfo = filteredEtdInfo.reduce((acc, stationEtdInfo) => {
        const filteredEtd = stationEtdInfo.etd.filter(
          (etdByDestination) => etdByDestination.abbreviation === destination
        );

        if (filteredEtd.length > 0) {
          acc.push({
            ...stationEtdInfo,
            etd: filteredEtd,
          });
        }

        return acc;
      }, [] as BartStationEtd[]);
    }

    if (direction) {
      filteredEtdInfo = _filterStationEtdsByDestinationAttr({
        etdsByStation: filteredEtdInfo,
        attr: `direction`,
        value: direction,
      });
    }

    if (lineColor) {
      filteredEtdInfo = _filterStationEtdsByDestinationAttr({
        etdsByStation: filteredEtdInfo,
        attr: `color`,
        value: lineColor,
      });
    }

    return filteredEtdInfo;
  },
};

function _filterStationEtdsByDestinationAttr<
  T extends keyof BartTimeEstimateByDirection,
>({
  etdsByStation,
  attr,
  value,
}: {
  etdsByStation: BartStationEtd[];
  attr: T;
  value: BartTimeEstimateByDirection[T];
}) {
  return etdsByStation.reduce((acc, stationEtdInfo) => {
    const filteredEtd = _filterDestinationEtdsByAttr({
      etdsByDestination: stationEtdInfo.etd,
      attr,
      value,
    });

    if (filteredEtd.length > 0) {
      acc.push({
        ...stationEtdInfo,
        etd: filteredEtd,
      });
    }

    return acc;
  }, [] as BartStationEtd[]);
}

function _filterDestinationEtdsByAttr<
  T extends keyof BartTimeEstimateByDirection,
>({
  etdsByDestination,
  attr,
  value,
}: {
  etdsByDestination: BartEtdByDestination[];
  attr: T;
  value: BartTimeEstimateByDirection[T];
}) {
  return etdsByDestination.reduce((etdAcc, etdByDestination) => {
    const filteredEstimates = etdByDestination.estimate.filter(
      (estimate) => estimate[attr] === value
    );

    if (filteredEstimates.length > 0) {
      etdAcc.push({
        ...etdByDestination,
        estimate: filteredEstimates,
      });
    }

    return etdAcc;
  }, [] as BartEtdByDestination[]);
}
