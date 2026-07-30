const walker = document.querySelector(".walker");
const drawnPath = document.querySelector(".walk-path-drawn");
const nodes = [...document.querySelectorAll(".progress-node")];
const sections = [...document.querySelectorAll("section[id]")];
const revealEls = [...document.querySelectorAll(".reveal")];
const islandButtons = [...document.querySelectorAll(".project-island")];
const cursorOrbit = document.querySelector(".cursor-orbit");
const reactiveEls = [...document.querySelectorAll(".motion-reactive")];
const heroCollage = document.querySelector(".hero-collage");
const collagePieces = [...document.querySelectorAll(".collage-piece")];
const skillTree = document.querySelector(".skill-tree");
const skillWires = document.querySelector(".skill-wires");
const skillNodes = [...document.querySelectorAll(".skill-node")];
const draggableSkillCards = [...document.querySelectorAll(".skill-root, .skill-node, .skill-panel")];
const skillTitle = document.querySelector("#skillTitle");
const skillDesc = document.querySelector("#skillDesc");
const mapBoard = document.querySelector(".map-board");
const contactTrigger = document.querySelector(".contact-trigger");
const mailPopover = document.querySelector("#mailPopover");
const mailClose = document.querySelector(".mail-close");
const anchorLinks = [...document.querySelectorAll('a[href^="#"]')];

const skillCopy = {
  ai: {
    title: "AI 编程协作",
    desc: "用 Claude Code、Gemini、Cursor、Codex 和 GPT 做需求拆解、原型实现、代码协作、文案迭代和方案校验。",
  },
  product: {
    title: "产品与原型",
    desc: "用 Figma、Axure 和 ProcessOn 输出原型、流程图、信息架构和评审材料，把问题变成能沟通的界面与流程。",
  },
  visual: {
    title: "视觉生成与 3D",
    desc: "用 Midjourney、Stable Diffusion、即梦、ComfyUI 和 triple3D 做概念图、风格探索、素材生成和三维表达。",
  },
  base: {
    title: "基础能力",
    desc: "CET-6 500+，能阅读英文资料、竞品文档和 AI/智能硬件相关工具说明。",
  },
};

const pathLength = 1000;

function toSvgPoint(element, xRatio = 0.5, yRatio = 0.5) {
  if (!skillTree || !skillWires || !element) return { x: 0, y: 0 };

  const treeRect = skillTree.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const scaleX = 1120 / treeRect.width;
  const scaleY = 600 / treeRect.height;

  return {
    x: (rect.left - treeRect.left + rect.width * xRatio) * scaleX,
    y: (rect.top - treeRect.top + rect.height * yRatio) * scaleY,
  };
}

function curvePath(from, to, lift = 0) {
  const dx = Math.max(80, Math.abs(to.x - from.x) * 0.46);
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} C${(from.x + dx).toFixed(1)} ${(from.y + lift).toFixed(1)} ${(to.x - dx).toFixed(1)} ${(to.y - lift).toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

function updateSkillWires() {
  if (!skillTree || !skillWires) return;

  const root = document.querySelector(".skill-root");
  const ai = document.querySelector('.skill-node[data-skill="ai"]');
  const product = document.querySelector('.skill-node[data-skill="product"]');
  const visual = document.querySelector('.skill-node[data-skill="visual"]');
  const base = document.querySelector('.skill-node[data-skill="base"]');
  const panel = document.querySelector(".skill-panel");

  const rootPoint = toSvgPoint(root, 0.78, 0.5);
  const paths = {
    ".wire-ai": curvePath(rootPoint, toSvgPoint(ai, 0.12, 0.5), -80),
    ".wire-product": curvePath(rootPoint, toSvgPoint(product, 0.1, 0.5), 0),
    ".wire-visual": curvePath(rootPoint, toSvgPoint(visual, 0.12, 0.6), 90),
    ".wire-base": curvePath(rootPoint, toSvgPoint(base, 0.12, 0.48), 42),
    ".wire-ai-result": curvePath(toSvgPoint(ai, 0.74, 0.48), toSvgPoint(panel, 0.2, 0.34), -44),
    ".wire-product-result": curvePath(toSvgPoint(product, 0.82, 0.42), toSvgPoint(panel, 0.18, 0.55), -12),
    ".wire-visual-result": curvePath(toSvgPoint(visual, 0.72, 0.16), toSvgPoint(panel, 0.48, 0.96), -36),
    ".wire-base-result": curvePath(toSvgPoint(base, 0.72, 0.26), toSvgPoint(panel, 0.08, 0.84), 70),
  };

  Object.entries(paths).forEach(([selector, path]) => {
    document.querySelector(selector)?.setAttribute("d", path);
  });
}

function updateProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll <= 0 ? 0 : window.scrollY / maxScroll;
  const y = 4 + progress * 92;

  walker.style.setProperty("--walker-top", `${y}%`);
  drawnPath.style.setProperty("--progress-dash", `${progress * pathLength}`);

  let activeId = "hero";
  for (const section of sections) {
    if (section.getBoundingClientRect().top < window.innerHeight * 0.42) {
      activeId = section.id;
    }
  }

  nodes.forEach((node) => {
    node.classList.toggle("is-active", node.dataset.target === activeId);
  });
}

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.18 },
  );

  revealEls.forEach((el) => observer.observe(el));
}

