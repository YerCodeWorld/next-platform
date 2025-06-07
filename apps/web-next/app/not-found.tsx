// app/not-found.tsx
export default function RootNotFound() {
    return (
        <html>
        <body>
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1>404 - Page Not Found</h1>
                <p>Redirecting to Spanish version...</p>
                <script dangerouslySetInnerHTML={{
                    __html: `
                                setTimeout(() => {
                                    window.location.href = '/es';
                                }, 1000);
                            `
                }} />
            </div>
        </div>
        </body>
        </html>
    );
}