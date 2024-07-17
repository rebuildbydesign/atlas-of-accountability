mapboxgl.accessToken = 'pk.eyJ1IjoiajAwYnkiLCJhIjoiY2x1bHUzbXZnMGhuczJxcG83YXY4czJ3ayJ9.S5PZpU9VDwLMjoX_0x5FDQ';



// Determine the initial zoom level based on the screen width
const initialZoom = window.innerWidth < 768 ? 2.5 : 3.5;  // Zoom level 3 for mobile, 4 for desktop

// CLIP TO NORTH AMERICA ONLY FOR AMY LOL
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/j00by/clvx7jcp006zv01ph3miketyz',
    center: [-96.68288, 39.32267],
    zoom: initialZoom,
    maxBounds: [
        [-179.0, 15.0],  // Southwest coordinates (including Hawaii)
        [-50.0, 60.0]    // Northeast coordinates (trimming more of Europe and South America)
    ],
    projection: {
        name: 'albers',
        center: [-96.68288, 39.32267],
        parallels: [29.5, 45.5]
    }
});





// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

map.on('load', function () {
    // Ensure that the info-icon event listener is added after the map has fully loaded
    document.getElementById('info-icon').addEventListener('click', function () {
        var infoPanel = document.getElementById('info-panel');
        if (infoPanel.style.display === 'none' || infoPanel.style.display === '') {
            infoPanel.style.display = 'block';  // Show the panel
        } else {
            infoPanel.style.display = 'none';  // Hide the panel
        }
    });

    // Load the GeoJSON file for Atlas_FEMA
    map.addSource('atlas-fema', {
        type: 'geojson',
        data: 'data/Atlas_FEMA.json'
    });

    // Add a layer for the Atlas_FEMA data
    map.addLayer({
        'id': 'atlas-fema-layer',
        'type': 'fill',
        'source': 'atlas-fema',
        'paint': {
            'fill-color': [
                'match',
                // Convert the string value to an integer using parseInt
                ['to-number', ['coalesce', ['get', 'COUNTY_DISASTER_COUNT'], 0]],
                0, '#ffffff',
                1, '#fee5d9',
                2, '#fee5d9',
                3, '#fcae91',
                4, '#fcae91',
                5, '#fb6a4a',
                6, '#fb6a4a',
                7, '#de2d26',
                8, '#de2d26',
                9, '#de2d26',
                10, '#a50f15',
                11, '#a50f15',
                12, '#a50f15',
                13, '#a50f15',
                14, '#a50f15',
                15, '#a50f15',
                '#ffffff' // Default color used if none of the values match
            ],
            'fill-opacity': 1
        }
    }, 'state-label');

    // Load the GeoJSON file for congressional districts with representative names
    map.addSource('congress', {
        type: 'geojson',
        data: 'data/US_Congress.json'
    });

    // Add a layer for districts
    map.addLayer({
        'id': 'congress-layer',
        'type': 'fill',
        'source': 'congress',
        'paint': {
            'fill-color': 'transparent', // No fill color
            'fill-outline-color': '#000' // Black border color
        }
    });

    // Line layer specifically for district borders
    map.addLayer({
        'id': 'congress-border',
        'type': 'line',
        'source': 'congress',
        'layout': {},
        'paint': {
            'line-color': '#000', // Black border color
            'line-width': 0.5
        }
    }, 'state-label');



    // Initialize the popup globally if it needs to be accessed by different layers
    var popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "none"  // Allows custom width styling
    });

    // When a user clicks on the map, show a popup with information
    map.on('click', function (e) {
        var femaFeatures = map.queryRenderedFeatures(e.point, { layers: ['atlas-fema-layer'] });
        var congressFeatures = map.queryRenderedFeatures(e.point, { layers: ['congress-layer'] });

        if (!femaFeatures.length || !congressFeatures.length) {
            return;
        }

        var femaFeature = femaFeatures[0].properties;
        var congressFeature = congressFeatures[0].properties;

        var stateName = femaFeature.STATE_NAME;
        var countyName = femaFeature.COUNTY_NAME;
        var disasterCount = femaFeature.COUNTY_DISASTER_COUNT;
        var representativeName = `${congressFeature.FIRSTNAME} ${congressFeature.LASTNAME}`;
        var party = congressFeature.PARTY;
        var repImage = congressFeature.PHOTOURL;
        var websiteUrl = congressFeature.WEBSITEURL;
        var facebookUrl = congressFeature.FACE_BOOK_;
        var twitterUrl = congressFeature.TWITTER_UR;
        var instagramUrl = congressFeature.INSTAGRAM_;
        var senator1 = congressFeature.SENATOR1;
        var sen1party = congressFeature.SENATOR1_PARTY;
        var senator1Url = congressFeature.SENATOR1_URL;
        var senator2 = congressFeature.SENATOR2;
        var sen2party = congressFeature.SENATOR2_PARTY;
        var senator2Url = congressFeature.SENATOR2_URL;
        var atlasUrl = congressFeature.ATLAS_URL;
        var atlasCover = congressFeature.ATLAS_COVER;

        // Debugging step: log the atlasUrl to the console
        console.log(`Atlas URL for ${countyName}, ${stateName}: ${atlasUrl}`);

        var countyFemaTotal = femaFeature.COUNTY_TOTAL_FEMA;
        var countyPerCapita = femaFeature.COUNTY_PER_CAPITA;
        var stateFemaTotal = femaFeature.STATE_FEMA_TOTAL;
        var stateCdbgTotal = femaFeature.STATE_CDBG_TOTAL;
        var statePerCapita = femaFeature.STATE_PER_CAPITA;

        var formattedCountyFemaTotal = `$${Number(countyFemaTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedCountyPerCapita = `$${Number(countyPerCapita).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedStateFemaTotal = `$${Number(stateFemaTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedStateCdbgTotal = `$${Number(stateCdbgTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedStatePerCapita = `$${Number(statePerCapita).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedStatePopulation = Number(femaFeature.STATE_POPULATION).toLocaleString('en-US', { maximumFractionDigits: 0 });

        var popupContent = `
        <div class="popup-container">
            <div class="popup-column">
                <h3>${countyName}, ${stateName}</h3>
                <div class="disaster-count">
                    <div class="count">${disasterCount}</div>
                    <div class="count-description"># of Federally Declared Extreme Weather Disasters</div>
                </div>
                <p class="namelsad">Post-Disaster Assistance</p>
                <b>${countyName} FEMA Total:</b> ${formattedCountyFemaTotal}<br>
                <b>${countyName} Per Capita:</b> ${formattedCountyPerCapita}<br>
                <hr>
                <b>${stateName} FEMA Total:</b> ${formattedStateFemaTotal}<br>
                <b>${stateName} HUD CDBG Total:</b> ${formattedStateCdbgTotal}<br>
                <b>${stateName} Per Capita:</b> ${formattedStatePerCapita}</p>
                <p class="namelsad">Atlas of Disaster Report</p>
                <p>Read more about how communities are experiencing climate change in the Atlas of Disaster: ${stateName} (2011-2021) report.</p>
                <a href="${atlasUrl}" target="_blank"><img src="${atlasCover}" alt="Atlas Cover" class="atlas-cover"></a>
            </div>
            <div class="popup-column">
                <p class="namelsad">${congressFeature.NAMELSAD20}</p>
                <h3>Congress Representative</h3>
                <p><a href="${websiteUrl}" target="_blank" style="color: #a50f15;">${representativeName} (${party})</a></p>
                <div class="rep-info">
                    <img src="${repImage}" alt="Profile Picture" class="rep-image">
                    <div class="social-links">
                        <a href="${websiteUrl}" target="_blank"><img src="img/id-card.svg" alt="Website"></a>
                        <a href="${facebookUrl}" target="_blank"><img src="img/facebook.svg" alt="Facebook"></a>
                        <a href="${twitterUrl}" target="_blank"><img src="img/twitter.svg" alt="Twitter"></a>
                        <a href="${instagramUrl}" target="_blank"><img src="img/instagram.svg" alt="Instagram"></a>
                    </div>
                </div>
                <h3>US Senators</h3>
                <div class="senator-info">
                    <div class="senator-row">
                        <img src="${congressFeature.SENATE1_PIC}" alt="Senator 1" class="senator-image">
                        <div>
                            <a href="${senator1Url}" target="_blank">${senator1} (${sen1party})</a>
                        </div>
                    </div>
                    <div class="senator-row">
                        <img src="${congressFeature.SENATOR2_PIC}" alt="Senator 2" class="senator-image">
                        <div>
                            <a href="${senator2Url}" target="_blank">${senator2} (${sen2party})</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        popup.setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
    });









    // Update mouse settings to change on enter and leave of the interactive layer
    map.on('mouseenter', 'atlas-fema-layer', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'atlas-fema-layer', function () {
        map.getCanvas().style.cursor = '';
    });





    // Toggle disaster data layer visibility document.getElementById('toggle-counties').addEventListener('click', function () {
    //  var visibility = map.getLayoutProperty('atlas-fema-layer', 'visibility');
    //  if (visibility === 'visible' || visibility === undefined) {
    //       map.setLayoutProperty('atlas-fema-layer', 'visibility', 'none');
    //        this.textContent = 'Show Disaster Data';
    //  } else {
    //    map.setLayoutProperty('atlas-fema-layer', 'visibility', 'visible');
    //  this.textContent = 'Hide Disaster Data';
    //}
    //});






    // Initialize the geocoder
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: 'Search Address For Elected Officials',
        zoom: 7.5,
        bbox: [-124.848974, 24.396308, -66.93457, 49.384358],
        flyTo: {
            bearing: 0,
            speed: 1.5,  // Transition speed (default is 1.2)
            curve: 1,   // Smoothness of the transition (default is 1.42)
            easing: function (t) { return t; }  // Custom easing function
        }
    });

    // Add the geocoder to the map
    map.addControl(geocoder, 'bottom-left');

    // Get the geocoder container element
    var geocoderContainer = document.querySelector('.mapboxgl-ctrl-geocoder');

    // Add the nudge animation after 5 seconds of inactivity
    var nudgeTimeout = setTimeout(function () {
        geocoderContainer.classList.add('nudge');
    }, 5000);

    // Remove the nudge animation on user interaction
    function removeNudgeOnInteraction() {
        clearTimeout(nudgeTimeout);
        geocoderContainer.classList.remove('nudge');
        map.off('mousemove', removeNudgeOnInteraction); // Remove the event listener after the first interaction
    }

    map.on('mousemove', removeNudgeOnInteraction);


    // Handle the result event from the geocoder
    geocoder.on('result', function (e) {
        // User interacted with the geocoder
        clearTimeout(nudgeTimeout);
        geocoderContainer.classList.remove('nudge');
        var lngLat = e.result.geometry.coordinates;

        // Wait for the map to be idle before processing the result
        map.once('idle', function () {
            if (popup.isOpen()) {
                popup.remove();
            }

            // Query features at the geographical coordinates
            var femaFeatures = map.queryRenderedFeatures(map.project(lngLat), { layers: ['atlas-fema-layer'] });
            var congressFeatures = map.queryRenderedFeatures(map.project(lngLat), { layers: ['congress-layer'] });

            if (!femaFeatures.length || !congressFeatures.length) {
                return;
            }

            var femaFeature = femaFeatures[0].properties;
            var congressFeature = congressFeatures[0].properties;

            var stateName = femaFeature.STATE_NAME;
            var countyName = femaFeature.COUNTY_NAME;
            var disasterCount = femaFeature.COUNTY_DISASTER_COUNT;
            var representativeName = `${congressFeature.FIRSTNAME} ${congressFeature.LASTNAME}`;
            var party = congressFeature.PARTY;
            var repImage = congressFeature.PHOTOURL;
            var websiteUrl = congressFeature.WEBSITEURL;
            var facebookUrl = congressFeature.FACE_BOOK_;
            var twitterUrl = congressFeature.TWITTER_UR;
            var instagramUrl = congressFeature.INSTAGRAM_;
            var senator1 = congressFeature.SENATOR1;
            var sen1party = congressFeature.SENATOR1_PARTY;
            var senator1Url = congressFeature.SENATOR1_URL;
            var senator2 = congressFeature.SENATOR2;
            var sen2party = congressFeature.SENATOR2_PARTY;
            var senator2Url = congressFeature.SENATOR2_URL;
            var atlasUrl = congressFeature.ATLAS_URL;
            var atlasCover = congressFeature.ATLAS_COVER;

            // Debugging step: log the atlasUrl to the console
            console.log(`Atlas URL for ${countyName}, ${stateName}: ${atlasUrl}`);

            var countyFemaTotal = femaFeature.COUNTY_TOTAL_FEMA;
            var countyPerCapita = femaFeature.COUNTY_PER_CAPITA;
            var stateFemaTotal = femaFeature.STATE_FEMA_TOTAL;
            var stateCdbgTotal = femaFeature.STATE_CDBG_TOTAL;
            var statePerCapita = femaFeature.STATE_PER_CAPITA;

            var formattedCountyFemaTotal = `$${Number(countyFemaTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedCountyPerCapita = `$${Number(countyPerCapita).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedStateFemaTotal = `$${Number(stateFemaTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedStateCdbgTotal = `$${Number(stateCdbgTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedStatePerCapita = `$${Number(statePerCapita).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedStatePopulation = Number(femaFeature.STATE_POPULATION).toLocaleString('en-US', { maximumFractionDigits: 0 });

            var popupContent = `
        <div class="popup-container">
            <div class="popup-column">
                <h3>${countyName}, ${stateName}</h3>
                <div class="disaster-count">
                    <div class="count">${disasterCount}</div>
                    <div class="count-description"># of Federally Declared Extreme Weather Disasters</div>
                </div>
                <p class="namelsad">Post-Disaster Assistance</p>
                <b>${countyName} FEMA Total:</b> ${formattedCountyFemaTotal}<br>
                <b>${countyName} Per Capita:</b> ${formattedCountyPerCapita}<br>
                <hr>
                <b>${stateName} FEMA Total:</b> ${formattedStateFemaTotal}<br>
                <b>${stateName} HUD CDBG Total:</b> ${formattedStateCdbgTotal}<br>
                <b>${stateName} Per Capita:</b> ${formattedStatePerCapita}</p>
                <p class="namelsad">Atlas of Disaster Report</p>
                <p>Read more about how communities are experiencing climate change in the Atlas of Disaster: ${stateName} (2011-2021) report.</p>
                <a href="${atlasUrl}" target="_blank"><img src="${atlasCover}" alt="Atlas Cover" class="atlas-cover"></a>
            </div>
            <div class="popup-column">
                <p class="namelsad">${congressFeature.NAMELSAD20}</p>
                <h3>Congress Representative</h3>
                <p><a href="${websiteUrl}" target="_blank" style="color: #a50f15;">${representativeName} (${party})</a></p>
                <div class="rep-info">
                    <img src="${repImage}" alt="Profile Picture" class="rep-image">
                    <div class="social-links">
                        <a href="${websiteUrl}" target="_blank"><img src="img/id-card.svg" alt="Website"></a>
                        <a href="${facebookUrl}" target="_blank"><img src="img/facebook.svg" alt="Facebook"></a>
                        <a href="${twitterUrl}" target="_blank"><img src="img/twitter.svg" alt="Twitter"></a>
                        <a href="${instagramUrl}" target="_blank"><img src="img/instagram.svg" alt="Instagram"></a>
                    </div>
                </div>
                <h3>US Senators</h3>
                <div class="senator-info">
                    <div class="senator-row">
                        <img src="${congressFeature.SENATE1_PIC}" alt="Senator 1" class="senator-image">
                        <div>
                            <a href="${senator1Url}" target="_blank">${senator1} (${sen1party})</a>
                        </div>
                    </div>
                    <div class="senator-row">
                        <img src="${congressFeature.SENATOR2_PIC}" alt="Senator 2" class="senator-image">
                        <div>
                            <a href="${senator2Url}" target="_blank">${senator2} (${sen2party})</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

            // Set new content and open the popup at the searched location
            popup.setLngLat(lngLat)
                .setHTML(popupContent)
                .addTo(map);
        });
    });


});