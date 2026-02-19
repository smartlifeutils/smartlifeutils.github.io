const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".section").forEach((section) => {
  section.style.animationPlayState = "paused";
  observer.observe(section);
});
