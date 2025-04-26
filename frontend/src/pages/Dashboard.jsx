/**
 * Dashboard.jsx
 * 
 * Main dashboard component responsible for displaying ESG metrics organized by categories.
 * This component fetches category and metric data from the backend based on selected filters
 * and renders the information in a structured layout with filtering capabilities.
 * 
 * @module Dashboard
 */

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Paper } from "@mui/material";
import FilterBar from "../components/FilterBar";
import Sidebar from "../components/Sidebar";
import MetricsGrid from "../components/MetricsGrid";

export default function Dashboard() {
  // Retrieve initial company state from router location, defaulting to "Soitec SA" if not provided
  const location = useLocation();
  const initialCompany = location.state?.company || "Soitec SA";

  // State management for filter parameters
  const [company, setCompany] = useState(initialCompany);
  const [industry, setIndustry] = useState("Semiconductors");
  const [reportingYear, setReportingYear] = useState("2022-12-31");

  // State management for API data and loading states
  const [categoriesData, setCategoriesData] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorMetrics, setErrorMetrics] = useState(null);

  /**
   * Effect hook to fetch all categories based on selected industry
   * Updates categoriesData state upon successful response
   * Handles loading state and potential errors
   */
  useEffect(() => {
    setLoadingCategories(true);
    axios
      .get(`http://127.0.0.1:5001/stardog/getAllCategories?industry=${industry}`)
      .then((res) => {
        setCategoriesData(res.data);
        setLoadingCategories(false);
      })
      .catch((err) => {
        setErrorCategories(err.message);
        setLoadingCategories(false);
      });
  }, [industry]);

  /**
   * Effect hook to fetch all metrics based on selected industry
   * Updates metricsData state upon successful response
   * Handles loading state and potential errors
   */
  useEffect(() => {
    setLoadingMetrics(true);
    axios
      .get(`http://127.0.0.1:5001/stardog/getAllMetrics?industry=${industry}`)
      .then((res) => {
        setMetricsData(res.data);
        setLoadingMetrics(false);
      })
      .catch((err) => {
        setErrorMetrics(err.message);
        setLoadingMetrics(false);
      });
  }, [industry]);

  // Display loading indicator while data is being fetched
  if (loadingCategories || loadingMetrics) {
    return <Typography sx={{ p: 2 }}>Loading...</Typography>;
  }

  // Display error message if either API request fails
  if (errorCategories || errorMetrics) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Error: {errorCategories || errorMetrics}
      </Typography>
    );
  }

  /**
   * Process and organize the fetched data by mapping metrics to their respective categories
   * Algorithm:
   * 1. Create a mapping object with category URIs as keys
   * 2. Match metrics to categories based on URI patterns
   * 3. Combine into a structured data format for rendering
   */
  const categoryMapping = {};
  categoriesData.forEach((cat) => {
    categoryMapping[cat.categories_uri] = { category: cat, metrics: [] };
  });
  metricsData.forEach((met) => {
    // Check if metric URI ends with a letter and extract potential category URI
    if (met.metric_uri && /[a-zA-Z]$/.test(met.metric_uri)) {
      const possibleCatUri = met.metric_uri.slice(0, -1);
      if (categoryMapping[possibleCatUri]) {
        categoryMapping[possibleCatUri].metrics.push(met);
      }
    }
  });
  const combinedData = Object.values(categoryMapping);

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Sidebar navigation component */}
      <Sidebar />

      {/* Main content container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f5f5f5",
          maxWidth: "100%",
          minHeight: "100vh",
        }}
      >
        {/* Sticky filter bar for adjusting dashboard parameters */}
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            borderRadius: 2,
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        >
          <FilterBar
            industry={industry}
            setIndustry={setIndustry}
            reportingYear={reportingYear}
            setReportingYear={setReportingYear}
            company={company}
            setCompany={setCompany}
          />
        </Paper>

        {/* Grid display of metrics organized by categories */}
        <MetricsGrid
          combinedData={combinedData}
          industry={industry}
          reportingYear={reportingYear}
          company={company}
        />
      </Box>
    </Box>
  );
}