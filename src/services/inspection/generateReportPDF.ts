import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { BiodiversityDBProps, TreeDBProps } from '../../types/database';

interface GenerateReportPDFProps {
  areaName: string;
  treesCount: number;
  biodiversityCount: number;
  biodiversity: BiodiversityDBProps[];
  trees: TreeDBProps[];
}

const styleHTML = `
  <style>
    body { font-family: Arial; padding: 20px; }
    h1 { color: #1eb76f; }
    h3 { color: #1eb76f; margin-top: 50px; }
    p { line-height: 0 }
    img { border-radius: 5px; }
    .div-flex-row { display: flex; flex-direction: row; gap: 20px}
    .card-count { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 16px; background-color: #eee; width: 200px}
    .card_p { font-weight: bold; color: black; font-size: 30px; line-height: 0 }
    .register-item { background-color: #eee; display: flex; gap: 30px; padding: 10px; border-radius: 16px; margin-bottom: 10px; }
    .register-item_img { width: 120px; height: 120px; border-radius: 16px; object-fit: cover; }
    .register-item_box { display: flex; flex-direction: column;}
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
        <p>coordinates</p>
        <p>
          Lat: ${JSON.parse(item.coordinate)?.latitude}, Lng: ${JSON.parse(item.coordinate)?.longitude}
        </p>
      </div>
    </div> 
  `)

  return `
      <h3>Biodiversity</h3>
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
        <p>coordinates</p>
        <p>
          Lat: ${JSON.parse(item.coordinate)?.latitude}, Lng: ${JSON.parse(item.coordinate)?.longitude}
        </p>
      </div>
    </div> 
  `)

  return `
      <h3>Trees</h3>
      ${bioHTML}
    `;
}

export async function generateReportPDF(props: GenerateReportPDFProps) {
  const {
    areaName,
    biodiversityCount,
    treesCount,
    biodiversity,
    trees
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
        
        ${listBiodiversity(biodiversity)}
        ${listTrees(trees)}
      </body>
    </html>
  `;

  const options = {
    html: htmlContent,
    fileName: `relatorio-123`,
    directory: 'Documents',
  };

  const file = await RNHTMLtoPDF.convert(options);
  console.log('PDF gerado em:', file.filePath);

  Share.open({
    url: `file://${file.filePath}`,
    title: 'report',
    type: 'application/pdf'
  })
}