// Initialize and add the map
function initMap() {
    // The location of Location
    const Location = { lat: -25.344, lng: 131.036 };
  
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: Location,
    });
    // The marker, positioned at Uluru
    const marker = new google.maps.Marker({
      position: Location,
      map: map,
    });
  }