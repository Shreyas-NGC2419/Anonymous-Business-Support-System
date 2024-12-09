document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([16.2, 77.4], 13); // Set default position and zoom level

    // Add OpenStreetMap Tile Layer (default view)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add Esri World Imagery Tile Layer (satellite view)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoIQ, and the GIS User Community'
    });

    // Layer control for switching between OpenStreetMap and Satellite View
    L.control.layers({
        "OpenStreetMap": osmLayer,
        "Satellite View": satelliteLayer
    }).addTo(map);

    // Variable to store the current marker
    let currentMarker = null;

    // The modal and its close button
    const modal = document.getElementById('businessModal');
    const closeModalBtn = document.querySelector('.close-btn');

    // Listen for map click event to place a marker
    map.on('click', function (event) {
        // If a marker already exists, remove it
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Coordinates where the user clicked
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;

        // Create the new marker at the clicked location
        currentMarker = L.marker([lat, lng]).addTo(map);

        // Show the modal
        modal.style.display = 'block';

        // Add event listener to the submit button inside the modal
        document.getElementById('BusinessSubBtn').addEventListener('click', function () {
            submitBusinessInfo(lat, lng);
        });
    });

    // Function to handle the business info submission
    function submitBusinessInfo(lat, lng) {
        // Get the input values
        const businessName = document.getElementById('businessName').value;
        const businessDesc = document.getElementById('businessDesc').value;
        const businessCategory = document.getElementById('businessCategory').value;

        // Validate input fields
        if (!businessName || !businessDesc) {
            alert("Please fill out both fields.");
            return;
        }

        // Create a business object
        const business = {
            b_name: businessName,
            description: businessDesc,
            coordinates: { lat, lng },
            category: businessCategory
        };

        // Log the business info for debugging
        console.log("Business Info Submitted:", business);

        // Send the business object via a POST request to the backend
        fetch("http://localhost:3000/api/business", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"  // Set header to send JSON data
            },
            body: JSON.stringify(business)  // Stringify the business object
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => Promise.reject(err));  // Handle errors
                }
                return response.json();  // Parse JSON if successful
            })
            .then(data => {
                console.log("Business Added Successfully:", data);
                // Handle success (you can update the UI or reset the form)
            })
            .catch(error => {
                console.error("Failed to add business:", error);
                alert("Failed to add business. Please try again later.");
            });

        // Close the modal after submission
        modal.style.display = 'none';
        resetForm();
    }



    // Function to close the modal when clicking the close button
    closeModalBtn.addEventListener('click', function () {
        modal.style.display = 'none';
        resetForm();
    });

    // Function to reset the form inside the modal
    function resetForm() {
        document.getElementById('businessName').value = '';
        document.getElementById('businessDesc').value = '';
    }

    // Loading all the businesses
    async function loadBusinesses() {
        try {
            fetch('/api/business') // or your appropriate endpoint
                .then(response => response.json())
                .then(businesses => {
                    // Loop through each business and add a marker to the map
                    businesses.forEach(business => {
                        const marker = L.marker([business.coordinates.lat, business.coordinates.lng]).addTo(map);

                        const popupContent = `
    <strong>${business.b_name}</strong><br><strong>Category: ${business.category}</strong><br>${business.description}<br>
    <button onclick="openAddReviewPopup('${business._id}')" style="background-color:green; color:white; padding:2px 5px; border-radius:5px; margin-top:5px">Add Review</button>
    <button onclick="openViewReviewsModal('${business._id}')" style="background-color:gold; padding:2px 5px; border-radius:5px; margin-top:5px">View Reviews</button>
`;

                        marker.bindPopup(popupContent);

                        // Attach event listeners after the content is inserted
                        marker.on('popupopen', function () {
                            document.getElementById('addReviewBtn').addEventListener('click', function () {
                                openPopup('addReviewPopup'); // Open the Add Review Modal
                            });

                            document.getElementById('viewReviewsBtn').addEventListener('click', function () {
                                openViewReviewsModal(business._id); // Open the View Reviews Modal
                            });
                        });

                    });
                })
                .catch(error => {
                    console.error("Error loading businesses:", error);
                });
        } catch (error) {
            console.error("Failed to load businesses:", error);
        }
    }

    //Loading all businesses with category selected
    document.getElementById('filterCategory').addEventListener('change', async (event) => {
        const selectedCategory = event.target.value;

        // Show loading spinner
        document.getElementById('loadingSpinner').style.display = 'block';

        try {
            const response = await fetch(`/api/businesses?category=${selectedCategory}`);
            const filteredBusinesses = await response.json();

            // Clear existing markers
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Add new markers for filtered businesses
            filteredBusinesses.forEach(addMarker);
        } catch (error) {
            console.error('Error fetching filtered businesses:', error);
        } finally {
            // Hide loading spinner
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    });



    //addMarker function
    function addMarker(business) {
        const marker = L.marker([business.coordinates.lat, business.coordinates.lng]).addTo(map);

        const popupContent = `
    <strong>${business.b_name}</strong><br><strong>${business.category}</strong><br>${business.description}<br>
    <button onclick="openAddReviewPopup('${business._id}')">Add Review</button>
    <button onclick="openViewReviewsModal('${business._id}')">View Reviews</button>
`;



        marker.bindPopup(popupContent);
    }






    // Calling the same function - loadBusinesses
    loadBusinesses();

    L.Control.geocoder({
        defaultMarkGeocode: false,
        geocoder: L.Control.Geocoder.nominatim()
    })
        .on('markgeocode', function (e) {
            const bbox = e.geocode.bbox;
            const poly = L.polygon([
                [bbox.getSouthEast().lat, bbox.getSouthEast().lng],
                [bbox.getNorthEast().lat, bbox.getNorthEast().lng],
                [bbox.getNorthWest().lat, bbox.getNorthWest().lng],
                [bbox.getSouthWest().lat, bbox.getSouthWest().lng]
            ]).addTo(map);
            map.fitBounds(poly.getBounds());
        })
        .addTo(map);


    // Custom red marker for the user
    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', // Valid URL for a red icon
        iconSize: [25, 41], // Size of the icon
        iconAnchor: [12, 41], // Anchor point of the icon (center bottom)
        popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', // Marker shadow
        shadowSize: [41, 41], // Size of the shadow
        shadowAnchor: [12, 41], // Anchor point of the shadow
    });



    // Function to locate the user and center the map on their location
    function locateUser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                console.log("Current Position:", lat, lng);

                // Center the map to user's location
                map.setView([lat, lng], 13);

                // Optionally, add a marker to indicate user's location
                L.marker([lat, lng], { icon: redIcon }).addTo(map)
                    .bindPopup("You are here")
                    .openPopup();
            }, function (error) {
                console.error("Geolocation error: ", error);
                alert("Unable to retrieve your location. Please enable geolocation.");
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    // Event listener for the Locate Me button
    const locateMeBtn = document.getElementById('locateMeBtn');
    if (locateMeBtn) {
        locateMeBtn.addEventListener('click', locateUser);
    }



    document.getElementById('addReviewForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const reviewText = document.getElementById('reviewText').value;
        const starRating = document.getElementById('starRating').value;
        const businessId = document.getElementById('addReviewPopup').dataset.businessId;


        console.log("Submitting review for business ID:", businessId); // Debugging

        if (!businessId) {
            alert("No business ID found. Cannot submit review.");
            return;
        }

        try {
            // Send the review data to the backend
            const response = await fetch(`/api/businesses/${businessId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewText, starRating })
            });

            // Check if the response is OK (status 200-299)
            if (response.ok) {
                // Parse the JSON response from the backend
                const responseData = await response.json(); // This will automatically parse JSON and handle emojis

                // Assuming the response has a "sentiment" field with the emoji
                const sentiment = responseData.sentiment;

                console.log("Sentiment received:", sentiment); // This will print the sentiment, including the emoji correctly

                alert('Review submitted successfully!');
                closePopup('addReviewPopup');
            } else {
                // If there's an error, display the message from the backend
                const errorData = await response.json();
                alert(`Failed to submit review: ${errorData.message}`);
            }
        } catch (error) {
            // Handle any network or unexpected errors
            console.error('Error submitting review:', error);
            alert('An error occurred while submitting your review.');
        }
    });








});

function openViewReviewsModal(businessId) {
    const modal = document.getElementById('viewReviewsModal');
    const reviewList = document.getElementById('reviewList');
    reviewList.innerHTML = '<p>Loading reviews...</p>'; // Temporary loading message

    // Fetch reviews for the specific business
    fetch(`/api/reviews/${businessId}`)
        .then(response => response.json())
        .then(reviews => {
            reviewList.innerHTML = ''; // Clear loading message

            if (reviews.length > 0) {
                reviews.forEach(review => {
                    const listItem = document.createElement('li');
                    listItem.dataset.reviewId = review._id;
                    listItem.innerHTML = `
                        <p>${review.reviewText}</p>
                        <p>Star Rating: ${review.starRating}</p>
                        <p>Sentiment: ${review.sentiment}</p>
                        <p>Upvotes: <span id="upvotes-${review._id}">${review.upvotes}</span></p>
            <p>Downvotes: <span id="downvotes-${review._id}">${review.downvotes}</span></p>
            <button class="vote-btn" data-vote-type="upvote" data-review-id="${review._id}">Upvote</button>
            <button class="vote-btn" data-vote-type="downvote" data-review-id="${review._id}">Downvote</button>
                    `;
                    reviewList.appendChild(listItem);
                });

                // Function to set a cookie for the review vote
                function setVoteCookie(reviewId, voteType) {
                    // Set cookie with expiration of 1 hour (or whatever time limit you choose)
                    document.cookie = `vote_${reviewId}=${voteType}; max-age=3600; path=/`;
                }


                // Function to check if a cookie exists for this review
                function getVoteForReview(reviewId) {
                    const cookies = document.cookie.split('; ');
                    for (let cookie of cookies) {
                        if (cookie.startsWith(`vote_${reviewId}=`)) {
                            return cookie.split('=')[1]; // Return the vote type (e.g., 'upvote' or 'downvote')
                        }
                    }
                    return null; // No vote found
                }

                // Function to handle the upvote/downvote logic
                async function handleVote(event, reviewId, voteType) {
                    const existingVote = getVoteForReview(reviewId);

                    if (existingVote === voteType) {
                        alert('You have already voted this way on this review!');
                        return;
                    }

                    // Proceed with sending the vote to the backend
                    try {
                        const response = await fetch(`/api/reviews/${reviewId}/vote`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ voteType })
                        });

                        const result = await response.json();
                        if (response.ok) {
                            // Update UI with new vote counts
                            document.querySelector(`#upvotes-${reviewId}`).textContent = result.upvotes;
                            document.querySelector(`#downvotes-${reviewId}`).textContent = result.downvotes;
                            // Set the cookie to track this vote
                            setVoteCookie(reviewId, voteType);
                        } else {
                            alert(result.message);
                        }
                    } catch (error) {
                        console.error('Error voting:', error);
                    }
                }

                // Event listeners for upvote and downvote buttons
                document.querySelectorAll('.vote-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const voteType = e.target.dataset.voteType;
                        const reviewId = e.target.dataset.reviewId;
                        handleVote(e, reviewId, voteType);
                    });
                });


            } else {
                reviewList.innerHTML = '<p>No reviews yet.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching reviews:', error);
            reviewList.innerHTML = '<p>Failed to load reviews.</p>';
        });


    modal.style.display = 'block';
}

// Close button functionality for the modal
document.getElementById('closeViewReviewsBtn').addEventListener('click', () => {
    const modal = document.getElementById('viewReviewsModal');
    modal.style.display = 'none';
});


// Close button functionality for the modal
document.getElementById('closeViewReviewsBtn').addEventListener('click', () => {
    const modal = document.getElementById('viewReviewsModal');
    modal.style.display = 'none';
});


