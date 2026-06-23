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
  const clickLinks = document.querySelectorAll('.nav-link, .dropdown-item');
  const sections = document.querySelectorAll('section');
  const dropdownToggle = document.querySelector('.nav-dropdown .dropdown-toggle');
  const dropdown = document.querySelector('.nav-dropdown');

  if (burgerToggle && navbar) {
    burgerToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      burgerToggle.classList.toggle('active');
      navbar.classList.toggle('active');
      if (dropdown && !navbar.classList.contains('active')) {
        dropdown.classList.remove('expanded');
      }
    });

    // Close mobile menu on clicking any link
    clickLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerToggle.classList.remove('active');
        navbar.classList.remove('active');
        if (dropdown) {
          dropdown.classList.remove('expanded');
        }
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navbar.classList.contains('active')) {
        burgerToggle.classList.remove('active');
        navbar.classList.remove('active');
        if (dropdown) {
          dropdown.classList.remove('expanded');
        }
      }
    });

    // Toggle dropdown in mobile view
    if (dropdownToggle && dropdown) {
      dropdownToggle.addEventListener('click', (e) => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          e.preventDefault();
          e.stopPropagation();
          dropdown.classList.toggle('expanded');
        }
      });
    }
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
  setupCarousel('projects-track', 'projects-prev', 'projects-next', 'projects-dots');
  setupCarousel('articles-track', 'articles-prev', 'articles-next', 'articles-dots');
}

