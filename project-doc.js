const params = new URLSearchParams(window.location.search);
const projectId = params.get("id") || "evtol";
const projects = window.PORTFOLIO_CONTENT?.projects || {};
const project = projects[projectId] || projects.evtol;

const docKicker = document.querySelector("#docKicker");
const docTitle = document.querySelector("#docTitle");
const docSummary = document.querySelector("#docSummary");
const docNotice = document.querySelector("#docNotice");
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

const previewPages = {
  evtol: { directory: "./assets/previews/pages/evtol", count: 48 },
  casebook: { directory: "./assets/previews/pages/casebook", count: 31 },
  lineage: { directory: "./assets/previews/pages/lineage", count: 17 },
  kansei: { directory: "./assets/previews/pages/kansei", count: 47 },
};

const protectedProjects = new Set(["casebook", "lineage"]);

function renderDocument() {
  if (!project) return;

  const previewUrl = previewFiles[projectId] || previewFiles.evtol;
  const pageSet = previewPages[projectId] || previewPages.evtol;
  document.title = `${project.title} | 王钰琪`;
  docKicker.textContent = project.kicker;
  docTitle.textContent = project.title;
  docSummary.textContent = project.summary;
  if (protectedProjects.has(projectId)) {
    docNotice.hidden = false;
    docNotice.textContent = "真实业务资料，外传将追究法律责任。";
  } else {
    docNotice.hidden = true;
    docNotice.textContent = "";
  }
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

  renderPreviewPages(pageSet, previewUrl);
}

renderDocument();

function renderPreviewPages(pageSet, previewUrl) {
  if (!pdfViewer || !pdfStatus) return;

  pdfViewer.replaceChildren();
  pdfStatus.textContent = `已载入 ${pageSet.count} 页图片预览`;

  for (let pageNumber = 1; pageNumber <= pageSet.count; pageNumber += 1) {
    const frame = document.createElement("article");
    frame.className = "pdf-page";

    const label = document.createElement("span");
    label.textContent = `${String(pageNumber).padStart(2, "0")} / ${String(pageSet.count).padStart(2, "0")}`;

    const image = document.createElement("img");
    image.alt = `${project.title} 第 ${pageNumber} 页`;
    image.loading = pageNumber <= 2 ? "eager" : "lazy";
    image.decoding = "async";
    image.src = `${pageSet.directory}/page-${String(pageNumber).padStart(3, "0")}.jpg`;

    frame.append(label, image);
    pdfViewer.appendChild(frame);
  }

  const fallbackNote = document.createElement("p");
  fallbackNote.className = "pdf-fallback-note";
  fallbackNote.innerHTML = `图片预览不完整时，可使用右上角 <a href="${previewUrl}" target="_blank" rel="noreferrer">打开 PDF</a>。`;
  pdfViewer.appendChild(fallbackNote);
}
