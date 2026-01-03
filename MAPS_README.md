# Free Map Integration with OpenStreetMap

This project uses **OpenStreetMap** with **Leaflet** for completely free geolocation mapping of trucks and drivers. No API keys or costs required!

## Why OpenStreetMap + Leaflet?

- ✅ **Completely Free** - No API keys, no usage limits, no costs
- ✅ **Open Source** - Community maintained, transparent
- ✅ **Privacy Friendly** - No tracking or data collection
- ✅ **Customizable** - Full control over styling and features
- ✅ **Reliable** - Used by millions of websites worldwide

## Components

### `OpenStreetMapBase`
The core map component that provides:
- Interactive maps with zoom and pan
- Markers for locations
- Polylines for routes
- Popups with location labels

### `TruckLocationMap`
Shows individual truck locations with:
- Current GPS coordinates
- Address information
- Single marker display

### `ManifestRouteMap`
Displays delivery routes with:
- Origin and destination markers
- Route polylines
- Current location tracking
- Address labels

## Usage Examples

### Basic Truck Location
```tsx
import { TruckLocationMap } from '@/components/maps/TruckLocationMap';

<TruckLocationMap location={{
  latitude: 40.7128,
  longitude: -74.0060,
  address: "New York, NY"
}} />
```

### Route Display
```tsx
import { ManifestRouteMap } from '@/components/maps/ManifestRouteMap';

<ManifestRouteMap
  origin={{
    latitude: 40.7128,
    longitude: -74.0060,
    address: "New York, NY"
  }}
  destination={{
    latitude: 34.0522,
    longitude: -118.2437,
    address: "Los Angeles, CA"
  }}
  lastReportedLocation={{
    latitude: 39.7392,
    longitude: -104.9903,
    address: "Denver, CO"
  }}
/>
```

## Features

- **Real-time Updates**: Maps automatically update when location data changes
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Lazy loading and efficient rendering
- **Offline Ready**: Basic functionality works without internet (tiles cache)

## Customization

### Styling
Maps inherit your app's theme. For light theme, they use light backgrounds and dark text.

### Markers
- Default Leaflet markers with popups
- Custom icons can be added by extending the `Icon` class

### Routes
- Blue polylines for routes
- Adjustable weight, color, and opacity

## Data Requirements

Maps expect coordinates in decimal degrees:
- `latitude`: -90 to 90
- `longitude`: -180 to 180
- `address`: Optional human-readable location string

## Browser Support

Works in all modern browsers that support:
- ES6 modules
- CSS Grid/Flexbox
- Canvas/WebGL (for smooth rendering)

## Migration from Google Maps

If you were previously using Google Maps:

1. ✅ No API key setup required
2. ✅ No billing concerns
3. ✅ Same functionality (markers, routes, popups)
4. ⚠️ Slightly different visual styling
5. ⚠️ May need minor coordinate format adjustments

## Troubleshooting

### Map not loading?
- Check browser console for errors
- Ensure coordinates are valid numbers
- Verify internet connection for tile loading

### Markers not showing?
- Confirm latitude/longitude are within valid ranges
- Check for TypeScript errors in coordinate objects

### Performance issues?
- Reduce number of markers on screen
- Use appropriate zoom levels
- Consider implementing marker clustering for dense data

## Future Enhancements

Potential improvements:
- Custom marker icons for different vehicle types
- Real-time location updates with WebSockets
- Route optimization visualization
- Geofencing overlays
- Historical route playback