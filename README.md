# False Ceiling Design Wizard

## Project info

An interactive tool for designing false ceilings with multiple design options and visualization.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

You can work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/SristiG12/False-Ceiling.git

# Step 2: Navigate to the project directory.
cd False-Ceiling

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Deploy with Vercel

This project is configured for seamless deployment with Vercel. To deploy:

1. Create a Vercel account if you don't have one: [Vercel Sign Up](https://vercel.com/signup)
2. Install Vercel CLI (already included in dev dependencies):
   ```
   npm i -g vercel
   ```
3. Login to Vercel:
   ```
   vercel login
   ```
4. Deploy your project:
   ```
   vercel
   ```

For production deployment:
```
vercel --prod
```

### Custom Domains

You can add custom domains to your Vercel deployment:

1. Go to your project dashboard on Vercel
2. Navigate to Settings > Domains
3. Add your custom domain and follow the verification steps
