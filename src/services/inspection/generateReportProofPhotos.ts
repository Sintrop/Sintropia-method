import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { ProofPhotosDBProps } from '../../types/database';
import { CoordinateProps } from '../../types/regenerator';

interface GenerateReportProofPhotosProps {
  areaName: string;
  proofPhoto: string;
  proofPhotos: ProofPhotosDBProps[];
  areaSize: string;
  coordinates: CoordinateProps[];
}

const styleHTML = `
  <style>
    @page { margin-top: 50px; }
    body { font-family: Arial; padding: 20px; }
    h1 { color: #1eb76f; }
    h3 { color: #1eb76f; margin-top: 50px; }
    p { margin: 0px }
    img { border-radius: 5px; }
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
    proofPhotos
  } = props;

  const htmlContent = `
    <html>
      <head>
        ${styleHTML}
      </head>
      <body>
        <h1>Proof Photos</h1>
        <p>${areaName}</p>

        <div class="div-flex-row">
          <div class="map-coordinates-box">
            <p>Area size: ${areaSize}</p>
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