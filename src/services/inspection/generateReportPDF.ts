import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { BiodiversityDBProps, TreeDBProps } from '../../types/database';
import { CoordinateProps } from '../../types/regenerator';
import { LogoBase64 } from '../../data/base64/images';
import { RCLogoBase64 } from '../../data/base64/images';

interface GenerateReportPDFProps {
  areaName: string;
  treesCount: number;
  biodiversityCount: number;
  biodiversity: BiodiversityDBProps[];
  trees: TreeDBProps[];
  areaSize: string;
  coordinates: CoordinateProps[];
  regenerator: {
    address?: string;
  }
  date: string;
  version: string;
  inspectorReport: string;
}

const styleHTML = `
  <style>
    @page { margin-top: 50px; }
    body { font-family: Arial; padding: 20px;}
    h1 { color: #1eb76f; }
    h3 { margin-top: 50px; }
    h4 { margin: 0px }
    p { margin: 0px }
    img { border-radius: 5px; }
    table { border: 1px solid black; margin: 10px 0 30px 0; }
    thead { font-weight: 800; }
    tr { border: 0 0 1px 0}
    th { border: 1px solid black; font-weight: 400; padding: 5px 10px;}

    .header-file { width: 100%; display: flex; align-items: center; justify-content: space-between; }
    .logo-sintropy { width: 150px; height: 50px; object-fit: contain; }
    .logo-rc { width: 50px; height: 50px; object-fit: contain; }
    .card-rc { width: 92%; display: flex; align-items: center; justify-content: space-between; background-color: #F0FFF0; padding: 30px; margin-top: 30px; margin-bottom: 30px; gap: 50px }
    .text-center { text-align: center; }
    .text-limit { max-width: 500px }
    .margin-vertical-50 { margin: 50px 0 50px 0 };
    .mt-20 {margin: 20px};
    .div-col-center { display: flex; flex-direction: column; align-items: center; width: 100% };

    .map-img { width: 100px; height: 100px; border-radius: 16px; object-fit: cover; }
    .map-coordinates-box { display: flex; flex-direction: column; margin-bottom: 30px; }
    .div-flex-row { display: flex; flex-direction: row; gap: 20px; margin-top: 20px; }
    .card-count { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 16px; border: 2px solid #000; width: 120px; height: 100px;}
    .card_p { font-weight: bold; color: black; font-size: 30px; } 
    .register-item { background-color: #eee; display: flex; flex-direction: column; gap: 15px; padding: 10px; border-radius: 16px; margin-bottom: 10px; width: 110px }
    .register-item_img { width: 70px; height: 70px; border-radius: 16px; object-fit: cover; }
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
    regenerator,
    date,
    version,
    inspectorReport
  } = props;

  const htmlContent = `
    <html>
      <head>
        ${styleHTML}
      </head>
      <body>
        <div class="header-file">
          <div class="div-flex-row">
            <img
              src="${LogoBase64}"
              class="logo-sintropy"
            />
            <img
              src="${RCLogoBase64}"
              class="logo-rc"
            />
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
        </div>

        <p class="text-center margin-vertical-50">
          This report was automatically generated using Sintropia Method version ${version}. The goal is to measure how many tress
          over 1m high and 3cm of diameter there is on the regeneration area, and of how many different species.
        </p>
        
        <h4 class"text-center">${areaName}</h4>
        <p class"text-center">Generated on: ${date}</p>

        <h2 class="text-center">Regenerator Data</h2>
        <h4>Regenerator Address:</h4>
        <p>${regenerator.address}</p>

        <div class="div-flex-row">
          <div class="map-coordinates-box">
            <h4>Area size: ${areaSize}</h4>
            ${listCoordinates(coordinates)}
          </div>
        </div>
        
        <h2 class="text-center mt-20">Justification Report</h2>
        <h4>Inspector report:</h4>
        <p>${inspectorReport}</p>

        <h3 class="mt-20">Biodiversity</h3>
        <div class="div-flex-wrap">
          ${listBiodiversity(biodiversity)}
        </div>

        <h3>Trees</h3>
        <div class="div-flex-wrap">
          ${listTrees(trees)}
        </div>

        <h3>Regeneration Index</h3>
        <h4>Trees</h4>
        <p>Indicator to measure the total amount of trees, palm trees and other plants over 1m high and 3cm in diameter in the regenerating area. How many trees, palm trees and other plants over 1m high and 3cm in diameter there is in the regenerating area? Justify your answer in the report.</p>
        <table>
          <thead>
            <tr>
              <th>Index</th>
              <th>Description</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>1</th>
              <th>Trees >= 50000</th>
              <th>REGENERATIVE 6 = +32 pts</th>
            </tr>

            <tr>
              <th>2</th>
              <th>Trees >= 25000 && Trees < 50000</th>
              <th>REGENERATIVE 5 = +16 pts</th>
            </tr>

            <tr>
              <th>3</th>
              <th>Trees >= 12500 && Trees < 25000</th>
              <th>REGENERATIVE 4 = +8 pts</th>
            </tr>

            <tr>
              <th>4</th>
              <th>Trees >= 6250 && Trees < 12500</th>
              <th>REGENERATIVE 3 = +4 pts</th>
            </tr>

            <tr>
              <th>5</th>
              <th>Trees >= 3125 && Trees < 6250</th>
              <th>REGENERATIVE 2 = +2 pts</th>
            </tr>

            <tr>
              <th>6</th>
              <th>Trees >= 20 && Trees < 3125</th>
              <th>REGENERATIVE 1 = +1 pts</th>
            </tr>

            <tr>
              <th>7</th>
              <th>Trees < 20</th>
              <th>NEUTRO = 0 pts</th>
            </tr>
          </tbody>
        </table>

        <h4>Biodiversity</h4>
        <p>Indicator to measure the level of biodiversity of trees, palm trees and other plants over 1m high and 3cm in diameter in the regenerating area. How many different species are there in the area? Each different species is equivalent to one point and only trees and plants managed or planted by the regenerator should be counted.</p>
        <table>
          <thead>
            <tr>
              <th>Index</th>
              <th>Description</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>1</th>
              <th>Biodiversity >= 160</th>
              <th>REGENERATIVE 6 = +32 pts</th>
            </tr>

            <tr>
              <th>2</th>
              <th>Biodiversity >= 80 && Biodiversity < 160</th>
              <th>REGENERATIVE 5 = +16 pts</th>
            </tr>

            <tr>
              <th>3</th>
              <th>Biodiversity >= 40 && Biodiversity < 80</th>
              <th>REGENERATIVE 4 = +8 pts</th>
            </tr>

            <tr>
              <th>4</th>
              <th>Biodiversity >= 20 && Biodiversity < 40</th>
              <th>REGENERATIVE 3 = +4 pts</th>
            </tr>

            <tr>
              <th>5</th>
              <th>Biodiversity >= 10 && Biodiversity < 20</th>
              <th>REGENERATIVE 2 = +2 pts</th>
            </tr>

            <tr>
              <th>6</th>
              <th>Biodiversity >= 5 && Biodiversity < 10</th>
              <th>REGENERATIVE 1 = +1 pts</th>
            </tr>

            <tr>
              <th>7</th>
              <th>Biodiversity < 5</th>
              <th>NEUTRO = 0 pts</th>
            </tr>
          </tbody>
        </table>
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