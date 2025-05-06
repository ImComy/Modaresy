import * as React from 'react';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts/LineChart';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const theme = createTheme({
    components: {
        MuiSlider: {
            styleOverrides: {
                root: {
                    '& .MuiSlider-rail': {
                        backgroundColor: 'primary',
                    },
                    '& .MuiSlider-thumb': {
                        color: 'primary',
                    },
                    '.MuiSlider-track': {
                        color: 'primary',
                    },
                },
            },
        },
    },
});

const BasicLineChart = ({ uData, xLabels }) => {
    const [value, setValue] = React.useState([
        Math.max(0, xLabels.length - 5),
        xLabels.length - 1,
    ]);

    const handleChange = (event, newValue) => {
        if (!Array.isArray(newValue)) {
            return;
        }
        const min = Math.max(0, newValue[0]);
        const max = Math.min(xLabels.length - 1, newValue[1]);
        setValue([min, max]);
    };

    const valueLabelFormat = (index) => {
        return xLabels[index];
    };

    return (
        <ThemeProvider theme={theme}>
        <Box
        sx={{
            width: '100%',
            maxWidth: 500,
            '& .MuiChartsAxis-line': {
            stroke: '#1976d2', // blue
            },
            '& .MuiChartsAxis-tick': {
            stroke: '#1976d2',
            },
            '& .MuiChartsAxis-tickLabel': {
            fill: '#1976d2',
            },
        }}
        >
        <LineChart
            width={500}
            height={300}
            series={[
            {
                data: uData.slice(value[0], value[1] + 1),
                color: '#1976d2',
            },
            ]}
            xAxis={[
            {
                scaleType: 'point',
                data: xLabels.slice(value[0], value[1] + 1),
            },
            ]}
            yAxis={[{}]}
        />
        <Slider
            value={value}
            onChange={handleChange}
            valueLabelDisplay="auto"
            valueLabelFormat={valueLabelFormat}
            min={0}
            max={xLabels.length - 1}
        />
        </Box>

        </ThemeProvider>
    );
};

export default BasicLineChart;
