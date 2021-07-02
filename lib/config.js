export const config = {
    BREAKPOINT_MD_IN_PX: 768,
    COUNTRY_CODE_GERMANY: 'DE',
    ENABLE_DEV_MODE: true,
    MAP_DEFAULT_ZOOM_COUNTRY: 6,
    MAP_DEFAULT_ZOOM_LOCATION: 15,
    MAP_MARKER_LIMIT_MOBILE: process.env.NODE_ENV === 'development' ? 10 : 300,
    MAP_MIN_ZOOM: 3,
    MAP_POSITION_GERMANY: { latitude: 51.165691, longitude: 10.451526 },
    FETCH_LOCATIONS_LIMIT: process.env.NODE_ENV === 'development' ? 20 : 2000,
    REVALIDATE_TIME_IN_SECONDS: 86400,
    SEO_NAME_GERMANY: 'germany',
}