# Deploying to Coolify

This project is configured to run on [Coolify](https://coolify.io/) using Docker Compose.

## Prerequisites

1.  A server (VPS) with Coolify installed.
2.  This repository connected to your Coolify instance.

## Deployment Steps

1.  **Go to your Coolify Dashboard**.
2.  Select your Project -> Environment -> **+ New Resource**.
3.  Choose **Docker Compose**.
4.  Select your **Repository** and Branch (`main`).
5.  **Configuration**:
    - Coolify might auto-detect `docker-compose.yml`. You should **replace** its content with the content of `docker-compose.prod.yml`.
    - *Alternatively, point the "Compose File Path" to `docker-compose.prod.yml` if Coolify supports that option directly, but pasting the content is safer.*
6.  **Environment Variables**:
    -   Go to the **Environment Variables** tab in Coolify.
    -   Add **ALL** of the following variables (copy from your local `.env`):
        -   **Backend & Database**:
            -   `POSTGRES_PASSWORD` (Create a strong password)
            -   `JWT_SECRET`
            -   `DOMAIN_NAME` (e.g., `stylrsa.co.za` - used for API URLs)
            -   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
            -   `SENDGRID_API_KEY` / `RESEND_API_KEY`
            -   `FROM_EMAIL` (e.g., `noreply@stylrsa.co.za`)
            -   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Backend SSO)
            -   `GOOGLE_CALLBACK_URL`
            -   `VIMEO_ACCESS_TOKEN`
        -   **Frontend (Build & Runtime)**:
            -   `NEXT_PUBLIC_API_URL` (Set to `https://stylrsa.co.za/api` or `https://${DOMAIN_NAME}/api`)
            -   `NEXT_PUBLIC_SITE_URL` (Set to `https://stylrsa.co.za`)
            -   `NEXTAUTH_URL` (Set to `https://stylrsa.co.za`)
            -   `NEXTAUTH_SECRET` (Generate a random string: `openssl rand -base64 32`)
            -   `GOOGLE_ID`, `GOOGLE_SECRET` (For NextAuth Google Provider - same as backend ones or different client)
            -   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
            -   `NEXT_PUBLIC_CLOUDINARY_API_KEY`
            -   `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
            -   `NEXT_PUBLIC_GA_MEASUREMENT_ID` (Optional)
            -   `NEXT_PUBLIC_SENTRY_DSN` (Optional)

    > **Important**: Coolify will inject these variables during the container build process (for `NEXT_PUBLIC_` variables) and at runtime. Ensure you paste them **before** clicking Deploy.

7.  **Domains**:
    -   In the **Settings** / **General** tab for the resource.
    -   Set **Domains** to `https://your-domain.com` (e.g., `https://stylrsa.co.za`).
    -   Coolify will automatically generate the SSL certificate.
    -   **Important**: If you are deploying to a specific domain, ensure `DOMAIN_NAME` env var matches it.

8.  **Deploy**:
    -   Click **Deploy**.
    -   The system will:
        1.  Build the Frontend (baking in `NEXT_PUBLIC_` variables).
        2.  Build the Backend.
        3.  Start Postgres & Redis.
        4.  Run Database Migrations (`npx prisma migrate deploy`).
        5.  Start the applications.

## Troubleshooting

-   **Logs**: Check the logs of the `backend` or `frontend` container if something fails.
-   **Database**: The first deploy creates the DB volume. Data is persistent in `postgres_data`.
