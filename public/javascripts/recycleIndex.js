document.getElementById('recycleUploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    if (!document.getElementById('recycleImage').files.length) {
        alert("Please select an image file.");
        return;
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                var userLat = position.coords.latitude;
                var userLon = position.coords.longitude;
                uploadRecycleImage(userLat, userLon); // Call the function to upload the image with the location
            },
            function(error) {
                console.error("Geolocation error:", error); // Log geolocation errors
                alert("Unable to retrieve your location.");
            },
            {
                enableHighAccuracy: true, // Request high accuracy
                timeout: 5000, // Set a 5 second timeout
                maximumAge: 0 // Force fresh location
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// List of recycling centers
var recyclingCenters = [
    { lat: 20.4625, lng: 85.8828, name: "CDA recycle Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4620, lng: 85.8780, name: "Barabati recycle Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4543, lng: 85.8822, name: "Cuttack Railway Station recycle Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4627, lng: 85.8344, name: "Orissa High Court recycle Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4630, lng: 85.8835, name: "Cuttack Medical College recycle Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4540, lng: 85.8020, name: "Mahanadi Barrage recycle Center", email: "putkutripathy2004@gmail.com" },
    { lat: 20.4600, lng: 85.8720, name: "Netaji Birth Place Museum recycle Center", email: "putkutripathy2004@gmail.com" }
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
function findNearestRecycleCenter(userLat, userLon) {
    let nearestCenter = null;
    let shortestDistance = Infinity;

    recyclingCenters.forEach(center => {
        const distance = calculateDistance(userLat, userLon, center.lat, center.lng);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestCenter = center;
        }
    });

    return nearestCenter;
}

// Function to upload the image and location
function uploadRecycleImage(lat, lon) {
    var formData = new FormData(); // Create a new FormData object
    var imageFile = document.getElementById('recycleImage').files[0]; // Get the uploaded file

    formData.append('image', imageFile); // Append the image file to the form data
    formData.append('latitude', lat); // Append the latitude
    formData.append('longitude', lon); // Append the longitude

    console.log("Sending location:", lat, lon); // Log the location being sent

    // Use the Fetch API to send the form data to the server
    fetch('/uploadRecycleImg', {
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
        alert("An error occurred while sending the image and location.Please check the console for details.");
    });
}
