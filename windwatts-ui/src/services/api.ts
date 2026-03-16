import {
  EnergyProductionRequest,
  WindspeedByLatLngRequest,
  WindRoseRequest,
  NearestGridLocationRequest,
  CSVExportRequest,
  CSVBatchExportRequest,
  WindRoseResponse,
} from "../types";

const USE_WIND_ROSE_PLACEHOLDER = true;

const WIND_ROSE_PLACEHOLDER_RESPONSE: WindRoseResponse = {
  unit: "m/s",
  speedBins: [
    { label: "0-3", min: 0, max: 3 },
    { label: "3-6", min: 3, max: 6 },
    { label: "6-9", min: 6, max: 9 },
    { label: "9-12", min: 9, max: 12 },
    { label: "12-15", min: 12, max: 15 },
  ],
  sectors: [
    { direction: "N", frequencies: [4, 8, 5, 2, 1] },
    { direction: "NE", frequencies: [3, 7, 8, 4, 2] },
    { direction: "E", frequencies: [2, 5, 10, 5, 2] },
    { direction: "SE", frequencies: [2, 4, 7, 4, 1] },
    { direction: "S", frequencies: [3, 6, 6, 2, 1] },
    { direction: "SW", frequencies: [4, 9, 8, 3, 1] },
    { direction: "W", frequencies: [5, 10, 7, 3, 1] },
    { direction: "NW", frequencies: [4, 8, 6, 2, 1] },
  ],
};

export const fetchWrapper = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchBlobWrapper = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};
// V1 API: Uses unified endpoint with model as path parameter
export const getWindspeedByLatLong = async ({
  lat,
  lng,
  hubHeight,
  dataModel,
}: WindspeedByLatLngRequest) => {
  const url = `/api/v1/${dataModel}/windspeed?lat=${lat}&lng=${lng}&height=${hubHeight}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper(url, options);
};

export const getWindRose = async ({
  lat,
  lng,
  hubHeight,
  dataModel,
}: WindRoseRequest): Promise<WindRoseResponse> => {
  const url = `/api/v1/${dataModel}/windrose?lat=${lat}&lng=${lng}&height=${hubHeight}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (USE_WIND_ROSE_PLACEHOLDER) {
    return structuredClone(WIND_ROSE_PLACEHOLDER_RESPONSE);
  }

  return fetchWrapper(url, options);
};

// V1 API:
// period options: "all" (default), "summary", "annual", "monthly" (varies by model)
export const getEnergyProduction = async ({
  lat,
  lng,
  hubHeight,
  turbine,
  dataModel,
  period = "all",
}: EnergyProductionRequest) => {
  const url = `/api/v1/${dataModel}/production?lat=${lat}&lng=${lng}&height=${hubHeight}&turbine=${turbine}&period=${period}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper(url, options);
};

// export const getAvailablePowerCurves = async ({
//   dataModel,
// }: { dataModel: DataModel }) => {
//   const url = `/api/${dataModel}/available-powercurves`;
//   const options = {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   };
//   return fetchWrapper(url, options);
// };

// V1 API: Turbines are model-agnostic
export const getAvailableTurbines = async () => {
  const url = `/api/v1/turbines`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper(url, options);
};

// V1 API: Grid points lookup
export const getNearestGridLocation = async ({
  lat,
  lng,
  n_neighbors = 1,
  dataModel,
}: NearestGridLocationRequest) => {
  const url = `/api/v1/${dataModel}/grid-points?lat=${lat}&lng=${lng}&limit=${n_neighbors}`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper(url, options);
};

// V1 API: Get model information
export const getModelInfo = async (dataModel: string) => {
  const url = `/api/v1/${dataModel}/info`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetchWrapper(url, options);
};

// V1 API: Single timeseries CSV download
// by period of hourly or monthly
// with option to include energy
export const getExportCSV = async (
  {
    gridIndex,
    dataModel,
    period = "hourly",
    turbine,
    yearSet,
  }: CSVExportRequest,
  includeEnergy: boolean
) => {
  if (includeEnergy) {
    if (!turbine) {
      throw new Error("Turbine must be specified for energy export");
    }
    // Energy export
    const params = new URLSearchParams({
      gridIndex: gridIndex,
      period: period,
      turbine: turbine,
    });
    if (yearSet) {
      params.append("year_set", yearSet);
    }
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries/energy?${params.toString()}`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    return fetchBlobWrapper(url, options);
  } else {
    // Timeseries export
    const params = new URLSearchParams({
      gridIndex: gridIndex,
      period: period,
    });
    if (yearSet) {
      params.append("year_set", yearSet);
    }
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries?${params.toString()}`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    return fetchBlobWrapper(url, options);
  }
};

// V1 API: Batch CSV download as ZIP
export const getBatchExportCSV = async (
  {
    gridLocations,
    dataModel,
    period = "hourly",
    turbine,
    yearSet,
  }: CSVBatchExportRequest,
  includeEnergy: boolean
) => {
  if (includeEnergy) {
    if (!turbine) {
      throw new Error("Turbine must be specified for energy export");
    }
    // Batch energy export
    const params = new URLSearchParams({
      period: period,
      turbine: turbine,
    });
    if (yearSet) {
      params.append("year_set", yearSet);
    }
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries/energy/batch?${params.toString()}`;
    const body = {
      locations: gridLocations,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
    return fetchBlobWrapper(url, options);
  } else {
    // Batch timeseries export
    const params = new URLSearchParams({
      period: period,
    });
    if (yearSet) {
      params.append("year_set", yearSet);
    }
    dataModel = "era5-timeseries"; // Hardcode timeseries model
    const url = `/api/v1/${dataModel}/timeseries/batch?${params.toString()}`;
    const body = {
      locations: gridLocations,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
    return fetchBlobWrapper(url, options);
  }
};
