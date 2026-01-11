require('dotenv').config();

const { OPENCAGE_API_KEY: opencageApiKey } = process.env;

// config/recyclingConfig.js


// Example data for recycling centers
const recyclingCenters = [
    { lat: 20.4625, lng: 85.8828, name: "CDA Recycling Center", email: "dwivediaakash2000@gmail.com" },
    { lat: 20.4620, lng: 85.8780, name: "Barabati Recycling Center", email: "dwivediaakash2000@gmail.com" },
    { lat: 20.4543, lng: 85.8822, name: "Cuttack Railway Station Recycling Center", email: "dwivediaakash2000@gmail.com" },
    { lat: 20.4627, lng: 85.8344, name: "Orissa High Court Recycling Center", email: "dwivediaakash2000@gmail.com" },
    { lat: 20.4630, lng: 85.8835, name: "Cuttack Medical College Recycling Center", email: "dwivediaakash2000@gmail.com" },
    { lat: 20.4540, lng: 85.8020, name: "Mahanadi Barrage Recycling Center", email: "dwivediaakash2000@gmail.com" },
    { lat: 20.4600, lng: 85.8720, name: "Netaji Birth Place Museum Recycling Center", email: "dwivediaakash2000@gmail.com" },
];

// Function to get address from coordinates
//To be changed to opencage
// async function getAddressFromCoordinates(lat, lon) {
//     const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
//     try {
//         const response = await fetch(url);
//         const data = await response.json();
//         return data.display_name || 'Address not found';
//     } catch (error) {
//         console.error('Error fetching address:', error);
//         return 'Error fetching address';
//     }
// }

async function getAddressFromCoordinates2(lat, lon) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${opencageApiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        // Return formatted address if available; otherwise return a Google Maps link
        if (data.results && data.results.length > 0 && data.results[0].formatted) {
            return data.results[0].formatted;
        } else {
            // NEW CODE: Return a clickable Google Maps link when no address is found
            return `https://www.google.com/maps?q=${lat},${lon}`;
        }
    } catch (error) {
        console.error('Error fetching address:', error);
        // NEW CODE: Return a clickable Google Maps link in case of an error
        return `https://www.google.com/maps?q=${lat},${lon}`;
    }
}

// Function to calculate distance between two geographical points 
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers 
}

// Function to find the nearest recycling center
function findNearestRecyclingCenter(userLat, userLon) {
    return recyclingCenters.reduce((nearest, center) => {
        const distance = calculateDistance(userLat, userLon, center.lat, center.lng);
        return distance < nearest.distance ? { center, distance } : nearest;
    }, { center: null, distance: Infinity }).center;
}

module.exports = {
    recyclingCenters,
    getAddressFromCoordinates2,
    calculateDistance,
    findNearestRecyclingCenter
};