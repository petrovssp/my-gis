import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ.js';
import LayerGroup from 'ol/layer/Group.js';
import { TileWMS } from 'ol/source';
import Graticule from 'ol/layer/Graticule.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import MousePosition from 'ol/control/MousePosition.js';
import { createStringXY } from 'ol/coordinate';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { WMS_URL, WFS_URL } from './config/geoserver.js'

proj4.defs("EPSG:7801","+proj=lcc +lat_0=42.6678756833333 +lon_0=25.5 +lat_1=42 +lat_2=43.3333333333333 +x_0=500000 +y_0=4725824.3591 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
register(proj4);
proj4.defs("EPSG:7800","+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
register(proj4);

//Създаване на изглед
const view = new View ({
    center: [2799918, 5269874],
    zoom: 7
})

//Създаване на карта
const map = new Map({
  target: 'map',
  view: view
});

//Добавяне на базови слоеве в картата
const osmMap = new TileLayer({
  source: new OSM(),
  visible: true,
  title: 'OSM'
})

const googleSat = new TileLayer({
  source: new XYZ ({
    url: 'https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
  }),
  visible: false,
  title: 'googleSat'
})

//Групиране на базовите слоеве в група

const baseLayerGroup = new LayerGroup({
  layers: [osmMap, googleSat]
})

map.addLayer(baseLayerGroup);


//Превключване на слоевете за базовите карти

const baseLayerElements = document.querySelectorAll('.basemaps > input[type=radio]');
for(let baseLayerElement of baseLayerElements){
  baseLayerElement.addEventListener('change', function(){
    let baseLayerElementValue = this.value;
    baseLayerGroup.getLayers().forEach(function(element, index, array){
      let baseLayerTitle = element.get('title');
      element.setVisible(baseLayerTitle===baseLayerElementValue);
    })
  })
}

//Добавяне на слоеве от Geoserver за област 

const district = new TileLayer({
  source: new TileWMS({
  url: WMS_URL,
  params:{'VERSION':'1.1.0', tiled: true, 'LAYERS':'BGDATA:Oblasti_DB'},
  serverType: 'geoserver',
  visible: true
  })
})

const mun = new TileLayer({
  source: new TileWMS ({
  url: WMS_URL,
  params:{'VERSION':'1.1.0', tiled: true, 'LAYERS':'BGDATA:Obshtini_DB'},
  serverType: 'geoserver',
  visible: true
  })
})

const rivers = new TileLayer({
  source: new TileWMS ({
  url: WMS_URL,
  params:{'VERSION':'1.1.0', tiled: true, 'LAYERS':'BGDATA:Reki_DB'},
  serverType: 'geoserver',
  visible: true
  })
})

const settlments = new TileLayer({
  source: new TileWMS ({
  url: WMS_URL,
  params:{'VERSION':'1.1.0', tiled: true, 'LAYERS':'BGDATA:Cities_DB'},
  serverType: 'geoserver',
  visible: true
  })
})



//Групиране на основните слоеве в група
const layersGroup = new LayerGroup ({
  layers: [district, mun, rivers, settlments]
})

map.addLayer(layersGroup);


//Включване и изключване на слоеве

const LayerElements = document.querySelectorAll('.mymaps > input[type=checkbox]');
for(let LayerElement of LayerElements){
  console.log(LayerElements),
  LayerElement.addEventListener('change', function(){
      //console.log(this.Id, this.checked);
      let LayerElementValue = this.value;
      let LayerElementId = this.id;
      let LayerElementCheck = this.checked;
      layersGroup.getLayers().forEach(function(element, index, array){
          let LayerIndex = index;
          if (LayerIndex === parseInt(LayerElementId)){
          element.setVisible(LayerElementCheck);
      };
      })
  })
} 

const myGraticule = new Graticule ({
  showLabels: true
})
map.addLayer(myGraticule);

const scaleBar = new ScaleLine ({
  text: true,
  bar: true,
  steps: 6,
  minWidth: 140
})
map.addControl(scaleBar)

const mouseCoordinates = new MousePosition ({
  coordinateFormat: createStringXY(0),
  projection:'EPSG:7801'
})
map.addControl(mouseCoordinates);

//Избор на проекция за координатите на курсура на мишката

const projectionSelect = document.getElementById('Myprojection');
projectionSelect.addEventListener('change', function(event){
 mouseCoordinates.setProjection(event.target.value);
});


//Изтегляне на векторни данни в geoJSON format 

document.getElementById('download0').addEventListener('click', function () {

  const url = WFS_URL +
              "?service=WFS&version=1.0.0&request=GetFeature" + 
              "&typeName=BGDATA%3AObshtini_DB&outputFormat=application%2Fjson";

  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = "Obshtini.geojson";
      link.click();
    });
});