function scrollToSectionCenter(target) {
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const headerOffset = window.innerWidth > 640 ? 46 : 0;
  const centeredTop = absoluteTop - (window.innerHeight - rect.height) / 2 - headerOffset;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  window.scrollTo({
    top: Math.max(0, Math.min(centeredTop, maxScroll)),
    behavior: "smooth",
  });
}

function bindNavigation() {
  nodes.forEach((node) => {
    node.addEventListener("click", () => {
      scrollToSectionCenter(document.getElementById(node.dataset.target));
    });
  });

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      scrollToSectionCenter(target);
    });
  });
}

function bindProjectControls() {
  islandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      islandButtons.forEach((item) => item.classList.remove("is-visited"));
      button.classList.add("is-visited");
    });
  });
}

function bindCursorOrbit() {
  window.addEventListener("mousemove", (event) => {
    const mx = event.clientX / window.innerWidth - 0.5;
    const my = event.clientY / window.innerHeight - 0.5;

    document.documentElement.style.setProperty("--mx", mx.toFixed(3));
    document.documentElement.style.setProperty("--my", my.toFixed(3));

    cursorOrbit.style.opacity = "1";
    cursorOrbit.style.left = `${event.clientX}px`;
    cursorOrbit.style.top = `${event.clientY}px`;
  });

  window.addEventListener("mouseleave", () => {
    cursorOrbit.style.opacity = "0";
  });
}

function bindReactiveMotion() {
  reactiveEls.forEach((el) => {
    const strength = Number(el.dataset.reactiveStrength || 12);
    const state = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      rect: null,
      raf: 0,
      active: false,
    };

    const setActive = (active) => {
      if (state.active === active) return;
      state.active = active;
      el.classList.toggle("is-reacting", active);
    };

    const cacheRect = () => {
      state.rect = el.getBoundingClientRect();
    };

    const writeMotion = () => {
      state.currentX += (state.targetX - state.currentX) * 0.09;
      state.currentY += (state.targetY - state.currentY) * 0.09;

      const active = Math.abs(state.currentX) + Math.abs(state.currentY) > 0.003;
      setActive(active);
      el.style.setProperty("--rx", `${(state.currentX * strength).toFixed(2)}px`);
      el.style.setProperty("--ry", `${(state.currentY * strength).toFixed(2)}px`);
      el.style.setProperty("--mx", state.currentX.toFixed(3));
      el.style.setProperty("--my", state.currentY.toFixed(3));

      if (active || Math.abs(state.targetX) + Math.abs(state.targetY) > 0.003) {
        state.raf = requestAnimationFrame(writeMotion);
      } else {
        state.currentX = 0;
        state.currentY = 0;
        el.style.setProperty("--rx", "0px");
        el.style.setProperty("--ry", "0px");
        el.style.setProperty("--mx", "0");
        el.style.setProperty("--my", "0");
        setActive(false);
        state.raf = 0;
      }
    };

    const ensureMotion = () => {
      if (!state.raf) state.raf = requestAnimationFrame(writeMotion);
    };

    el.addEventListener("pointerenter", cacheRect);

    el.addEventListener("pointermove", (event) => {
      const rect = state.rect || el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      state.targetX = Math.max(-0.5, Math.min(0.5, x));
      state.targetY = Math.max(-0.5, Math.min(0.5, y));
      ensureMotion();
    });

    el.addEventListener("pointerleave", () => {
      state.targetX = 0;
      state.targetY = 0;
      state.rect = null;
      ensureMotion();
    });
  });
}

function bindSkillTree() {
  if (!skillTree) return;

  skillNodes.forEach((node) => {
    const activate = () => {
      const key = node.dataset.skill;
      const copy = skillCopy[key];
      skillTree.dataset.active = key;
      skillNodes.forEach((item) => item.classList.toggle("is-active", item === node));
      skillTitle.textContent = copy.title;
      skillDesc.textContent = copy.desc;
      updateSkillWires();
    };

    node.addEventListener("mouseenter", activate);
    node.addEventListener("focus", activate);
  });

  skillTree.addEventListener("mouseleave", () => {
    skillTree.dataset.active = "";
    skillNodes.forEach((item) => item.classList.remove("is-active"));
    skillTitle.textContent = "滑过一个节点";
    skillDesc.textContent = "查看它如何服务项目推进。";
    updateSkillWires();
  });
}

