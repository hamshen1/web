// Import GSAP (add to your HTML)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    const setupImageTransition = () => {
        // Configuration
        const config = {
            gridSize: 10,
            spiralDuration: 1.2, // Faster initial animation
            explosionDuration: 0.8, // Faster second animation
            spiralRevolutions: 1,
            explosionRadius: 300,
            container: {
                width: 600,
                height: 600
            }
        };

        // Initialize containers
        const animationContainer = document.getElementById('animation-container');
        const svg1Container = document.createElement('div');
        const svg2Container = document.createElement('div');
        
        svg1Container.className = 'image-grid';
        svg2Container.className = 'image-grid hidden';
        
        animationContainer.appendChild(svg1Container);
        animationContainer.appendChild(svg2Container);

        // Calculate grid metrics
        const tileSize = {
            width: config.container.width / config.gridSize,
            height: config.container.height / config.gridSize
        };

        // Create timeline
        const timeline = gsap.timeline({ paused: true });
        
        // Generate grid tiles
        const createImageGrid = (container, imagePath, isSecond = false) => {
            const tiles = [];
            const centerX = config.container.width / 2;
            const centerY = config.container.height / 2;

            for (let row = 0; row < config.gridSize; row++) {
                for (let col = 0; col < config.gridSize; col++) {
                    const tile = document.createElement('div');
                    tile.className = 'image-tile';
                    
                    // Position and style tile
                    Object.assign(tile.style, {
                        width: `${tileSize.width}px`,
                        height: `${tileSize.height}px`,
                        left: `${col * tileSize.width}px`,
                        top: `${row * tileSize.height}px`,
                        backgroundImage: `url(${imagePath})`,
                        backgroundSize: `${config.container.width}px ${config.container.height}px`,
                        backgroundPosition: `-${col * tileSize.width}px -${row * tileSize.height}px`
                    });

                    // Calculate spiral parameters
                    const index = row * config.gridSize + col;
                    const angle = (index / (config.gridSize * config.gridSize)) * Math.PI * 2 * config.spiralRevolutions;
                    const radius = Math.sqrt(Math.pow(col - config.gridSize/2, 2) + Math.pow(row - config.gridSize/2, 2));
                    
                    // Add to timeline
                    if (!isSecond) {
                        // Spiral in animation - all tiles animate concurrently
                        timeline.to(tile, {
                            duration: config.spiralDuration,
                            x: centerX - (col * tileSize.width + tileSize.width/2) + Math.cos(angle) * radius,
                            y: centerY - (row * tileSize.height + tileSize.height/2) + Math.sin(angle) * radius,
                            rotation: angle * (180/Math.PI),
                            scale: 0,
                            ease: "power2.inOut"
                        }, 0); // All start at 0 for concurrent animation
                    } else {
                        // Explosion animation - faster with slight stagger
                        const randomAngle = Math.random() * Math.PI * 2;
                        const explosionX = Math.cos(randomAngle) * config.explosionRadius;
                        const explosionY = Math.sin(randomAngle) * config.explosionRadius;
                        
                        timeline.fromTo(tile, 
                            {
                                x: centerX - (col * tileSize.width + tileSize.width/2),
                                y: centerY - (row * tileSize.height + tileSize.height/2),
                                rotation: angle * (180/Math.PI),
                                scale: 0,
                                opacity: 0
                            },
                            {
                                duration: config.explosionDuration,
                                x: 0,
                                y: 0,
                                rotation: 0,
                                scale: 1,
                                opacity: 1,
                                ease: "back.out(1.2)" // Changed to back ease for snappier animation
                            }, 
                            config.spiralDuration + (index * 0.01) // Slight stagger for visual interest
                        );
                    }

                    container.appendChild(tile);
                    tiles.push(tile);
                }
            }
            return tiles;
        };

        // Create both image grids
        createImageGrid(svg1Container, 'einstein1.svg');
        createImageGrid(svg2Container, 'einstein2.svg', true);

        // Add hover interactions with faster state management
        let isAnimating = false;
        
        animationContainer.addEventListener('mouseenter', () => {
            if (!isAnimating) {
                isAnimating = true;
                svg2Container.classList.remove('hidden');
                timeline.timeScale(1.2).play().then(() => { // Slightly speed up overall animation
                    svg1Container.classList.add('hidden');
                    isAnimating = false;
                });
            }
        });

        animationContainer.addEventListener('mouseleave', () => {
            if (!isAnimating) {
                isAnimating = true;
                svg1Container.classList.remove('hidden');
                timeline.timeScale(1.2).reverse().then(() => { // Maintain speed on reverse
                    svg2Container.classList.add('hidden');
                    isAnimating = false;
                });
            }
        });
    };

    // Initialize the animation
    setupImageTransition();
});