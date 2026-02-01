
function locomotive(){
  gsap.registerPlugin(ScrollTrigger);

  // Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll
  
  const locoScroll = new LocomotiveScroll({
    el: document.querySelector(".main"),
    smooth: true
  });
  // each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
  locoScroll.on("scroll", ScrollTrigger.update);
  
  // tell ScrollTrigger to use these proxy methods for the "" element since Locomotive Scroll is hijacking things
  ScrollTrigger.scrollerProxy(".main", {
    scrollTop(value) {
      return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    }, // we don't have to define a scrollLeft because we're only scrolling vertically.
    getBoundingClientRect() {
      return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
    },
    // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
    pinType: document.querySelector(".main").style.transform ? "transform" : "fixed"
  });
  
  
  // each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  
  // after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
  ScrollTrigger.refresh();
  
  
  
  
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
gsap.from(".servies h1",{
    y:120,
    stagger:0.2,
    duration:1,
    ScrollTrigger:{
        trigger:".page2",
        scroller:"",
        start:"top 40%",
        end: "top 37%",
        // markers:true,
        scrub:2
    }
})
}
page2Animation();

function page3Animation(){
  gsap.from(".servies h1",{
      y:120,
      stagger:0.2,
      duration:1,
      ScrollTrigger:{
          trigger:".page2",
          scroller:"",
          start:"top 40%",
          end: "top 37%",
          // markers:true,
          scrub:2
      }
  })
  }
  page3Animation();

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

function loader(){
  window.addEventListener('load', function() {
    // Your GSAP animation code here
    // Set initial states
  gsap.set(".pre-loader", { opacity: 1 });
  gsap.set(".pre-loader h3", { opacity: 1, x: 0 });
  
  var tl = gsap.timeline({
      onComplete: function() {
          gsap.set(".pre-loader", { display: "none" });
      }
  });
  
  tl.to(".pre-loader h3", {
      opacity: 0,
      x: -10,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.in"
  })
  .to(".pre-loader", {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut"
  }, "-=0.3");
  
  tl.to(".pre-loader", { duration: 1 }) // 1-second delay
    .to(".pre-loader h3", {
      opacity: 0,
      y: -10,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.in"
    })
    .to(".pre-loader", {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut"
    }, "-=0.3");
  });
  
}
loader();

