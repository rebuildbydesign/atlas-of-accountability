mapboxgl.accessToken = 'pk.eyJ1IjoiajAwYnkiLCJhIjoiY2x1bHUzbXZnMGhuczJxcG83YXY4czJ3ayJ9.S5PZpU9VDwLMjoX_0x5FDQ';

// HIDE TITLE IF USING AN IFRAME FOR WORDPRESS
document.addEventListener("DOMContentLoaded", function () {
    if (window.location !== window.parent.location) {
        // The page is in an iframe
        var titleElement = document.querySelector('.css-atlas-title');
        if (titleElement) {
            titleElement.style.display = 'none';
        }
    } else {
        // The page is not in an iframe, do nothing
    }
});

// Determine the initial zoom level based on the screen width
const initialZoom = window.innerWidth < 768 ? 3 : 3.7;  // Zoom level 3 for mobile, 4 for desktop

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/j00by/clvx7jcp006zv01ph3miketyz',
    center: [-97.97135, 38.13880],
    zoom: initialZoom
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
                ['coalesce', ['get', 'COUNTY_DISASTER_COUNT'], 0], // Default to 0 if value is null
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
            'fill-opacity': 0.8
        }
    }, 'state-label');

    // Load the GeoJSON file for congressional districts with representative names
    map.addSource('districts', {
        type: 'geojson',
        data: 'data/US_Districts.json'
    });

    // Add a layer for districts
    map.addLayer({
        'id': 'districts-layer',
        'type': 'fill',
        'source': 'districts',
        'paint': {
            'fill-color': 'transparent', // No fill color
            'fill-outline-color': '#000' // Black border color
        }
    });

    // Line layer specifically for district borders
    map.addLayer({
        'id': 'districts-border',
        'type': 'line',
        'source': 'districts',
        'layout': {},
        'paint': {
            'line-color': '#000', // Black border color
            'line-width': 0.5
        }
    }, 'state-label');

    // Load the GeoJSON file for counties and FEMA declaration count
    map.addSource('counties', {
        type: 'geojson',
        data: 'data/US_Counties.json'
    });

    // Add a layer for counties
    map.addLayer({
        'id': 'counties-layer',
        'type': 'fill',
        'source': 'counties',
        'paint': {
            'fill-color': [
                'match',
                ['coalesce', ['get', 'FEMA_TOTAL_FEMA_DISASTERS'], 0], // Default to 0 if value is null
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

    // Initialize the popup globally if it needs to be accessed by different layers
    var popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "none"  // Allows custom width styling
    });

    // When a user clicks on the map, show a popup with information
    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['atlas-fema-layer'] });
        if (!features.length) {
            return;
        }

        var feature = features[0].properties;
        var stateName = feature.STATE_NAME;
        var countyName = feature.COUNTY_NAME;
        var disasterCount = feature.COUNTY_DISASTER_COUNT;
        var representativeName = `${feature.FIRSTNAME} ${feature.LASTNAME}`;
        var party = feature.PARTY;
        var repImage = feature.PHOTOURL;
        var websiteUrl = feature.WEBSITEURL;
        var facebookUrl = feature.FACE_BOOK_;
        var twitterUrl = feature.TWITTER_UR;
        var instagramUrl = feature.INSTAGRAM_;
        var senator1 = feature.SENATOR1;
        var sen1party = feature.SEN1_PARTY;
        var senator1Url = feature.SENATOR1_URL;
        var senator2 = feature.SENATOR2;
        var sen2party = feature.PARTY_SEN2;
        var senator2Url = feature.SENATOR2_URL;
        var atlasUrl = feature.ATLAS_URL;
        var atlasCover = feature.ATLAS_COVER;

        var femaCountyTotalFunds = feature.FEMA_COUNTY_TOTAL_FUNDS;
        var stateFemaTotalFunds = feature.STATE_FEMA_TOTAL_FUNDS;
        var stateCdbgTotalFunds = feature.STATE_CDBG_TOTAL_FUNDS;
        var statePopulation = feature.STATE_POPULATION;
        var statePerCapita = feature.STATE_PER_CAPITA;

        var formattedFemaCountyTotalFunds = `$${Number(femaCountyTotalFunds).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedStateFemaTotalFunds = `$${Number(stateFemaTotalFunds).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedStateCdbgTotalFunds = `$${Number(stateCdbgTotalFunds).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedStatePerCapita = `$${Number(statePerCapita).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        var formattedStatePopulation = Number(statePopulation).toLocaleString('en-US', { maximumFractionDigits: 0 });

        var popupContent = `
<div class="popup-container">
    <div class="popup-column">
        <h3>${countyName} County, ${stateName}</h3>
        <div class="disaster-count">
            <div class="count">${disasterCount}</div>
            <div class="count-description"># of Federally Declared Extreme Weather Disasters</div>
        </div>
        <p class="namelsad">Total Federal Funding (2011-2023)</p>
        <b>${countyName} Total FEMA:</b> ${formattedFemaCountyTotalFunds}<br>
        <b>${stateName} Total FEMA:</b> ${formattedStateFemaTotalFunds}<br>
        <b>${stateName} Total CDBG-DR:</b> ${formattedStateCdbgTotalFunds}<br>
        <b>${stateName} Population:</b> ${formattedStatePopulation}<br>
        <b>${stateName} Per Capita:</b> ${formattedStatePerCapita}</p>
        <p class="namelsad">Atlas of Disaster Report</p>
        <p>Read the Atlas of Disaster: ${stateName} to learn more.</p>
        <a href="${atlasUrl}" target="_blank"><img src="${atlasCover}" alt="Atlas Cover" class="atlas-cover"></a>
    </div>
    <div class="popup-column">
        <p class="namelsad">${feature.NAMELSAD20}</p>
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
                <img src="https://static.wikia.nocookie.net/headsoccer/images/1/1b/Mystery_character.png" alt="Senator 1" class="senator-image">
                <div>
                    <a href="${senator1Url}" target="_blank">${senator1} (${sen1party})</a>
                </div>
            </div>
            <div class="senator-row">
                <img src="https://static.wikia.nocookie.net/headsoccer/images/1/1b/Mystery_character.png" alt="Senator 2" class="senator-image">
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
    map.on('mouseenter', 'counties-layer', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'counties-layer', function () {
        map.getCanvas().style.cursor = '';
    });

    // Toggle disaster data layer visibility
    document.getElementById('toggle-counties').addEventListener('click', function () {
        var visibility = map.getLayoutProperty('counties-layer', 'visibility');
        if (visibility === 'visible' || visibility === undefined) {
            map.setLayoutProperty('counties-layer', 'visibility', 'none');
            this.textContent = 'Show Disaster Data';
        } else {
            map.setLayoutProperty('counties-layer', 'visibility', 'visible');
            this.textContent = 'Hide Disaster Data';
        }
    });

    // Initialize the geocoder
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: 'Search Address',
        zoom: 9,
        bbox: [-124.848974, 24.396308, -66.93457, 49.384358]
    });

    // Add the geocoder to the map
    map.addControl(geocoder, 'bottom-left');

    // Handle the result event from the geocoder
    geocoder.on('result', function (e) {
        var lngLat = e.result.geometry.coordinates;

        window.setTimeout(function () {
            if (popup.isOpen()) {
                popup.remove();
            }

            var features = map.queryRenderedFeatures(map.project(lngLat), { layers: ['atlas-fema-layer'] });
            if (!features.length) {
                return;
            }

            var feature = features[0].properties;
            var stateName = feature.STATE_NAME;
            var countyName = feature.COUNTY_NAME;
            var disasterCount = feature.COUNTY_DISASTER_COUNT;
            var representativeName = `${feature.FIRSTNAME} ${feature.LASTNAME}`;
            var party = feature.PARTY;
            var repImage = feature.PHOTOURL;
            var websiteUrl = feature.WEBSITEURL;
            var facebookUrl = feature.FACE_BOOK_;
            var twitterUrl = feature.TWITTER_UR;
            var instagramUrl = feature.INSTAGRAM_;
            var senator1 = feature.SENATOR1;
            var sen1party = feature.SEN1_PARTY;
            var senator1Url = feature.SENATOR1_URL;
            var senator2 = feature.SENATOR2;
            var sen2party = feature.PARTY_SEN2;
            var senator2Url = feature.SENATOR2_URL;
            var atlasUrl = feature.ATLAS_URL;
            var atlasCover = feature.ATLAS_COVER;

            var femaCountyTotalFunds = feature.FEMA_COUNTY_TOTAL_FUNDS;
            var stateFemaTotalFunds = feature.STATE_FEMA_TOTAL_FUNDS;
            var stateCdbgTotalFunds = feature.STATE_CDBG_TOTAL_FUNDS;
            var statePopulation = feature.STATE_POPULATION;
            var statePerCapita = feature.STATE_PER_CAPITA;

            var formattedFemaCountyTotalFunds = `$${Number(femaCountyTotalFunds).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedStateFemaTotalFunds = `$${Number(stateFemaTotalFunds).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedStateCdbgTotalFunds = `$${Number(stateCdbgTotalFunds).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedStatePerCapita = `$${Number(statePerCapita).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
            var formattedStatePopulation = Number(statePopulation).toLocaleString('en-US', { maximumFractionDigits: 0 });

            var popupContent = `
<div class="popup-container">
    <div class="popup-column">
        <h3>${countyName} County, ${stateName}</h3>
        <div class="disaster-count">
            <div class="count">${disasterCount}</div>
            <div class="count-description"># of Federally Declared Extreme Weather Disasters</div>
        </div>
        <p class="namelsad">Total Federal Funding (2011-2023)</p>
        <b>${countyName} Total FEMA:</b> ${formattedFemaCountyTotalFunds}<br>
        <b>${stateName} Total FEMA:</b> ${formattedStateFemaTotalFunds}<br>
        <b>${stateName} Total CDBG-DR:</b> ${formattedStateCdbgTotalFunds}<br>
        <b>${stateName} Population:</b> ${formattedStatePopulation}<br>
        <b>${stateName} Per Capita:</b> ${formattedStatePerCapita}</p>
        <p class="namelsad">Atlas of Disaster Report</p>
        <p>Read the Atlas of Disaster: ${stateName} to learn more.</p>
        <a href="${atlasUrl}" target="_blank"><img src="${atlasCover}" alt="Atlas Cover" class="atlas-cover"></a>
    </div>
    <div class="popup-column">
        <p class="namelsad">${feature.NAMELSAD20}</p>
        <h3>Congress Representative</h3>
        <p><a href="${websiteUrl}" target="_blank" style="color: #a50f15;">${representativeName} (${party})</a></p>
        <img src="${repImage}" alt="Profile Picture" class="rep-image">
        <div class="social-links">
            <a href="${websiteUrl}" target="_blank"><img src="img/id-card.svg" alt="Website"></a>
            <a href="${facebookUrl}" target="_blank"><img src="img/facebook.svg" alt="Facebook"></a>
            <a href="${twitterUrl}" target="_blank"><img src="img/twitter.svg" alt="Twitter"></a>
            <a href="${instagramUrl}" target="_blank"><img src="img/instagram.svg" alt="Instagram"></a>
        </div>
        <h3>US Senators</h3>
        <div class="senator-info">
            <div class="senator-row">
                <img src="https://static.wikia.nocookie.net/headsoccer/images/1/1b/Mystery_character.png" alt="Senator 1" class="senator-image">
                <div>
                    <a href="${senator1Url}" target="_blank">${senator1} (${sen1party})</a>
                </div>
            </div>
            <div class="senator-row">
                <img src="https://static.wikia.nocookie.net/headsoccer/images/1/1b/Mystery_character.png" alt="Senator 2" class="senator-image">
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
        }, 300);
    });
});
