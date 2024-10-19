document.addEventListener('DOMContentLoaded', function() {
    const imageOne = document.getElementById('image-one');
    const imageTwo = document.getElementById('image-two');
    const transitionArea = document.querySelector('.image-transition');
        function shuffleImage(image) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
    
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            for (let i = 0; i < pixels.length; i += 4) {
                const j = Math.floor(Math.random() * pixels.length);
                [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
                [pixels[i+1], pixels[j+1]] = [pixels[j+1], pixels[i+1]];
                [pixels[i+2], pixels[j+2]] = [pixels[j+2], pixels[i+2]];
            }
    
            ctx.putImageData(imageData, 0, 0);
            return canvas.toDataURL();
        }
    
        let shuffledImage = null;
    
        function triggerTransition(e) {
            const rect = transitionArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
            
            const opacity = Math.min(distance / maxDistance, 1);
    
            if (!shuffledImage) {
                shuffledImage = shuffleImage(imageOne);
                imageOne.src = shuffledImage;
            }
    
            imageTwo.style.opacity = opacity;
        }
    
        transitionArea.addEventListener('mousemove', triggerTransition);
        transitionArea.addEventListener('mouseleave', () => {
            imageTwo.style.opacity = 0;
        });
    

    // Function to calculate distance between mouse and center
    function distanceFromCenter(x, y, element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        return Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
    }

    // Function to initiate the shuffle and transition
    function triggerTransition(e) {
        const distance = distanceFromCenter(e.clientX, e.clientY, transitionArea);
        const threshold = 150; // Adjust threshold for sensitivity

        if (distance < threshold) {
            imageOne.style.transform = 'scale(0.8)'; // Shrink first image
            imageOne.style.opacity = 0; // Fade out first image
            imageTwo.style.opacity = 1; // Fade in second image
            shuffleSVGElements(imageOne); // Shuffle elements
        } else {
            imageOne.style.transform = 'scale(1)'; // Restore original scale
            imageOne.style.opacity = 1; // Fade back first image
            imageTwo.style.opacity = 0; // Fade out second image
        }
    }

    // Shuffle elements function
    function shuffleSVGElements(svg) {
        const elements = Array.from(svg.children);
        for (let i = elements.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            svg.appendChild(elements[j]); // Randomly reorder elements
        }
    }

    // Add event listener for mouse movement
    transitionArea.addEventListener('mousemove', triggerTransition);
});
