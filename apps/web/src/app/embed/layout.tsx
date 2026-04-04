/**
 * Embed layout: no navigation, no footer, minimal wrapper.
 * This is loaded inside an iframe by the widget.
 */
export default function EmbedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