function setupCarousel(trackId, prevBtnId, nextBtnId, dotsContainerId) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);
  const dotsContainer = document.getElementById(dotsContainerId);
  
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const dots = Array.from(dotsContainer.children);
  const cards = Array.from(track.children);
  if (cards.length === 0) return;

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
    
    // Update dots visibility and active status
    const maxIndex = getMaxIndex();
    dots.forEach((dot, index) => {
      if (index > maxIndex) {
        dot.style.display = 'none';
      } else {
        dot.style.display = '';
      }
      
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
  const modalActions = document.getElementById('modal-actions');

  const projectData = [
    {
      title: "Saharah",
      category: "project",
      imgSrc: "assets/saharahlogo.png",
      links: [
        { label: "Visit Saharah", url: "https://saharah.ca/" }
      ],
      description: '<figure><img src="assets/saharah_test_checkout.png" alt="A screenshot of a customer\'s cart with a test product in it"><figcaption>A screenshot of a customer\'s cart with a test product in it.</figcaption></figure><figure><img src="assets/saharah_aws_architecture.png" alt="Architectural Diagram of Saharah"><figcaption>Architectural Diagram of Saharah</figcaption></figure><p class="modal-intro">A freelance project for an e-commerce client who sells traditional South Asian clothing for Women. Developed as a full-stack e-commerce application showcasing a modern, serverless architecture on AWS. The front end was built with React and bundled/deployed via AWS Amplify, leveraging a CI/CD pipeline connected to GitHub. The app\'s domain is managed with Amazon Route 53, ensuring custom URL and DNS configuration.</p><h3 class="modal-section-title">Technologies Used</h3><h4 class="modal-subsection-title">Frontend</h4><ul class="modal-tech-list"><li><strong>React/NodeJS:</strong> User interface and client-side logic</li></ul><h4 class="modal-subsection-title">Backend</h4><ul class="modal-tech-list"><li><strong>Amplify GraphQL:</strong> Provides schemas and mutations for real-time data operations</li><li><strong>AWS Amplify:</strong> Used for hosting the React front end and managing a CI/CD pipeline with GitHub</li><li><strong>Amazon SES:</strong> Delivers automated email invoices and notifications</li><li><strong>AWS Lambda:</strong> Executes cart session management, inventory updates, and payment workflows with Stripe</li></ul><h4 class="modal-subsection-title">Database</h4><ul class="modal-tech-list"><li><strong>Amazon DynamoDB:</strong> Stores product details, orders, and inventory information</li><li><strong>Amazon S3:</strong> Hosts product images and other static assets</li></ul><h4 class="modal-subsection-title">Other</h4><ul class="modal-tech-list"><li><strong>AWS Amplify CLI:</strong> For local development, testing, and deployment of the application</li><li><strong>Amazon Route53:</strong> Handles domain registration and DNS configuration for a custom URL</li></ul><h3 class="modal-section-title">How It All Works</h3><h4 class="modal-subsection-title">User Experience &amp; Cart Sessions</h4><p>Visitors are greeted by a beautiful UI. They can freely browse products and add items to their cart. AWS Lambda functions track cart sessions and update DynamoDB for accurate stock levels.</p><h4 class="modal-subsection-title">Payment Processing</h4><p>At checkout, the app invokes a Lambda function to process the payment through Stripe. Upon receiving a webhook event from Stripe, another Lambda function confirms the transaction and updates order records.</p><h4 class="modal-subsection-title">Failed/Abandoned Payments</h4><p>If Stripe indicates a failed payment or the user abandons the checkout, the Lambda function holds stock for 30 minutes, then automatically restocks DynamoDB to maintain accurate inventory.</p><h4 class="modal-subsection-title">Invoice Generation &amp; Notifications</h4><p>After successful payment, the final Lambda function calls Amazon SES to send an email invoice to the buyer. Product images are served from S3, and all order details remain accessible in DynamoDB.</p>'
    },
    {
      title: "Xevron",
      category: "project",
      imgSrc: "assets/xevLogo.png",
      links: [
        { label: "Try It Out", url: "https://main.d3m6cl65omgl3g.amplifyapp.com/" },
        { label: "GitHub", url: "https://github.com/mhuzaifashaikh/awsclientapp" }
      ],
      description: '<figure><img src="assets/HomePageXev.png" alt="A screenshot of the web application\'s homepage"><figcaption>A screenshot of the web application\'s homepage.</figcaption></figure><p class="modal-intro">A comprehensive full-stack AWS application, designed to provide a seamless user experience. Upon signing in or registering, users are welcomed by a beautiful homepage, offering easy access to their client portfolio. A sleek and efficiently designed form enables rapid data entry, directly updating a cloud-based database. Following submission, users are redirected to a dedicated client management page, showcasing a comprehensive list of all clients, including the newly added entry.</p><h3 class="modal-section-title">Technologies Used</h3><h4 class="modal-subsection-title">Frontend</h4><ul class="modal-tech-list"><li><strong>React:</strong> User interface and client-side logic</li></ul><h4 class="modal-subsection-title">Backend</h4><ul class="modal-tech-list"><li><strong>AWS CLI:</strong> Command-line tool for interacting with AWS services</li><li><strong>AWS Amplify:</strong> Development platform for building scalable mobile and web applications</li><li><strong>AWS API Gateway:</strong> RESTful API for handling client requests</li><li><strong>AWS Lambda:</strong> Serverless compute service for executing business logic</li></ul><h4 class="modal-subsection-title">Database</h4><ul class="modal-tech-list"><li><strong>Amazon DynamoDB:</strong> NoSQL database for storing client data</li></ul><h4 class="modal-subsection-title">Authentication</h4><ul class="modal-tech-list"><li><strong>AWS Amplify Auth:</strong> Authentication library for managing user sessions</li><li><strong>AWS Cognito:</strong> User identity and access management service</li></ul><h4 class="modal-subsection-title">Other</h4><ul class="modal-tech-list"><li><strong>AWS Amplify CLI:</strong> For local development, testing, and deployment of the application</li></ul><h3 class="modal-section-title">How It All Works</h3><h4 class="modal-subsection-title">User Authentication</h4><p>Users sign in or sign up using AWS Amplify Auth, which utilizes AWS Cognito for secure user identity and access management.</p><h4 class="modal-subsection-title">Client Form Submission</h4><p>When a user submits a client form, the application uses AWS API Gateway to send a PUT request to a Lambda function.</p><h4 class="modal-subsection-title">Lambda Function</h4><p>The Lambda function interacts with Amazon DynamoDB, adding the new client data to the database.</p><h4 class="modal-subsection-title">Client Page</h4><p>When a user navigates to the client page, API Gateway automatically triggers the Lambda function\'s GET method. The Lambda function queries DynamoDB, retrieving all records associated with the logged-in user. The application displays the retrieved data on the client page, providing a personalized view of the user\'s clients.</p>'
    },
    {
      title: "VirtueGPT",
      category: "project",
      imgSrc: "assets/VirtueGPT.png",
      links: [
        { label: "Visit Website", url: "https://www.thevirtuegpt.com" },
        { label: "GitHub", url: "https://github.com/mhuzaifashaikh/VirtueGPT" }
      ],
      description: '<h3 class="modal-section-title">What is VirtueGPT</h3><p>VirtueGPT stands as a groundbreaking AI-powered Faith-Based companion, purposefully designed to provide profound spiritual guidance and unwavering support to individuals navigating life\'s intricate challenges. It represents a digital sanctuary, where seekers can find solace, wisdom, and empowerment on their spiritual journeys.</p><h3 class="modal-section-title">Who is VirtueGPT For</h3><p>VirtueGPT is tailored to serve individuals from diverse backgrounds, offering culturally sensitive support and insights to users worldwide. With a particular focus on nurturing the needs of the Muslim community, VirtueGPT welcomes seekers of all faiths and backgrounds, embracing inclusivity and understanding.</p><h3 class="modal-section-title">How I Developed VirtueGPT</h3><p>Leveraging cutting-edge technologies, I utilized Python for robust backend logic and processing, while Flask provided the dynamic web framework for seamless interactions. HTML/CSS sculpted the frontend design, ensuring an intuitive and aesthetically pleasing user interface.</p><p>VirtueGPT\'s deployment and hosting are powered by Vercel, ensuring efficient access and reliability for users. Integration with OpenAI\'s advanced LLM-AI responses infuses the platform with personalized insights and empathetic responses.</p><h3 class="modal-section-title">Impact and Future Reach</h3><p>VirtueGPT is already making a big difference, with more than 145 people using it every day from all over the world. And it\'s only going to get bigger! We\'re working hard to make sure VirtueGPT can help even more people in the future. Our goal is to make it easy for everyone to find support and guidance on their spiritual journey, no matter where they are or what they believe in.</p>'
    },
    {
      title: "Apple E-Commerce",
      category: "project",
      imgSrc: "assets/MT.jpg",
      links: [
        { label: "GitHub", url: "https://github.com/mhuzaifashaikh/EcommWebApp" }
      ],
      description: '<figure><div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; width: 100%; max-width: 560px; margin: 0 auto;"><iframe src="https://www.youtube.com/embed/o6G5otHGhDI?si=gDb1Vh2kY2Mly6sF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div><figcaption>A quick demonstration going over the main functionality of the website.</figcaption></figure><p class="modal-intro">A platform where users can register for an account and purchase Apple products in an eBay-like fashion. Users have the option to list their item as a forward/dutch auction. The highest bidder wins (earliest "bidder" in case of a dutch auction) and is then able to proceed to the payment page. The website has a sleek modern look which is intuitive as well as fun to interact with.</p><h3 class="modal-section-title">About This Project</h3><p>In a team of 3, we worked to create a functional E-commerce platform focused on Apple products.</p><p>We employed Java with Spring Boot for the backend functionality of the website and established a Spring MVC architecture for efficient communication between the platform\'s elements. Our data management relied on SQLite, a reliable and straightforward database management system.</p><p>For the frontend, we utilized Thymeleaf templates which dynamically reference the model in order to populate the HTML pages and used CSS to style these pages, keeping things modern and intuitive. And for testing/demonstration, we streamlined local hosting on Apache Tomcat.</p><p>A notable highlight of our platform is the integration of a real-time bidding system. By employing web sockets, we engineered a mechanism that provides immediate updates to bidders (the current highest bidding price and the username of that highest bidder) in real time. This keeps the bidding process exciting and transparent.</p>'
    },
    {
      title: "Intro to Machine Learning",
      category: "article",
      imgSrc: "assets/ML.png",
      links: [
        { label: "Read on Medium", url: "https://medium.com/@mhuzaifashaikh" }
      ],
      description: '<p class="modal-intro">A carefully crafted article that provides a broad image of Machine Learning and Artificial Intelligence, ensuring you gain enough understanding to engage in basic discussions.</p><p>The article covers the fundamental concepts of ML, different types of learning algorithms (supervised, unsupervised, reinforcement learning), and real-world applications across industries. It\'s designed to be accessible to readers without a deep technical background while still providing substantive insight.</p>'
    },
    {
      title: "Amazon SageMaker",
      category: "article",
      imgSrc: "assets/sagemaker.png",
      links: [
        { label: "Read on Medium", url: "https://medium.com/@mhuzaifashaikh" }
      ],
      description: '<p class="modal-intro">An article that explains how Amazon SageMaker, a fully managed ML service from AWS, significantly reduces the cost and complexity of scaling, managing infrastructure, and deploying machine learning models.</p><p>The article dives into how SageMaker abstracts away the heavy lifting of ML infrastructure — from data labeling and model training to tuning and deployment — allowing engineers to focus on building better models rather than managing servers.</p>'
    },
    {
      title: "Object-Oriented Programming",
      category: "article",
      imgSrc: "assets/OOP.jpg",
      links: [
        { label: "Read on Medium", url: "https://medium.com/@mhuzaifashaikh" }
      ],
      description: '<p class="modal-intro">An article that goes into great detail about the possible benefits and drawbacks of using OOP and its features in designing and implementing software.</p><p>Covering core principles like encapsulation, inheritance, polymorphism, and abstraction, this article examines when OOP shines and when alternative paradigms might be more appropriate. With over 422 readers, it provides practical insights for both beginners and experienced developers.</p>'
    },
    {
      title: "Open-Source Operating Systems",
      category: "article",
      imgSrc: "assets/OS.jpg",
      links: [
        { label: "Read on Medium", url: "https://medium.com/@mhuzaifashaikh" }
      ],
      description: '<p class="modal-intro">An article that goes into everything about open-source operating systems.</p><p>This piece explores the architecture, philosophy, and community-driven development models behind open-source operating systems. From Linux distributions to the principles of free software, it provides a comprehensive overview for anyone interested in understanding the ecosystem.</p>'
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
      modalDesc.innerHTML = data.description;
      
      // Build action buttons
      let actionsHtml = '';
      if (data.links && data.links.length > 0) {
        data.links.forEach(link => {
          actionsHtml += '<a href="' + link.url + '" class="modal-action-btn" target="_blank" rel="noopener noreferrer"><span>' + link.label + '</span><i class="fa-solid fa-arrow-up-right-from-square"></i></a>';
        });
      }
      modalActions.innerHTML = actionsHtml;

      // Update badge style if article
      if (data.category === 'article') {
        modalBadge.style.borderColor = 'rgba(233, 168, 129, 0.4)';
      } else {
        modalBadge.style.borderColor = 'rgba(233, 168, 129, 0.2)';
      }

      // Show modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal functions
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
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
