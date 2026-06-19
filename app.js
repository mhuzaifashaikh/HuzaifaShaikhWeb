/**
 * Huzaifa Shaikh - Portfolio App Script
 * ---------------------------------------------------------
 * Handles navigation scroll effects, responsive menu toggles,
 * a robust custom drag/swipe carousel, and modal popups.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCarousel();
  initModal();
});

/* ==========================================================================
   Navbar & Scroll Tracking
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const burgerToggle = document.getElementById('burger-toggle');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  if (burgerToggle && navbar) {
    burgerToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      burgerToggle.classList.toggle('active');
      navbar.classList.toggle('active');
    });

    // Close mobile menu on clicking any link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerToggle.classList.remove('active');
        navbar.classList.remove('active');
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navbar.classList.contains('active')) {
        burgerToggle.classList.remove('active');
        navbar.classList.remove('active');
      }
    });
  }

  const scrollIndicator = document.querySelector('.scroll-indicator');

  // Track active scroll section
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      // Triggers link change slightly before the section reaches the top
      if (window.scrollY >= (sectionTop - 250)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-target') === current) {
        link.classList.add('active');
      }
    });

    // Fade out scroll indicator on scroll
    if (scrollIndicator) {
      if (window.scrollY > 50) {
        scrollIndicator.classList.add('fade-out');
      } else {
        scrollIndicator.classList.remove('fade-out');
      }
    }
  });
}

/* ==========================================================================
   Custom Carousel Slider (Swipe / Drag & Click)
   ========================================================================== */
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  const dots = Array.from(dotsContainer.children);
  const cards = Array.from(track.children);
  
  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  // Touch and Mouse drag events
  track.addEventListener('mousedown', dragStart);
  track.addEventListener('touchstart', dragStart, { passive: true });
  track.addEventListener('mouseup', dragEnd);
  track.addEventListener('touchend', dragEnd);
  track.addEventListener('mousemove', drag);
  track.addEventListener('touchmove', drag, { passive: true });
  track.addEventListener('mouseleave', dragEnd);

  // Resize handler
  window.addEventListener('resize', () => {
    updateSliderPosition();
  });

  // Prev / Next button clicks
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });

  nextBtn.addEventListener('click', () => {
    const maxIndex = getMaxIndex();
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateSlider();
    }
  });

  // Dots clicks
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      // Safeguard index against mobile vs desktop columns limit
      const maxIndex = getMaxIndex();
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      updateSlider();
    });
  });

  function dragStart(e) {
    isDragging = true;
    startX = getPositionX(e);
    track.style.transition = 'none'; // Stop transition to drag in real time
    animationID = requestAnimationFrame(animation);
  }

  function drag(e) {
    if (!isDragging) return;
    const currentX = getPositionX(e);
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
  }

  function dragEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    
    // Calculate final index based on drag distance
    const cardWidth = getCardWidthWithGap();
    const movedBy = currentTranslate - prevTranslate;
    
    // Check swipe threshold
    if (movedBy < -100) {
      currentIndex++;
    } else if (movedBy > 100) {
      currentIndex--;
    }

    // Keep index within bounds
    const maxIndex = getMaxIndex();
    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
    
    // Add smooth transition back
    track.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    updateSlider();
  }

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  }

  function setSliderPosition() {
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function getCardWidthWithGap() {
    const card = cards[0];
    const cardWidth = card.getBoundingClientRect().width;
    // Extract gap from parent styles
    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(trackStyle.gap) || 0;
    return cardWidth + gap;
  }

  function getMaxIndex() {
    // Check how many cards are fully visible in the container
    const trackWidth = track.parentElement.getBoundingClientRect().width;
    const cardWidth = cards[0].getBoundingClientRect().width;
    
    // Estimate visible cards
    const visibleCards = Math.round(trackWidth / cardWidth);
    const maxIndex = cards.length - visibleCards;
    return Math.max(0, maxIndex);
  }

  function updateSlider() {
    const cardWidth = getCardWidthWithGap();
    currentTranslate = -currentIndex * cardWidth;
    prevTranslate = currentTranslate;
    setSliderPosition();
    updateControls();
  }

  function updateSliderPosition() {
    // Instantly snap to position on window resize
    track.style.transition = 'none';
    const cardWidth = getCardWidthWithGap();
    
    // Handle bounds change
    const maxIndex = getMaxIndex();
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }
    
    currentTranslate = -currentIndex * cardWidth;
    prevTranslate = currentTranslate;
    setSliderPosition();
    // Re-enable smooth transition
    setTimeout(() => {
      track.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    }, 50);
    
    updateControls();
  }

  function updateControls() {
    // Disable/Enable buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === getMaxIndex();
    
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.remove('active');
      if (index === currentIndex) {
        dot.classList.add('active');
      }
    });
  }

  // Initialize
  updateSlider();
}

