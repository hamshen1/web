document.addEventListener('DOMContentLoaded', function() {
    const svgNS = "http://www.w3.org/2000/svg";
    const container = document.getElementById('image-group');
    const transitionArea = document.querySelector('.image-transition');
    let pieces = [];
    const gridSize = 10;

    // Function to create image pieces
    function createImagePieces(imageSrc, isSecondImage = false) {
        const image = document.createElementNS(svgNS, 'image');
        image.setAttributeNS(null, 'href', imageSrc);
        image.setAttributeNS(null, 'width', '100');
        image.setAttributeNS(null, 'height', '100');
        image.id = 'image-' + (isSecondImage ? 'two' : 'one');
        container.appendChild(image);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const piece = document.createElementNS(svgNS, 'use');
                piece.setAttributeNS(null, 'href', '#' + image.id);
                piece.setAttributeNS(null, 'x', -x * (100 / gridSize));
                piece.setAttributeNS(null, 'y', -y * (100 / gridSize));
                piece.setAttributeNS(null, 'width', '100');
                piece.setAttributeNS(null, 'height', '100');

                const clipPath = document.createElementNS(svgNS, 'clipPath');
                clipPath.id = `clip-${x}-${y}-${isSecondImage ? 'two' : 'one'}`;
                const clipRect = document.createElementNS(svgNS, 'rect');
                clipRect.setAttributeNS(null, 'x', x * (100 / gridSize));
                clipRect.setAttributeNS(null, 'y', y * (100 / gridSize));
                clipRect.setAttributeNS(null, 'width', 100 / gridSize);
                clipRect.setAttributeNS(null, 'height', 100 / gridSize);
                clipPath.appendChild(clipRect);
                container.appendChild(clipPath);

                const g = document.createElementNS(svgNS, 'g');
                g.appendChild(piece);
                g.setAttributeNS(null, 'clip-path', `url(#${clipPath.id})`);

                if (isSecondImage) {
                    g.style.opacity = '0';
                    g.style.transform = 'scale(0.1)';
                } else {
                    g.style.opacity = '1';
                    g.style.transform = 'scale(1)';
                }

                container.appendChild(g);
                pieces.push({ element: g, isSecond: isSecondImage, x, y });
            }
        }
    }

    // Function to shuffle pieces and scale properly
    function shufflePieces() {
        const centerX = gridSize / 2;
        const centerY = gridSize / 2;
        pieces.forEach(piece => {
            const distance = Math.sqrt(Math.pow(piece.x - centerX, 2) + Math.pow(piece.y - centerY, 2));
            const maxDistance = Math.sqrt(Math.pow(gridSize / 2, 2) + Math.pow(gridSize / 2, 2));
            const normalizedDistance = distance / maxDistance;

            piece.element.style.transition = `all ${0.5 + normalizedDistance * 0.5}s ease-in-out`;

            if (!piece.isSecond) {
                // Scale the pieces down and move towards the center for first image
                const translateX = (centerX - piece.x) * 20;
                const translateY = (centerY - piece.y) * 20;
                piece.element.style.transform = `scale(0.1) translate(${translateX}px, ${translateY}px)`;
            } else {
                // Prepare the second image pieces
                piece.element.style.transform = `scale(1) translate(0, 0)`;
            }
        });
    }

    function resetPieces() {
        // Reset pieces back to their original state (if needed)
        pieces.forEach(piece => {
            if (piece.isSecond) {
                piece.element.style.opacity = '0';
                piece.element.style.transform = 'scale(0.1)';
            } else {
                piece.element.style.opacity = '1';
                piece.element.style.transform = 'scale(1)';
            }
        });
    }

    // Function to handle transition from shuffled first image to the second image
    function triggerTransition() {
        shufflePieces(); // Shuffle pieces to the center and shrink them

        setTimeout(() => {
            pieces.forEach(piece => {
                if (piece.isSecond) {
                    // Show second image pieces
                    piece.element.style.opacity = '1';
                } else {
                    // Hide first image pieces
                    piece.element.style.opacity = '0';
                }
            });
        }, 500); // Allow some time for the shuffle before transitioning
    }

    // Initialize pieces for both images
    createImagePieces('einstein1.svg');
    createImagePieces('einstein2.svg', true);

    // Shuffle pieces for the first image on load
    shufflePieces();

    // Event listeners for hover transitions
    transitionArea.addEventListener('mouseenter', triggerTransition);
    transitionArea.addEventListener('mouseleave', resetPieces);
});
