import { useContext, useMemo } from "react";
import useSWR from "swr";
import { SettingsContext } from "../providers/SettingsContext";
import { getWindRose } from "../services/api";
import { isOutOfBounds } from "../utils";

export const useWindRoseData = () => {
  const {
    currentPosition,
    hubHeight,
    preferredModel: dataModel,
  } = useContext(SettingsContext);
  const { lat, lng } = currentPosition || {};
  const outOfBounds =
    lat && lng && dataModel ? isOutOfBounds(lat, lng, dataModel) : false;
  const shouldFetch = lat && lng && hubHeight && dataModel && !outOfBounds;

  const swrKey = useMemo(() => {
    if (!shouldFetch) return null;
    return JSON.stringify({
      lat,
      lng,
      hubHeight,
      dataModel,
      endpoint: "windrose",
    });
  }, [shouldFetch, lat, lng, hubHeight, dataModel]);

  const { isLoading, data, error } = useSWR(
    swrKey,
    () =>
      getWindRose({
        lat: lat!,
        lng: lng!,
        hubHeight,
        dataModel,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 0,
    }
  );

  return {
    windRoseData: data,
    isLoading,
    error,
    hasData: !!data,
    outOfBounds,
    dataModel,
    lat,
    lng,
  };
};
