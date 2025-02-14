mapboxgl.accessToken = 'pk.eyJ1IjoiajAwYnkiLCJhIjoiY2x1bHUzbXZnMGhuczJxcG83YXY4czJ3ayJ9.S5PZpU9VDwLMjoX_0x5FDQ';

// ZOOM LEVELS FOR STARTING DEPENDENT ON VIEWPORT SIZE
const initialZoom = window.innerWidth < 768 ? 2.5 : 3.5;  // Zoom level 3 for mobile, 4 for desktop

// CLIP TO NORTH AMERICA ONLY
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/j00by/clvx7jcp006zv01ph3miketyz',
    center: [-96.68288, 39.32267],
    zoom: initialZoom,
    maxBounds: [
        [-220.0, -20.0],  // Southwest coordinates (including US Territories)
        [-50.0, 74.0]    // Northeast coordinates (including Puerto Rico)
    ],
    projection: {
        name: 'mercator'
    },
    pitchWithRotate: false,   // Disable tilting with right-click drag
    dragRotate: false,        // Disable rotating the map with the mouse
    maxPitch: 0               // Ensure no tilt at all
});


// Add zoom and rotation controls to the map.
// map.addControl(new mapboxgl.NavigationControl());


// LOAD MAPBOX
map.on('load', function () {
    // Custom code to fade text opacity for countries and states outside the US
    const updateTextOpacity = (layerId, opacity) => {
        if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'text-opacity', [
                'case',
                // Check if the feature is a US state or the United States
                ['any',
                    ['==', ['get', 'name_en'], 'United States'],
                    ['==', ['get', 'iso_3166_1'], 'US']
                ],
                1,
                // Default opacity for all other countries and states
                opacity
            ]);
        }
    };

    const layersToUpdate = [
        'country-label-sm',
        'country-label-md',
        'country-label-lg',
        'country-lavel',
        'state-label' // Include state labels as well
    ];

    map.on('styledata', function () {
        layersToUpdate.forEach(layerId => {
            updateTextOpacity(layerId, 0.2);
        });
    });



    // Display the info panel on startup
    var infoPanel = document.getElementById('info-panel');
    infoPanel.style.display = 'block';

    // Ensure that the info-icon event listener is added after the map has fully loaded
    document.getElementById('info-icon').addEventListener('click', function () {
        if (infoPanel.style.display === 'none' || infoPanel.style.display === '') {
            infoPanel.style.display = 'block';  // Show the panel
        } else {
            infoPanel.style.display = 'none';  // Hide the panel
        }
    });


    // Add event listener for the close button
    document.getElementById('close-info-panel').addEventListener('click', function () {
        infoPanel.style.display = 'none';
    });





    // Load the GeoJSON file for Atlas_FEMA
    map.addSource('atlas-fema', {
        type: 'geojson',
        data: 'data/Atlas_FEMA_V2.json'
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
        data: 'data/US_Congress_V2.json'
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
    });


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
        var countyName = femaFeature.NAMELSAD;
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

        var countyFemaTotal = femaFeature.COUNTY_TOTAL_FEMA;
        var countyPerCapita = femaFeature.COUNTY_PER_CAPITA;
        var stateFemaTotal = femaFeature.STATE_FEMA_TOTAL;
        var stateCdbgTotal = femaFeature.STATE_CDBG_TOTAL;
        var statePerCapita = femaFeature.STATE_PER_CAPITA;

        var formattedCountyFemaTotal = `$${Number(countyFemaTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedCountyPerCapita;
        if (femaFeature.GEOID === "36039" || typeof countyPerCapita !== 'string' && Number.isNaN(Number(countyPerCapita))) {
            formattedCountyPerCapita = "$11,487 *Under Review";
        } else {
            formattedCountyPerCapita = `$${Number(countyPerCapita.replace(/\D/g, '')).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        }
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
        <div style="line-height: 1.2;">
        <b>${countyName} FEMA Total:</b> <span class="formatted-value">${formattedCountyFemaTotal}</span><br>
        <b>${countyName} Per Capita:</b> <span class="formatted-value">${formattedCountyPerCapita}</span><br>
        <hr>
        <b>${stateName} FEMA Total:</b> <span class="formatted-value">${formattedStateFemaTotal}</span><br>
        <b>${stateName} HUD CDBG-DR Total:</b> <span class="formatted-value">${formattedStateCdbgTotal}</span><br>
        <b>${stateName} Per Capita:</b> <span class="formatted-value">${formattedStatePerCapita}</span>
    </div>
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
        placeholder: 'Search Address Here',
        flyTo: {
            zoom: 6.5, // Ensures the map zooms to level 6.5
            bearing: 0,
            speed: 1.2,
            curve: 1,
            easing: function (t) { return t; }
        }
    });


    // Add the geocoder to the map
    map.addControl(geocoder, 'top-right');

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
        var lngLat = e.result.geometry.coordinates;

        // Wait for the map to be idle before processing the result
        map.once('idle', function () {
            if (popup.isOpen()) {
                popup.remove();
            }

            // Query features at the geographical coordinates
            var femaFeatures = map.queryRenderedFeatures(map.project(lngLat), { layers: ['atlas-fema-layer'] });
            var congressFeatures = map.queryRenderedFeatures(map.project(lngLat), { layers: ['congress-layer'] });

            // Check for general location match and handle appropriately
            if (femaFeatures.length === 0) {
                alert("No detailed match found. Try a more specific address.");
                return;
            }

            var femaFeature = femaFeatures[0].properties;
            var congressFeature = congressFeatures[0].properties;

            var stateName = femaFeature.STATE_NAME;
            var countyName = femaFeature.NAMELSAD;
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

            var countyFemaTotal = femaFeature.COUNTY_TOTAL_FEMA;
            var countyPerCapita = femaFeature.COUNTY_PER_CAPITA;
            var stateFemaTotal = femaFeature.STATE_FEMA_TOTAL;
            var stateCdbgTotal = femaFeature.STATE_CDBG_TOTAL;
            var statePerCapita = femaFeature.STATE_PER_CAPITA;

            var formattedCountyFemaTotal = `$${Number(countyFemaTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedCountyPerCapita;
            if (femaFeature.GEOID === "36039" || typeof countyPerCapita !== 'string' && Number.isNaN(Number(countyPerCapita))) {
                formattedCountyPerCapita = "$11,487 *Under Review";
            } else {
                formattedCountyPerCapita = `$${Number(countyPerCapita.replace(/\D/g, '')).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            }
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
        <div style="line-height: 1.2;">
        <b>${countyName} FEMA Total:</b> <span class="formatted-value">${formattedCountyFemaTotal}</span><br>
        <b>${countyName} Per Capita:</b> <span class="formatted-value">${formattedCountyPerCapita}</span><br>
        <hr>
        <b>${stateName} FEMA Total:</b> <span class="formatted-value">${formattedStateFemaTotal}</span><br>
        <b>${stateName} HUD CDBG-DR Total:</b> <span class="formatted-value">${formattedStateCdbgTotal}</span><br>
        <b>${stateName} Per Capita:</b> <span class="formatted-value">${formattedStatePerCapita}</span>
    </div>
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

    document.getElementById('shareReportButton').addEventListener('click', function () {
        const subject = encodeURIComponent('Atlas of Accountability by Rebuild by Design');
        const body = encodeURIComponent(
            'Hello,\n\nI believe you will be interested in this.\n\nCheck out Rebuild by Design\'s Atlas of Accountability, a web tool that allows users to identify past federal disaster declarations and recovery funding for climate-driven events county-by-county, and congressional representatives district-by-district. The interactive map is designed to help communities and policymakers understand their localized exposure to extreme weather disasters and the benefits of investments in resilient infrastructure that can make communities safer.\n\nThe analysis finds that for 2011-2023:\n- 91% of congressional districts include a county that has received a federal disaster declaration for an extreme weather event.\n- 72% of states have had more than 10 disaster declarations\n- In 24 states (48%), every county has had a disaster declaration.\n- Of the 23 congressional districts that have experienced 10 or more disasters, over two-thirds are represented by Republicans while nearly one-third are represented by Democrats.\n\nYou can check it out here: https://rebuildbydesign.org/atlas-of-disaster\n\nThis map highlights the urgency of bipartisan cooperation and the need to unite across the urban-rural divide, it also outlines strategies for shifting from post-disaster funding to pre-disaster preparedness.\n\nPlease share this with your network to help spread awareness and advocate for stronger, resilient infrastructure.'
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    });

    // Event listener for the DOWNLOAD button
    document.getElementById('downloadReportButton').addEventListener('click', function () {
        window.location.href = 'https://rebuildbydesign.org/wp-content/uploads/Atlas-of-Accountability-Full-Report.pdf';  // Replace with the actual URL of your maps download page
    });


});