/**
 * UserGuidePage.jsx
 * 
 * A comprehensive documentation page that provides users with detailed instructions,
 * explanations, and visual guides on how to use the ESG Data Analysis System.
 * The page covers system introduction, dashboard usage, report generation,
 * report history management, and answers to common questions.
 * 
 * @module UserGuidePage
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Container,
  Grid,
  Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Import application screenshots and visualization images for documentation
import dashboardImg from '../assets/images/dashboard.jpeg';
import generateReportImg1 from '../assets/images/generate-report-1.jpeg';
import generateReportImg2 from '../assets/images/generate-report-2.jpeg';
import reportHistoryImg from '../assets/images/report-history.jpeg';
import pcaHeatmapImg from '../assets/images/pca-heatmap.png';
import screeplotImg from '../assets/images/screeplot.png';

export default function UserGuidePage() {
  const navigate = useNavigate();

  /**
   * Handles navigation back to the dashboard page
   */
  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Main navigation sidebar */}
      <Sidebar />

      {/* Main content container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          overflow: "auto"
        }}
      >
        {/* Main content wrapper */}
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
          }}
        >
          {/* Page header with back navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h5" fontWeight="600">User Guide</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Content container with max width for better readability */}
          <Container maxWidth="lg">
            <Paper
              elevation={0}
              sx={{
                p: 4,
                backgroundColor: 'white',
                borderRadius: 2,
                mb: 4
              }}
            >
              {/* Section 1: System Introduction - Overview of the ESG analysis platform */}
              <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
                1. System Introduction
              </Typography>

              <Typography paragraph>
                Welcome to our ESG Data Analysis System! This platform is designed to help you explore and evaluate
                corporate ESG (Environmental, Social, and Governance) performance based on the SASB framework
                and Eurofidai's raw ESG data.
              </Typography>

              <Typography paragraph>
                Powered by advanced data preprocessing, PCA modeling, and a knowledge graph integrating SASB
                relationships, our system delivers accurate, transparent, and actionable ESG insights. Whether
                you're an investor, analyst, or sustainability professional, this tool empowers you to make
                data-driven decisions with confidence.
              </Typography>

              <Typography paragraph>
                Start by checking the dashboard page and selecting your industry to explore ESG metrics tailored
                to your needs!
              </Typography>

              {/* External reference links */}
              <Box sx={{ mb: 4, mt: 2 }}>
                <Link href="https://sasb.ifrs.org/standards/materiality-finder/find/" target="_blank"
                  sx={{ display: 'block', mb: 1 }}>
                  SASB Framework Reference
                </Link>
                <Link href="https://www.eurofidai.org/product/esg-raw-data-corporations" target="_blank">
                  Eurofidai's Raw ESG Data Reference
                </Link>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Section 2: Dashboard - Explanation of the main interface and features */}
              <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
                2. Dashboard
              </Typography>

              <Typography paragraph>
                Our system provides a user-friendly dashboard where you can:
              </Typography>

              <Box component="ul" sx={{ pl: 4, mb: 3 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Select an Industry and Reporting Year:</strong> Discover the most relevant ESG
                    categories (topics) for your chosen industry, as defined by the SASB Standards.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Explore Metrics and Models:</strong> For each category, view the associated metrics
                    and models. The system identifies key raw metrics from Eurofidai's dataset that serve as
                    principal components for the category, ensuring industry-specific relevance.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Calculate Category Scores:</strong> Combine SASB framework and PCA-weighted metrics
                    to generate a comprehensive score for each category.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Generate and Save Reports:</strong> Create detailed ESG reports and review your
                    historical reports anytime.
                  </Typography>
                </Box>
              </Box>

              {/* Dashboard screenshot with caption */}
              <Box sx={{ mt: 2, mb: 4, textAlign: 'center' }}>
                <img
                  src={dashboardImg}
                  alt="Dashboard Screenshot"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                  }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Dashboard Interface
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Section 3: Generate Report - Step-by-step guide for report creation */}
              <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
                3. Generate Report
              </Typography>

              <Typography paragraph>
                After you click "Generate Report" after adding all categories you want, the system enables you to create customized ESG reports based on your selected categories and metrics. In this page you can:
              </Typography>

              <Box component="ul" sx={{ pl: 4, mb: 3 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Select Report Type:</strong> Choose between a comprehensive combined report or individual reports for each ESG category.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Modify Report Name:</strong> Personalize the report name for easy identification in your history.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Generate Report:</strong> Produce the final report with your selected metrics and category scores.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>View your Generated Report:</strong> The report includes all the information you have selected in previous steps: industry, company, year, category, calculated ESG score, selected metrics below category and their raw values.
                  </Typography>
                </Box>
              </Box>

              {/* Report generation screenshots grid with captions */}
              <Box sx={{ mt: 2, mb: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <img
                        src={generateReportImg1}
                        alt="Generate Report Dialog Step 1"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1, mb: 2, color: 'text.secondary' }}>
                        Step 1: Add metrics to report
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <img
                        src={generateReportImg2}
                        alt="Generate Report Dialog Step 2"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1, mb: 2, color: 'text.secondary' }}>
                        Step 2: Generate the report
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Section 4: Report History - Description of report management features */}
              <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
                4. Report History
              </Typography>

              <Typography paragraph>
                The system maintains a complete record of all your previously generated ESG reports for easy access and management. In this page you can:
              </Typography>

              <Box component="ul" sx={{ pl: 4, mb: 3 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Review Report Listings:</strong> View a chronological table of all your past reports, including report names, company names, corresponding industry, generation time, and ESG score parameters.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Examine Report Details:</strong> Click any report entry to see its comprehensive metadata - including all selected categories, metrics used, and final scoring methodology.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Access Full Reports:</strong> Select "View Report" to reopen any complete report exactly as when it was generated.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Manage Your History:</strong> Maintain your report collection by deleting obsolete or test reports to keep your workspace organized.
                  </Typography>
                </Box>
              </Box>

              {/* Report history screenshot with caption */}
              <Box sx={{ mt: 2, mb: 4, textAlign: 'center' }}>
                <img
                  src={reportHistoryImg}
                  alt="Report History Page"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                  }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Report History Interface
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Section 5: Common Q&A - Answers to frequently asked questions */}
              <Typography variant="h4" fontWeight="600" sx={{ mb: 3 }}>
                Common Q & A
              </Typography>

              {/* Question 1: Available companies */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  What companies can I access in the system?
                </Typography>
                <Typography paragraph>
                  Up to now, we have included over 4,400 companies from 4 industries
                  (Semiconductor, Biotechnology & Pharmaceuticals, Internet Media & Services,
                  Drug Retailers) in the system. Here are some examples of industry and company
                  name you can find. Please make sure you have selected the corresponding industry
                  to your company or you would fail to load the correct data.
                </Typography>

                {/* Company examples table */}
                <Box sx={{ overflow: 'auto', mb: 2 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ padding: '4px 6px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Industry</th>
                        <th style={{ padding: '4px 6px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Company Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0', verticalAlign: 'top' }} rowSpan="5">Drug Retailers</td>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Clicks Group Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>CK Hutchison Holdings Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Galenica AG</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Dis-Chem Pharmacies Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Raia Drogasil SA</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0', verticalAlign: 'top' }} rowSpan="5">Biotechnology & Pharmaceuticals</td>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Aspen Pharmacare Holdings Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Dr Reddy's Laboratories Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Johnson & Johnson</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Teva Pharmaceutical Industries Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Shanghai Fosun Pharmaceutical Group Co Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0', verticalAlign: 'top' }} rowSpan="5">Internet Media & Services</td>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>SPS Commerce Inc</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Seek Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Tencent Holdings Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Rightmove PLC</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Naspers Ltd</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0', verticalAlign: 'top' }} rowSpan="5">Semiconductors</td>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Soitec SA</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>STMicroelectronics NV</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>ON Semiconductor Corp</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>United Microelectronics Corp</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0' }}>Winbond Electronics Corp</td>
                      </tr>
                    </tbody>
                  </table>
                </Box>

                <Typography>
                  You can access the full list of available company names <Link href="https://drive.google.com/file/d/11vnNza7uDpq3Rcvg5HRpO1r5BfnUJXcL/view?usp=sharing" target="_blank">here</Link>.
                </Typography>
              </Box>

              {/* Question 2: Missing companies */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  Why I cannot find my company in the full company list?
                </Typography>
                <Typography paragraph>
                  The companies in the list are all the companies you may access in the system now.
                  We are still expanding our company list and industries. Please keep hope and wait patiently! : )
                </Typography>
              </Box>

              {/* Question 3: No records issue */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  Why it shows "No records" after I load framework data or PCA data?
                </Typography>
                <Typography paragraph>
                  For framework data, it is normal case to find no records for descriptive categories because
                  our Eurofidai Data resource does not fully align with the metric/model descriptions in the
                  SASB standards. You can still refer to PCA metrics that can also indicate how well your
                  company behave in the target category.
                </Typography>
                <Typography paragraph>
                  For PCA metrics, you should always find some metrics. But that the Eurofidai Dataset. In this
                  circumstance, you can consider remove that category and choose.
                </Typography>
                <Typography paragraph>
                  However, if you find all the metrics on the system shows "No records" when you load data,
                  you may have input the wrong company name, or may have selected the wrong industry, or your
                  company is not included in our system. Please check for details to Q&A 1 to find the industry
                  and company name you are able to fill in.
                </Typography>
              </Box>

              {/* Question 4: Loading performance */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  My dashboard keeps showing "Loading Data" but no results appear after clicking "Load Dataframe Data / Load PCA Data" / My dashboard keeps waiting after clicking "generate report"
                </Typography>
                <Typography paragraph>
                  It may take some time (approximately up to 20s) to search the data in our database because we
                  have a large cloud database and due to budget issues the computing performance of which is not
                  ideal. Please have patience with it!
                </Typography>
              </Box>

              {/* Question 5: Technical methodology explanation */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  How are the PCA metrics derived and how is the category score calculated?
                </Typography>
                <Typography paragraph>
                  PCA (Principal Component Analysis) model is a linear dimensionality reduction technique. It finds
                  patterns in the data and combines related items into a 'smaller set of items' (called principal
                  components), making it easier to analyze without losing the key information.
                </Typography>
                <Typography paragraph>
                  Based on the plain PCA model, we introduce the concept of ontology to implement ontology-based
                  PCA model. We add the hierarchy relationship between category and raw metrics to the PCA model
                  in which way the metrics can be interpreted better.
                </Typography>
                <Typography paragraph>
                  The category score is a combination result of both SASB framework metrics and PCA model metrics.
                  We get the weights from PCA model and give a percentage score. You can always select the metrics
                  you consider important and the system would use your selected metrics to calculate the category score!
                </Typography>
                <Typography paragraph>
                  Here are some visualization results of the PCA model taking Drug Retailer Industry as example.
                  The results of our data are interpreted and validated in these visualization graphs:
                </Typography>

                {/* PCA visualization grid */}
                <Grid container spacing={4} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                      Scree Plot
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <img
                        src={screeplotImg}
                        alt="Scree Plot"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                    <Typography paragraph sx={{ mt: 2 }}>
                      Shows the proportion of variance explained by each principal component:
                    </Typography>
                    <Box component="ul" sx={{ pl: 4 }}>
                      <Box component="li">
                        <Typography>The first principal component explains about 45% of the variance</Typography>
                      </Box>
                      <Box component="li">
                        <Typography>The cumulative 8 principal components can explain about 80% of the total variance</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                      Heatmap Plot
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <img
                        src={pcaHeatmapImg}
                        alt="PCA Heatmap"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                    <Typography paragraph sx={{ mt: 2 }}>
                      Shows the impact strength of each indicator on the first five principal components:
                    </Typography>
                    <Box component="ul" sx={{ pl: 4 }}>
                      <Box component="li">
                        <Typography>Red indicates positive correlation, blue indicates negative correlation</Typography>
                      </Box>
                      <Box component="li">
                        <Typography>Such as co2indirectscope2 contribute more to PC1</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Container>
        </Paper>
      </Box>
    </Box>
  );
}