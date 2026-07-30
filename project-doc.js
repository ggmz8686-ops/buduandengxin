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
const pdfPageNav = document.querySelector("#pdfPageNav");
const pdfStatus = document.querySelector("#pdfStatus");
const pdfFallback = document.querySelector("#pdfFallback");

const pdfJsVersion = "2.16.105";
const pdfWorkerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.worker.min.js`;

const previewFiles = {
  evtol: "./assets/previews/evtol-source.pdf",
  casebook: "./assets/previews/casebook-source.pdf",
  lineage: "./assets/previews/lineage-source.pdf",
  kansei: "./assets/previews/kansei-source.pdf",
};

const protectedProjects = new Set(["casebook", "lineage"]);

function renderDocument() {
  if (!project) return;

  const previewUrl = previewFiles[projectId] || previewFiles.evtol;
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

  renderPdf(previewUrl);
}

renderDocument();

async function renderPdf(previewUrl) {
  if (!pdfViewer || !pdfStatus) return;

  pdfViewer.replaceChildren();
  pdfPageNav?.replaceChildren();
  pdfStatus.textContent = "正在用 PDF.js 加载文档...";

  const pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) {
    renderPdfError(previewUrl, "PDF.js CDN 没有加载成功，请检查网络后刷新页面。");
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  try {
    const pdf = await pdfjsLib.getDocument(previewUrl).promise;
    pdfStatus.textContent = `PDF.js 已读取 ${pdf.numPages} 页，正在逐页渲染...`;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      await renderPdfPage(pdf, pageNumber);
      pdfStatus.textContent = `正在渲染 ${pageNumber} / ${pdf.numPages} 页`;
      await nextFrame();
    }

    pdfStatus.textContent = `已用 PDF.js 渲染 ${pdf.numPages} 页`;
    setActivePdfPage(1);
    appendFallbackNote(previewUrl);
  } catch (error) {
    console.error("PDF render failed", error);
    renderPdfError(previewUrl, "PDF 渲染失败，可以先用右上角打开原始 PDF。");
  }
}

async function renderPdfPage(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const availableWidth = Math.min(pdfViewer.clientWidth - 48, 1120);
  const cssScale = Math.max(0.45, Math.min(1.6, availableWidth / baseViewport.width));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const viewport = page.getViewport({ scale: cssScale * dpr });

  const frame = document.createElement("article");
  frame.className = "pdf-page";
  frame.id = `pdf-page-${pageNumber}`;

  const label = document.createElement("span");
  label.textContent = `${String(pageNumber).padStart(2, "0")} / ${String(pdf.numPages).padStart(2, "0")}`;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
  canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
  canvas.setAttribute("aria-label", `${project.title} 第 ${pageNumber} 页`);

  frame.append(label, canvas);
  pdfViewer.appendChild(frame);
  appendPdfPageNavItem(pageNumber);

  await page.render({ canvasContext: context, viewport }).promise;
}

function appendPdfPageNavItem(pageNumber) {
  if (!pdfPageNav) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "pdf-page-nav-item";
  button.dataset.page = String(pageNumber);
  button.textContent = `P${String(pageNumber).padStart(2, "0")}`;
  button.addEventListener("click", () => {
    const page = document.querySelector(`#pdf-page-${pageNumber}`);
    if (!page || !pdfViewer) return;
    pdfViewer.scrollTo({
      top: page.offsetTop - 12,
      behavior: "smooth",
    });
    setActivePdfPage(pageNumber);
  });

  pdfPageNav.appendChild(button);
}

function setActivePdfPage(pageNumber) {
  if (!pdfPageNav) return;
  pdfPageNav.querySelectorAll(".pdf-page-nav-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.page === String(pageNumber));
  });
}

function appendFallbackNote(previewUrl) {
  const fallbackNote = document.createElement("p");
  fallbackNote.className = "pdf-fallback-note";
  fallbackNote.innerHTML = `如果浏览器渲染不完整，可使用右上角 <a href="${previewUrl}" target="_blank" rel="noreferrer">打开 PDF</a>。`;
  pdfViewer.appendChild(fallbackNote);
}

function renderPdfError(previewUrl, message) {
  pdfViewer.replaceChildren();
  pdfPageNav?.replaceChildren();
  pdfStatus.textContent = "PDF.js 渲染未完成";

  const errorCard = document.createElement("div");
  errorCard.className = "pdf-error";
  errorCard.innerHTML = `
    <b>${message}</b>
    <a href="${previewUrl}" target="_blank" rel="noreferrer">打开 PDF</a>
  `;
  pdfViewer.appendChild(errorCard);
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

pdfViewer?.addEventListener("scroll", () => {
  const pages = Array.from(pdfViewer.querySelectorAll(".pdf-page"));
  const currentPage = pages.findLast((page) => page.offsetTop - pdfViewer.scrollTop < pdfViewer.clientHeight * 0.35);
  if (!currentPage) return;
  const pageNumber = Number(currentPage.id.replace("pdf-page-", ""));
  if (Number.isFinite(pageNumber)) setActivePdfPage(pageNumber);
});
