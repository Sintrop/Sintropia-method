import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { ProofPhotosDBProps } from '../../types/database';
import { CoordinateProps } from '../../types/regenerator';
import { LogoBase64 } from '../../data/base64/images';
import { RCLogoBase64 } from '../../data/base64/images';

interface GenerateReportProofPhotosProps {
  areaName: string;
  proofPhoto: string;
  proofPhotos: ProofPhotosDBProps[];
  areaSize: string;
  coordinates: CoordinateProps[];
  regenerator: {
    address?: string;
  }
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
    .card-rc { width: 92%; display: flex; align-items: center; justify-content: space-between; background-color: #F0FFF0; padding: 30px; margin-top: 30px; margin-bottom: 30px; gap: 50px }
    .text-center { text-align: center; }
    .text-limit { max-width: 500px }
    .margin-vertical-50 { margin: 50px 0 50px 0 };
    .mt-20 {margin-top: 20px};
    .div-col-center { display: flex; flex-direction: column; align-items: center; width: 100% };

    .map-img { width: 500px; height: 500px; border-radius: 16px; object-fit: cover; }
    .map-coordinates-box { display: flex; flex-direction: column; }
    .div-flex-row { display: flex; flex-direction: row; gap: 20px; margin-top: 20px; }
    .card-count { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 16px; background-color: #eee; width: 200px; padding-vertical: 10px;}
    .card_p { font-weight: bold; color: black; font-size: 30px; } 
    .register-item { background-color: #eee; display: flex; flex-direction: column; gap: 15px; padding: 10px; border-radius: 16px; margin-bottom: 10px; width: 500px; height: 500px; }
    .register-item_img { width: 500px; height: 500px; border-radius: 16px; object-fit: cover; }
    .register-item_box { display: flex; flex-direction: column;}
    .div-flex-wrap { display: flex; gap: 15px; flex-wrap: wrap; }
    .p-coordinate { font-size: 10px; }
  </style>
`

function listProofPhotos(photos: ProofPhotosDBProps[]) {
  const photosHTML = photos.map(item => `
    <img
      src="${item.photo}"
      class="register-item_img"
    />
  `).join('');

  return `
      ${photosHTML}
    `;
}

function listCoordinates(coords: CoordinateProps[]) {
  const coordsHTML = coords.map(item => `<p>Lat: ${item?.latitude}, Lng: ${item?.longitude}</p>`).join('');
  return `${coordsHTML}`;
}

export async function generateReportProofPhotos(props: GenerateReportProofPhotosProps): Promise<string> {
  const {
    areaName,
    areaSize,
    coordinates,
    proofPhoto,
    proofPhotos,
    regenerator,
    version,
    date
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
            <h2>Proof Photos</h2>
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
        
        <h3>Proof photo with regenerator</h3>
        <img
          class="map-img"
          src="${proofPhoto}"
        />

        <h3>Proof photos of area</h3>
        <div class="div-flex-wrap">
          ${listProofPhotos(proofPhotos)}
        </div>
      </body>
    </html>
  `;

  const options = {
    html: htmlContent,
    fileName: `proof-photo-report`,
    directory: 'Documents',
  };

  const file = await RNHTMLtoPDF.convert(options);

  return `file://${file.filePath}`
}