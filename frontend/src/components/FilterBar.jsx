/**
 * FilterBar.jsx
 * 
 * A component providing filter controls for the ESG dashboard.
 * Allows users to select industry, reporting year, and company name,
 * with optimized input handling to minimize unnecessary re-renders.
 * 
 * @module FilterBar
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from "@mui/material";
import GenerateReportButton from "./GenerateReportButton";

/**
 * FilterBar component for dashboard controls
 * 
 * @param {Object} props - Component props
 * @param {string} props.industry - Currently selected industry
 * @param {Function} props.setIndustry - Setter function for industry
 * @param {string} props.reportingYear - Currently selected reporting year (in format YYYY-MM-DD)
 * @param {Function} props.setReportingYear - Setter function for reporting year
 * @param {string} props.company - Currently selected company name
 * @param {Function} props.setCompany - Setter function for company name
 * @param {Function} props.onGenerateReport - Handler for report generation (optional)
 * @returns {JSX.Element} The FilterBar component
 */
export default function FilterBar({
  industry,
  setIndustry,
  reportingYear,
  setReportingYear,
  company,
  setCompany,
  onGenerateReport
}) {
  // Local state for company name input to prevent frequent parent re-renders
  const [tempCompany, setTempCompany] = useState(company);

  /**
   * Synchronize local state with props when company prop changes externally
   */
  useEffect(() => {
    setTempCompany(company);
  }, [company]);

  /**
   * Update company value only on blur to optimize performance
   * Only triggers parent update when value has actually changed
   */
  const handleBlur = () => {
    if (tempCompany !== company) {
      setCompany(tempCompany);
    }
  };

  /**
   * Extracts year portion from a date string in format YYYY-MM-DD
   * 
   * @param {string} dateString - Date in format YYYY-MM-DD
   * @returns {string} The year portion (YYYY)
   */
  const getYearFromDateString = (dateString) => {
    return dateString.substring(0, 4);
  };

  /**
   * Handles year selection changes
   * Converts year to standardized date format (YYYY-12-31)
   * 
   * @param {Object} e - Change event from Select component
   */
  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    const fullDateFormat = `${selectedYear}-12-31`;
    setReportingYear(fullDateFormat);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        alignItems: "center",
        p: 2,
        width: "100%",
      }}
    >
      {/* Industry selection dropdown */}
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Industry</InputLabel>
        <Select
          value={industry}
          label="Industry"
          onChange={(e) => setIndustry(e.target.value)}
        >
          <MenuItem value="Semiconductors">Semiconductors</MenuItem>
          <MenuItem value="Biotechnology %26 Pharmaceuticals">Biotechnology & Pharmaceuticals</MenuItem>
          <MenuItem value="Internet Media %26 Services">Internet Media & Services</MenuItem>
          <MenuItem value="Drug Retailers">Drug Retailers</MenuItem>
        </Select>
      </FormControl>

      {/* Year selection dropdown */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Year</InputLabel>
        <Select
          value={getYearFromDateString(reportingYear)}
          label="Year"
          onChange={handleYearChange}
        >
          <MenuItem value="2024">2024</MenuItem>
          <MenuItem value="2023">2023</MenuItem>
          <MenuItem value="2022">2022</MenuItem>
          <MenuItem value="2021">2021</MenuItem>
          <MenuItem value="2020">2020</MenuItem>
          <MenuItem value="2019">2019</MenuItem>
          <MenuItem value="2018">2018</MenuItem>
          <MenuItem value="2017">2017</MenuItem>
          <MenuItem value="2016">2016</MenuItem>
        </Select>
      </FormControl>

      {/* Company name input field with optimized update handling */}
      <TextField
        size="small"
        label="Company"
        value={tempCompany}
        onChange={(e) => setTempCompany(e.target.value)}
        onBlur={handleBlur} // Only update parent state on blur
        sx={{ minWidth: 200 }}
      />

      {/* Report generation button */}
      <GenerateReportButton />
    </Box>
  );
}