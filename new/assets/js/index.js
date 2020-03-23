import { Showcase } from "./Showcase";
import { Slides } from "./Slides";
import { Cursor } from "./Cursor";
import may22 from "../images/2020/03/19/2020031922232200-02CB906EA538A35643C1E1484C4B947D.jpg";
import may21 from "../images/2020/03/20/2020032011330000-02CB906EA538A35643C1E1484C4B947D.jpg";
import may20 from "../images/2020/03/21/2020032111342100-02CB906EA538A35643C1E1484C4B947D.jpg";
import may19 from "../images/2020/03/22/2020032211350600-02CB906EA538A35643C1E1484C4B947D.jpg";

const container = document.getElementById("app");
const cursor = new Cursor(document.querySelector(".cursor"));
const slidesData = [
  {
    image: may22,
    title: "03/22/2020",
    meta: "Test"
  },
  {
    image: may21,
    title: "03/21/2020",
    meta: "Test"
  },
  {
    image: may20,
    title: "03/20/2020",
    meta: "Test"
  },
  {
    image: may19,
    title: "03/19/2020",
    meta: "Test"
  }
];

const slides = new Slides(slidesData);
const showcase = new Showcase(slidesData, {
  onActiveIndexChange: activeIndex => {
    slides.onActiveIndexChange(activeIndex);
  },
  onIndexChange: index => {
    slides.onMove(index);
  },
  onZoomOutStart: ({ activeIndex }) => {
    cursor.enter();
    slides.appear();
  },
  onZoomOutFinish: ({ activeIndex }) => {},
  onFullscreenStart: ({ activeIndex }) => {
    cursor.leave();
    slides.disperse(activeIndex);
  },
  onFullscreenFinish: ({ activeIndex }) => {}
});

showcase.mount(container);
slides.mount(container);
showcase.render();

window.addEventListener("resize", function() {
  showcase.onResize();
});

window.addEventListener("mousemove", function(ev) {
  showcase.onMouseMove(ev);
});
