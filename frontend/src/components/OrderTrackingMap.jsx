import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function OrderTrackingMap({
  destination,
  rider,
  height = 360
}) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  const destinationLayerRef = useRef(null);
  const riderLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  const routeRequestRef = useRef(0);
  const mountedRef = useRef(true);

  const lastFitKeyRef = useRef('');
  const lastRouteKeyRef = useRef('');

  const [mapReady, setMapReady] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  // ==========================================================
  // VALIDATE LOCATION
  // ==========================================================

  const isValidLocation = (location) => {
    if (!location) {
      return false;
    }

    const lat = Number(location.lat);
    const lng = Number(location.lng);

    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  // ==========================================================
  // CUSTOM DESTINATION ICON
  // ==========================================================

  const createDestinationIcon = () =>
    L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          width:42px;
          height:42px;
          border-radius:50%;
          background:#dc2626;
          border:4px solid white;
          box-shadow:0 3px 12px rgba(0,0,0,0.35);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:22px;
        ">
          🏠
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -22]
    });

  // ==========================================================
  // CUSTOM RIDER ICON
  // ==========================================================

  const createRiderIcon = () =>
    L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          width:46px;
          height:46px;
          border-radius:50%;
          background:#059669;
          border:4px solid white;
          box-shadow:0 3px 14px rgba(0,0,0,0.4);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:24px;
        ">
          🚚
        </div>
      `,
      iconSize: [46, 46],
      iconAnchor: [23, 23],
      popupAnchor: [0, -24]
    });

  // ==========================================================
  // INITIALIZE MAP
  // ==========================================================

  useEffect(() => {
    mountedRef.current = true;

    if (!mapRef.current || instanceRef.current) {
      return;
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      attributionControl: true
    }).setView([20.5937, 78.9629], 5);

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(map);

    instanceRef.current = map;

    const resizeTimer = setTimeout(() => {
      if (!mountedRef.current || !instanceRef.current) {
        return;
      }

      map.invalidateSize();

      if (mountedRef.current) {
        setMapReady(true);
      }
    }, 200);

    return () => {
      mountedRef.current = false;

      clearTimeout(resizeTimer);

      routeRequestRef.current += 1;

      if (instanceRef.current) {
        instanceRef.current.remove();
      }

      instanceRef.current = null;
      destinationLayerRef.current = null;
      riderLayerRef.current = null;
      routeLayerRef.current = null;

      lastFitKeyRef.current = '';
      lastRouteKeyRef.current = '';
    };
  }, []);

  // ==========================================================
  // LOAD ROAD ROUTE USING OSRM
  // ==========================================================

  const loadRoadRoute = async (
    riderPoint,
    destinationPoint
  ) => {
    const map = instanceRef.current;

    if (!map || !mountedRef.current) {
      return;
    }

    const currentRequest = ++routeRequestRef.current;

    const routeKey = [
      riderPoint.lat.toFixed(5),
      riderPoint.lng.toFixed(5),
      destinationPoint.lat.toFixed(5),
      destinationPoint.lng.toFixed(5)
    ].join('|');

    lastRouteKeyRef.current = routeKey;

    setRouteLoading(true);

    try {
      /*
       * OSRM coordinate format:
       *
       * longitude,latitude
       *
       * Rider -> Customer
       */

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${riderPoint.lng},${riderPoint.lat};` +
        `${destinationPoint.lng},${destinationPoint.lat}` +
        `?overview=full&geometries=geojson`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Route request failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (
        !mountedRef.current ||
        currentRequest !== routeRequestRef.current
      ) {
        return;
      }

      if (
        data.code !== 'Ok' ||
        !data.routes ||
        !data.routes.length
      ) {
        throw new Error('Road route not available');
      }

      const route = data.routes[0];

      const coordinates =
        route.geometry?.coordinates || [];

      if (!coordinates.length) {
        throw new Error('Route geometry unavailable');
      }

      const latLngs = coordinates
        .map(([lng, lat]) => [
          Number(lat),
          Number(lng)
        ])
        .filter(
          ([lat, lng]) =>
            Number.isFinite(lat) &&
            Number.isFinite(lng)
        );

      if (!latLngs.length) {
        throw new Error('Invalid route coordinates');
      }

      // ------------------------------------------------------
      // REMOVE OLD ROUTE
      // ------------------------------------------------------

      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }

      // ------------------------------------------------------
      // DRAW ROAD ROUTE
      // ------------------------------------------------------

      routeLayerRef.current = L.polyline(
        latLngs,
        {
          color: '#2563eb',
          weight: 6,
          opacity: 0.85,
          lineJoin: 'round',
          lineCap: 'round'
        }
      ).addTo(map);

      // ------------------------------------------------------
      // DISTANCE
      // ------------------------------------------------------

      const distanceMeters = Number(route.distance || 0);
      const durationSeconds = Number(route.duration || 0);

      const distanceKm = distanceMeters / 1000;
      const durationMinutes = durationSeconds / 60;

      let distanceText = 'Distance unavailable';

      if (distanceMeters > 0) {
        distanceText =
          distanceKm < 1
            ? `${Math.round(distanceMeters)} m`
            : `${distanceKm.toFixed(1)} km`;
      }

      let timeText = 'ETA unavailable';

      if (durationMinutes > 0) {
        if (durationMinutes < 60) {
          timeText =
            `${Math.max(
              1,
              Math.round(durationMinutes)
            )} min`;
        } else {
          const hours =
            Math.floor(durationMinutes / 60);

          const minutes =
            Math.round(durationMinutes % 60);

          timeText =
            minutes > 0
              ? `${hours} hr ${minutes} min`
              : `${hours} hr`;
        }
      }

      const newRouteInfo = {
        distance: distanceText,
        duration: timeText
      };

      if (mountedRef.current) {
        setRouteInfo(newRouteInfo);
      }

      map._deliveryRouteInfo = newRouteInfo;

      // ------------------------------------------------------
      // FIT MAP TO ROUTE
      // ------------------------------------------------------

      const bounds =
        routeLayerRef.current.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [70, 70],
          maxZoom: 16,
          animate: true
        });
      }
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      console.warn(
        'OSRM route unavailable:',
        error?.message || error
      );

      // ------------------------------------------------------
      // REMOVE OLD ROUTE
      // ------------------------------------------------------

      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }

      // ------------------------------------------------------
      // FALLBACK STRAIGHT LINE
      // ------------------------------------------------------

      routeLayerRef.current =
        L.polyline(
          [
            [
              riderPoint.lat,
              riderPoint.lng
            ],
            [
              destinationPoint.lat,
              destinationPoint.lng
            ]
          ],
          {
            color: '#64748b',
            weight: 4,
            opacity: 0.75,
            dashArray: '10, 10',
            lineJoin: 'round',
            lineCap: 'round'
          }
        ).addTo(map);

      const fallbackBounds =
        routeLayerRef.current.getBounds();

      if (fallbackBounds.isValid()) {
        map.fitBounds(fallbackBounds, {
          padding: [70, 70],
          maxZoom: 16,
          animate: true
        });
      }

      if (mountedRef.current) {
        setRouteInfo({
          distance: 'Road distance unavailable',
          duration: 'ETA unavailable'
        });
      }
    } finally {
      if (
        mountedRef.current &&
        currentRequest === routeRequestRef.current
      ) {
        setRouteLoading(false);
      }
    }
  };

  // ==========================================================
  // UPDATE MARKERS
  // ==========================================================

  useEffect(() => {
    const map = instanceRef.current;

    if (!map || !mapReady) {
      return;
    }

    const hasDestination =
      isValidLocation(destination);

    const hasRider =
      isValidLocation(rider);

    const destinationPoint =
      hasDestination
        ? {
            lat: Number(destination.lat),
            lng: Number(destination.lng)
          }
        : null;

    const riderPoint =
      hasRider
        ? {
            lat: Number(rider.lat),
            lng: Number(rider.lng)
          }
        : null;

    // ========================================================
    // DESTINATION MARKER
    // ========================================================

    if (hasDestination) {
      if (!destinationLayerRef.current) {
        destinationLayerRef.current =
          L.marker(
            [
              destinationPoint.lat,
              destinationPoint.lng
            ],
            {
              icon: createDestinationIcon(),
              zIndexOffset: 1000
            }
          ).addTo(map);
      } else {
        destinationLayerRef.current.setLatLng([
          destinationPoint.lat,
          destinationPoint.lng
        ]);
      }

      destinationLayerRef.current.bindPopup(`
        <div style="
          min-width:190px;
          font-family:Arial,sans-serif;
        ">
          <div style="
            font-size:16px;
            font-weight:700;
            margin-bottom:6px;
          ">
            🏠 Delivery Address
          </div>

          <div style="
            font-size:13px;
            color:#475569;
          ">
            Customer delivery location
          </div>

          <div style="
            font-size:12px;
            margin-top:6px;
            color:#64748b;
          ">
            ${destinationPoint.lat.toFixed(6)},
            ${destinationPoint.lng.toFixed(6)}
          </div>
        </div>
      `);
    } else {
      if (destinationLayerRef.current) {
        destinationLayerRef.current.remove();
        destinationLayerRef.current = null;
      }
    }

    // ========================================================
    // RIDER MARKER
    // ========================================================

    if (hasRider) {
      if (!riderLayerRef.current) {
        riderLayerRef.current =
          L.marker(
            [
              riderPoint.lat,
              riderPoint.lng
            ],
            {
              icon: createRiderIcon(),
              zIndexOffset: 2000
            }
          ).addTo(map);
      } else {
        riderLayerRef.current.setLatLng([
          riderPoint.lat,
          riderPoint.lng
        ]);
      }

      const accuracyValue =
        Number(rider?.accuracy);

      const accuracyText =
        Number.isFinite(accuracyValue) &&
        accuracyValue > 0
          ? `±${Math.round(
              accuracyValue
            )} meters`
          : 'GPS accuracy unavailable';

      riderLayerRef.current.bindPopup(`
        <div style="
          min-width:200px;
          font-family:Arial,sans-serif;
        ">
          <div style="
            font-size:16px;
            font-weight:700;
            margin-bottom:6px;
          ">
            🚚 Delivery Person
          </div>

          <div style="
            font-size:13px;
            color:#059669;
            font-weight:600;
          ">
            🟢 Live GPS Location
          </div>

          <div style="
            font-size:12px;
            margin-top:6px;
            color:#64748b;
          ">
            Accuracy: ${accuracyText}
          </div>

          <div style="
            font-size:12px;
            margin-top:4px;
            color:#64748b;
          ">
            ${riderPoint.lat.toFixed(6)},
            ${riderPoint.lng.toFixed(6)}
          </div>
        </div>
      `);
    } else {
      if (riderLayerRef.current) {
        riderLayerRef.current.remove();
        riderLayerRef.current = null;
      }
    }

    // ========================================================
    // BOTH LOCATIONS AVAILABLE
    // ========================================================

    if (hasDestination && hasRider) {
      const routeKey = [
        riderPoint.lat.toFixed(5),
        riderPoint.lng.toFixed(5),
        destinationPoint.lat.toFixed(5),
        destinationPoint.lng.toFixed(5)
      ].join('|');

      /*
       * Avoid requesting the same route repeatedly.
       * This is especially useful when polling every few seconds.
       */

      if (routeKey !== lastRouteKeyRef.current) {
        loadRoadRoute(
          riderPoint,
          destinationPoint
        );
      }
    } else {
      // ------------------------------------------------------
      // CANCEL OLD ROUTE REQUEST
      // ------------------------------------------------------

      routeRequestRef.current += 1;

      // ------------------------------------------------------
      // REMOVE ROUTE
      // ------------------------------------------------------

      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }

      if (mountedRef.current) {
        setRouteLoading(false);
        setRouteInfo(null);
      }

      // ------------------------------------------------------
      // DESTINATION ONLY
      // ------------------------------------------------------

      if (hasDestination) {
        const fitKey =
          `destination-${destinationPoint.lat.toFixed(
            5
          )}-${destinationPoint.lng.toFixed(5)}`;

        if (fitKey !== lastFitKeyRef.current) {
          lastFitKeyRef.current = fitKey;

          map.setView(
            [
              destinationPoint.lat,
              destinationPoint.lng
            ],
            15,
            {
              animate: true
            }
          );
        }
      }

      // ------------------------------------------------------
      // RIDER ONLY
      // ------------------------------------------------------

      else if (hasRider) {
        const fitKey =
          `rider-${riderPoint.lat.toFixed(
            5
          )}-${riderPoint.lng.toFixed(5)}`;

        if (fitKey !== lastFitKeyRef.current) {
          lastFitKeyRef.current = fitKey;

          map.setView(
            [
              riderPoint.lat,
              riderPoint.lng
            ],
            15,
            {
              animate: true
            }
          );
        }
      }

      // ------------------------------------------------------
      // NOTHING AVAILABLE
      // ------------------------------------------------------

      else {
        lastFitKeyRef.current = '';

        map.setView(
          [20.5937, 78.9629],
          5,
          {
            animate: false
          }
        );
      }
    }

    // ========================================================
    // MAP RESIZE
    // ========================================================

    const resizeTimer = setTimeout(() => {
      if (
        mountedRef.current &&
        instanceRef.current
      ) {
        instanceRef.current.invalidateSize();
      }
    }, 100);

    return () => {
      clearTimeout(resizeTimer);
    };
  }, [
    mapReady,
    destination?.lat,
    destination?.lng,
    rider?.lat,
    rider?.lng,
    rider?.accuracy
  ]);

  // ==========================================================
  // RENDER FLAGS
  // ==========================================================

  const hasDestination =
    isValidLocation(destination);

  const hasRider =
    isValidLocation(rider);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      style={{
        width: '100%',
        position: 'relative'
      }}
    >
      {/* =====================================================
          MAP
      ====================================================== */}

      <div
        ref={mapRef}
        style={{
          width: '100%',
          height,
          minHeight: height,
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid #dbe3ea',
          background: '#e2e8f0'
        }}
      />

      {/* =====================================================
          TOP STATUS
      ====================================================== */}

      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '8px',
          pointerEvents: 'none'
        }}
      >
        {/* STATUS */}

        <div
          style={{
            background: 'white',
            borderRadius: '10px',
            padding: '8px 12px',
            boxShadow:
              '0 2px 10px rgba(0,0,0,0.15)',
            fontSize: '13px',
            fontWeight: '700',
            color: '#0f172a'
          }}
        >
          {hasRider && hasDestination
            ? '🚚 Rider → 🏠 Delivery'
            : hasRider
            ? '🚚 Rider GPS Active'
            : hasDestination
            ? '🏠 Delivery Location'
            : '📍 Location unavailable'}
        </div>

        {/* ROUTE LOADING */}

        {routeLoading && (
          <div
            style={{
              background: 'white',
              borderRadius: '10px',
              padding: '8px 12px',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.15)',
              fontSize: '12px',
              color: '#475569'
            }}
          >
            🛣️ Finding route...
          </div>
        )}
      </div>

      {/* =====================================================
          ROUTE INFORMATION
      ====================================================== */}

      {hasRider &&
        hasDestination &&
        routeInfo && (
          <div
            style={{
              position: 'absolute',
              top: '58px',
              left: '12px',
              zIndex: 1000,
              background: 'white',
              borderRadius: '10px',
              padding: '8px 12px',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.15)',
              fontSize: '12px',
              color: '#334155',
              pointerEvents: 'none'
            }}
          >
            <div>
              📏 <strong>{routeInfo.distance}</strong>
            </div>

            <div style={{ marginTop: '3px' }}>
              ⏱️ <strong>{routeInfo.duration}</strong>
            </div>
          </div>
        )}

      {/* =====================================================
          LEGEND
      ====================================================== */}

      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 1000,
          background: 'white',
          borderRadius: '10px',
          padding: '10px 12px',
          boxShadow:
            '0 2px 10px rgba(0,0,0,0.18)',
          fontSize: '12px',
          lineHeight: '1.7'
        }}
      >
        <div>
          <span style={{ fontSize: '16px' }}>
            🚚
          </span>{' '}
          <strong>Delivery Person</strong>
        </div>

        <div>
          <span style={{ fontSize: '16px' }}>
            🏠
          </span>{' '}
          <strong>Delivery Address</strong>
        </div>

        {hasRider &&
          hasDestination && (
            <div>
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '4px',
                  background: '#2563eb',
                  verticalAlign: 'middle',
                  marginRight: '5px',
                  borderRadius: '3px'
                }}
              />

              <strong>Road Route</strong>
            </div>
          )}
      </div>

      {/* =====================================================
          LOCATION WARNING
      ====================================================== */}

      {!hasDestination &&
        !hasRider && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 12px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '10px',
              color: '#9a3412',
              fontSize: '13px'
            }}
          >
            📍 Location is being prepared.
            Customer address coordinates and rider GPS
            will appear here when available.
          </div>
        )}

      {/* =====================================================
          DESTINATION AVAILABLE, RIDER NOT AVAILABLE
      ====================================================== */}

      {hasDestination &&
        !hasRider && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              color: '#1e40af',
              fontSize: '13px'
            }}
          >
            🏠 Delivery address found.
            <strong>
              {' '}
              Waiting for rider GPS...
            </strong>
          </div>
        )}

      {/* =====================================================
          RIDER AVAILABLE, DESTINATION NOT AVAILABLE
      ====================================================== */}

      {!hasDestination &&
        hasRider && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              color: '#065f46',
              fontSize: '13px'
            }}
          >
            🚚 Rider GPS is active.
            <strong>
              {' '}
              Waiting for delivery address coordinates...
            </strong>
          </div>
        )}

      {/* =====================================================
          BOTH AVAILABLE
      ====================================================== */}

      {hasDestination &&
        hasRider && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              color: '#065f46',
              fontSize: '13px'
            }}
          >
            🟢 <strong>Live delivery tracking active.</strong>
            {' '}
            Rider location is being updated on the map.
          </div>
        )}
    </div>
  );
}