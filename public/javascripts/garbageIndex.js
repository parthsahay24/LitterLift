document.getElementById('garbageUploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    if (!document.getElementById('garbageImage').files.length) {
        alert("Please select an image file.");
        return;
    }
    if (!document.getElementById('garbageAddress').value) {
        alert("Please write the address");
        return;
    }
    
    if (navigator.geolocation) {
        let watchID = navigator.geolocation.watchPosition(
            function(position) {
                let accuracy = position.coords.accuracy; // Accuracy in meters
                console.log("Accuracy:", accuracy);
                
                // Only use the location if accuracy is within 10 meters
                if (accuracy <= 10) {
                    let userLat = position.coords.latitude;
                    let userLon = position.coords.longitude;
                    uploadGarbageImage(userLat, userLon);
                    
                    // Stop further tracking once an accurate reading is obtained
                    navigator.geolocation.clearWatch(watchID);
                }
            },
            function(error) {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location.");
            },
            {
                enableHighAccuracy: true, // Request the best possible reading
                timeout: 15000,           // Give it more time (15 seconds) to get a precise fix
                maximumAge: 0             // Always get a fresh reading
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
    
});

// List of recycling centers
var garbageCenters = [
    { lat: 20.4625, lng: 85.8828, name: "CDA Garbage Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4620, lng: 85.8780, name: "Barabati Garbage Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4543, lng: 85.8822, name: "Cuttack Railway Station Garbage Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4627, lng: 85.8344, name: "Orissa High Court Garbage Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4630, lng: 85.8835, name: "Cuttack Medical College Garbage Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4540, lng: 85.8020, name: "Mahanadi Barrage Garbage Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4600, lng: 85.8720, name: "Netaji Birth Place Museum Garbage Center", email: "putkutripathy2004@gmail.com" }
];

// Function to calculate the distance between two geographical points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // dist in km
}

// Function to find the nearest recycling center
function findNearestGarbageCenter(userLat, userLon) {
    let nearestCenter = null;
    let shortestDistance = Infinity;

    garbageCenters.forEach(center => {
        const distance = calculateDistance(userLat, userLon, center.lat, center.lng);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestCenter = center;
        }
    });

    return nearestCenter;
}

// Function to upload the image and location
// function uploadGarbageImage(lat, lon) {
//     var formData = new FormData(); // Create a new FormData object
//     var imageFile = document.getElementById('garbageImage').files[0]; // Get the uploaded file

//     formData.append('image', imageFile); // Append the image file to the form data
//     formData.append('latitude', lat); // Append the latitude
//     formData.append('longitude', lon); // Append the longitude

//     console.log("Sending location:", lat, lon); // Log the location being sent

//     // Use the Fetch API to send the form data to the server
//     fetch('/uploadGarbageImg', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("Server response:", data); // Log the server's response

//         if (data.success) {
//             alert("Image and location sent successfully! Address: " + (data.address || "Not available"));
//         } else {
//             alert("Failed to send image and location. Please try again. Error: " + (data.message || "Unknown error"));
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error); // Log any errors
//         alert("An error occurred while sending the image and location.Please check the console for details.");
//     });
// }

function uploadGarbageImage(lat, lon) {
    var formData = new FormData(); // Create a new FormData object
    var imageFile = document.getElementById('garbageImage').files[0]; // Get the uploaded file
    var manualAddress = document.getElementById('garbageAddress').value;

    formData.append('image', imageFile); // Append the image file to the form data
    formData.append('manualAddress', manualAddress)
    formData.append('latitude', lat); // Append the latitude
    formData.append('longitude', lon); // Append the longitude

    console.log("Sending location:", lat, lon); // Log the location being sent
    console.log("Manual address:", manualAddress);

    // Use the Fetch API to send the form data to the server
    fetch('/uploadGarbageImg', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server response:", data); // Log the server's response

        if (data.success) {
            alert("Image and location sent successfully! Address: " + (data.address || "Not available"));
            window.location.href = '/userProfile'; 
        } else {
            alert("Failed to send image and location. Please try again. Error: " + (data.message || "Unknown error"));
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log any errors
        alert("An error occurred while sending the image and location. Please check the console for details.");
    });
}