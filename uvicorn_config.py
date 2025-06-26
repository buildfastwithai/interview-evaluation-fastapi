import uvicorn
from main import app

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        limit_max_requests=1000,
        limit_concurrency=50,  # Reduced concurrency to prevent overload
        # Increase these limits for large file uploads
        h11_max_incomplete_event_size=16 * 1024 * 1024,  # 16MB
        http_max_request_size=100 * 1024 * 1024,  # 100MB
        timeout_keep_alive=600,  # Increased keep-alive timeout
        timeout_graceful_shutdown=600,  # Increased graceful shutdown timeout
        # Add timeout configurations
        timeout_graceful_shutdown=600,
        access_log=True,
        log_level="info"
    ) 