/* ==========================================================================
   Project Detail Modal System
   ========================================================================== */
function initModal() {
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const projectCards = document.querySelectorAll('.project-card');
  
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalBadge = document.getElementById('modal-badge');
  const modalDesc = document.getElementById('modal-desc');

  // Rich data objects for the projects modal
  const projectData = [
    {
      title: "Saharah",
      category: "project",
      imgSrc: "assets/saharahlogo.png",
      description: "A freelance project for an e-commerce client who sells traditional South Asian clothing for Women. Developed as a full-stack e-commerce application showcasing a modern, serverless architecture on AWS. The front end was built with React and bundled/deployed via AWS Amplify, leveraging a CI/CD pipeline connected to GitHub. The app's domain is managed with Amazon Route 53, ensuring custom URL and DNS configuration."
    },
    {
      title: "Xevron",
      category: "project",
      imgSrc: "assets/xevLogo.png",
      description: "A comprehensive full-stack AWS application designed to provide a seamless user experience. Upon signing in or registering, users are welcomed by a beautiful homepage offering easy access to their client portfolio. A sleek and efficiently designed form enables rapid data entry, directly updating a cloud-based database. Following submission, users are redirected to a dedicated client management page showcasing a comprehensive list of all clients."
    },
    {
      title: "VirtueGPT",
      category: "project",
      imgSrc: "assets/VirtueGPT.png",
      description: "An AI-powered faith-based companion crafted to offer deep spiritual guidance and unwavering support to users facing life's ups and downs. Created using the latest tech to make it an engaging and life-changing experience, with an average of 145+ users benefiting from it daily."
    },
    {
      title: "Apple E-Commerce",
      category: "project",
      imgSrc: "assets/MT.jpg",
      description: "Worked in a team of 3 and developed a comprehensive e-commerce platform (an online store tailored for Apple products). This project leverages Java (Spring Boot) for backend services, a Spring MVC architecture, SQLite for database management, and a modern UI/UX using HTML/CSS for the frontend. Employs Docker to encapsulate the application environment. Tasked with creating a real-time bidding system utilizing web sockets to notify bidders dynamically and maintain live bid updates."
    },
    {
      title: "Intro to Machine Learning",
      category: "article",
      imgSrc: "assets/ML.png",
      description: "A carefully crafted article that provides a broad image of Machine Learning and Artificial Intelligence, ensuring you gain enough understanding to engage in basic discussions."
    },
    {
      title: "Amazon SageMaker",
      category: "article",
      imgSrc: "assets/sagemaker.png",
      description: "An article that explains how Amazon SageMaker, a fully managed ML service from AWS, significantly reduces the cost and complexity of scaling, managing infrastructure, and deploying machine learning models."
    },
    {
      title: "Object-Oriented Programming",
      category: "article",
      imgSrc: "assets/OOP.jpg",
      description: "An article that goes into great detail about the possible benefits and drawbacks of using OOP and its features in designing and implementing software."
    },
    {
      title: "Open-Source Operating Systems",
      category: "article",
      imgSrc: "assets/OS.jpg",
      description: "An article that goes into everything about open-source operating systems, exploring their architecture, history, and community-driven development models."
    }
  ];

  // Open modal
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.getAttribute('data-index'));
      const data = projectData[index];
      
      if (!data) return;

      // Populate details
      modalImg.src = data.imgSrc;
      modalImg.alt = data.title;
      modalTitle.textContent = data.title;
      modalBadge.textContent = data.category;
      modalDesc.textContent = data.description;
      
      // Update badge style if article
      if (data.category === 'article') {
        modalBadge.style.borderColor = 'rgba(233, 168, 129, 0.4)';
      } else {
        modalBadge.style.borderColor = 'rgba(233, 168, 129, 0.2)';
      }

      // Show modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Stop background scroll
    });
  });

  // Close modal functions
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
  }

  modalClose.addEventListener('click', closeModal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}
