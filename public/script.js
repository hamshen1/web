document.addEventListener('DOMContentLoaded', function () {
    const animationContainer = document.getElementById('animation-container');
    const blackCircle = document.getElementById('black-circle');
    const svg1Container = document.getElementById('svg1-container');
    const svg2Container = document.getElementById('svg2-container');

    const containerWidth = animationContainer.clientWidth;
    const containerHeight = animationContainer.clientHeight;

    // Define grid size (number of squares per row and column)
    const gridRows = 10; // Adjust as needed
    const gridCols = 10; // Adjust as needed

    const squareWidth = containerWidth / gridCols;
    const squareHeight = containerHeight / gridRows;

    const maxCircleDiameter = Math.min(containerWidth, containerHeight) / 2;
    const maxCircleRadius = maxCircleDiameter / 2;

    let isHovered = false;
    let animationInProgress = false;

    let svg1Squares = []; // Array to hold all squares of first SVG
    let svg2Squares = []; // Array to hold all squares of second SVG

    // Golden angle in degrees
    const goldenAngle = 137.5;

    /**
     * Function to create squares for a given SVG and append them to the specified container.
     * @param {string} svgPath - Path to the SVG file.
     * @param {HTMLElement} container - The container to append squares to.
     * @returns {Promise<Array>} - Resolves with an array of square elements.
     */
    function createSquares(svgPath, container) {
        return new Promise((resolve, reject) => {
            // Create a canvas to extract SVG image data
            const canvas = document.createElement('canvas');
            canvas.width = containerWidth;
            canvas.height = containerHeight;
            const ctx = canvas.getContext('2d');

            const img = new Image();
            img.src = svgPath;

            // Handle cross-origin issues if SVGs are hosted elsewhere
            img.crossOrigin = 'Anonymous';

            img.onload = function () {
                // Draw SVG onto canvas
                ctx.drawImage(img, 0, 0, containerWidth, containerHeight);

                let squares = [];

                for (let row = 0; row < gridRows; row++) {
                    for (let col = 0; col < gridCols; col++) {
                        const x = col * squareWidth;
                        const y = row * squareHeight;

                        // Create a new square div
                        const square = document.createElement('div');
                        square.classList.add('square');
                        square.style.width = `${squareWidth}px`;
                        square.style.height = `${squareHeight}px`;
                        square.style.left = `${x}px`;
                        square.style.top = `${y}px`;

                        // Set the background image and position
                        square.style.backgroundImage = `url('${svgPath}')`;
                        square.style.backgroundPosition = `-${x}px -${y}px`;
                        square.style.backgroundSize = `${containerWidth}px ${containerHeight}px`;

                        // Assign a unique rotation angle based on the golden angle
                        const index = row * gridCols + col;
                        const rotationAngle = (index * goldenAngle) % 360; // Ensure angle stays within 0-360 degrees
                        square.dataset.rotation = rotationAngle; // Store rotation angle in data attribute

                        // Append the square to the container
                        container.appendChild(square);
                        squares.push(square);
                    }
                }

                resolve(squares);
            };

            img.onerror = function () {
                console.error(`Failed to load SVG image from path: ${svgPath}`);
                reject(`Failed to load SVG image from path: ${svgPath}`);
            };
        });
    }

    /**
     * Initialize the animation by creating squares for both SVGs.
     */
    async function initializeAnimation() {
        try {
            // Create squares for first SVG
            svg1Squares = await createSquares('einstein1.svg', svg1Container);
            // Ensure svg1Container is visible
            svg1Container.classList.remove('hidden');

            // Create squares for second SVG but keep them hidden initially
            svg2Squares = await createSquares('einstein2.svg', svg2Container);
            svg2Container.classList.add('hidden');

        } catch (error) {
            console.error('Error initializing animation:', error);
        }
    }

    // Initialize the animation on page load
    initializeAnimation();

    // Handle hover events
    animationContainer.addEventListener('mouseenter', () => {
        if (animationInProgress || isHovered) return;
        animationInProgress = true;
        isHovered = true;
        startHoverInAnimation();
    });

    animationContainer.addEventListener('mouseleave', () => {
        if (animationInProgress || !isHovered) return;
        animationInProgress = true;
        isHovered = false;
        startHoverOutAnimation();
    });

    /**
     * Function to handle hover-in animation (first SVG to second SVG).
     */
    function startHoverInAnimation() {
        // Phase 1: Animate first SVG's squares moving to center
        svg1Squares.forEach(square => {
            const rotation = square.dataset.rotation;
            const currentX = parseFloat(square.style.left) + squareWidth / 2;
            const currentY = parseFloat(square.style.top) + squareHeight / 2;

            // Calculate translation towards the center using golden ratio path
            const targetX = (containerWidth / 2 - currentX);
            const targetY = (containerHeight / 2 - currentY);

            // Apply rotation and translation with scaling
            square.style.transform = `translate(${targetX}px, ${targetY}px) rotate(${rotation}deg) scale(0.1)`;
            square.style.opacity = '0';
        });

        // Grow the black circle
        blackCircle.classList.add('grow');

        // After Phase 1 duration, switch to second SVG
        setTimeout(() => {
            // Hide first SVG's container
            svg1Container.classList.add('hidden');

            // Show second SVG's container
            svg2Container.classList.remove('hidden');

            // Phase 2: Animate second SVG's squares moving out from center
            svg2Squares.forEach(square => {
                const rotation = square.dataset.rotation;
                // Calculate explosion direction influenced by golden angle
                const angle = parseInt(square.dataset.rotation) % 360;
                const distance = containerWidth / 2; // Maximum distance to move

                const translateX = Math.cos(angle * (Math.PI / 180)) * distance;
                const translateY = Math.sin(angle * (Math.PI / 180)) * distance;

                // Animate to explode out with rotation
                square.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(1)`;
                square.style.opacity = '1';
            });

            // Shrink the black circle
            blackCircle.classList.remove('grow');
            blackCircle.classList.add('shrink');

            // After Phase 2 duration, reset black circle and end animation
            setTimeout(() => {
                blackCircle.classList.remove('shrink');
                animationInProgress = false;
            }, 2000); // Duration matches the CSS transition
        }, 2000); // Phase 1 duration
    }

    /**
     * Function to handle hover-out animation (second SVG to first SVG).
     */
    function startHoverOutAnimation() {
        // Phase 1: Animate second SVG's squares moving to center
        svg2Squares.forEach(square => {
            const rotation = square.dataset.rotation;
            const currentX = parseFloat(square.style.left) + squareWidth / 2;
            const currentY = parseFloat(square.style.top) + squareHeight / 2;

            // Calculate translation towards the center using golden ratio path
            const targetX = (containerWidth / 2 - currentX);
            const targetY = (containerHeight / 2 - currentY);

            // Apply rotation and translation with scaling
            square.style.transform = `translate(${targetX}px, ${targetY}px) rotate(${rotation}deg) scale(0.1)`;
            square.style.opacity = '0';
        });

        // Grow the black circle
        blackCircle.classList.add('grow');

        // After Phase 1 duration, switch back to first SVG
        setTimeout(() => {
            // Hide second SVG's container
            svg2Container.classList.add('hidden');

            // Show first SVG's container
            svg1Container.classList.remove('hidden');

            // Phase 2: Animate first SVG's squares moving out from center
            svg1Squares.forEach(square => {
                const rotation = square.dataset.rotation;
                // Calculate explosion direction influenced by golden angle
                const angle = parseInt(square.dataset.rotation) % 360;
                const distance = containerWidth / 2; // Maximum distance to move

                const translateX = Math.cos(angle * (Math.PI / 180)) * distance;
                const translateY = Math.sin(angle * (Math.PI / 180)) * distance;

                // Animate to explode out with rotation
                square.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(1)`;
                square.style.opacity = '1';
            });

            // Shrink the black circle
            blackCircle.classList.remove('grow');
            blackCircle.classList.add('shrink');

            // After Phase 2 duration, reset black circle and end animation
            setTimeout(() => {
                blackCircle.classList.remove('shrink');
                animationInProgress = false;
            }, 2000); // Duration matches the CSS transition
        }, 2000); // Phase 1 duration
    }
});
