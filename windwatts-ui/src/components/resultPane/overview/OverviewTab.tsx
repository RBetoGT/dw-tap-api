import { Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { SettingsContext } from "../../../providers/SettingsContext";
import { useOutputUnit } from "../../../hooks";
import { DataSourceLinks } from "./DataSourceLinks";
import { ProductionCard } from "./ProductionCard";
import { SummaryCards } from "./SummaryCards";

export const OverviewTab = () => {
  const { preferredModel } = useContext(SettingsContext);

  useOutputUnit(); // auto-switches between kWh and MWh

  return (
    <Stack spacing={2}>
      <SummaryCards />
      {preferredModel !== "ensemble-quantiles" && (
        <DataSourceLinks preferredModel={preferredModel} />
      )}
      {preferredModel === "ensemble-quantiles" && (
        <Typography variant="body2" color="text.secondary">
          * Experimental model (under development)
        </Typography>
      )}
      <ProductionCard />
    </Stack>
  );
};
