// src/components/MetricDescription.jsx
/**
 * MetricDescription Component
 * 
 * This component displays descriptive information about ESG (Environmental, Social, and Governance) 
 * metrics or categories. It fetches descriptions from an API and uses multiple matching strategies
 * to find the most relevant description for the current metric or category.
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, CircularProgress } from "@mui/material";
import axios from "axios";

/**
 * MetricDescription Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.metric - The metric object containing information such as URI and label
 */
export default function MetricDescription({ metric }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Effect hook to fetch the description when the metric changes
   */
  useEffect(() => {
    if (metric) {
      fetchDescription();
    }
  }, [metric]);

  /**
   * Extracts a category code from a URI
   * Looks for patterns like "A-B-123" in the URI string
   * 
   * @param {string} uri - The URI to extract from
   * @returns {string} - The extracted category code or an empty string if none found
   */
  const extractCategoryCode = (uri) => {
    const match = uri && uri.match(/([A-Z]+-[A-Z]+-\d+[a-z]*)/);
    return match ? match[1] : "";
  };

  /**
   * Fetches and sets the description for the current metric
   * Uses multiple strategies to find the most relevant description:
   * 1. Exact match by category code
   * 2. Partial match by category code
   * 3. Keyword matching from the label
   * 4. Generated description based on category code patterns
   * 5. Generated description based on label keywords
   * 
   * If no match is found, falls back to a default description
   */
  const fetchDescription = async () => {
    if (!metric) return;

    setLoading(true);

    try {
      const uri = metric.categories_uri || metric.metric_uri || "";
      const categoryCode = extractCategoryCode(uri);
      const label = (metric.categories_label || metric.metric_label || "").trim();
      const response = await axios.get("http://127.0.0.1:5001/stardog/getCategoryDescriptions");

      if (response.status === 200) {
        const descriptions = response.data;

        // Try multiple matching strategies to find the appropriate description
        let matchedDesc = null;

        // First try: Exact match using category code
        if (categoryCode) {
          matchedDesc = descriptions.find(desc =>
            desc.category_name.toUpperCase() === categoryCode.toUpperCase()
          );
        }

        // Second try: Partial match using category code
        if (!matchedDesc && categoryCode) {
          matchedDesc = descriptions.find(desc =>
            desc.category_name.toUpperCase().includes(categoryCode.toUpperCase()) ||
            categoryCode.toUpperCase().includes(desc.category_name.toUpperCase())
          );
        }

        // Third try: Keyword matching from the label
        if (!matchedDesc && label) {
          // Extract keywords
          const keywords = label.split(/\s+/)
            .filter(word => word.length > 3)  // Only use keywords longer than 3 characters
            .map(word => word.toLowerCase());

          // Calculate matching score for each description
          let bestMatch = null;
          let maxMatches = 0;

          descriptions.forEach(desc => {
            if (!desc.category_name || !desc.description) return;

            const descLower = desc.category_name.toLowerCase() + " " + desc.description.toLowerCase();
            let matches = 0;

            keywords.forEach(keyword => {
              if (descLower.includes(keyword)) {
                matches++;
              }
            });

            if (matches > maxMatches) {
              maxMatches = matches;
              bestMatch = desc;
            }
          });

          if (maxMatches > 0) {
            matchedDesc = bestMatch;
          }
        }

        if (matchedDesc && matchedDesc.description) {
          setDescription(matchedDesc.description);
        } else {
          // Fallback: Generate description based on category code pattern
          if (categoryCode) {
            // Determine the main category based on the first part of the code
            const categoryType = categoryCode.split('-')[1] || '';

            if (categoryType === 'SC') {
              if (categoryCode.includes('110')) {
                setDescription("Information about greenhouse gas emissions and energy management in the Semiconductor industry.");
              } else if (categoryCode.includes('140')) {
                setDescription("Information about water management and water usage in the Semiconductor industry.");
              } else if (categoryCode.includes('150')) {
                setDescription("Information about hazardous waste management in the Semiconductor industry.");
              } else {
                setDescription("Environmental, Social, and Governance metrics for the Semiconductor industry.");
              }
            } else if (categoryType === 'BP') {
              if (categoryCode.includes('110')) {
                setDescription("Information about safety of clinical trial participants in the Biotechnology & Pharmaceuticals industry.");
              } else if (categoryCode.includes('240')) {
                setDescription("Information about drug safety and side effects in the Biotechnology & Pharmaceuticals industry.");
              } else if (categoryCode.includes('250')) {
                setDescription("Information about counterfeit drugs in the Biotechnology & Pharmaceuticals industry.");
              } else {
                setDescription("Environmental, Social, and Governance metrics for the Biotechnology & Pharmaceuticals industry.");
              }
            } else {
              setDescription("Environmental, Social, and Governance (ESG) metric related to corporate sustainability and accountability.");
            }
          } else if (label) {
            // Fallback: Generate description based on keywords in the label
            if (label.includes("GHG") || label.includes("Emissions") || label.includes("CO2")) {
              setDescription("Information about greenhouse gas emissions and carbon footprint management.");
            } else if (label.includes("Energy")) {
              setDescription("Information about energy management, usage, and efficiency initiatives.");
            } else if (label.includes("Water")) {
              setDescription("Information about water management, consumption, and conservation efforts.");
            } else if (label.includes("Waste")) {
              setDescription("Information about waste management, reduction, and recycling programs.");
            } else {
              setDescription("Environmental, Social, and Governance (ESG) metrics related to corporate sustainability and accountability.");
            }
          } else {
            setDescription("No description available for this metric or category.");
          }
        }
      }
    } catch (err) {
      console.error("Error fetching description:", err);
      setDescription("Unable to load description. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#fafafa",
        minHeight: 420,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>

        <Box sx={{
          mt: 2,
          flexGrow: 1,
          display: "flex",
          alignItems: loading ? "center" : "flex-start",
          justifyContent: loading ? "center" : "flex-start"
        }}>
          {loading ? (
            <CircularProgress size={24} />
          ) : description ? (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-line",
                lineHeight: 1.6,
                color: "#333",
                fontFamily: "inherit",
              }}
            >
              {description}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No description available for this category.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}