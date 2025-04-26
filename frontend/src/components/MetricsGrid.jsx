// src/components/MetricsGrid.jsx
/**
 * MetricsGrid Component
 * 
 * This component renders a grid of ESG (Environmental, Social, and Governance) metric categories.
 * Each grid item contains a MetricCard for interacting with the metric data and a MetricDescription
 * that provides contextual information about the category.
 * 
 * The layout uses a 66/34 split between the metric card and description for optimal viewing.
 */
import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import MetricCard from "./MetricCard";
import MetricDescription from "./MetricDescription";

/**
 * MetricsGrid Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.combinedData - Array of objects containing category and metrics data
 *   Each object has:
 *   - category: The category object with properties like categories_uri, categories_label
 *   - metrics: Array of metrics that belong to this category
 * @param {string} props.industry - Selected industry for metric context
 * @param {string} props.reportingYear - Selected year for reporting period
 * @param {string} props.company - Company name for which metrics are being displayed
 */
export default function MetricsGrid({ combinedData, industry, reportingYear, company }) {
  return (
    <Grid container spacing={3} direction="column">
      {combinedData.map((item) => (
        <Grid item xs={12} key={item.category.categories_uri}>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 2,
              display: "flex",
              flexDirection: "row",
              gap: 2,
              maxWidth: "1200px",
            }}
          >
            {/* Left section (66% width) containing the MetricCard */}
            <Box sx={{ width: "66%" }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontWeight: 200,
                  fontFamily: "inherit",
                  color: "#000",
                  fontSize: "1.2rem"
                }}
              >
                {item.category.categories_label}
              </Typography>
              <MetricCard
                metric={item.category}
                matchedMetrics={item.metrics}
                industry={industry}
                reportingYear={reportingYear}
                company={company}
                uniqueId={item.category.categories_uri}
              />
            </Box>

            {/* Right section (34% width) containing the MetricDescription */}
            <Box sx={{ width: "34%" }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontWeight: 200,
                  fontFamily: "inherit",
                  color: "#000",
                  fontSize: "1.2rem"
                }}
              >
                Category Description
              </Typography>
              <MetricDescription metric={item.category} />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}