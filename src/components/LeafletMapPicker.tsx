import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '../context/LanguageContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

interface LeafletMapPickerProps {
    onSelectAddress: (data: { address: string; city: string; postalCode: string; lat?: number; lng?: number }) => void;
    currentAddress?: string;
}

interface Coordinates {
    lat: number;
    lng: number;
}

interface GeocodedPlace {
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        county?: string;
        postcode?: string;
    };
}

const isGeocodedPlace = (value: unknown): value is GeocodedPlace =>
    typeof value === 'object'
    && value !== null
    && 'display_name' in value
    && typeof value.display_name === 'string'
    && 'lat' in value
    && typeof value.lat === 'string'
    && 'lon' in value
    && typeof value.lon === 'string';

const getLeafletMapHtml = ({ lat, lng }: Coordinates) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
        <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.css"/>
        <script type="importmap">
          {
            "imports": {
              "leaflet": "https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js",
              "maplibre-gl": "https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.mjs"
            }
          }
        </script>
        <style>
          * { box-sizing: border-box; }
          html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: #f4f1fa;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }

          /* Modern & clean map styling */
          .leaflet-tile {
            filter: saturate(1.08) contrast(1.02);
          }

          .leaflet-control-attribution {
            padding: 4px 8px !important;
            border: 1px solid rgba(139, 114, 230, 0.12) !important;
            border-radius: 9px 0 0 0 !important;
            color: #5b556b !important;
            background: rgba(255, 255, 255, 0.9) !important;
            font-size: 10px !important;
            box-shadow: 0 2px 8px rgba(35, 20, 75, 0.08) !important;
          }
          .leaflet-control-attribution a { color: #5d45b5 !important; }

          /* Premium Glassmorphic Zoom Controls */
          .leaflet-bar {
            border: none !important;
            box-shadow: 0 4px 18px rgba(35, 20, 75, 0.14) !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            background: rgba(255, 255, 255, 0.94) !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
            margin: 14px !important;
          }
          .leaflet-bar a,
          .leaflet-bar a:hover {
            width: 38px !important;
            height: 38px !important;
            line-height: 38px !important;
            font-size: 20px !important;
            font-weight: 500 !important;
            color: #4b3894 !important;
            background: transparent !important;
            border-color: rgba(139, 114, 230, 0.15) !important;
            transition: all 0.2s ease !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .leaflet-bar a:first-child {
            border-bottom: 1px solid rgba(139, 114, 230, 0.12) !important;
          }
          .leaflet-bar a:hover {
            background: #8b72e6 !important;
            color: #ffffff !important;
          }
          .leaflet-bar a:active {
            background: #7353dc !important;
            transform: scale(0.96);
          }

          /* Custom Animated Marker */
          .zone-pin-wrapper {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: grab;
          }
          .zone-pin-wrapper:active {
            cursor: grabbing;
          }

          /* Pulsing base radar ring */
          .zone-pin-pulse {
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translate(-50%, 50%);
            width: 24px;
            height: 10px;
            background: rgba(139, 114, 230, 0.4);
            border-radius: 50%;
            animation: pinRadar 2s ease-out infinite;
            pointer-events: none;
          }

          @keyframes pinRadar {
            0% {
              transform: translate(-50%, 50%) scale(0.6);
              opacity: 0.9;
            }
            50% {
              transform: translate(-50%, 50%) scale(1.9);
              opacity: 0.25;
            }
            100% {
              transform: translate(-50%, 50%) scale(2.5);
              opacity: 0;
            }
          }

          /* Pin icon styling */
          .zone-pin-icon {
            position: relative;
            width: 38px;
            height: 48px;
            filter: drop-shadow(0 8px 16px rgba(45, 25, 95, 0.35));
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: block;
          }
          .zone-pin-wrapper:hover .zone-pin-icon {
            transform: translateY(-4px) scale(1.06);
          }

          /* Custom sleek tooltip */
          .leaflet-tooltip.zone-map-tooltip {
            background: rgba(26, 18, 56, 0.92);
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.3px;
            padding: 5px 11px;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(6px);
          }
          .leaflet-tooltip-top.zone-map-tooltip::before {
            border-top-color: rgba(26, 18, 56, 0.92);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script type="module">
          import * as LeafletModule from 'leaflet';
          import { maplibreGL } from 'https://unpkg.com/@maplibre/maplibre-gl-leaflet@0.1.4/dist/leaflet-maplibre-gl.mjs';
          const L = LeafletModule.default || LeafletModule;

          const map = L.map('map', {
            attributionControl: true,
            zoomControl: true,
            minZoom: 1,
            maxBounds: [[180, -Infinity], [-180, Infinity]],
            maxBoundsViscosity: 1
          }).setView([${lat}, ${lng}], 15);
          map.attributionControl.setPrefix(false);

          const vectorLayer = maplibreGL({
            style: 'https://tiles.openfreemap.org/styles/positron',
            attributionControl: {
              customAttribution: 'OpenFreeMap | © OpenMapTiles | Data from OpenStreetMap'
            }
          }).addTo(map);
          const mapLibreMap = vectorLayer.getMaplibreMap();
          mapLibreMap.once('style.load', () => {
            ['highway-shield-non-us', 'highway-shield-us-interstate', 'road_shield_us'].forEach((layerId) => {
              if (mapLibreMap.getLayer(layerId)) {
                mapLibreMap.setLayoutProperty(layerId, 'visibility', 'none');
              }
            });
          });

          const pinHtml = \`
            <div class="zone-pin-wrapper">
              <div class="zone-pin-pulse"></div>
              <svg class="zone-pin-icon" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#a48df0"/>
                    <stop offset="50%" stop-color="#8b72e6"/>
                    <stop offset="100%" stop-color="#694cd4"/>
                  </linearGradient>
                </defs>
                <path d="M19 0C8.50659 0 0 8.50659 0 19C0 31.8 19 48 19 48C19 48 38 31.8 38 19C38 8.50659 29.4934 0 19 0Z" fill="url(#pinGrad)"/>
                <circle cx="19" cy="18" r="8" fill="#ffffff"/>
                <circle cx="19" cy="18" r="4" fill="#694cd4"/>
              </svg>
            </div>
          \`;

          const marker = L.marker([${lat}, ${lng}], {
            draggable: true,
            icon: L.divIcon({
              className: 'zone-custom-div-icon',
              html: pinHtml,
              iconSize: [38, 48],
              iconAnchor: [19, 48]
            })
          }).addTo(map);

          marker.bindTooltip("Point de livraison", {
            permanent: false,
            direction: 'top',
            offset: [0, -48],
            className: 'zone-map-tooltip'
          });

          const notifyParent = (point) => {
            const message = { type: 'leaflet-location', lat: point.lat, lng: point.lng };
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify(message));
            } else {
              window.parent.postMessage(message, '*');
            }
          };

          map.on('click', (event) => {
            marker.setLatLng(event.latlng);
            map.panTo(event.latlng, { animate: true, duration: 0.35 });
            notifyParent(event.latlng);
          });

          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            notifyParent(pos);
          });

          const resizeMap = () => setTimeout(() => map.invalidateSize(), 100);
          window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'leaflet-resize') resizeMap();
          });
          resizeMap();
          setTimeout(() => map.invalidateSize(), 600);
        </script>
      </body>
    </html>
`;

export const LeafletMapPicker: React.FC<LeafletMapPickerProps> = ({ onSelectAddress, currentAddress }) => {
    const { height: windowHeight } = useWindowDimensions();
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState(currentAddress || 'Lomé, Togo');
    const [selectedCoords, setSelectedCoords] = useState<Coordinates>({
        lat: 6.1319,
        lng: 1.2228,
    });
    const [mapHtml, setMapHtml] = useState(() => getLeafletMapHtml({ lat: 6.1319, lng: 1.2228 }));
    const [selectedPlace, setSelectedPlace] = useState<GeocodedPlace | null>(null);
    const [searching, setSearching] = useState(false);
    const [locating, setLocating] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [mapError, setMapError] = useState('');
    const mapFrameRef = useRef<HTMLIFrameElement>(null);
    const mapHeight = Math.max(210, windowHeight - 360);

    const handleMapLocation = (data: unknown) => {
        if (typeof data !== 'object' || data === null || !('type' in data) || data.type !== 'leaflet-location') return;
        if (!('lat' in data) || !('lng' in data)) return;

        const { lat, lng } = data;
        if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

        setSelectedCoords({ lat, lng });
        setSelectedPlace(null);
        setMapError('');
    };

    useEffect(() => {
        const handleMapMessage = (event: MessageEvent<unknown>) => {
            if (event.source !== mapFrameRef.current?.contentWindow || typeof event.data !== 'object' || event.data === null) {
                return;
            }
            handleMapLocation(event.data);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('message', handleMapMessage);
            return () => window.removeEventListener('message', handleMapMessage);
        }
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setMapError('Saisis une adresse ou une ville à rechercher.');
            return;
        }

        setSearching(true);
        setMapError('');
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(searchQuery.trim())}`
            );
            if (!response.ok) {
                throw new Error(`La recherche d’adresse a échoué (HTTP ${response.status}).`);
            }

            const results: unknown = await response.json();
            if (!Array.isArray(results) || !isGeocodedPlace(results[0])) {
                setMapError('Aucune adresse trouvée. Essaie avec une rue, une ville ou un quartier.');
                return;
            }

            const place = results[0];
            const lat = Number(place.lat);
            const lng = Number(place.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                throw new Error('La recherche a renvoyé des coordonnées invalides.');
            }

            setSelectedCoords({ lat, lng });
            setMapHtml(getLeafletMapHtml({ lat, lng }));
            setSelectedPlace(place);
            setSearchQuery(place.display_name);
        } catch (error) {
            setMapError(error instanceof Error ? error.message : String(error));
        } finally {
            setSearching(false);
        }
    };

    const handleLocateMe = () => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            setMapError('La géolocalisation n’est pas disponible sur cet appareil.');
            return;
        }

        setLocating(true);
        setMapError('');
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const location = { lat: coords.latitude, lng: coords.longitude };
                setSelectedCoords(location);
                setMapHtml(getLeafletMapHtml(location));
                setSelectedPlace(null);
                setLocating(false);
            },
            (error) => {
                setMapError(`Impossible de récupérer ta position : ${error.message}`);
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const handleConfirmLocation = async () => {
        setConfirming(true);
        setMapError('');
        try {
            let place = selectedPlace;
            if (!place) {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${selectedCoords.lat}&lon=${selectedCoords.lng}`
                );
                if (!response.ok) {
                    throw new Error(`Impossible de trouver l’adresse du point choisi (HTTP ${response.status}).`);
                }
                const result: unknown = await response.json();
                if (!isGeocodedPlace(result)) {
                    throw new Error('Aucune adresse n’a été trouvée pour ce point.');
                }
                place = result;
            }

            const locationAddress = place.address;
            onSelectAddress({
                address: place.display_name,
                city: locationAddress?.city
                    || locationAddress?.town
                    || locationAddress?.village
                    || locationAddress?.municipality
                    || locationAddress?.county
                    || '',
                postalCode: locationAddress?.postcode || '',
                lat: selectedCoords.lat,
                lng: selectedCoords.lng,
            });
            setSearchQuery(place.display_name);
            setSelectedPlace(place);
            setModalVisible(false);
        } catch (error) {
            setMapError(error instanceof Error ? error.message : String(error));
        } finally {
            setConfirming(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.mapTriggerBtn}
                onPress={() => {
                    setMapHtml(getLeafletMapHtml(selectedCoords));
                    setModalVisible(true);
                }}
                activeOpacity={0.8}
            >
                <View style={styles.triggerIcon}>
                    <Ionicons name="location-outline" size={20} color="#111111" />
                </View>
                <View style={styles.triggerTextWrapper}>
                    <Text style={styles.triggerTitle}>Pin exact location on Leaflet Map</Text>
                    <Text style={styles.triggerSub} numberOfLines={1}>
                        {currentAddress || 'Search for an address or select a point on the map'}
                    </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#525252" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.mapModalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.headerTitleRow}>
                                <Ionicons name="location-outline" size={22} color="#111111" />
                                <View>
                                    <Text style={styles.modalTitle}>Choose delivery location</Text>
                                    <Text style={styles.modalSubtitle}>Search an address or move the map pin</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setModalVisible(false)}
                                accessibilityLabel="Close map"
                            >
                                <Feather name="x" size={18} color="#111111" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchRow}>
                            <View style={styles.searchBarWrapper}>
                                <Feather name="search" size={17} color="#525252" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Street, city or postal code"
                                    value={searchQuery}
                                    onChangeText={(value) => {
                                        setSearchQuery(value);
                                        setMapError('');
                                    }}
                                    onSubmitEditing={handleSearch}
                                    returnKeyType="search"
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.searchBtn}
                                onPress={handleSearch}
                                disabled={searching}
                                accessibilityLabel="Search address"
                            >
                                {searching
                                    ? <ActivityIndicator size="small" color="#ffffff" />
                                    : <Feather name="arrow-right" size={18} color="#ffffff" />}
                            </TouchableOpacity>
                        </View>

                        {mapError ? <Text style={styles.mapError}>{mapError}</Text> : null}

                        <View style={[styles.mapViewFrame, { height: mapHeight }]}>
                            {Platform.OS === 'web' ? (
                                <iframe
                                    ref={mapFrameRef}
                                    title="Leaflet Map"
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    srcDoc={mapHtml}
                                    onLoad={() => {
                                        mapFrameRef.current?.contentWindow?.postMessage({ type: 'leaflet-resize' }, '*');
                                    }}
                                />
                            ) : (
                                <WebView
                                    originWhitelist={['*']}
                                    source={{ html: mapHtml }}
                                    javaScriptEnabled
                                    domStorageEnabled
                                    style={{ width: '100%', height: '100%', backgroundColor: '#f3efff' }}
                                    onMessage={(event) => {
                                        try {
                                            const data: unknown = JSON.parse(event.nativeEvent.data);
                                            handleMapLocation(data);
                                        } catch (error) {
                                            setMapError(`Impossible de lire la position sélectionnée : ${String(error)}`);
                                        }
                                    }}
                                />
                            )}
                            <TouchableOpacity
                                style={styles.locateBtn}
                                onPress={handleLocateMe}
                                disabled={locating}
                                accessibilityLabel="Use my current location"
                            >
                                {locating
                                    ? <ActivityIndicator size="small" color="#ffffff" />
                                    : <Ionicons name="locate-outline" size={22} color="#ffffff" />}
                            </TouchableOpacity>
                            <View style={styles.pinInfoBadge}>
                                <Ionicons name="pin-outline" size={14} color="#111111" />
                                <Text style={styles.pinInfoText}>
                                    {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.mapHint}>Tap the map or drag the pin to adjust your delivery point.</Text>
                        <TouchableOpacity
                            style={styles.confirmLocationBtn}
                            onPress={handleConfirmLocation}
                            disabled={confirming}
                            activeOpacity={0.8}
                        >
                            {confirming
                                ? <ActivityIndicator size="small" color="#ffffff" />
                                : <Feather name="check" size={18} color="#ffffff" />}
                            <Text style={styles.confirmBtnText}>
                                {confirming ? 'Finding address...' : 'Confirm this location'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    mapTriggerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d4d4d4',
        gap: 12,
    },
    triggerIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    triggerTextWrapper: {
        flex: 1,
    },
    triggerTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#111111',
    },
    triggerSub: {
        fontSize: 12,
        color: '#525252',
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    mapModalContainer: {
        width: '100%',
        maxWidth: 1200,
        flex: 1,
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111111',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#525252',
        marginTop: 2,
    },
    closeBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    searchBarWrapper: {
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#d4d4d4',
        gap: 10,
    },
    searchInput: {
        flex: 1,
        minWidth: 0,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111111',
    },
    searchBtn: {
        width: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8b72e6',
    },
    mapError: {
        color: '#111111',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
    },
    mapViewFrame: {
        flexShrink: 0,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#f4f1fa',
        borderWidth: 1.5,
        borderColor: '#e5dcff',
        position: 'relative',
        shadowColor: '#362370',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    locateBtn: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#8b72e6',
        borderWidth: 1.5,
        borderColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2b1b59',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
        elevation: 4,
    },
    pinInfoBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(139, 114, 230, 0.25)',
        shadowColor: '#2b1b59',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 3,
    },
    pinInfoText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#4b3894',
        letterSpacing: 0.2,
    },
    mapHint: {
        fontSize: 12,
        color: '#525252',
        marginTop: 8,
        marginBottom: 8,
    },
    confirmLocationBtn: {
        minHeight: 50,
        backgroundColor: '#8b72e6',
        borderRadius: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#8b72e6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    confirmBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.3,
    },
});
