// document.addEventListener('DOMContentLoaded', function() {
//     const imageOne = document.getElementById('image-one');
//     const imageTwo = document.getElementById('image-two');
//     const transitionArea = document.querySelector('.image-transition');
//         function shuffleImage(image) {
//             const canvas = document.createElement('canvas');
//             const ctx = canvas.getContext('2d');
//             canvas.width = image.width;
//             canvas.height = image.height;
//             ctx.drawImage(image, 0, 0);
    
//             const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//             const pixels = imageData.data;
            
//             for (let i = 0; i < pixels.length; i += 4) {
//                 const j = Math.floor(Math.random() * pixels.length);
//                 [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
//                 [pixels[i+1], pixels[j+1]] = [pixels[j+1], pixels[i+1]];
//                 [pixels[i+2], pixels[j+2]] = [pixels[j+2], pixels[i+2]];
//             }
    
//             ctx.putImageData(imageData, 0, 0);
//             return canvas.toDataURL();
//         }
    
//         let shuffledImage = null;
    
//         function triggerTransition(e) {
//             const rect = transitionArea.getBoundingClientRect();
//             const x = e.clientX - rect.left;
//             const y = e.clientY - rect.top;
//             const centerX = rect.width / 2;
//             const centerY = rect.height / 2;
            
//             const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
//             const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
            
//             const opacity = Math.min(distance / maxDistance, 1);
    
//             if (!shuffledImage) {
//                 shuffledImage = shuffleImage(imageOne);
//                 imageOne.src = shuffledImage;
//             }
    
//             imageTwo.style.opacity = opacity;
//         }
    
//         transitionArea.addEventListener('mousemove', triggerTransition);
//         transitionArea.addEventListener('mouseleave', () => {
//             imageTwo.style.opacity = 0;
//         });
    

//     // Function to calculate distance between mouse and center
//     function distanceFromCenter(x, y, element) {
//         const rect = element.getBoundingClientRect();
//         const centerX = rect.left + rect.width / 2;
//         const centerY = rect.top + rect.height / 2;
//         return Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
//     }

//     // Function to initiate the shuffle and transition
//     function triggerTransition(e) {
//         const distance = distanceFromCenter(e.clientX, e.clientY, transitionArea);
//         const threshold = 150; // Adjust threshold for sensitivity

//         if (distance < threshold) {
//             imageOne.style.transform = 'scale(0.8)'; // Shrink first image
//             imageOne.style.opacity = 0; // Fade out first image
//             imageTwo.style.opacity = 1; // Fade in second image
//             shuffleSVGElements(imageOne); // Shuffle elements
//         } else {
//             imageOne.style.transform = 'scale(1)'; // Restore original scale
//             imageOne.style.opacity = 1; // Fade back first image
//             imageTwo.style.opacity = 0; // Fade out second image
//         }
//     }

//     // Shuffle elements function
//     function shuffleSVGElements(svg) {
//         const elements = Array.from(svg.children);
//         for (let i = elements.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             svg.appendChild(elements[j]); // Randomly reorder elements
//         }
//     }

//     // Add event listener for mouse movement
//     transitionArea.addEventListener('mousemove', triggerTransition);
// });

document.addEventListener('DOMContentLoaded', function() {
    // Define SVG namespace
    const svgNS = "http://www.w3.org/2000/svg";
    // Get the container for SVG elements
    const container = document.getElementById('image-group');
    // Get the transition area
    const transitionArea = document.querySelector('.image-transition');
    // Array to store SVG piece elements
    let pieces = [];
    // Define grid size for image pieces
    const gridSize = 10;

    /**
     * Create image pieces for transition effect
     * @param {string} imageSrc - Source of the image
     * @param {boolean} isSecondImage - Flag to determine if it's the second image
     */
    function createImagePieces(imageSrc, isSecondImage = false) {
        // Create main image element
        const image = document.createElementNS(svgNS, 'image');
        image.setAttributeNS(null, 'href', imageSrc);
        image.setAttributeNS(null, 'width', '100');
        image.setAttributeNS(null, 'height', '100');
        image.id = 'image-' + (isSecondImage ? 'two' : 'one');
        container.appendChild(image);

        // Create grid of image pieces
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // Create piece using the main image
                const piece = document.createElementNS(svgNS, 'use');
                piece.setAttributeNS(null, 'href', '#' + image.id);
                piece.setAttributeNS(null, 'x', -x * (100 / gridSize));
                piece.setAttributeNS(null, 'y', -y * (100 / gridSize));
                piece.setAttributeNS(null, 'width', '100');
                piece.setAttributeNS(null, 'height', '100');

                // Create clip path for the piece
                const clipPath = document.createElementNS(svgNS, 'clipPath');
                clipPath.id = `clip-${x}-${y}-${isSecondImage ? 'two' : 'one'}`;
                const clipRect = document.createElementNS(svgNS, 'rect');
                clipRect.setAttributeNS(null, 'x', x * (100 / gridSize));
                clipRect.setAttributeNS(null, 'y', y * (100 / gridSize));
                clipRect.setAttributeNS(null, 'width', 100 / gridSize);
                clipRect.setAttributeNS(null, 'height', 100 / gridSize);
                clipPath.appendChild(clipRect);
                container.appendChild(clipPath);

                // Group for the piece and its clip path
                const g = document.createElementNS(svgNS, 'g');
                g.appendChild(piece);
                g.setAttributeNS(null, 'clip-path', `url(#${clipPath.id})`);

                // Set initial opacity for second image pieces
                if (isSecondImage) {
                    g.style.opacity = '0';
                }

                container.appendChild(g);
                pieces.push(g);
            }
        }
    }

    /**
     * Shuffle the order of image pieces
     */
    function shufflePieces() {
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            container.appendChild(pieces[i]);
            container.appendChild(pieces[j]);
        }
    }

    /**
     * Handle transition effect based on mouse movement
     * @param {Event} e - Mouse event
     */
    function triggerTransition(e) {
        const rect = transitionArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate distance from center
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
        
        // Calculate progress of transition
        const progress = Math.min(distance / maxDistance, 1);

        // Apply transition to each piece
        pieces.forEach((piece, index) => {
            const delay = index * 0.01;
            const easedProgress = easeInOutCubic(progress);
            
            // Set opacity based on whether it's first or second image
            if (index < pieces.length / 2) {
                piece.style.opacity = 1 - easedProgress;
            } else {
                piece.style.opacity = easedProgress;
            }

            // Apply random movement to pieces
            piece.style.transform = `translate(${(Math.random() - 0.5) * 50 * (1 - easedProgress)}px, ${(Math.random() - 0.5) * 50 * (1 - easedProgress)}px)`;
        });
    }

    /**
     * Easing function for smoother animation
     * @param {number} t - Input value (0 to 1)
     * @return {number} Eased value
     */
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Create image pieces for both images
    createImagePieces('einstein1.svg');
    createImagePieces('einstein2.svg', true);
    // Shuffle the pieces
    shufflePieces();

    // Add event listeners for mouse interaction
    transitionArea.addEventListener('mousemove', triggerTransition);
    transitionArea.addEventListener('mouseleave', () => {
        // Reset pieces on mouse leave
        pieces.forEach((piece, index) => {
            if (index < pieces.length / 2) {
                piece.style.opacity = 1;
            } else {
                piece.style.opacity = 0;
            }
            piece.style.transform = 'translate(0, 0)';
        });
    });
});