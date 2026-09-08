document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.hero-globe');
    if (!container) return;

    // Remove the old manually-drawn canvas if it exists
    const oldCanvas = document.getElementById('globeCanvas');
    if (oldCanvas) {
        oldCanvas.remove();
    }
    
    // Create a container strictly for globe.gl
    const globeDiv = document.createElement('div');
    globeDiv.style.width = '100%';
    globeDiv.style.height = '100%';
    globeDiv.style.borderRadius = '50%';
    globeDiv.style.overflow = 'hidden';
    globeDiv.style.position = 'relative';
    globeDiv.style.zIndex = '1';
    container.insertBefore(globeDiv, container.firstChild);

    // Determine size based on CSS
    let rect = container.getBoundingClientRect();
    let size = Math.max(220, Math.min(rect.width || 400, 460));

    // Initialize the real 3D Globe
    const world = Globe()(globeDiv)
        .width(size)
        .height(size)
        // High-res realistic earth texture (day time)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        // Bump map for 3D mountains/terrain
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        // Transparent background so it fits in our dark UI
        .backgroundColor('rgba(0,0,0,0)')
        // Atmosphere styling
        .showAtmosphere(true)
        .atmosphereColor('#00bfff')
        .atmosphereAltitude(0.15);

    // Set up drag/spin controls
    const controls = world.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.enableZoom = false; // Disable zooming so users don't accidentally zoom when trying to scroll the page
    
    // Adjust camera distance to make the globe fit perfectly
    world.camera().position.z = 250;

    // Handle responsive resizing
    window.addEventListener('resize', () => {
        rect = container.getBoundingClientRect();
        size = Math.max(220, Math.min(rect.width || 400, 460));
        world.width(size);
        world.height(size);
    });
});
