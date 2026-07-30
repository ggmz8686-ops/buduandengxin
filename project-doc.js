import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id") || "evtol";
const projects = window.PORTFOLIO_CONTENT?.projects || {};
const project = projects[projectId] || projects.evtol;

const docKicker = document.querySelector("#docKicker");
const docTitle = document.querySelector("#docTitle");
const docSummary = document.querySelector("#docSummary");
const docIndex = document.querySelector("#docIndex");
const docSections = document.querySelector("#docSections");
const pdfViewer = document.querySelector("#pdfViewer");
const pdfStatus = document.querySelector("#pdfStatus");
const pdfFallback = document.querySelector("#pdfFallback");

const previewFiles = {
  evtol: "./assets/previews/evtol-source.pdf",
  casebook: "./assets/previews/casebook-source.pdf",
  lineage: "./assets/previews/lineage-source.pdf",
  kansei: "./assets/previews/kansei-source.pdf",
};

function renderDocument() {
  if (!project) return;

  const previewUrl = previewFiles[projectId] || previewFiles.evtol;
  document.title = `${project.title} | 王钰琪`;
  docKicker.textContent = project.kicker;
  docTitle.textContent = project.title;
  docSummary.textContent = project.summary;
  pdfFallback.href = previewUrl;
  docIndex.replaceChildren();
  docSections.replaceChildren();

  project.slices.forEach((slice, index) => {
    const anchor = `part-${index + 1}`;
    const indexItem = document.createElement("a");
    indexItem.className = "doc-index-item motion-reactive";
    indexItem.href = `#${anchor}`;
    indexItem.dataset.reactiveStrength = "8";
    indexItem.innerHTML = `
      <span>${String(index + 1).padStart(2, "0")}</span>
      <b>${slice.tag}</b>
      <small>${slice.title}</small>
    `;
    docIndex.appendChild(indexItem);

    const section = document.createElement("article");
    section.className = "doc-card";
    section.id = anchor;
    section.innerHTML = `
      <span class="doc-step">${String(index + 1).padStart(2, "0")} / ${slice.tag}</span>
      <h2>${slice.title}</h2>
      <p>${slice.body}</p>
    `;
    docSections.appendChild(section);
  });

  renderPdf(previewUrl);
}

renderDocument();

async function renderPdf(previewUrl) {
  if (!pdfViewer || !pdfStatus) return;

  pdfViewer.replaceChildren();
  pdfStatus.textContent = "正在把文档铺开...";

  try {
    const pdf = await pdfjsLib.getDocument(previewUrl).promise;
    pdfStatus.textContent = `共 ${pdf.numPages} 页，正在渲染`;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const frame = document.createElement("article");
      frame.className = "pdf-page";
      frame.innerHTML = `<span>${String(pageNumber).padStart(2, "0")} / ${String(pdf.numPages).padStart(2, "0")}</span>`;

      const canvas = document.createElement("canvas");
      frame.appendChild(canvas);
      pdfViewer.appendChild(frame);

      const availableWidth = Math.min(pdfViewer.clientWidth - 34, 1080);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.max(0.72, availableWidth / baseViewport.width);
      const viewport = page.getViewport({ scale });
      const context = canvas.getContext("2d");

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = "100%";
      canvas.style.height = "auto";

      await page.render({ canvasContext: context, viewport }).promise;
    }

    pdfStatus.textContent = `已在网页渲染 ${pdf.numPages} 页`;
  } catch (error) {
    console.error(error);
    pdfStatus.textContent = "网页预览加载失败，可以点右侧 PDF 兜底打开。";
  }
}
