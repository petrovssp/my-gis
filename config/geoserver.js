const wmsWorkspace =
  import.meta.env.VITE_WMS_WORKSPACE

const wfsWorkspace =
  import.meta.env.VITE_WFS_WORKSPACE

export const WMS_URL =
  `${geoserverUrl}/${wmsWorkspace}/wms`

export const WFS_URL =
  `${geoserverUrl}/${wfsWorkspace}/ows`

export { geoserverUrl }