const chapters = [...document.querySelectorAll<HTMLElement>(".chapter")];
const links = [...document.querySelectorAll<HTMLAnchorElement>(".page-nav a")];

function updateNavigation() {
  if (!chapters.length) return;
  let current = chapters[0];
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= 175) current = chapter;
  }
  for (const link of links) {
    const selected = link.hash === `#${current.id}`;
    link.classList.toggle("active", selected);
    if (selected) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

let scrollPending = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      updateNavigation();
      scrollPending = false;
    });
  },
  { passive: true },
);
updateNavigation();

function revealHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  const disclosure = target?.closest("details");
  if (disclosure) disclosure.open = true;
}
window.addEventListener("hashchange", revealHash);
revealHash();

const dialog = document.querySelector<HTMLDialogElement>("#figure-dialog");
const enlarged = document.querySelector<HTMLImageElement>("#enlarged-figure");
const caption = document.querySelector("#figure-dialog-caption");
const original = document.querySelector<HTMLAnchorElement>("#figure-original");
let figureTrigger: HTMLElement | null = null;

if (dialog && enlarged && caption && original) {
  for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-lightbox]")) {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (typeof dialog.showModal !== "function") return;
      event.preventDefault();
      figureTrigger = link;
      const sourceImage = link.querySelector("img");
      enlarged.src = link.href;
      enlarged.alt = sourceImage?.alt ?? "";
      caption.textContent = link.dataset.caption ?? "";
      original.href = link.href;
      dialog.showModal();
      document.body.classList.add("figure-open");
    });
  }
  document.querySelector("#close-figure")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("figure-open");
    figureTrigger?.focus({ preventScroll: true });
  });
}

const videos = [...document.querySelectorAll<HTMLVideoElement>(".scroll-video-frame video")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

for (const video of videos) {
  const frame = video.closest(".teaser-video");
  if (!frame) continue;
  video.addEventListener("playing", () => frame.classList.add("has-started"));
  video.addEventListener("emptied", () => frame.classList.remove("has-started"));
}

if (!reduceMotion && videos.length > 0) {
  const playVisible = (video: HTMLVideoElement, visible: boolean) => {
    if (visible) video.play().catch(() => {});
    else video.pause();
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        playVisible(entry.target as HTMLVideoElement, entry.isIntersecting);
      }
    },
    { threshold: 0.4 },
  );
  for (const video of videos) observer.observe(video);
}
