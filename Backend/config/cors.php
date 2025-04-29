<?php
// config/cors.php

return [
    'paths' => ['api/*'],  // All API routes
    'allowed_methods' => ['*'],  // Allow all HTTP methods (GET, POST, PUT, DELETE)
    'allowed_origins' => ['http://localhost:4200'],  // Allow Angular front-end URL
    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'Authorization'],  // Allow all headers
    'allowed_origins_patterns' => [],
    'with_credentials' => true,  // Include cookies in cross-origin requests
    'supports_credentials' => true,
];
