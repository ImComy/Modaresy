import * as React from 'react';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts/LineChart';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

const getCSSVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const BasicLineChart = ({
  uData = [],
  secondaryData = null,
  xLabels = [],
  primaryLabel = 'Contacts',
  secondaryLabel = 'Views',
}) => {
  const { t } = useTranslation();
  const [value, setValue] = React.useState([
    Math.max(0, xLabels.length - 5),
    xLabels.length - 1,
  ]);

  const [themeColors, setThemeColors] = React.useState({
    primary: '#1976d2',
    secondary: '#c19b00',
  });

  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(300);
  const [height, setHeight] = React.useState(250);

  React.useEffect(() => {
    const primary = getCSSVar('--primary');
    const secondary = getCSSVar('--secondary');
    if (primary && secondary) {
      setThemeColors({
        primary: `hsl(${primary})`,
        secondary: `hsl(${secondary})`,
      });
    }
  }, []);

  React.useEffect(() => {
    const updateDimensions = () => {
      const newWidth = containerRef.current?.offsetWidth || 300;
      const screenHeight = window.innerHeight;
      const newHeight = Math.max(350, Math.min(500, screenHeight * 0.3));
      setWidth(newWidth);
      setHeight(newHeight);
    };

    updateDimensions();
    const handleResize = () => {
      clearTimeout((window)._chartResizeTimer);
      (window)._chartResizeTimer = setTimeout(updateDimensions, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout((window)._chartResizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const theme = createTheme({
    components: {
      MuiSlider: {
        styleOverrides: {
          root: {
            '& .MuiSlider-rail': { backgroundColor: themeColors.primary },
            '& .MuiSlider-thumb': { color: themeColors.primary },
            '& .MuiSlider-track': { color: themeColors.primary },
          },
        },
      },
    },
  });

  const handleChange = (event, newValue) => {
    if (!Array.isArray(newValue)) return;
    const min = Math.max(0, newValue[0]);
    const max = Math.min(xLabels.length - 1, newValue[1]);
    setValue([min, max]);
  };

  const valueLabelFormat = (index) => xLabels[index];

  const chartSeries = [
    {
      data: uData.slice(value[0], value[1] + 1),
      color: themeColors.primary,
    },
  ];

  if (secondaryData && Array.isArray(secondaryData)) {
    chartSeries.push({
      data: secondaryData.slice(value[0], value[1] + 1),
      color: themeColors.secondary,
    });
  }

  return (
    <>
      <div style={{ direction: 'ltr' }} />
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          px: 2,
          maxWidth: 500,
          mx: 'auto',
          '& .MuiChartsAxis-line': { stroke: `${themeColors.primary} !important` },
          '& .MuiChartsAxis-tick': { stroke: `${themeColors.primary} !important` },
          '& .MuiChartsAxis-tickLabel': { fill: `${themeColors.primary} !important` },
        }}
      >
        <LineChart
          sx={{ marginRight: '30px' }}
          width={width}
          height={height}
          series={chartSeries}
          xAxis={[
            {
              scaleType: 'point',
              data: xLabels.slice(value[0], value[1] + 1),
              axisLine: { stroke: themeColors.primary, strokeWidth: 2 },
              tickLine: { stroke: themeColors.secondary },
              tickLabelStyle: { fill: themeColors.primary },
            },
          ]}
          yAxis={[
            {
              axisLine: { stroke: themeColors.primary, strokeWidth: 2 },
              tickLine: { stroke: themeColors.secondary },
              tickLabelStyle: { fill: themeColors.secondary },
            },
          ]}
        />

        <Box display="flex" justifyContent="center" gap={2} mt={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 16, height: 4, bgcolor: themeColors.primary }} />
            <Typography variant="body2">{t(primaryLabel)}</Typography>
          </Box>
          {secondaryData && (
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 4, bgcolor: themeColors.secondary }} />
              <Typography variant="body2">{t(secondaryLabel)}</Typography>
            </Box>
          )}
        </Box>

        <ThemeProvider theme={theme}>
          <Slider
            value={value}
            onChange={handleChange}
            valueLabelDisplay="auto"
            valueLabelFormat={valueLabelFormat}
            min={0}
            max={xLabels.length - 1}
          />
        </ThemeProvider>
      </Box>
    </>
  );
};

export default BasicLineChart;
