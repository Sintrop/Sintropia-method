import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { BiodiversityDBProps, TreeDBProps } from '../../types/database';
import { CoordinateProps } from '../../types/regenerator';
import { calculateAreaCircle } from './calculateAreaCircle';
import { LogoBase64 } from '../../data/base64/images';
import { RCLogoBase64 } from '../../data/base64/images';

export interface SamplingPDFProps {
  samplingNumber: number;
  size: number;
  trees: TreeDBProps[];
}

interface GenerateReportPDFProps {
  areaName: string;
  treesCount: number;
  biodiversityCount: number;
  biodiversity: BiodiversityDBProps[];
  samplings: SamplingPDFProps[];
  areaSize: string;
  coordinates: CoordinateProps[];
  regenerator: {
    address?: string;
  },
  date: string;
  version: string;
}

const styleHTML = `
  <style>
    @page { margin-top: 50px; }
    body { font-family: Arial; padding: 20px; }
    h1 { color: #1eb76f; }
    h3 { color: #1eb76f; margin-top: 50px; }
    h4 { margin: 0px }
    p { margin: 0px }
    img { border-radius: 5px; }


    .header-file { width: 100%; display: flex; align-items: center; justify-content: space-between; }
    .logo-sintropy { width: 200px; height: 70px; object-fit: contain; }
    .logo-rc { width: 120px; height: 120px; object-fit: contain; }
    .card-rc { width: 92%; display: flex; align-items: center; justify-content: space-between; background-color: #22CC3F; padding: 30px; margin-top: 30px; margin-bottom: 30px; gap: 50px }
    .text-center { text-align: center; }
    .text-limit { max-width: 500px }
    .margin-vertical-50 { margin: 50px 0 50px 0 };
    .mt-20 {margin-top: 20px};
    .div-col { display: flex; flex-direction: column; };

    .map-img { width: 100px; height: 100px; border-radius: 16px; object-fit: cover; }
    .map-coordinates-box { display: flex; flex-direction: column; }
    .div-flex-row { display: flex; flex-direction: row; gap: 20px; margin-top: 20px; margin-bottom: 20px; }
    .card-count { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 16px; border: 2px solid #000; width: 120px; height: 100px;}
    .card_p { font-weight: bold; color: black; font-size: 30px; }
    .sampling-item { display: flex; flex-direction: column; }
    .sampling-item_title { color: black; margin-top: 20px; margin-bottom: 10px; }
    .sampling-item_header-data { display: flex; gap: 10px; margin-top: 5px; margin-bottom: 10px; }
    .sampling-item_box-count { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; background-color: #eee; width: 120px; height: 80px; border-radius: 16px }
    .sampling-item_count { color: black; font-weight: bold; font-size: 20px; }
    .register-item { background-color: #eee; display: flex; flex-direction: column; gap: 15px; padding: 10px; border-radius: 16px; margin-bottom: 10px; width: 110px }
    .register-item_img { width: 70px; height: 70px; border-radius: 16px; object-fit: cover; }
    .register-item_box { display: flex; flex-direction: column;}
    .div-flex-wrap { display: flex; gap: 15px; flex-wrap: wrap; }
    .p-coordinate { font-size: 10px; }
    .box-trees-result { display: flex; flex-direction: column; align-items: center; border: 2px black; border-radius: 16px; padding: 10px; margin-top: 20px }
    .box-trees-result_title { color: black; text-align: center; font-weight: bold; }
    .box-trees-result_p1 { color: black; text-align: center; margin-top: 10px }
    .box-trees-result_p { color: black; text-align: center }
    .box-trees-result_result { color: black; text-align: center; font-weight: bold; margin-top: 20px; }
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

function listTrees(samplings: SamplingPDFProps[]) {
  const samplingsHTML = samplings.map(item => `
    <div class="sampling-item">
      <p class="sampling-item_title">
        Sampling #${item.samplingNumber}
      </p>
      <div class="sampling-item_header-data">
        <div class="sampling-item_box-count">
          <p class="sampling-item_count">${item.trees.length}</p>
          <p>Trees</p>
        </div>
        <div class="sampling-item_box-count">
          <p class="sampling-item_count">${item.size} m</p>
          <p>Radius</p>
        </div>
        <div class="sampling-item_box-count">
          <p class="sampling-item_count">${calculateAreaCircle(item.size)} m²</p>
          <p>Area</p>
        </div>
      </div>
      <div class="div-flex-wrap">
        ${trees(item.trees)}
      </div>
    </div> 
  `).join('');

  function trees(trees: TreeDBProps[]) {
    const treesHTML = trees.map(item => `
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

    return treesHTML
  }

  return `
      <h3>Trees</h3>
      ${samplingsHTML}
    `;
}

function listCoordinates(coords: CoordinateProps[]) {
  const coordsHTML = coords.map(item => `<p>Lat: ${item?.latitude}, Lng: ${item?.longitude}</p>`).join('');
  return `${coordsHTML}`;
}

export async function generateReportPDFSamplingMode(props: GenerateReportPDFProps): Promise<string> {
  const {
    areaName,
    biodiversityCount,
    treesCount,
    biodiversity,
    samplings,
    areaSize,
    coordinates,
    regenerator,
    date,
    version
  } = props;

  const htmlContent = `
    <html>
      <head>
        ${styleHTML}
      </head>
      <body>
        <div class="header-file">
          <img
            src="${LogoBase64}"
            class="logo-sintropy"
          />

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

        
        <div class="card-rc">
          <img
            src="${RCLogoBase64}"
            class="logo-rc"
          />
          <p class="text-center text-limit">
            This report was automatically generated using Sintropia Method version ${version}. It is designed
            to help inspectors to perform the Regeneration Credit inspections. The goal is to measure how many tress
            over 1m high and 3cm of diameter there is on the regeneration area, and of how many different species.
          </p>
        </div>
        
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

        <div class="header-file">
          <div class="div-col">
            <p>Sampling radius: ${samplings[0].size} m</p>
            <p>Sampling area: ${calculateAreaCircle(samplings[0].size)} m²</p>
          </div>

          <div class="box-trees-result">
            <p class="box-trees-result_title">Trees result</p>
            <p class="box-trees-result_p1">Ai = Inspected area</p>
            <p class="box-trees-result_p">P1 = Sampling trees 1</p>
            <p class="box-trees-result_p">Pn = Sampling trees n</p>
            <p class="box-trees-result_p">Ap = Sampling area n</p>
            <p class="box-trees-result_p">n = Number of samplings</p>
            <p class="box-trees-result_result">Result = {[(P1 +...+ Pn) / n] * Ai} / Ap</p>
          </div>
        </div>
        
        <h3>Biodiversity</h3>
        <div class="div-flex-wrap">
          ${listBiodiversity(biodiversity)}
        </div>
        ${listTrees(samplings)}
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