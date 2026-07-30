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

function renderPdf(previewUrl) {
  if (!pdfViewer || !pdfStatus) return;

  pdfViewer.replaceChildren();
  pdfStatus.textContent = "已嵌入 PDF 预览";

  const frame = document.createElement("iframe");
  frame.className = "pdf-inline";
  frame.title = `${project.title} 源文件预览`;
  frame.src = `${previewUrl}#toolbar=1&navpanes=0&view=FitH`;
  pdfViewer.appendChild(frame);
}
