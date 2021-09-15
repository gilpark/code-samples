export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

export function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    const dLat = degreesToRadians(lat2-lat1);
    const dLon = degreesToRadians(lon2-lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return earthRadiusKm * c;
}

//calculating camera height https://www.javaer101.com/en/article/13990532.html
//detecting zoom level : https://gist.github.com/ezze/d57e857a287677c9b43b5a6a43243b14
export function detectZoomLevel(viewer,distance) {
    const scene = viewer.scene;
    const tileProvider = scene.globe._surface.tileProvider;
    const quadtree = tileProvider._quadtree;
    const drawingBufferHeight = viewer.canvas.height;
    const sseDenominator = viewer.camera.frustum.sseDenominator;

    for (let level = 0; level <= 19; level++) {
        const maxGeometricError = tileProvider.getLevelMaximumGeometricError(level);
        const error = (maxGeometricError * drawingBufferHeight) / (distance * sseDenominator);
        if (error < quadtree.maximumScreenSpaceError) {
            return level;
        }
    }
    return null
}