import { MathJaxContext } from 'better-react-mathjax'
import { useEffect, useState } from 'react'
import CornerPlot from './CornerPlot'
import { Box, Button, Typography, Card, Link, Snackbar } from '@mui/material'
import AppearanceConfig from './Appearance/AppearanceConfiguration'
import { PlotConfig, DatasetConfig, ParameterConfig } from './PlotTypes'
import * as d3 from 'd3'
import { uploadCornerPlotConfigs } from './PlotUploadShare'
import { useParams } from 'react-router-dom'
import { colours } from './constants/Colours'

const PlotConfigDefault: PlotConfig = {
  plot_size: 500, // change this so that it takes the size of the parent container
  subplot_size: 150,
  margin: {
    horizontal: 5,
    vertical: 5
  },
  axis: {
    size: 100,
    tickSize: 5,
    ticks: 3
  },
  background_color: colours.plotBackground
}

const DatasetConfigDefault: DatasetConfig = {
  data: {},
  bins: 30,
  sigmas: [1, 2, 3],
  quantiles: [0.5],
  color: '#0088FF',
  line_width: 1.25,
  blur_radius: 1,
  file_id: ''
}

function PlotsPage({
  rawDatasets,
  parameterNames
}: {
  rawDatasets: Record<string, Record<string, number[]>>
  parameterNames: string[]
}) {
  /* 
    This is the skeleton component for our plots page. It hosts all relevant components for the user to create plots
    including the parameter selectors and the corner plot itself. It also hosts the download button and the appearance config.
    */
  const [datasets, setDatasets] = useState<DatasetConfig[]>()
  const [parameters, setParameters] = useState<ParameterConfig[]>([])
  const [config, setConfig] = useState<PlotConfig>(PlotConfigDefault)
  const [open, setOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')

  useEffect(() => {
    setDatasets(
      Object.entries(rawDatasets).map(([file_id, data], i) => ({
        ...DatasetConfigDefault,
        color: (i < colours.colourPickerOptions.length) ? colours.colourPickerOptions[i] : colours.plotDefault,
        data,
        file_id
      }))
    )
  }, [rawDatasets])

  useEffect(() => {
    if (datasets) {
      setParameters(
        parameterNames.map(p => {
          const combined_data = [].concat(...datasets.map(d => d.data[p]))
          return { name: p, display_text: p, domain: d3.extent(combined_data) }
        })
      )
    }
  }, [datasets, parameterNames])

  const { id } = useParams()

  // Config for MathJax rendering of mathematical symbols
  const MathJaxConfig = {
    tex: {
      inlineMath: [
        ['$', '$'],
        ['\\(', '\\)']
      ]
    },
    startup: {
      typeset: false
    }
  }

  const constructShareLink = (corner_id: string) => {
    const baseURL = window.location.href.split('/')[2]
    return `${baseURL}/visualise/view/${corner_id}`
  }

  // Get share link only in updates post-mount
  const sharePlot = async () => {
    try {
      const shareResponse = await uploadCornerPlotConfigs(id, config, datasets, parameters)
      navigator.clipboard.writeText(constructShareLink(shareResponse))
      setSnackbarMessage('Link copied to clipboard')
      setOpen(true)
    } catch (err) {
      console.error(err)
      setSnackbarMessage('Link could not be generated')
      setOpen(true)
    }
  }

  if (!datasets) {
    return <div>Loading</div>
  }

  const scaledConfig = {
    ...config,
    subplot_size: config.plot_size / parameters.length,
    // Reduce tick count if parameter count is high
    ...(parameters.length > 7 && { axis: { ...config.axis, ticks: 2 } })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', flexGrow: 1 }}>
      <MathJaxContext config={MathJaxConfig}>
        <div
          className='corner-plot-appearance-config-container'
          style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}
        >
          <CornerPlot datasets={datasets} parameters={parameters} config={scaledConfig} />
          <Box>
            <AppearanceConfig datasets={datasets} setDatasets={setDatasets} />
            {parameters.length > 0 && (
              <Box>
                <Box sx={{ marginTop: '10px', width: '100%' }}>
                  <Button variant='contained' onClick={sharePlot} sx={{ width: '100%', marginBottom: '5px' }}>
                    Generate Shareable Link
                  </Button>
                  <Snackbar
                    message={snackbarMessage}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    autoHideDuration={2000}
                    onClose={() => setOpen(false)}
                    open={open}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </div>
      </MathJaxContext>
    </Box>
  )
}

export default PlotsPage
