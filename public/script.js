document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('animationCanvas');
    const ctx = canvas.getContext('2d');
    const canvasSize = 400;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    let isTransitioningToSecond = false;
    const blackCircle = { radius: 10, maxRadius: canvasSize / 2 };
    
    // Divide SVG into random shapes (for both SVGs)
    function generateRandomPieces(pieceCount = 12, isSecondSVG = false) {
        const pieces = [];
        for (let i = 0; i < pieceCount; i++) {
            const randomShape = {
                x: Math.random() * canvasSize,
                y: Math.random() * canvasSize,
                size: Math.random() * 40 + 20,
                angle: Math.random() * Math.PI * 2,
                isSecondSVG: isSecondSVG
            };
            pieces.push(randomShape);
        }
        return pieces;
    }

    const svg1Pieces = generateRandomPieces(12);
    const svg2Pieces = generateRandomPieces(12, true);

    // Draw first SVG pieces spiraling inward
    function animateFirstSVG(pieces, proximity) {
        pieces.forEach(piece => {
            const distance = Math.max(0, 1 - proximity); // Shrink as mouse moves in
            const spiralRadius = piece.size * distance * 3;
            const pieceX = canvasSize / 2 + spiralRadius * Math.cos(piece.angle);
            const pieceY = canvasSize / 2 + spiralRadius * Math.sin(piece.angle);
            
            ctx.fillStyle = 'gray';
            ctx.beginPath();
            ctx.arc(pieceX, pieceY, piece.size * distance, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Draw second SVG expanding outward
    function animateSecondSVG(pieces, proximity) {
        const expansion = 1 + proximity * 0.2; // Expand 20% more
        pieces.forEach(piece => {
            const pieceX = piece.x * expansion;
            const pieceY = piece.y * expansion;

            ctx.fillStyle = 'lightblue';
            ctx.fillRect(pieceX, pieceY, piece.size, piece.size);
        });
    }

    // Draw black circle, grows or shrinks based on proximity
    function drawBlackCircle(proximity) {
        if (isTransitioningToSecond) {
            blackCircle.radius -= 5;
        } else {
            blackCircle.radius += proximity * 10;
        }
        if (blackCircle.radius < 0) blackCircle.radius = 0;
        if (blackCircle.radius > blackCircle.maxRadius) blackCircle.radius = blackCircle.maxRadius;

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, blackCircle.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Handle mouse move proximity
    function handleMouseMove(e) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceFromCenter = Math.sqrt(
            Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );
        const proximity = Math.max(0, 1 - distanceFromCenter / (canvasSize / 2));

        // Animate based on proximity
        if (!isTransitioningToSecond) {
            animateFirstSVG(svg1Pieces, proximity);
            drawBlackCircle(proximity);
            if (proximity === 1) {
                isTransitioningToSecond = true;  // Transition to second SVG once first finishes
            }
        } else {
            animateSecondSVG(svg2Pieces, proximity);
            drawBlackCircle(0); // Shrink black circle to disappear
        }
    }

    // Set up event listeners
    canvas.addEventListener('mousemove', handleMouseMove);

    // Initial draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    animateFirstSVG(svg1Pieces, 0);
    drawBlackCircle(0);
});
