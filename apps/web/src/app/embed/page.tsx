/**
 * /embed?key=ak_live_xxx
 *
 * This page is rendered inside an iframe by the widget loader.
 * It displays the configurator with no navigation chrome,
 * themed according to the tenant's settings.
 */
export default function EmbedPage() {
    // TODO: Resolve tenant from API key query param
    // TODO: Load tenant theme and apply CSS variables
    // TODO: Render configurator components
    return (
        <div className="p-4">
            <p className="text-gray-500 text-sm">
                Aerolume Embed — configurator will render here once tenant resolution is implemented.
            </p>
        </div>
    );
}
