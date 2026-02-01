function locomotive() {
  gsap.registerPlugin(ScrollTrigger);

  const locoScroll = new LocomotiveScroll({
    el: document.querySelector(".main"),
    smooth: true,
    multiplier: 1,
    lerp: 0.05
  });

  locoScroll.on("scroll", ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(".main", {
    scrollTop(value) {
      return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.querySelector(".main").style.transform ? "transform" : "fixed"
  });

  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  ScrollTrigger.refresh();

  // Add smooth scrolling for navigation items
  const navLinks = document.querySelectorAll('nav a[data-scroll-to]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-scroll-to');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        locoScroll.scrollTo(targetElement);
      }
    });
  });
}
locomotive();

function cursorAnimation (){
  var page1Content = document.querySelector(".page1-content");
var cursor1 = document.querySelector(".cursor1");

page1Content.addEventListener("mousemove", function (key) {
  gsap.to(cursor1, {
      x: key.x,
      y: key.y
  })
})
page1Content.addEventListener("mouseenter",function(){
  gsap.to(cursor1, {
      scale:1,
      opacity:1
   })
})
page1Content.addEventListener("mouseleave",function(){
  gsap.to(cursor1, {
     scale:0,
     opacity:0
  })
})
};
cursorAnimation();


function page2Animation(){
gsap.from(".services .container h3",{
    y:60,
    stagger:0.2,
    duration:1,
    opacity:0,
    scrollTrigger:{
        trigger:".page2",
        scroller:".main",
        start:"top 40%",
        end: "top 37%",
        // markers:true,
        scrub:2,
    }
})
}
page2Animation();

// function page3Animation(){
//   gsap.from(".main-content .about",{
//       y:100,
//       stagger:0.2,
//       duration:1,
//       opacity:0,
//       scrollTrigger:{
//           trigger:".page3",
//           scroller:".main",
//           start:"top 60%",
//           end: "top 20%",
//           // markers:true,
//           scrub:2
//       }
//   })
// }
//page3Animation();



//page 3 animation
var t1=gsap.timeline();
t1.from(".main-content .about",{
    opacity:0,
    y:60,
    stagger:0.5,
    delay:2,
    duration:0.9,
    scrollTrigger:{
        trigger:".page3",
        scroller:".main",
        start:"top 60%",
        //markers:true,
        end:"top 40%",
        scrub:1,
    }
})

function swiper(){
  var swiper = new Swiper(".swiper-container", {
    slidesPerView: 'auto',
    spaceBetween: 30,
    loop: true,
    centeredSlides: true,

    autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    // navigation: {
    //   nextEl: ".swiper-button-next",
    //   prevEl: ".swiper-button-prev",
    // },
    
  });

}
swiper();


function loader() {
  return new Promise((resolve) => {
    window.addEventListener('load', () => {
      const preLoader = document.querySelector(".pre-loader");
      const tl = gsap.timeline();
      
      tl.to(".pre-loader h3", {
        opacity: 0,
        y: -10,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.in"
      })
      .to(preLoader, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          preLoader.style.display = "none";
          resolve();
        }
      });
    });
  });
}

// Use async/await to ensure loader is complete before initializing other functions
async function init() {
  await loader();
  locomotive();
  cursorAnimation();
  // Call other init functions here
}
init();

document.addEventListener('DOMContentLoaded', function() {
  const userIcon = document.getElementById('userIcon');
  const loginDropdown = document.getElementById('loginDropdown');

  userIcon.addEventListener('click', function(event) {
      event.stopPropagation();
      loginDropdown.classList.toggle('show');
  });

  document.addEventListener('click', function(event) {
      if (!event.target.matches('#userIcon')) {
          if (loginDropdown.classList.contains('show')) {
              loginDropdown.classList.remove('show');
          }
      }
  });
});
