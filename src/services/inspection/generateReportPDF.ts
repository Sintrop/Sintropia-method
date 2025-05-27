import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { BiodiversityDBProps, TreeDBProps } from '../../types/database';
import { CoordinateProps } from '../../types/regenerator';

interface GenerateReportPDFProps {
  areaName: string;
  treesCount: number;
  biodiversityCount: number;
  biodiversity: BiodiversityDBProps[];
  trees: TreeDBProps[];
  areaSize: string;
  coordinates: CoordinateProps[];
  proofPhoto: string;
}

const styleHTML = `
  <style>
    @page { margin-top: 50px; }
    body { font-family: Arial; padding: 20px; }
    h1 { color: #1eb76f; }
    h3 { color: #1eb76f; margin-top: 50px; }
    p { margin: 0px }
    img { border-radius: 5px; }
    .map-img { width: 200px; height: 200px; border-radius: 16px; object-fit: cover; }
    .map-coordinates-box { display: flex; flex-direction: column; }
    .div-flex-row { display: flex; flex-direction: row; gap: 20px; margin-top: 20px; }
    .card-count { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 16px; background-color: #eee; width: 200px; padding-vertical: 10px;}
    .card_p { font-weight: bold; color: black; font-size: 30px; } 
    .register-item { background-color: #eee; display: flex; flex-direction: column; gap: 30px; padding: 10px; border-radius: 16px; margin-bottom: 10px; width: 110px }
    .register-item_img { width: 80px; height: 80px; border-radius: 16px; object-fit: cover; }
    .register-item_box { display: flex; flex-direction: column;}
    .div-flex-wrap { display: flex; gap: 15px; flex-wrap: wrap; }
    .p-coordinate { font-size: 10px; }
  </style>
`

function listBiodiversity(biodiversity: BiodiversityDBProps[]) {
  const bioHTML = biodiversity.map(item => `
    <div class="register-item">
      <img
        src="${item.photo}"
        class="register-item_img"
      />
          
      <div class="register-item_box">
        <p class="p-coordinate">coordinate</p>
        <p class="p-coordinate">
          Lat: ${JSON.parse(item.coordinate)?.latitude}
        </p>
        <p class="p-coordinate">
          Lng: ${JSON.parse(item.coordinate)?.longitude}
        </p>
      </div>
    </div> 
  `).join('');

  return `
      ${bioHTML}
    `;
}

function listTrees(trees: TreeDBProps[]) {
  const bioHTML = trees.map(item => `
    <div class="register-item">
      <img
        src="${item.photo}"
        class="register-item_img"
      />
          
      <div class="register-item_box">
        <p class="p-coordinate">coordinate</p>
        <p class="p-coordinate">
          Lat: ${JSON.parse(item.coordinate)?.latitude}
        </p>
        <p class="p-coordinate">
          Lng: ${JSON.parse(item.coordinate)?.longitude}
        </p>
      </div>
    </div> 
  `).join('');

  return `
      ${bioHTML}
    `;
}

function listCoordinates(coords: CoordinateProps[]) {
  const coordsHTML = coords.map(item => `<p>Lat: ${item?.latitude}, Lng: ${item?.longitude}</p>`).join('');
  return `${coordsHTML}`;
}

export async function generateReportPDF(props: GenerateReportPDFProps): Promise<string> {
  const {
    areaName,
    biodiversityCount,
    treesCount,
    biodiversity,
    trees,
    areaSize,
    coordinates,
    proofPhoto
  } = props;

  const htmlContent = `
    <html>
      <head>
        ${styleHTML}
      </head>
      <body>
        <h1>Final Result</h1>
        <p>${areaName}</p>

        <div class="div-flex-row">
          <img
            src="${proofPhoto}"
            class="map-img"
          />

          <div class="map-coordinates-box">
            <p>Area size: ${areaSize}</p>
            ${listCoordinates(coordinates)}
          </div>
        </div>

        <div class="div-flex-row">
          <div class="card-count">
            <p class="card_p">
              ${treesCount}
            </p>
            <p>Trees</p>
          </div>
          
          <div class="card-count">
            <p class="card_p">
              ${biodiversityCount}
            </p>
            <p>Biodiversity</p>
          </div>
        </div>
        
        <h3>Biodiversity</h3>
        <div class="div-flex-wrap">
          ${listBiodiversity(biodiversity)}
        </div>

        <h3>Trees</h3>
        <div class="div-flex-wrap">
          ${listTrees(trees)}
        </div>
      </body>
    </html>
  `;

  const options = {
    html: htmlContent,
    fileName: `inspection-area`,
    directory: 'Documents',
  };

  const file = await RNHTMLtoPDF.convert(options);

  return `file://${file.filePath}`
}