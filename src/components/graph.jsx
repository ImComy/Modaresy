import * as React from 'react';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts/LineChart';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

const getCSSVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const BasicLineChart = ({ uData, secondaryData, xLabels }) => {
  const [value, setValue] = React.useState([
    Math.max(0, xLabels.length - 5),
    xLabels.length - 1,
  ]);

  const { t } = useTranslation();

  const [themeColors, setThemeColors] = React.useState({
    primary: '#1976d2',
    secondary: '#c19b00',
  });

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

  const theme = createTheme({
    components: {
      MuiSlider: {
        styleOverrides: {
          root: {
            '& .MuiSlider-rail': {
              backgroundColor: themeColors.primary,
            },
            '& .MuiSlider-thumb': {
              color: themeColors.primary,
            },
            '& .MuiSlider-track': {
              color: themeColors.primary,
            },
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

  return (
    <>
       <div style={{ direction: 'ltr' }}></div>
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          '& .MuiChartsAxis-line': { stroke: '#1976d2 !important' },
          '& .MuiChartsAxis-tick': { stroke: '#1976d2 !important' },
          '& .MuiChartsAxis-tickLabel': { fill: '#1976d2 !important' },
        }}
      >
        <LineChart
          width={500}
          height={300}
          series={[
            {
              data: uData.slice(value[0], value[1] + 1),
              color: themeColors.primary,
            },
            {
              data: secondaryData.slice(value[0], value[1] + 1),
              color: themeColors.secondary,
            },
          ]}
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
            <Typography variant="body2">{t('Views')}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 16, height: 4, bgcolor: themeColors.secondary }} />
            <Typography variant="body2">{t('Contacts')}</Typography>
          </Box>
        </Box>

        <Slider
          value={value}
          onChange={handleChange}
          valueLabelDisplay="auto"
          valueLabelFormat={valueLabelFormat}
          min={0}
          max={xLabels.length - 1}
        />
      </Box>
      </>
  );
};

export default BasicLineChart;