function bindDraggableSkillCards() {
  if (!skillTree || window.matchMedia("(max-width: 980px)").matches) return;

  draggableSkillCards.forEach((card) => {
    card.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;

      event.preventDefault();
      card.setPointerCapture(event.pointerId);

      const startX = event.clientX;
      const startY = event.clientY;
      const initialX = Number(card.dataset.dragX || 0);
      const initialY = Number(card.dataset.dragY || 0);

      card.classList.add("is-dragging");

      const moveCard = (moveEvent) => {
        const nextX = initialX + moveEvent.clientX - startX;
        const nextY = initialY + moveEvent.clientY - startY;
        card.dataset.dragX = String(nextX);
        card.dataset.dragY = String(nextY);
        card.style.setProperty("--card-x", `${nextX}px`);
        card.style.setProperty("--card-y", `${nextY}px`);
        updateSkillWires();
      };

      const stopDrag = () => {
        card.classList.remove("is-dragging");
        card.removeEventListener("pointermove", moveCard);
        card.removeEventListener("pointerup", stopDrag);
        card.removeEventListener("pointercancel", stopDrag);
        updateSkillWires();
      };

      card.addEventListener("pointermove", moveCard);
      card.addEventListener("pointerup", stopDrag);
      card.addEventListener("pointercancel", stopDrag);
    });
  });
}

function hasReadableTextBelow(piece, x, y) {
  const previousPointerEvents = piece.style.pointerEvents;
  piece.style.pointerEvents = "none";
  const under = document.elementFromPoint(x, y);
  piece.style.pointerEvents = previousPointerEvents;

  if (!under || piece.contains(under)) return false;

  const textHost = under.closest("h1, h2, h3, p, a, span, strong, small, b, .ascii-ghost, .blueprint-card");
  return Boolean(textHost && textHost.textContent.trim().length > 0);
}

function bindDraggableCollagePieces() {
  if (!heroCollage || window.matchMedia("(max-width: 980px)").matches) return;

  collagePieces.forEach((piece) => {
    piece.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();
      piece.setPointerCapture(event.pointerId);

      const startX = event.clientX;
      const startY = event.clientY;
      const initialX = Number(piece.dataset.dragX || 0);
      const initialY = Number(piece.dataset.dragY || 0);
      const collageRect = heroCollage.getBoundingClientRect();
      const pieceRect = piece.getBoundingClientRect();
      const minX = collageRect.left - pieceRect.left - pieceRect.width * 0.38;
      const maxX = collageRect.right - pieceRect.right + pieceRect.width * 0.38;
      const minY = collageRect.top - pieceRect.top - pieceRect.height * 0.38;
      const maxY = collageRect.bottom - pieceRect.bottom + pieceRect.height * 0.38;

      piece.classList.add("is-dragging");

      const movePiece = (moveEvent) => {
        moveEvent.stopPropagation();
        const nextX = Math.max(minX, Math.min(maxX, initialX + moveEvent.clientX - startX));
        const nextY = Math.max(minY, Math.min(maxY, initialY + moveEvent.clientY - startY));
        piece.dataset.dragX = String(nextX);
        piece.dataset.dragY = String(nextY);
        piece.style.setProperty("--piece-x", `${nextX}px`);
        piece.style.setProperty("--piece-y", `${nextY}px`);
        piece.classList.toggle("is-over-text", hasReadableTextBelow(piece, moveEvent.clientX, moveEvent.clientY));
      };

      const stopDrag = (stopEvent) => {
        piece.classList.remove("is-dragging");
        piece.classList.toggle("is-over-text", hasReadableTextBelow(piece, stopEvent.clientX, stopEvent.clientY));
        piece.removeEventListener("pointermove", movePiece);
        piece.removeEventListener("pointerup", stopDrag);
        piece.removeEventListener("pointercancel", stopDrag);
      };

      piece.addEventListener("pointermove", movePiece);
      piece.addEventListener("pointerup", stopDrag);
      piece.addEventListener("pointercancel", stopDrag);
    });
  });
}

function bindMapTourist() {
  if (!mapBoard) return;

  mapBoard.addEventListener("mouseenter", () => {
    mapBoard.classList.add("is-touring");
  });

  mapBoard.addEventListener("mousemove", (event) => {
    const rect = mapBoard.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    mapBoard.style.setProperty("--tour-x", `${x.toFixed(2)}%`);
    mapBoard.style.setProperty("--tour-y", `${y.toFixed(2)}%`);
  });

  mapBoard.addEventListener("mouseleave", () => {
    mapBoard.classList.remove("is-touring");
  });
}

function bindMailPopover() {
  if (!contactTrigger || !mailPopover || !mailClose) return;

  const openPopover = () => {
    mailPopover.hidden = false;
    mailClose.focus();
  };

  const closePopover = () => {
    mailPopover.hidden = true;
    contactTrigger.focus();
  };

  contactTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    openPopover();
  });

  mailClose.addEventListener("click", closePopover);
  mailPopover.addEventListener("click", (event) => {
    if (event.target === mailPopover) closePopover();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mailPopover.hidden) closePopover();
  });
}

function init() {
  revealOnScroll();
  bindNavigation();
  bindProjectControls();
  bindCursorOrbit();
  bindReactiveMotion();
  bindSkillTree();
  bindDraggableSkillCards();
  bindDraggableCollagePieces();
  bindMapTourist();
  bindMailPopover();
  updateProgress();
  updateSkillWires();

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", () => {
    updateProgress();
    updateSkillWires();
  });
}

init();
