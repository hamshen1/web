document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('animationCanvas');
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const rows = 10; // Number of rows for the grid
    const cols = 15; // Number of columns for the grid
    const tileWidth = canvasWidth / cols;
    const tileHeight = canvasHeight / rows;
    const PROXIMITY_THRESHOLD = 0.5; // Threshold to switch phases (halfway)
    const SPEEDUP_FACTOR_FIRST = 1.0; // Speed for first animation
    const SPEEDUP_FACTOR_SECOND = 1.25; // Speed up second animation by 25%
    const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // Approximately 1.618

    let tiles = [];
    let img1 = new Image();
    let img2 = new Image();
    let isImagesLoaded = false;
    let animationFrameId;
    let currentPhase = 'first'; // 'first' or 'second'

    // Swapped images: First image is now 'einstein2.jpg', second is 'einstein1.jpg'
    img1.src = 'einstein2.jpg'; // First image
    img2.src = 'einstein1.jpg'; // Second image

    let imagesLoaded = 0;

    // Load both images before starting
    img1.onload = imgLoaded;
    img2.onload = imgLoaded;

    img1.onerror = function () {
        console.error('Failed to load einstein2.jpg.');
    };

    img2.onerror = function () {
        console.error('Failed to load einstein1.jpg.');
    };

    function imgLoaded() {
        imagesLoaded++;
        if (imagesLoaded === 2) {
            isImagesLoaded = true;
            createTiles();
            canvas.addEventListener('mousemove', handleMouseMove);
            animate(0); // Start the animation with proximity 0
        }
    }

    function createTiles() {
        // Calculate offsets to center the images within the canvas
        const offsetX1 = (canvasWidth - img1.width) / 2;
        const offsetY1 = (canvasHeight - img1.height) / 2;

        const offsetX2 = (canvasWidth - img2.width) / 2;
        const offsetY2 = (canvasHeight - img2.height) / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const dx = col * tileWidth;
                const dy = row * tileHeight;

                const tileCenterX = dx + tileWidth / 2;
                const tileCenterY = dy + tileHeight / 2;
                const deltaX = tileCenterX - centerX;
                const deltaY = tileCenterY - centerY;
                const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const angle = Math.atan2(deltaY, deltaX);

                tiles.push({
                    // Source positions for both images
                    sx1: dx - offsetX1,
                    sy1: dy - offsetY1,
                    sx2: dx - offsetX2,
                    sy2: dy - offsetY2,
                    dx: dx,
                    dy: dy,
                    initialRadius: radius,
                    initialAngle: angle,
                });
            }
        }
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        const proximity = 1 - Math.min(distance / maxDistance, 1);

        // Cancel any pending animation frames
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(() => animate(proximity));
    }

    function animate(proximity) {
        if (!isImagesLoaded) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const maxRadius = Math.min(canvasWidth, canvasHeight) / 2;

        if (currentPhase === 'first') {
            // Adjusted proximity for speed
            const adjustedProximity = Math.min(
                (proximity / PROXIMITY_THRESHOLD) * SPEEDUP_FACTOR_FIRST,
                1
            );

            // Draw black circle first so tiles appear on top
            if (proximity > 0) {
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(centerX, centerY, proximity * (maxRadius / 2), 0, Math.PI * 2);
                ctx.fill();
            }

            tiles.forEach(tile => {
                // Golden ratio spiral parameters
                const b = Math.log(GOLDEN_RATIO) / (2 * Math.PI); // Determines the spiral tightness

                // Calculate new angle and radius
                const newAngle = tile.initialAngle + adjustedProximity * 4 * Math.PI; // Rotate 2 full turns
                const newRadius = tile.initialRadius * Math.exp(-b * adjustedProximity * 4 * Math.PI);

                // Convert polar to Cartesian coordinates
                const x = centerX + newRadius * Math.cos(newAngle) - tile.dx - tileWidth / 2;
                const y = centerY + newRadius * Math.sin(newAngle) - tile.dy - tileHeight / 2;

                // Scaling from 100% to 25%
                const scale = 1 - adjustedProximity * 0.75; // Shrink from 100% to 25%

                // Rotation (optional, can be kept if desired)
                const rotation = adjustedProximity * 4 * Math.PI; // Rotate 2 full turns

                ctx.save();
                ctx.translate(tile.dx + x + tileWidth / 2, tile.dy + y + tileHeight / 2);
                ctx.rotate(rotation);
                ctx.scale(scale, scale);
                ctx.drawImage(
                    img1, // Now using img1 (einstein2.jpg)
                    tile.sx1,
                    tile.sy1,
                    tileWidth,
                    tileHeight,
                    -tileWidth / 2,
                    -tileHeight / 2,
                    tileWidth,
                    tileHeight
                );
                ctx.restore();
            });

            // Check if we should switch to the second phase
            if (adjustedProximity >= 1) {
                currentPhase = 'second';
            }
        } else if (currentPhase === 'second') {
            // Reverse to first phase if proximity decreases
            if (proximity < PROXIMITY_THRESHOLD) {
                currentPhase = 'first';
                return;
            }

            // Adjust proximity for second phase
            const adjustedDuration = (1 - PROXIMITY_THRESHOLD) / SPEEDUP_FACTOR_SECOND; // Speed up by 25%
            const adjustedProximity = Math.min(
                (proximity - PROXIMITY_THRESHOLD) / adjustedDuration,
                1
            );

            // Draw black circle first so tiles appear on top
            if (proximity > 0) {
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(centerX, centerY, (1 - proximity) * (maxRadius / 2), 0, Math.PI * 2);
                ctx.fill();
            }

            tiles.forEach(tile => {
                // Tiles start centered and expand to their original positions
                const xOffset = (tile.dx + tileWidth / 2 - centerX) * adjustedProximity;
                const yOffset = (tile.dy + tileHeight / 2 - centerY) * adjustedProximity;

                const x = centerX + xOffset - (tile.dx + tileWidth / 2);
                const y = centerY + yOffset - (tile.dy + tileHeight / 2);

                // Calculate scale
                const scale = 0.25 + adjustedProximity * 0.85; // Expand from 25% to 110%

                ctx.save();
                ctx.translate(tile.dx + x + tileWidth / 2, tile.dy + y + tileHeight / 2);
                ctx.scale(scale, scale);
                ctx.drawImage(
                    img2, // Now using img2 (einstein1.jpg)
                    tile.sx2,
                    tile.sy2,
                    tileWidth,
                    tileHeight,
                    -tileWidth / 2,
                    -tileHeight / 2,
                    tileWidth,
                    tileHeight
                );
                ctx.restore();
            });
        }
    }
});
